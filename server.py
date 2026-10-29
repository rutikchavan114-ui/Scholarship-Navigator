#!/usr/bin/env python3
"""Local Scholarship Navigator backend. Uses only the Python standard library."""
from __future__ import annotations

import hashlib
import hmac
import json
import mimetypes
import os
import re
import secrets
import sqlite3
import time
from http import cookies
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse
from email import policy
from email.parser import BytesParser
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
UPLOAD_DIR = DATA_DIR / "uploads"
DB_PATH = DATA_DIR / "scholarship_navigator.sqlite3"
SCHOLARSHIPS_PATH = ROOT / "scholarships.json"
HOST = os.environ.get("SCHOLARSHIP_HOST", "127.0.0.1")
PORT = int(os.environ.get("SCHOLARSHIP_PORT", "8000"))
SESSION_COOKIE = "sn_session"
SESSION_SECONDS = 60 * 60 * 24 * 7
MAX_BODY = 2 * 1024 * 1024
MAX_UPLOAD = 10 * 1024 * 1024
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"}

DEMO_PROFILE = {
    "hasCompletedIntake": True, "name": "Gajanan Chavan", "email": "gajanan.student@example.com",
    "phone": "9876543210", "institution": "G. H. Raisoni International Skill Tech University",
    "course": "B.Tech Computer Science & Engineering", "year": "First year", "semester": "1",
    "gpa": "8.6", "percentage": "86", "income": "180000", "domicile": "Maharashtra",
    "category": "OBC", "gender": "Male", "isFemaleStem": False, "isFirstGen": True,
    "isPwd": False, "isSports": False, "isRural": True, "isInnovator": True, "completion": 92
}
DEMO_STATE = {
    "profile": DEMO_PROFILE,
    "applications": [],
    "documents": [],
    "notifications": [
        {"title": "Welcome to Scholarship Navigator", "message": "Check each official provider page for current eligibility and application status.", "time": "Just now", "icon": "🏛", "unread": True}
    ],
    "saved": [], "sentEmails": [], "language": "en", "page": "college-dashboard"
}


def connect():
    DATA_DIR.mkdir(exist_ok=True)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(DB_PATH, timeout=10)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")
    db.execute("PRAGMA journal_mode = WAL")
    db.executescript("""
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS portal_state (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        payload TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
    """)
    db.commit()
    return db


def password_hash(password: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 240_000).hex()


