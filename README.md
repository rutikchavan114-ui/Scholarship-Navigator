# Scholarship Navigator

A responsive college scholarship portal with a local Python backend. It uses the Python standard library and SQLite; no package installation or internet access is needed.

## Start the full app

**macOS:** Open `start.command` (or run `python3 server.py` in the VS Code terminal).

**Windows:** Open `start.bat` (requires the Python launcher `py -3`).

Then visit [http://127.0.0.1:8000](http://127.0.0.1:8000). Keep the terminal window open while using the app. Stop the server with **Ctrl+C**.

The server listens on your computer only (`127.0.0.1`). Do not expose it to the public internet as-is.

## Demo sign-in

- Email: `gajanan.student@example.com`
- Password: `student123`

The demo account is created in the local SQLite database on first launch. Use **Register New Student** to create a separate local account. New passwords must contain at least 8 characters.

## Official scholarship data

The catalogue is in `scholarships.json` and is served by the local backend at `/api/scholarships`. It contains 11 real government scheme listings for academic year 2026–27, with a source link on every listing. NSP application dates were checked against the official portal on 17 October 2026. MahaDBT 2.0 does not provide one common closing date for these schemes, so the app tells students to check the live portal instead of inventing one.

This is a dated snapshot, not a live feed. Scheme details and application windows can change. Open the linked official source before applying. The profile matching score is only an indicative guide; it does not check every rule or determine eligibility. Some rules require documents, admission records, institution lists, or special circumstances that the profile form cannot fully assess.

To update the catalogue, edit `scholarships.json` and recheck each scheme's eligibility, benefit, deadline, and source URL. `id` values should remain stable so saved and tracked records continue to refer to the same scheme.

## Backend features

- Account registration and password sign-in, with salted PBKDF2 password hashes and server-side, HttpOnly, SameSite session cookies.
- SQLite storage for each user’s profile, saved scholarships, applications, document records, notifications, and preferences.
- Authenticated document upload and download. Files are size-limited to 10 MB and saved under `data/uploads/`; metadata and review status are kept in SQLite-backed portal state.
- User data is separated by account. Signing out clears the server session; browser storage keeps only appearance and language preferences.
- Front-end scholarship matching remains a transparent rule-based estimate using the official snapshot. It does not determine or guarantee scholarship awards.

## Important limits

- This is intended for a local academic demonstration. It has no HTTPS, email verification, password reset, admin role, production deployment configuration, database backups, or hardened rate limiting. Use sample information only; do not expose it to the internet or use sensitive real documents.
- The built-in demo account has a published sample password. Change/remove it before any shared deployment.
- Email actions create a local preview and activity record only. No message is sent. A trusted mail service and server-side configuration would be needed for real delivery.
- Scholarship names, benefits, requirements, and deadlines are sourced from government portals. The catalogue is still a dated snapshot, so check current details with official providers.
- “Mark Verified” is a local status change, not review by a college.

## Files

- `index.html`, `styles.css`, `app.js` — responsive front end and interactions
- `server.py` — local HTTP API, official catalogue endpoint, authentication, SQLite persistence, and document handling
- `scholarships.json` — source-linked 2026–27 official scheme snapshot
- `start.command`, `start.bat` — launch helpers
- `data/` — created at first run; contains the database and uploaded files