def token_digest(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


class Handler(SimpleHTTPRequestHandler):
    server_version = "ScholarshipNavigator/1.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))

    def send_json(self, status, payload, extra_headers=None):
        body = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        if extra_headers:
            for key, value in extra_headers:
                self.send_header(key, value)
        self.end_headers()
        self.wfile.write(body)

    def read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        if length > MAX_BODY:
            raise ValueError("Request is too large")
        raw = self.rfile.read(length) if length else b"{}"
        data = json.loads(raw.decode("utf-8"))
        if not isinstance(data, dict):
            raise ValueError("Expected a JSON object")
        return data

    def current_user(self, db):
        jar = cookies.SimpleCookie()
        try:
            jar.load(self.headers.get("Cookie", ""))
        except cookies.CookieError:
            return None
        morsel = jar.get(SESSION_COOKIE)
        if not morsel:
            return None
        row = db.execute("SELECT users.* FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token_hash=? AND sessions.expires_at>?",
                         (token_digest(morsel.value), int(time.time()))).fetchone()
        return row

    def require_user(self, db):
        user = self.current_user(db)
        if not user:
            self.send_json(401, {"error": "Please sign in again."})
        return user

    def save_state(self, db, user_id, payload):
        allowed = {"profile", "applications", "documents", "notifications", "saved", "sentEmails", "language", "page", "catalogVersion"}
        state = {key: payload[key] for key in allowed if key in payload}
        state["catalogVersion"] = 2
        if not isinstance(state.get("profile", {}), dict):
            raise ValueError("Student profile must be an object")
        for key in ("applications", "documents", "notifications", "sentEmails", "saved"):
            if key in state and not isinstance(state[key], list):
                raise ValueError(f"{key} must be a list")
            if len(state.get(key, [])) > 500:
                raise ValueError(f"Too many {key} records")
        state["profile"]["email"] = payload.get("profile", {}).get("email", "")
        db.execute("INSERT INTO portal_state(user_id,payload,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at",
                   (user_id, json.dumps(state, ensure_ascii=False), int(time.time())))
        db.commit()

    def get_state(self, db, user):
        row = db.execute("SELECT payload FROM portal_state WHERE user_id=?", (user["id"],)).fetchone()
        if not row:
            return None
        state = json.loads(row["payload"])
        # Old demo rows pointed to invented scholarship records and amounts.
        # Preserve the student's profile and uploaded document records, but drop
        # obsolete demo applications, saved IDs, and email previews for this one
        # published demo account when moving to the verified catalogue.
        if user["email"].lower() == "gajanan.student@example.com" and state.get("catalogVersion", 0) < 2:
            state["applications"] = []
            state["saved"] = []
            state["sentEmails"] = []
            state["notifications"] = [{
                "title": "Official scholarship catalogue updated",
                "message": "Check each linked provider page for current eligibility and application status.",
                "time": "Just now", "icon": "🏛", "unread": True
            }]
            state["catalogVersion"] = 2
            db.execute("UPDATE portal_state SET payload=?,updated_at=? WHERE user_id=?",
                       (json.dumps(state, ensure_ascii=False), int(time.time()), user["id"]))
            db.commit()
        return state

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            self.send_json(200, {"ok": True, "service": "Scholarship Navigator local backend"})
            return
        if parsed.path == "/api/scholarships":
            try:
                with SCHOLARSHIPS_PATH.open("r", encoding="utf-8") as handle:
                    self.send_json(200, json.load(handle))
            except (OSError, json.JSONDecodeError) as exc:
                self.send_json(503, {"error": "Official scholarship dataset is unavailable."})
            return
        db = connect()
        try:
            if parsed.path == "/api/state":
                user = self.current_user(db)
                if not user:
                    self.send_json(200, {"authenticated": False})
                    return
                self.send_json(200, {"authenticated": True, "user": {"name": user["name"], "email": user["email"]}, "state": self.get_state(db, user)})
                return
            if parsed.path.startswith("/api/documents/file/"):
                user = self.require_user(db)
                if not user:
                    return
                stored_name = unquote(parsed.path.rsplit("/", 1)[-1])
                if not re.fullmatch(r"[a-f0-9]{32}\.[a-zA-Z0-9]{1,8}", stored_name):
                    self.send_json(404, {"error": "Document not found"})
                    return
                state = self.get_state(db, user) or {}
                record = next((doc for doc in state.get("documents", []) if doc.get("storedName") == stored_name), None)
                path = UPLOAD_DIR / str(user["id"]) / stored_name
                if not record or not path.is_file():
                    self.send_json(404, {"error": "Document not found"})
                    return
                body = path.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", mimetypes.guess_type(record.get("filename", ""))[0] or "application/octet-stream")
                self.send_header("Content-Length", str(len(body)))
                self.send_header("Content-Disposition", "attachment; filename*=UTF-8''" + quote(record.get("filename", "document")))
                self.send_header("X-Content-Type-Options", "nosniff")
                self.end_headers()
                self.wfile.write(body)
                return
        finally:
            db.close()
        if parsed.path.startswith("/api/"):
            self.send_json(404, {"error": "API route not found"})
            return
        if parsed.path == "/data" or parsed.path.startswith("/data/"):
            self.send_error(404, "Not found")
            return
        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        db = connect()
        try:
            if parsed.path in ("/api/register", "/api/login"):
                data = self.read_json()
                email = str(data.get("email", "")).strip().lower()
                password = str(data.get("password", ""))
                if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
                    self.send_json(400, {"error": "Enter a valid email address."})
                    return
                if parsed.path == "/api/register":
                    name = str(data.get("name", "")).strip()[:100]
                    if len(name) < 2 or len(password) < 8 or len(password) > 200:
                        self.send_json(400, {"error": "Enter your name and a password with at least 8 characters."})
                        return
                    salt = secrets.token_hex(16)
                    try:
                        cur = db.execute("INSERT INTO users(email,name,password_hash,password_salt,created_at) VALUES(?,?,?,?,?)",
                                         (email, name, password_hash(password, salt), salt, int(time.time())))
                        user_id = cur.lastrowid
                    except sqlite3.IntegrityError:
                        self.send_json(409, {"error": "An account with this email already exists."})
                        return
                else:
                    row = db.execute("SELECT * FROM users WHERE email=? COLLATE NOCASE", (email,)).fetchone()
                    if not row or not hmac.compare_digest(row["password_hash"], password_hash(password, row["password_salt"])):
                        self.send_json(401, {"error": "Email or password is incorrect."})
                        return
                    user_id = row["id"]
                    name = row["name"]
                token = secrets.token_urlsafe(32)
                db.execute("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)",
                           (token_digest(token), user_id, int(time.time()) + SESSION_SECONDS))
                db.commit()
                user_row = db.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
                self.send_json(200, {"ok": True, "user": {"name": user_row["name"], "email": user_row["email"]},
                                     "state": self.get_state(db, user_row)},
                               [("Set-Cookie", f"{SESSION_COOKIE}={token}; Path=/; HttpOnly; SameSite=Strict; Max-Age={SESSION_SECONDS}")])
                return
            if parsed.path == "/api/logout":
                user = self.current_user(db)
                if user:
                    jar = cookies.SimpleCookie(); jar.load(self.headers.get("Cookie", ""))
                    db.execute("DELETE FROM sessions WHERE token_hash=?", (token_digest(jar[SESSION_COOKIE].value),)); db.commit()
                self.send_json(200, {"ok": True}, [("Set-Cookie", f"{SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0")])
                return
            if parsed.path == "/api/documents/upload":
                user = self.require_user(db)
                if not user:
                    return
                content_length = int(self.headers.get("Content-Length", "0"))
                if content_length > MAX_UPLOAD + 1024 * 1024:
                    self.send_json(413, {"error": "File is larger than 10 MB."})
                    return
                raw = self.rfile.read(content_length)
                message = BytesParser(policy=policy.default).parsebytes(
                    b"Content-Type: " + self.headers.get("Content-Type", "").encode() + b"\r\nMIME-Version: 1.0\r\n\r\n" + raw)
                file_part = name_part = None
                if message.is_multipart():
                    for part in message.iter_parts():
                        if part.get_param("name", header="content-disposition") == "file": file_part = part
                        if part.get_param("name", header="content-disposition") == "name": name_part = part
                if not file_part or not file_part.get_filename():
                    self.send_json(400, {"error": "Choose a file first."}); return
                original = Path(Path(file_part.get_filename()).name).name
                ext = Path(original).suffix.lower()
                if ext not in ALLOWED_EXTENSIONS:
                    self.send_json(400, {"error": "Choose a PDF, image, or Word document."}); return
                content = file_part.get_payload(decode=True) or b""
                if len(content) > MAX_UPLOAD:
                    self.send_json(413, {"error": "File is larger than 10 MB."}); return
                stored_name = secrets.token_hex(16) + ext
                user_dir = UPLOAD_DIR / str(user["id"])
                user_dir.mkdir(parents=True, exist_ok=True)
                (user_dir / stored_name).write_bytes(content)
                record = {"id": int(time.time() * 1000), "name": str(name_part.get_content() if name_part else "Supporting document")[:100],
                          "filename": original[:200], "storedName": stored_name, "size": len(content),
                          "date": time.strftime("%Y-%m-%d"), "status": "Pending review", "icon": "▤"}
                self.send_json(201, {"document": record})
                return
            self.send_json(404, {"error": "API route not found"})
        except (ValueError, json.JSONDecodeError) as exc:
            self.send_json(400, {"error": str(exc) or "Invalid request"})
        finally:
            db.close()

    def do_PUT(self):
        if urlparse(self.path).path != "/api/state":
            self.send_json(404, {"error": "API route not found"}); return
        db = connect()
        try:
            user = self.require_user(db)
            if not user:
                return
            data = self.read_json()
            self.save_state(db, user["id"], data)
            self.send_json(200, {"ok": True})
        except (ValueError, json.JSONDecodeError) as exc:
            self.send_json(400, {"error": str(exc) or "Invalid request"})
        finally:
            db.close()


if __name__ == "__main__":
    db = connect()
    email = "gajanan.student@example.com"
    if not db.execute("SELECT 1 FROM users WHERE email=?", (email,)).fetchone():
        salt = secrets.token_hex(16)
        cur = db.execute("INSERT INTO users(email,name,password_hash,password_salt,created_at) VALUES(?,?,?,?,?)",
                         (email, "Gajanan Chavan", password_hash("student123", salt), salt, int(time.time())))
        demo_state = dict(DEMO_STATE)
        demo_state["profile"] = dict(DEMO_PROFILE)
        db.execute("INSERT INTO portal_state(user_id,payload,updated_at) VALUES(?,?,?)",
                   (cur.lastrowid, json.dumps(demo_state, ensure_ascii=False), int(time.time())))
        db.commit()
    db.close()
    print(f"Scholarship Navigator running at http://{HOST}:{PORT}")
    print("Demo login: gajanan.student@example.com / student123")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
