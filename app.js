const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const money = n => n ? "₹" + Number(n).toLocaleString("en-IN") : "See official rules";

// Official catalogue is loaded from the bundled, dated source snapshot.
// Populated from the official, source-linked 2026-27 snapshot at /api/scholarships.
let scholarshipData = [];

// App State
let state = {
  appMode: "login", // 'login' | 'intake' | 'portal'
  page: "college-dashboard",
  search: "",
  filter: "All types",
  sort: "Recommended",
  saved: new Set(),
  auth: {
    isLoggedIn: false,
    username: "",
    authTab: "login" // 'login' | 'register'
  },
  profile: {
    hasCompletedIntake: true,
    name: "Gajanan Chavan",
    email: "gajanan.student@example.com",
    phone: "9876543210",
    institution: "G. H. Raisoni International Skill Tech University",
    course: "B.Tech Computer Science & Engineering",
    year: "First year",
    semester: "1",
    gpa: "8.6",
    percentage: "86",
    income: "180000",
    domicile: "Maharashtra",
    category: "OBC",
    gender: "Male",
    isFemaleStem: false,
    isFirstGen: true,
    isPwd: false,
    isSports: false,
    isRural: true,
    isInnovator: true,
    completion: 92
  },
  applications: [],
  documents: [],
  notifications: [],
  collegeFilterTab: "all",
  language: "en",
  sentEmails: []
};

// Core interface translations. Scholarship titles and official programme names
// remain in their source language so students can find the exact scheme online.
const interfaceText = {
  hi: {
    "COLLEGE PORTAL":"कॉलेज पोर्टल", "College Portal":"कॉलेज पोर्टल", "College Portal & Matches":"कॉलेज पोर्टल और मिलान",
    "Edit Your Info":"अपनी जानकारी संपादित करें", "Edit Your Information":"अपनी जानकारी संपादित करें", "Discover All":"सभी छात्रवृत्तियाँ",
    "Discover Scholarships":"छात्रवृत्तियाँ खोजें", "My Applications":"मेरे आवेदन", "Document Vault":"दस्तावेज़ केंद्र",
    "Deadlines Calendar":"अंतिम तिथि कैलेंडर", "Dispatched Emails":"ईमेल इतिहास", "Email Preview History":"ईमेल इतिहास",
    "Notifications":"सूचनाएँ", "Dashboard":"डैशबोर्ड", "Student":"विद्यार्थी", "Logout":"लॉग आउट",
    "Search scholarships, degrees...":"छात्रवृत्ति या पाठ्यक्रम खोजें...", "Search scholarships":"छात्रवृत्तियाँ खोजें",
    "Profile Completion":"प्रोफ़ाइल पूरी", "Upcoming Deadlines":"आने वाली अंतिम तिथियाँ", "Top Scholarship Matches":"शीर्ष छात्रवृत्ति मिलान",
    "Student Profile Summary":"विद्यार्थी प्रोफ़ाइल सारांश", "Your active details matching scholarships:":"आपकी जानकारी से मेल खाने वाली छात्रवृत्तियाँ:",
    "Family Income":"परिवार की आय", "Open Document Vault":"दस्तावेज़ केंद्र खोलें", "Modify Student Credentials":"विद्यार्थी की जानकारी बदलें",
    "Explore Scholarships":"छात्रवृत्तियाँ देखें", "View All":"सभी देखें", "Search & Filter":"खोजें और फ़िल्टर करें",
    "Award Amount":"पुरस्कार राशि", "Application Deadline":"आवेदन की अंतिम तिथि", "Documents to Prepare":"तैयार करने के दस्तावेज़",
    "Required for submission":"जमा करने के लिए आवश्यक", "Scholarship Details":"छात्रवृत्ति का विवरण", "Close":"बंद करें",
    "Track This Scholarship":"इस छात्रवृत्ति को ट्रैक करें", "Already Tracking ✓":"पहले से ट्रैक हो रही है ✓",
    "In preparation":"तैयारी में", "Ready to apply":"आवेदन के लिए तैयार", "Submitted externally":"बाहरी पोर्टल पर जमा",
    "Under review":"समीक्षा जारी", "Approved":"स्वीकृत", "Not approved":"स्वीकृत नहीं", "Deadline passed":"अंतिम तिथि बीत गई",
    "days left":"दिन शेष", "days remaining":"दिन शेष", "Save Updates":"बदलाव सहेजें", "Cancel":"रद्द करें",
    "Update Application Status":"आवेदन की स्थिति बदलें", "Current Status":"वर्तमान स्थिति", "Personal Tracking Notes":"निजी नोट",
    "Document Record":"दस्तावेज़ रिकॉर्ड", "Review Status":"समीक्षा स्थिति", "Mark Verified":"सत्यापित चिह्नित करें",
    "Application added to your applications":"आवेदन सूची में जोड़ा गया", "Scholarship added to your applications":"छात्रवृत्ति आवेदन सूची में जोड़ी गई",
    "Document marked verified":"दस्तावेज़ सत्यापित हुआ", "Light mode enabled ☀️":"लाइट मोड चालू ☀️", "Night mode enabled 🌙":"नाइट मोड चालू 🌙",
    "DISPATCH & ACTIVITY":"सूचनाएँ और गतिविधियाँ", "AI MATCH":"एआई मिलान", "Emails":"ईमेल", "Choose language":"भाषा चुनें", "Edit Info":"जानकारी संपादित करें",
    "STUDENT PROFILE":"विद्यार्थी प्रोफ़ाइल", "Prepared Documents":"तैयार दस्तावेज़", "based on your info":"आपकी जानकारी के आधार पर", "Annual Award Amount":"वार्षिक पुरस्कार राशि",
    "EMAIL PREVIEWS":"ईमेल इतिहास", "MATCHED SCHOLARSHIPS":"मेल खाने वाली छात्रवृत्तियाँ", "TOP MATCH RATING":"सबसे अच्छा मिलान", "TOTAL POTENTIAL AID":"कुल संभावित सहायता",
    "For top suggested schemes":"प्रमुख सुझाई गई योजनाओं के लिए", "Merit threshold: Met for 8+ schemes":"मेरिट सीमा: 8 से अधिक योजनाओं के लिए पूरी",
    "Qualifies for state & central need funds":"राज्य और केंद्र की ज़रूरत आधारित सहायता के योग्य", "State & reservation quotas unlocked":"राज्य और आरक्षण कोटे उपलब्ध",
    "Supporting paperwork ready for applications:":"आवेदनों के लिए ज़रूरी दस्तावेज़:", "Why you qualify:":"आप पात्र क्यों हैं:",
    "Download Application Kit (.html)":"आवेदन किट डाउनलोड करें (.html)", "Open in Real Email Client (Gmail/Outlook)":"ईमेल ऐप में खोलें (Gmail/Outlook)",
    "Preview Email Summary":"ईमेल सारांश देखें", "Send Scholarship Dossier to Student Email":"छात्र के ईमेल के लिए छात्रवृत्ति सारांश बनाएँ",
    "Local demo preview only":"केवल स्थानीय डेमो पूर्वावलोकन", "No email is sent":"कोई ईमेल नहीं भेजा जाता", "Scholarship added to your applications":"छात्रवृत्ति आपके आवेदनों में जोड़ी गई",
    "Application added to your applications":"आवेदन आपकी सूची में जोड़ा गया", "Your active details matching scholarships:":"आपकी जानकारी से मेल खाने वाली छात्रवृत्तियाँ:",
    "Category:":"श्रेणी:", "Status:":"स्थिति:", "View details":"विवरण देखें", "Learn more":"और जानें", "Apply now":"अभी आवेदन करें",
    "No scholarships found":"कोई छात्रवृत्ति नहीं मिली", "No applications yet":"अभी कोई आवेदन नहीं", "No documents uploaded":"कोई दस्तावेज़ अपलोड नहीं है",
    "No upcoming deadlines":"कोई आने वाली अंतिम तिथि नहीं", "Upload Document":"दस्तावेज़ अपलोड करें", "Upload documents":"दस्तावेज़ अपलोड करें",
    "Choose file":"फ़ाइल चुनें", "All statuses":"सभी स्थितियाँ", "All categories":"सभी श्रेणियाँ", "All types":"सभी प्रकार",
    "Filter by status":"स्थिति के अनुसार छाँटें", "Filter scholarships":"छात्रवृत्तियाँ फ़िल्टर करें", "Sort by":"इसके अनुसार क्रमबद्ध करें",
    "Deadline":"अंतिम तिथि", "Amount":"राशि", "Provider":"प्रदाता", "Category":"श्रेणी", "Type":"प्रकार", "Status":"स्थिति", "Actions":"कार्रवाई",
    "Merit-based":"मेरिट आधारित", "Need-based":"आर्थिक आवश्यकता आधारित", "Special category":"विशेष श्रेणी", "Undergraduate":"स्नातक",
    "Bonafide certificate":"बोनाफ़ाइड प्रमाणपत्र", "Income certificate":"आय प्रमाणपत्र", "Previous marksheet":"पिछली अंकतालिका",
    "Academic transcript":"शैक्षणिक विवरण", "Admission proof":"प्रवेश प्रमाण", "Domicile certificate":"निवास प्रमाणपत्र",
    "Family income":"परिवार की आय", "Personal information":"व्यक्तिगत जानकारी", "Academic information":"शैक्षणिक जानकारी",
    "Save Profile":"प्रोफ़ाइल सहेजें", "Save Changes":"बदलाव सहेजें", "Update Profile":"प्रोफ़ाइल अपडेट करें", "Full Name":"पूरा नाम",
    "Email Address":"ईमेल पता", "College / Institution":"कॉलेज / संस्थान", "Course / Degree":"कोर्स / डिग्री", "Academic Year":"शैक्षणिक वर्ष",
    "Percentage":"प्रतिशत", "GPA":"जीपीए", "Annual Family Income":"परिवार की वार्षिक आय", "Domicile State":"निवास राज्य",
    "Select category":"श्रेणी चुनें", "Select your category":"अपनी श्रेणी चुनें", "General":"सामान्य", "Other Backward Class":"अन्य पिछड़ा वर्ग",
    "Scheduled Caste":"अनुसूचित जाति", "Scheduled Tribe":"अनुसूचित जनजाति", "Minority":"अल्पसंख्यक", "Female":"महिला", "Male":"पुरुष",
    "Calendar":"कैलेंडर", "Month":"महीना", "Previous":"पिछला", "Next":"अगला", "Today":"आज", "Read more":"और पढ़ें",
    "Mark all as read":"सभी को पढ़ा हुआ चिह्नित करें", "Mark as read":"पढ़ा हुआ चिह्नित करें", "All caught up":"सब जानकारी देख ली गई है",
    "Application status":"आवेदन की स्थिति", "Tracking notes":"ट्रैकिंग नोट्स", "Add notes":"नोट जोड़ें", "Last updated":"आखिरी अपडेट",
    "Verified":"सत्यापित", "Pending review":"जाँच लंबित", "Uploaded":"अपलोड किया गया", "Download":"डाउनलोड करें", "Delete":"हटाएँ",
    "Search by name or provider":"नाम या प्रदाता से खोजें", "Showing":"दिखाए जा रहे हैं", "scholarships":"छात्रवृत्तियाँ",
    "Quick Actions":"त्वरित कार्रवाई", "Recent Activity":"हाल की गतिविधि", "Your Profile":"आपकी प्रोफ़ाइल", "View Profile":"प्रोफ़ाइल देखें",
    "Get started":"शुरू करें", "Welcome back":"वापसी पर स्वागत है", "Sign in":"साइन इन करें", "Create account":"खाता बनाएँ",
    "Password":"पासवर्ड", "Forgot password?":"पासवर्ड भूल गए?", "Continue":"जारी रखें", "Next step":"अगला चरण", "Back":"वापस",
    "Application deadline":"आवेदन की अंतिम तिथि", "Documents required":"ज़रूरी दस्तावेज़", "Eligibility":"पात्रता", "Description":"विवरण",
    "View all scholarships":"सभी छात्रवृत्तियाँ देखें", "Track application":"आवेदन ट्रैक करें", "Save scholarship":"छात्रवृत्ति सहेजें", "Saved":"सहेजा गया",
    "Your College Scholarship Journey":"आपकी कॉलेज छात्रवृत्ति यात्रा", "Starts Here.":"यहाँ से शुरू होती है।", "Explore sample central, state, and private scholarship listings matched against your marks, college, and family income.":"अपने अंकों, कॉलेज और परिवार की आय से मेल खाने वाली केंद्र, राज्य और निजी छात्रवृत्तियाँ देखें।",
    "Create or sign in to your account":"अपना खाता बनाएँ या साइन इन करें", "Add Your College & Academic Info":"अपने कॉलेज और पढ़ाई की जानकारी जोड़ें", "Review matches and prepare applications":"मेल देखें और आवेदन तैयार करें",
    "Local account · Scholarship matches are estimates":"स्थानीय खाता · छात्रवृत्ति मिलान अनुमान हैं", "Student Sign In":"विद्यार्थी साइन इन", "Register New Student":"नया विद्यार्थी पंजीकरण",
    "Welcome Back, Student!":"वापस स्वागत है, विद्यार्थी!", "Create Student Account":"विद्यार्थी खाता बनाएँ", "Sign in to access your matched scholarships and edit your information.":"मेल खाती छात्रवृत्तियाँ देखने और जानकारी बदलने के लिए साइन इन करें।",
    "Enter your details to create your scholarship account.":"छात्रवृत्ति खाता बनाने के लिए अपनी जानकारी भरें।", "Student Email or PRN / Roll No":"विद्यार्थी ईमेल या पीआरएन / रोल नंबर",
    "Sign In to Portal →":"पोर्टल में साइन इन करें →", "Register & Add Info →":"पंजीकरण करें और जानकारी जोड़ें →", "OR ONE-CLICK DEMO ACCESS":"या एक क्लिक में डेमो खोलें",
    "Instant Login ⚡":"तुरंत लॉगिन ⚡", "Fill in Your Student & College Credentials":"विद्यार्थी और कॉलेज की जानकारी भरें", "We compare your profile with ":"हम आपकी प्रोफ़ाइल की तुलना ", " official scholarship listings and show schemes you may want to review.":" आधिकारिक छात्रवृत्तियों से करते हैं। उपयुक्त योजनाएँ जाँचें।", 
    "STEP 2 OF 3":"चरण 2 / 3", "ADD YOUR INFORMATION":"अपनी जानकारी जोड़ें", "College / University Details":"कॉलेज / विश्वविद्यालय की जानकारी", "Select your institute, ongoing course stream, and year.":"अपना संस्थान, कोर्स और वर्ष चुनें।",
    "College / University Name":"कॉलेज / विश्वविद्यालय का नाम", "Degree / Branch":"डिग्री / शाखा", "Current Year & Semester":"वर्तमान वर्ष और सेमेस्टर", "Academic Performance":"शैक्षणिक प्रदर्शन",
    "Used to compare against merit cutoffs across central and private funds.":"केंद्र और निजी छात्रवृत्तियों की शैक्षणिक पात्रता से तुलना के लिए।", "Cumulative GPA (10 pt scale)":"कुल जीपीए (10 अंकों का पैमाना)", "Auto-syncs with percentage":"प्रतिशत के साथ अपने आप बदलेगा",
    "Overall Percentage (%)":"कुल प्रतिशत (%)", "Merit evaluation metric":"मेरिट जाँच का माप", "Financial & Social Category":"आर्थिक और सामाजिक वर्ग", "Government reservations, need-based funds, and state quotas.":"सरकारी आरक्षण, आर्थिक सहायता और राज्य कोटे के लिए।",
    "Social Category":"सामाजिक वर्ग", "Special Priority Criteria":"विशेष प्राथमिकता की जानकारी", "First-Generation Student":"परिवार में पहली बार कॉलेज जाने वाला विद्यार्थी", "First in family to attend college":"परिवार में कॉलेज जाने वाला पहला व्यक्ति",
    "Women in STEM Candidate":"एसटीईएम क्षेत्र की महिला विद्यार्थी", "Eligible for Google, Adobe & Tech Grants":"Google, Adobe और तकनीकी सहायता के लिए पात्र", "Rural / Village Schooling":"ग्रामीण / गाँव में पढ़ाई",
    "Eligible for rural education grants":"ग्रामीण शिक्षा सहायता के लिए पात्र", "Project Builder / Innovator":"प्रोजेक्ट निर्माता / नवाचारी", "Has GitHub, patents, or projects":"GitHub, पेटेंट या प्रोजेक्ट हैं",
    "Student Contact & Email Dossier Target":"विद्यार्थी संपर्क और ईमेल जानकारी", "Your official email where the application kit and matched scholarships will be dispatched.":"आपका आधिकारिक ईमेल, जहाँ आवेदन किट और मिलान की गई छात्रवृत्तियों की जानकारी तैयार होगी।",
    "Student Full Name":"विद्यार्थी का पूरा नाम", "Destination Email Address":"संपर्क ईमेल पता", "Pre-fill Sample Data":"नमूना जानकारी भरें", "Save Information & Open College Portal →":"जानकारी सहेजें और कॉलेज पोर्टल खोलें →",
    "First year":"पहला वर्ष", "Second year":"दूसरा वर्ष", "Third year":"तीसरा वर्ष", "Fourth year":"चौथा वर्ष", "Maharashtra":"महाराष्ट्र", "Karnataka":"कर्नाटक", "Delhi":"दिल्ली", "Tamil Nadu":"तमिलनाडु", "Gujarat":"गुजरात", "Uttar Pradesh":"उत्तर प्रदेश", "Other":"अन्य",
    "Email Preview History":"ईमेल इतिहास", "View sample email summaries created in this browser. No messages are sent.":"इस ब्राउज़र में बने ईमेल सारांश देखें। कोई संदेश नहीं भेजा जाता।", "Create Email Preview":"ईमेल पूर्वावलोकन बनाएँ", "Outbox & Sent History":"ईमेल पूर्वावलोकन इतिहास", "sample previews stored in this browser":"नमूना पूर्वावलोकन इस ब्राउज़र में सहेजे गए", "Previews":"पूर्वावलोकन", "Scholarship Application Dossier:":"छात्रवृत्ति आवेदन सारांश:", "Total Aid:":"कुल सहायता:", "Demo preview":"डेमो पूर्वावलोकन", "View Email Preview":"ईमेल पूर्वावलोकन देखें", "Official Scholarship Catalogue & Application Tracker":"स्वचालित छात्रवृत्ति मिलान प्रणाली", "To:":"प्रति:", "College Edition":"कॉलेज संस्करण", "Scholarship Navigator Alerts":"स्कॉलरशिप नेविगेटर सूचनाएँ", "Sign out of student account":"विद्यार्थी खाते से लॉग आउट करें",
    "Your Certified Documents Vault":"आपके सत्यापित दस्तावेज़", "Organize verification paperwork to speed up application submissions.":"आवेदन जल्दी जमा करने के लिए सत्यापन वाले दस्तावेज़ व्यवस्थित रखें।", "PDF or Image up to 10MB.":"10 एमबी तक की पीडीएफ या तस्वीर।", "Choose File":"फ़ाइल चुनें", "Upload & Save":"अपलोड करें और सहेजें", "Document Category":"दस्तावेज़ की श्रेणी", "Latest Semester / Marksheet":"नवीनतम सेमेस्टर / अंकतालिका", "State Domicile Certificate":"राज्य निवास प्रमाणपत्र", "Annual Family Income Certificate":"परिवार की वार्षिक आय का प्रमाणपत्र", "College Bonafide Certificate":"कॉलेज का बोनाफ़ाइड प्रमाणपत्र", "Attested copy showing passing grades.":"उत्तीर्ण अंकों की प्रमाणित प्रति।", "State residential eligibility proof.":"राज्य निवास पात्रता का प्रमाण।", "Issued by":"जारीकर्ता:", "Done & Return to Portal":"हो गया, पोर्टल पर लौटें",
    "No applications tracked yet":"अभी कोई आवेदन ट्रैक नहीं है", "No saved scholarships yet":"अभी कोई छात्रवृत्ति सहेजी नहीं गई", "Click the heart icon on any card to save it here.":"यहाँ सहेजने के लिए किसी छात्रवृत्ति के दिल वाले आइकन पर क्लिक करें।", "Find matching opportunities in the College Portal to begin tracking.":"ट्रैक करना शुरू करने के लिए कॉलेज पोर्टल में मेल खाती योजनाएँ खोजें।", "Required Supporting Documents Checklist":"ज़रूरी सहायक दस्तावेज़ों की सूची", "Checklist:":"जाँच सूची:", "Matched Opportunities:":"मेल खाती योजनाएँ:", "Curated Opportunities for ":"के लिए चुनी गई योजनाएँ: ", "OFFICIAL STUDENT AID DOSSIER":"आधिकारिक विद्यार्थी सहायता सारांश", "DEMO PREVIEW · NOT SENT":"डेमो पूर्वावलोकन · भेजा नहीं गया", "Annual award":"वार्षिक सहायता", "No saved scholarships yet":"अभी कोई छात्रवृत्ति सहेजी नहीं गई", "Inbox":"इनबॉक्स", "Explore ↗":"खोजें ↗", "Manage ↗":"व्यवस्थित करें ↗", "Copy Summary":"सारांश कॉपी करें", "Print / Save PDF":"प्रिंट / पीडीएफ सहेजें",
    "B.Tech Computer Science & Engineering":"बी.टेक कंप्यूटर साइंस और इंजीनियरिंग", "B.Tech AI & Data Science":"बी.टेक एआई और डेटा साइंस", "B.Tech Electronics & Telecommunication":"बी.टेक इलेक्ट्रॉनिक्स और टेलीकम्युनिकेशन", "B.Tech Mechanical Engineering":"बी.टेक मैकेनिकल इंजीनियरिंग", "MBBS / Medical Sciences":"एमबीबीएस / चिकित्सा विज्ञान", "B.Com / BBA Management":"बी.कॉम / बीबीए प्रबंधन", "Diploma in Engineering":"इंजीनियरिंग डिप्लोमा",
    "Enrolled in eligible STEM technology program":"पात्र एसटीईएम तकनीकी कोर्स में पढ़ाई जारी है", "First-generation college learner preference unlocked":"परिवार में पहली बार कॉलेज जाने वाले विद्यार्थी की प्राथमिकता लागू", "Rural background education criteria matched":"ग्रामीण शिक्षा की शर्त से मेल है", "Project and technology builder profile verified":"प्रोजेक्ट और तकनीकी नवाचारी प्रोफ़ाइल सत्यापित", "Female candidate qualification applied":"महिला उम्मीदवार की पात्रता लागू", "General undergraduate eligibility criteria satisfied":"सामान्य स्नातक पात्रता पूरी", "WHY YOU QUALIFY:":"आप पात्र क्यों हैं:", "Email Scheme":"योजना की जानकारी ईमेल करें", "Tracking ✓":"ट्रैक हो रही है ✓", "Details ↗":"विवरण ↗", "Top Matches":"बेहतरीन मिलान", "Need-Based":"आर्थिक सहायता", "Merit-Based":"मेरिट आधारित", "High eligibility":"उच्च पात्रता", "Top Tier":"सर्वोच्च श्रेणी", "PROFILE FITS TO REVIEW":"देखने के लिए प्रोफ़ाइल मेल", "HIGHEST LISTED BENEFIT":"सबसे बड़ा सूचीबद्ध लाभ", "Indicative profile score only; check each scheme's official rules":"यह केवल अनुमानित प्रोफ़ाइल स्कोर है; हर योजना के आधिकारिक नियम देखें", "Not a guaranteed award":"पुरस्कार की गारंटी नहीं", "PROFILE FIT":"प्रोफ़ाइल मेल", "Possible profile signals · confirm official eligibility:":"संभावित प्रोफ़ाइल मेल · आधिकारिक पात्रता जाँचें:", "Officially listed scholarship cutoffs":"आधिकारिक छात्रवृत्ति की अंतिम तिथियाँ", "Current Month":"वर्तमान महीना", "official portal":"आधिकारिक पोर्टल", "Check official portal":"आधिकारिक पोर्टल देखें", "Check official scheme":"आधिकारिक योजना देखें", "Official source:":"आधिकारिक स्रोत:", "Scheme guidelines":"योजना के दिशा-निर्देश", "Apply / check official portal ↗":"आवेदन करें / आधिकारिक पोर्टल देखें ↗", "Eligibility summary:":"पात्रता सारांश:", "Benefit:":"लाभ:", "Current listing:":"वर्तमान स्थिति:", "Browse ":"देखें ", " official programmes from ":" आधिकारिक योजनाएँ: ", " for academic year ":" शैक्षणिक वर्ष ", "Verified from official provider pages on ":"आधिकारिक प्रदाता पृष्ठों से सत्यापित: ", "Application windows can change. Check the official page before applying.":"आवेदन की तारीख बदल सकती है। आवेदन से पहले आधिकारिक पृष्ठ देखें।", "Person with benchmark disability":"मानक दिव्यांगता वाले विद्यार्थी", "40% or more, with valid certificate":"40% या अधिक, वैध प्रमाणपत्र के साथ", "Email Previews":"ईमेल पूर्वावलोकन", "Email Preview History":"ईमेल पूर्वावलोकन इतिहास", "Official Scholarship Catalogue & Application Tracker":"आधिकारिक छात्रवृत्ति सूची और आवेदन ट्रैकर", "official scholarship listings and show schemes you may want to review.":"आधिकारिक छात्रवृत्तियाँ दिखाते हैं; उपयुक्त योजनाएँ जाँचें।"
  },
  mr: {
    "COLLEGE PORTAL":"महाविद्यालय पोर्टल", "College Portal":"महाविद्यालय पोर्टल", "College Portal & Matches":"महाविद्यालय पोर्टल आणि जुळणाऱ्या योजना",
    "Edit Your Info":"माहिती संपादित करा", "Edit Your Information":"तुमची माहिती संपादित करा", "Discover All":"सर्व शिष्यवृत्ती",
    "Discover Scholarships":"शिष्यवृत्ती शोधा", "My Applications":"माझे अर्ज", "Document Vault":"कागदपत्र केंद्र",
    "Deadlines Calendar":"अंतिम तारीख दिनदर्शिका", "Dispatched Emails":"ईमेल इतिहास", "Email Preview History":"ईमेल इतिहास",
    "Notifications":"सूचना", "Dashboard":"डॅशबोर्ड", "Student":"विद्यार्थी", "Logout":"बाहेर पडा",
    "Search scholarships, degrees...":"शिष्यवृत्ती किंवा अभ्यासक्रम शोधा...", "Search scholarships":"शिष्यवृत्ती शोधा",
    "Profile Completion":"प्रोफाइल पूर्णता", "Upcoming Deadlines":"जवळ येणाऱ्या अंतिम तारखा", "Top Scholarship Matches":"शिष्यवृत्तीचे उत्तम पर्याय",
    "Student Profile Summary":"विद्यार्थी प्रोफाइल सारांश", "Your active details matching scholarships:":"तुमच्या माहितीनुसार जुळणाऱ्या शिष्यवृत्ती:",
    "Family Income":"कुटुंबाचे उत्पन्न", "Open Document Vault":"कागदपत्र केंद्र उघडा", "Modify Student Credentials":"विद्यार्थ्याची माहिती बदला",
    "Explore Scholarships":"शिष्यवृत्ती पहा", "View All":"सर्व पहा", "Search & Filter":"शोधा आणि गाळा",
    "Award Amount":"शिष्यवृत्तीची रक्कम", "Application Deadline":"अर्जाची अंतिम तारीख", "Documents to Prepare":"तयार ठेवायची कागदपत्रे",
    "Required for submission":"सादरीकरणासाठी आवश्यक", "Scholarship Details":"शिष्यवृत्तीचा तपशील", "Close":"बंद करा",
    "Track This Scholarship":"ही शिष्यवृत्ती ट्रॅक करा", "Already Tracking ✓":"आधीच ट्रॅक होत आहे ✓",
    "In preparation":"तयारी सुरू", "Ready to apply":"अर्जासाठी तयार", "Submitted externally":"बाह्य पोर्टलवर सादर",
    "Under review":"पडताळणी सुरू", "Approved":"मंजूर", "Not approved":"मंजूर नाही", "Deadline passed":"अंतिम तारीख संपली",
    "days left":"दिवस बाकी", "days remaining":"दिवस बाकी", "Save Updates":"बदल जतन करा", "Cancel":"रद्द करा",
    "Update Application Status":"अर्जाची स्थिती बदला", "Current Status":"सध्याची स्थिती", "Personal Tracking Notes":"वैयक्तिक नोंदी",
    "Document Record":"कागदपत्र नोंद", "Review Status":"पडताळणी स्थिती", "Mark Verified":"पडताळले असे चिन्हांकित करा",
    "Scholarship added to your applications":"शिष्यवृत्ती अर्ज यादीत जोडली", "Document marked verified":"कागदपत्र पडताळले",
    "Light mode enabled ☀️":"लाइट मोड सुरू ☀️", "Night mode enabled 🌙":"नाईट मोड सुरू 🌙",
    "DISPATCH & ACTIVITY":"सूचना आणि हालचाली", "AI MATCH":"एआय जुळवणी", "Emails":"ईमेल", "Choose language":"भाषा निवडा", "Edit Info":"माहिती संपादित करा",
    "STUDENT PROFILE":"विद्यार्थी प्रोफाइल", "Prepared Documents":"तयार कागदपत्रे", "based on your info":"तुमच्या माहितीवर आधारित", "Annual Award Amount":"वार्षिक शिष्यवृत्ती रक्कम",
    "EMAIL PREVIEWS":"ईमेल इतिहास", "MATCHED SCHOLARSHIPS":"जुळणाऱ्या शिष्यवृत्ती", "TOP MATCH RATING":"सर्वोत्तम जुळवणी", "TOTAL POTENTIAL AID":"एकूण संभाव्य मदत",
    "For top suggested schemes":"प्रमुख सुचवलेल्या योजनांसाठी", "Merit threshold: Met for 8+ schemes":"गुणांची अट: ८ पेक्षा अधिक योजनांसाठी पूर्ण",
    "Qualifies for state & central need funds":"राज्य व केंद्राच्या गरजाधारित मदतीसाठी पात्र", "State & reservation quotas unlocked":"राज्य व आरक्षण कोटे उपलब्ध",
    "Supporting paperwork ready for applications:":"अर्जासाठी आवश्यक कागदपत्रे:", "Why you qualify:":"तुम्ही पात्र का आहात:",
    "Download Application Kit (.html)":"अर्ज संच डाउनलोड करा (.html)", "Open in Real Email Client (Gmail/Outlook)":"ईमेल अॅपमध्ये उघडा (Gmail/Outlook)",
    "Preview Email Summary":"ईमेल सारांश पहा", "Send Scholarship Dossier to Student Email":"विद्यार्थ्याच्या ईमेलसाठी शिष्यवृत्ती सारांश तयार करा",
    "Local demo preview only":"फक्त स्थानिक डेमो पूर्वावलोकन", "No email is sent":"ईमेल पाठवला जात नाही", "Scholarship added to your applications":"शिष्यवृत्ती तुमच्या अर्जांत जोडली",
    "Application added to your applications":"अर्ज तुमच्या यादीत जोडला", "Your active details matching scholarships:":"तुमच्या माहितीनुसार जुळणाऱ्या शिष्यवृत्ती:",
    "Category:":"प्रवर्ग:", "Status:":"स्थिती:", "View details":"तपशील पहा", "Learn more":"अधिक जाणून घ्या", "Apply now":"आता अर्ज करा",
    "No scholarships found":"शिष्यवृत्ती सापडल्या नाहीत", "No applications yet":"अजून अर्ज नाहीत", "No documents uploaded":"कागदपत्रे अपलोड केलेली नाहीत",
    "No upcoming deadlines":"जवळची अंतिम तारीख नाही", "Upload Document":"कागदपत्र अपलोड करा", "Upload documents":"कागदपत्रे अपलोड करा",
    "Choose file":"फाइल निवडा", "All statuses":"सर्व स्थिती", "All categories":"सर्व प्रवर्ग", "All types":"सर्व प्रकार",
    "Filter by status":"स्थितीनुसार गाळा", "Filter scholarships":"शिष्यवृत्ती गाळा", "Sort by":"क्रमवारी लावा",
    "Deadline":"अंतिम तारीख", "Amount":"रक्कम", "Provider":"प्रदाता", "Category":"प्रवर्ग", "Type":"प्रकार", "Status":"स्थिती", "Actions":"कृती",
    "Merit-based":"गुणांवर आधारित", "Need-based":"आर्थिक गरजाधारित", "Special category":"विशेष प्रवर्ग", "Undergraduate":"पदवी शिक्षण",
    "Bonafide certificate":"बोनाफाइड प्रमाणपत्र", "Income certificate":"उत्पन्न प्रमाणपत्र", "Previous marksheet":"मागील गुणपत्रिका",
    "Academic transcript":"शैक्षणिक तपशील", "Admission proof":"प्रवेशाचा पुरावा", "Domicile certificate":"अधिवास प्रमाणपत्र",
    "Family income":"कुटुंबाचे उत्पन्न", "Personal information":"वैयक्तिक माहिती", "Academic information":"शैक्षणिक माहिती",
    "Save Profile":"प्रोफाइल जतन करा", "Save Changes":"बदल जतन करा", "Update Profile":"प्रोफाइल अद्ययावत करा", "Full Name":"पूर्ण नाव",
    "Email Address":"ईमेल पत्ता", "College / Institution":"महाविद्यालय / संस्था", "Course / Degree":"अभ्यासक्रम / पदवी", "Academic Year":"शैक्षणिक वर्ष",
    "Percentage":"टक्केवारी", "GPA":"जीपीए", "Annual Family Income":"कुटुंबाचे वार्षिक उत्पन्न", "Domicile State":"अधिवास राज्य",
    "Select category":"प्रवर्ग निवडा", "Select your category":"तुमचा प्रवर्ग निवडा", "General":"खुला प्रवर्ग", "Other Backward Class":"इतर मागासवर्ग",
    "Scheduled Caste":"अनुसूचित जाती", "Scheduled Tribe":"अनुसूचित जमाती", "Minority":"अल्पसंख्याक", "Female":"महिला", "Male":"पुरुष",
    "Calendar":"दिनदर्शिका", "Month":"महिना", "Previous":"मागील", "Next":"पुढील", "Today":"आज", "Read more":"अधिक वाचा",
    "Mark all as read":"सर्व वाचले असे चिन्हांकित करा", "Mark as read":"वाचले असे चिन्हांकित करा", "All caught up":"सर्व सूचना पाहिल्या",
    "Application status":"अर्जाची स्थिती", "Tracking notes":"ट्रॅकिंग नोंदी", "Add notes":"नोंदी जोडा", "Last updated":"शेवटचे अद्ययावत",
    "Verified":"पडताळले", "Pending review":"पडताळणी प्रलंबित", "Uploaded":"अपलोड केले", "Download":"डाउनलोड करा", "Delete":"काढून टाका",
    "Search by name or provider":"नाव किंवा प्रदात्यानुसार शोधा", "Showing":"दाखवत आहे", "scholarships":"शिष्यवृत्ती",
    "Quick Actions":"जलद कृती", "Recent Activity":"अलीकडील हालचाली", "Your Profile":"तुमचे प्रोफाइल", "View Profile":"प्रोफाइल पहा",
    "Get started":"सुरू करा", "Welcome back":"पुन्हा स्वागत आहे", "Sign in":"साइन इन करा", "Create account":"खाते तयार करा",
    "Password":"पासवर्ड", "Forgot password?":"पासवर्ड विसरलात?", "Continue":"पुढे चला", "Next step":"पुढील टप्पा", "Back":"मागे",
    "Application deadline":"अर्जाची अंतिम तारीख", "Documents required":"आवश्यक कागदपत्रे", "Eligibility":"पात्रता", "Description":"वर्णन",
    "View all scholarships":"सर्व शिष्यवृत्ती पहा", "Track application":"अर्ज ट्रॅक करा", "Save scholarship":"शिष्यवृत्ती जतन करा", "Saved":"जतन केले",
    "Your College Scholarship Journey":"तुमचा महाविद्यालयीन शिष्यवृत्ती प्रवास", "Starts Here.":"इथून सुरू होतो.", "Explore sample central, state, and private scholarship listings matched against your marks, college, and family income.":"तुमचे गुण, महाविद्यालय आणि कुटुंबाचे उत्पन्न यांच्याशी जुळणाऱ्या केंद्र, राज्य आणि खासगी शिष्यवृत्ती पहा.",
    "Create or sign in to your account":"खाते तयार करा किंवा साइन इन करा", "Add Your College & Academic Info":"महाविद्यालय आणि शैक्षणिक माहिती जोडा", "Review matches and prepare applications":"जुळणाऱ्या योजना पहा आणि अर्ज तयार करा",
    "Local account · Scholarship matches are estimates":"स्थानिक खाते · शिष्यवृत्ती जुळवणी अंदाजे आहे", "Student Sign In":"विद्यार्थी साइन इन", "Register New Student":"नवीन विद्यार्थी नोंदणी",
    "Welcome Back, Student!":"पुन्हा स्वागत आहे, विद्यार्थी!", "Create Student Account":"विद्यार्थी खाते तयार करा", "Sign in to access your matched scholarships and edit your information.":"जुळणाऱ्या शिष्यवृत्ती पाहण्यासाठी आणि माहिती बदलण्यासाठी साइन इन करा.",
    "Enter your details to create your scholarship account.":"शिष्यवृत्ती खाते तयार करण्यासाठी माहिती भरा.", "Student Email or PRN / Roll No":"विद्यार्थी ईमेल किंवा पीआरएन / रोल नंबर",
    "Sign In to Portal →":"पोर्टलमध्ये साइन इन करा →", "Register & Add Info →":"नोंदणी करून माहिती भरा →", "OR ONE-CLICK DEMO ACCESS":"किंवा एका क्लिकमध्ये डेमो उघडा",
    "Instant Login ⚡":"झटपट लॉगिन ⚡", "Fill in Your Student & College Credentials":"विद्यार्थी आणि महाविद्यालयाची माहिती भरा", "We compare your profile with ":"तुमच्या प्रोफाइलची तुलना ", " official scholarship listings and show schemes you may want to review.":" अधिकृत शिष्यवृत्तींशी करतो. योग्य योजना तपासा.", 
    "STEP 2 OF 3":"टप्पा २ / ३", "ADD YOUR INFORMATION":"तुमची माहिती भरा", "College / University Details":"महाविद्यालय / विद्यापीठाची माहिती", "Select your institute, ongoing course stream, and year.":"तुमची संस्था, अभ्यासक्रम आणि वर्ष निवडा.",
    "College / University Name":"महाविद्यालय / विद्यापीठाचे नाव", "Degree / Branch":"पदवी / शाखा", "Current Year & Semester":"सध्याचे वर्ष आणि सत्र", "Academic Performance":"शैक्षणिक कामगिरी",
    "Used to compare against merit cutoffs across central and private funds.":"केंद्र आणि खासगी शिष्यवृत्तींच्या गुणांच्या अटीशी तुलना करण्यासाठी.", "Cumulative GPA (10 pt scale)":"एकूण जीपीए (१० गुणांचे प्रमाण)", "Auto-syncs with percentage":"टक्केवारीनुसार आपोआप बदलेल",
    "Overall Percentage (%)":"एकूण टक्केवारी (%)", "Merit evaluation metric":"गुणवत्ता तपासण्याचे माप", "Financial & Social Category":"आर्थिक आणि सामाजिक प्रवर्ग", "Government reservations, need-based funds, and state quotas.":"सरकारी आरक्षण, गरजाधारित मदत आणि राज्य कोट्यासाठी.",
    "Social Category":"सामाजिक प्रवर्ग", "Special Priority Criteria":"विशेष प्राधान्य माहिती", "First-Generation Student":"कुटुंबातील पहिला महाविद्यालयीन विद्यार्थी", "First in family to attend college":"कुटुंबातील महाविद्यालयात जाणारी पहिली व्यक्ती",
    "Women in STEM Candidate":"एसटीईएम क्षेत्रातील महिला विद्यार्थी", "Eligible for Google, Adobe & Tech Grants":"Google, Adobe आणि तंत्रज्ञान अनुदानासाठी पात्र", "Rural / Village Schooling":"ग्रामीण / गावातील शिक्षण",
    "Eligible for rural education grants":"ग्रामीण शिक्षण अनुदानासाठी पात्र", "Project Builder / Innovator":"प्रकल्प निर्माता / नवोन्मेषक", "Has GitHub, patents, or projects":"GitHub, पेटंट किंवा प्रकल्प आहेत",
    "Student Contact & Email Dossier Target":"विद्यार्थी संपर्क आणि ईमेल माहिती", "Your official email where the application kit and matched scholarships will be dispatched.":"तुमचा अधिकृत ईमेल, जिथे अर्ज संच आणि जुळलेल्या शिष्यवृत्तींची माहिती तयार होईल.",
    "Student Full Name":"विद्यार्थ्याचे पूर्ण नाव", "Destination Email Address":"संपर्क ईमेल पत्ता", "Pre-fill Sample Data":"नमुना माहिती भरा", "Save Information & Open College Portal →":"माहिती जतन करून महाविद्यालयीन पोर्टल उघडा →",
    "First year":"पहिले वर्ष", "Second year":"दुसरे वर्ष", "Third year":"तिसरे वर्ष", "Fourth year":"चौथे वर्ष", "Maharashtra":"महाराष्ट्र", "Karnataka":"कर्नाटक", "Delhi":"दिल्ली", "Tamil Nadu":"तामिळनाडू", "Gujarat":"गुजरात", "Uttar Pradesh":"उत्तर प्रदेश", "Other":"इतर",
    "Email Preview History":"ईमेल इतिहास", "View sample email summaries created in this browser. No messages are sent.":"या ब्राउझरमध्ये तयार केलेले ईमेल सारांश पहा. कोणताही संदेश पाठवला जात नाही.", "Create Email Preview":"ईमेल पूर्वावलोकन तयार करा", "Outbox & Sent History":"ईमेल पूर्वावलोकन इतिहास", "sample previews stored in this browser":"नमुना पूर्वावलोकने या ब्राउझरमध्ये जतन केली", "Previews":"पूर्वावलोकने", "Scholarship Application Dossier:":"शिष्यवृत्ती अर्ज सारांश:", "Total Aid:":"एकूण मदत:", "Demo preview":"डेमो पूर्वावलोकन", "View Email Preview":"ईमेल पूर्वावलोकन पहा", "Official Scholarship Catalogue & Application Tracker":"स्वयंचलित शिष्यवृत्ती जुळवणी प्रणाली", "To:":"प्रति:", "College Edition":"महाविद्यालय आवृत्ती", "Scholarship Navigator Alerts":"स्कॉलरशिप नेव्हिगेटर सूचना", "Sign out of student account":"विद्यार्थी खात्यातून लॉग आउट करा",
    "Your Certified Documents Vault":"तुमची पडताळलेली कागदपत्रे", "Organize verification paperwork to speed up application submissions.":"अर्ज लवकर सादर करण्यासाठी पडताळणीची कागदपत्रे व्यवस्थित ठेवा.", "PDF or Image up to 10MB.":"१० एमबीपर्यंतची पीडीएफ किंवा प्रतिमा.", "Choose File":"फाइल निवडा", "Upload & Save":"अपलोड करा आणि जतन करा", "Document Category":"कागदपत्राचा प्रवर्ग", "Latest Semester / Marksheet":"नवीनतम सत्र / गुणपत्रिका", "State Domicile Certificate":"राज्य अधिवास प्रमाणपत्र", "Annual Family Income Certificate":"कुटुंबाच्या वार्षिक उत्पन्नाचे प्रमाणपत्र", "College Bonafide Certificate":"महाविद्यालयाचे बोनाफाइड प्रमाणपत्र", "Attested copy showing passing grades.":"उत्तीर्ण गुण दाखवणारी प्रमाणित प्रत.", "State residential eligibility proof.":"राज्यातील रहिवासाचा पात्रता पुरावा.", "Issued by":"जारी करणारे:", "Done & Return to Portal":"झाले, पोर्टलवर परत जा",
    "No applications tracked yet":"अजून अर्ज ट्रॅक केलेले नाहीत", "No saved scholarships yet":"अजून शिष्यवृत्ती जतन केलेल्या नाहीत", "Click the heart icon on any card to save it here.":"येथे जतन करण्यासाठी शिष्यवृत्तीवरील हृदय चिन्ह दाबा.", "Find matching opportunities in the College Portal to begin tracking.":"ट्रॅकिंग सुरू करण्यासाठी महाविद्यालयीन पोर्टलमध्ये जुळणाऱ्या योजना शोधा.", "Required Supporting Documents Checklist":"आवश्यक कागदपत्रांची यादी", "Checklist:":"तपासणी यादी:", "Matched Opportunities:":"जुळणाऱ्या संधी:", "Curated Opportunities for ":"यांच्यासाठी निवडलेल्या संधी: ", "OFFICIAL STUDENT AID DOSSIER":"अधिकृत विद्यार्थी सहाय्य सारांश", "DEMO PREVIEW · NOT SENT":"डेमो पूर्वावलोकन · पाठवलेले नाही", "Annual award":"वार्षिक मदत", "Inbox":"इनबॉक्स", "Explore ↗":"शोधा ↗", "Manage ↗":"व्यवस्थापित करा ↗", "Copy Summary":"सारांश कॉपी करा", "Print / Save PDF":"प्रिंट / पीडीएफ जतन करा",
    "B.Tech Computer Science & Engineering":"बी.टेक संगणक विज्ञान आणि अभियांत्रिकी", "B.Tech AI & Data Science":"बी.टेक एआय आणि डेटा सायन्स", "B.Tech Electronics & Telecommunication":"बी.टेक इलेक्ट्रॉनिक्स आणि दूरसंचार", "B.Tech Mechanical Engineering":"बी.टेक यांत्रिकी अभियांत्रिकी", "MBBS / Medical Sciences":"एमबीबीएस / वैद्यकीय विज्ञान", "B.Com / BBA Management":"बी.कॉम / बीबीए व्यवस्थापन", "Diploma in Engineering":"अभियांत्रिकी पदविका",
    "Enrolled in eligible STEM technology program":"पात्र एसटीईएम तंत्रज्ञान अभ्यासक्रमात शिक्षण सुरू", "First-generation college learner preference unlocked":"कुटुंबातील पहिल्या महाविद्यालयीन विद्यार्थ्याचे प्राधान्य लागू", "Rural background education criteria matched":"ग्रामीण शिक्षणाच्या निकषांशी जुळते", "Project and technology builder profile verified":"प्रकल्प आणि तंत्रज्ञान नवोन्मेषक प्रोफाइल पडताळले", "Female candidate qualification applied":"महिला उमेदवाराची पात्रता लागू", "General undergraduate eligibility criteria satisfied":"सामान्य पदवी पात्रता पूर्ण", "WHY YOU QUALIFY:":"तुम्ही पात्र का आहात:", "Email Scheme":"योजनेची माहिती ईमेल करा", "Tracking ✓":"ट्रॅक होत आहे ✓", "Details ↗":"तपशील ↗", "Top Matches":"उत्तम जुळवणी", "Need-Based":"गरजाधारित", "Merit-Based":"गुणवत्ताधारित", "High eligibility":"उच्च पात्रता", "Top Tier":"सर्वोत्तम स्तर", "PROFILE FITS TO REVIEW":"पाहण्यासाठी प्रोफाइल जुळवणी", "HIGHEST LISTED BENEFIT":"सर्वाधिक नमूद लाभ", "Indicative profile score only; check each scheme's official rules":"हा केवळ अंदाजे प्रोफाइल गुण आहे; प्रत्येक योजनेचे अधिकृत नियम पहा", "Not a guaranteed award":"शिष्यवृत्तीची हमी नाही", "PROFILE FIT":"प्रोफाइल जुळवणी", "Possible profile signals · confirm official eligibility:":"संभाव्य प्रोफाइल जुळवणी · अधिकृत पात्रता तपासा:", "Officially listed scholarship cutoffs":"अधिकृत शिष्यवृत्ती अंतिम तारखा", "Current Month":"सध्याचा महिना", "official portal":"अधिकृत पोर्टल", "Check official portal":"अधिकृत पोर्टल तपासा", "Check official scheme":"अधिकृत योजना तपासा", "Official source:":"अधिकृत स्रोत:", "Scheme guidelines":"योजनेचे मार्गदर्शक नियम", "Apply / check official portal ↗":"अर्ज करा / अधिकृत पोर्टल पहा ↗", "Eligibility summary:":"पात्रता सारांश:", "Benefit:":"लाभ:", "Current listing:":"सध्याची स्थिती:", "Browse ":"पहा ", " official programmes from ":" अधिकृत योजना: ", " for academic year ":" शैक्षणिक वर्ष ", "Verified from official provider pages on ":"अधिकृत प्रदाता पृष्ठांवरून पडताळले: ", "Application windows can change. Check the official page before applying.":"अर्जाच्या तारखा बदलू शकतात. अर्जापूर्वी अधिकृत पृष्ठ तपासा.", "Person with benchmark disability":"दिव्यांगत्व असलेला विद्यार्थी", "40% or more, with valid certificate":"40% किंवा अधिक, वैध प्रमाणपत्रासह", "Email Previews":"ईमेल पूर्वावलोकने", "Email Preview History":"ईमेल पूर्वावलोकन इतिहास", "Official Scholarship Catalogue & Application Tracker":"अधिकृत शिष्यवृत्ती सूची आणि अर्ज ट्रॅकर", "official scholarship listings and show schemes you may want to review.":"अधिकृत शिष्यवृत्ती दाखवतो; योग्य योजना तपासा."
  }
};

const originalTranslationText = new WeakMap();
const originalTranslationAttrs = new WeakMap();
function translateInterface(root = document) {
  const language = state.language || "en";
  const dictionary = interfaceText[language] || {};
  document.documentElement.lang = language;
  [$("#language-select"), $("#global-language-select")].forEach(select => { if (select) select.value = language; });
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    if (node.parentElement?.closest("[data-no-translate]")) return;
    if (!originalTranslationText.has(node)) originalTranslationText.set(node, node.nodeValue);
    const sourceValue = originalTranslationText.get(node);
    let value = sourceValue;
    const trimmed = sourceValue.trim();
    if (dictionary[trimmed]) value = sourceValue.replace(trimmed, dictionary[trimmed]);
    else Object.entries(dictionary).sort((a, b) => b[0].length - a[0].length).forEach(([english, translated]) => {
      if (!sourceValue.includes(english)) return;
      if (english.includes(" ")) value = value.split(english).join(translated);
      else {
        const escaped = english.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        value = value.replace(new RegExp(`(^|[^A-Za-z])${escaped}(?=$|[^A-Za-z])`, "g"), `$1${translated}`);
      }
    });
    if (value !== node.nodeValue) node.nodeValue = value;
  });
  const pageTitle = document.title.split(" · ")[0];
  if (dictionary[pageTitle]) document.title = `${dictionary[pageTitle]} · Scholarship Navigator`;
  const elements = [root, ...root.querySelectorAll("*")].filter(el => el?.getAttribute);
  elements.forEach(el => {
    if (el.closest("[data-no-translate]")) return;
    ["placeholder", "title", "aria-label", "alt"].forEach(attr => {
      if (!el.hasAttribute(attr)) return;
      let originals = originalTranslationAttrs.get(el);
      if (!originals) { originals = {}; originalTranslationAttrs.set(el, originals); }
      if (!(attr in originals)) originals[attr] = el.getAttribute(attr);
      let value = originals[attr];
      Object.entries(dictionary).sort((a, b) => b[0].length - a[0].length).forEach(([english, translated]) => {
        if (!value.includes(english)) return;
        if (english.includes(" ")) value = value.split(english).join(translated);
        else {
          const escaped = english.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          value = value.replace(new RegExp(`(^|[^A-Za-z])${escaped}(?=$|[^A-Za-z])`, "g"), `$1${translated}`);
        }
      });
      if (el.getAttribute(attr) !== value) el.setAttribute(attr, value);
    });
  });
}

// Storage Persistence
const STORAGE_KEY = "scholarshipNavigator.workspace.v5";
let backendAuthenticated = false;
let stateSaveTimer = null;
function serverStatePayload() {
  return {
    profile: state.profile, applications: state.applications, documents: state.documents,
    notifications: state.notifications, saved: [...state.saved], sentEmails: state.sentEmails,
    language: state.language || "en", page: state.page
  };
}
async function flushServerState() {
  if (!backendAuthenticated) return;
  const response = await fetch("/api/state", {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(serverStatePayload())
  });
  if (!response.ok) throw new Error((await response.json()).error || "Could not save your changes.");
}
function mergeServerState(remote) {
  if (!remote || typeof remote !== "object") return;
  if (remote.profile && typeof remote.profile === "object") state.profile = { ...state.profile, ...remote.profile };
  if (Array.isArray(remote.applications)) state.applications = remote.applications;
  if (Array.isArray(remote.documents)) state.documents = remote.documents;
  if (Array.isArray(remote.notifications)) state.notifications = remote.notifications;
  if (Array.isArray(remote.saved)) state.saved = new Set(remote.saved);
  if (Array.isArray(remote.sentEmails)) state.sentEmails = remote.sentEmails;
  if (["en", "hi", "mr"].includes(remote.language)) state.language = remote.language;
  if (typeof remote.page === "string") state.page = remote.page;
}
function persistState() {
  try {
    const snapshot = {
      authTab: state.auth.authTab,
      theme: document.body.classList.contains("soft-dark"),
      language: state.language || "en"
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    updateBadges();
    if (backendAuthenticated) {
      clearTimeout(stateSaveTimer);
      stateSaveTimer = setTimeout(() => flushServerState().catch(err => {
        console.error("Backend save failed", err);
        toast("Could not sync changes to the server. Check that it is running.");
      }), 250);
    }
  } catch (err) {
    console.warn("Could not save to localStorage", err);
  }
}

function restoreState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    // A browser cache must never grant access; the server session is checked at startup.
    state.auth = { isLoggedIn: false, username: "", authTab: data.authTab || "login" };
    state.appMode = "login";
    if (data.theme) document.body.classList.add("soft-dark");
    if (["en", "hi", "mr"].includes(data.language)) state.language = data.language;
  } catch (err) {
    console.warn("Could not restore state", err);
  }
}

function updateBadges() {
  const notifCount = state.notifications.filter(n => n.unread).length;
  const notifBadge = $("#sidebar-notif-count");
  if (notifBadge) notifBadge.textContent = notifCount;

  const emailBadge = $("#sidebar-email-count");
  if (emailBadge) emailBadge.textContent = state.sentEmails.length;

  const topEmail = $("#topbar-email-badge");
  if (topEmail) topEmail.textContent = `(${state.sentEmails.length})`;

  const schCount = $("#sidebar-scholarship-count");
  if (schCount) schCount.textContent = scholarshipData.length;

  // Sidebar student info
  const sName = $("#sidebar-student-name");
  if (sName) sName.textContent = state.profile.name || "Student";
  const sSub = $("#sidebar-student-sub");
  if (sSub) sSub.textContent = (state.profile.course || "").split(" ")[0] + " Student";
  const sAvatar = $("#sidebar-avatar");
  if (sAvatar) sAvatar.textContent = getInitials(state.profile.name);

  // Topbar student info
  const tName = $("#top-student-name");
  if (tName) tName.textContent = (state.profile.name || "Student").split(" ")[0];
  const tAvatar = $("#top-avatar");
  if (tAvatar) tAvatar.textContent = getInitials(state.profile.name);
}

function getInitials(name = "") {
  return name.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase() || "GC";
}

// Helpers
function esc(s = "") {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function dateObj(d) { return d ? new Date(d + "T12:00:00") : null; }
function dateLabel(d) {
  const date = dateObj(d);
  const locale = state.language === "hi" ? "hi-IN" : state.language === "mr" ? "mr-IN" : "en-IN";
  return date ? date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" }) : "Check official portal";
}
function daysLeft(d) {
  const date = dateObj(d);
  return date ? Math.ceil((date - new Date(new Date().toDateString())) / 86400000) : null;
}
function pill(text, tone = "") { return `<span class="pill ${tone}">${esc(text)}</span>`; }
function logo(s) { return `<div class="provider-logo ${s.tone || ""}">${esc(s.initials)}</div>`; }
function scholarship(id) { return scholarshipData.find(s => s.id === Number(id)); }
function schemeText(s, field) {
  return s?.translations?.[state.language]?.[field] || s?.[field] || "";
}

function intro(title, desc, action = "") {
  return `<div class="page-header"><div><div class="welcome-eyebrow"><span class="live-dot"></span> SCHOLARSHIP NAVIGATOR</div><h1 class="page-title">${title}</h1><p class="page-description">${desc}</p></div>${action}</div>`;
}
function panel(title, subtitle, body, action = "") {
  return `<section class="panel"><div class="panel-head"><div><h3 class="panel-title">${title}</h3><p class="panel-subtitle">${subtitle}</p></div>${action}</div><div class="panel-body">${body}</div></section>`;
}
function statusClass(s) {
  if (["READY_TO_APPLY", "APPROVED", "VERIFIED"].includes(s)) return "status-ready";
  if (["SUBMITTED_EXTERNALLY", "UNDER_REVIEW", "PREPARING"].includes(s)) return "status-progress";
  if (["REJECTED", "NEEDS_ATTENTION"].includes(s)) return "status-rejected";
  return "status-pending";
}
function statusName(s) {
  return ({
    PREPARING: "In preparation",
    READY_TO_APPLY: "Ready to apply",
    SUBMITTED_EXTERNALLY: "Submitted externally",
    UNDER_REVIEW: "Under review",
    APPROVED: "Approved",
    REJECTED: "Not approved",
    CLOSED: "Closed"
  })[s] || s;
}
function daysTag(s) {
  let d = daysLeft(s.deadline);
  if (d === null) return pill("Check official portal", "blue");
  return d < 0 ? pill("Deadline passed", "rose") : d <= 7 ? pill(`${d} days left`, "amber") : pill(`${d} days left`, "blue");
}
function currentSchemeStatus(s) {
  return s.deadline && daysLeft(s.deadline) < 0 ? "Listed deadline has passed; check the official portal" : (s.status || "Check official portal");
}
function stat(label, value, icon, tone, foot) {
  return `<div class="stat-card"><div class="stat-top"><span>${label}</span><span class="stat-icon ${tone}">${icon}</span></div><div class="stat-value count-up" data-value="${value}">0</div><div class="stat-foot">${foot}</div></div>`;
}

// Dynamic Matching Algorithm
function calculateScholarshipMatches(profile = state.profile) {
  const p = profile;
  const percentage = parseFloat(p.percentage) || (parseFloat(p.gpa) ? parseFloat(p.gpa) * 9.5 : 75);
  const income = Number.isFinite(parseFloat(p.income)) ? parseFloat(p.income) : 200000;
    const isFemale = p.gender === "Female" || Boolean(p.isFemaleStem);

  return scholarshipData.map(s => {
    let score = 55;
    let reasons = [];
    const elig = s.eligibility || {};

    if (elig.renewalOnly && p.year === "First year") {
      score -= 45;
      reasons.push("Current NSP listing is renewal-only; new applicants may not be eligible");
    }

    if (elig.minPercentage) {
      if (percentage >= elig.minPercentage) {
        score += 20;
        reasons.push(`Academic score (${percentage}%) meets or exceeds ${elig.minPercentage}% requirement`);
      } else {
        score -= 25;
      }
    } else {
      score += 10;
    }

    if (elig.maxIncome) {
      if (income <= elig.maxIncome) {
        score += 15;
        reasons.push(`Family annual income (₹${income.toLocaleString("en-IN")}) is within ceiling (₹${elig.maxIncome.toLocaleString("en-IN")})`);
      } else {
        score -= 30;
      }
    }

    if (elig.domicile && elig.domicile !== "All") {
      const domicileMatches = Array.isArray(elig.domicile)
        ? elig.domicile.some(place => place.toLowerCase() === (p.domicile || "").toLowerCase())
        : elig.domicile.toLowerCase() === (p.domicile || "").toLowerCase();
      if (domicileMatches) {
        score += 20;
        reasons.push(`Domicile verified for ${p.domicile} state quota`);
      } else {
        score -= 40;
      }
    }

    if (elig.isPwd) {
      if (p.isPwd) { score += 20; reasons.push("Disability profile may meet the scheme's disability category; check certificate criteria"); }
      else score -= 35;
    }
    if (elig.courseKeywords?.length) {
      const courseMatches = elig.courseKeywords.some(keyword => (p.course || "").toLowerCase().includes(keyword.toLowerCase()));
      if (courseMatches) score += 10;
      else score -= 30;
    }

    if (elig.gender && elig.gender.toLowerCase() === "female") {
      if (isFemale) {
        score += 25;
        reasons.push(`Female candidate qualification applied`);
      } else {
        score -= 50;
      }
    }

    if (elig.isStem && (p.course.toLowerCase().includes("tech") || p.course.toLowerCase().includes("computer") || p.course.toLowerCase().includes("science"))) {
      score += 10;
      reasons.push(`Enrolled in eligible STEM technology program`);
    }

    if (elig.isFirstGen && p.isFirstGen) {
      score += 25;
      reasons.push(`First-generation college learner preference unlocked`);
    }
    if (elig.isRural && p.isRural) {
      score += 20;
      reasons.push(`Rural background education criteria matched`);
    }
    if (elig.isInnovator && p.isInnovator) {
      score += 15;
      reasons.push(`Project and technology builder profile verified`);
    }
    if (elig.category && elig.category !== "all") {
      if (p.category && p.category.toLowerCase().includes(elig.category.toLowerCase())) {
        score += 15;
        reasons.push(`Category criteria for ${elig.category} matched`);
      } else if (p.category) {
        score -= 35;
      }
    }

    let finalMatch = Math.min(99, Math.max(38, Math.round(score)));
    if (reasons.length === 0) {
      reasons.push(`General undergraduate eligibility criteria satisfied`);
    }

    return {
      ...s,
      calculatedMatch: finalMatch,
      matchConfidence: s.matchConfidence || "Indicative only",
      matchReasons: reasons
    };
  }).sort((a, b) => b.calculatedMatch - a.calculatedMatch);
}

// -------------------------------------------------------------
// SCREEN 1: STUDENT LOGIN RENDERER
// -------------------------------------------------------------
function renderAuthScreen() {
  const authRoot = $("#auth-view");
  if (!authRoot) return;
  authRoot.style.display = "flex";
  $("#intake-view").style.display = "none";
  $("#portal-view").style.display = "none";

  const isLogin = state.auth.authTab !== "register";
  document.body.classList.remove("portal-language-active");
  document.title = "Scholarship Navigator — Official Scholarship Information and Application Tracking";

  authRoot.innerHTML = `
    <div class="auth-card-container">
      <div class="auth-left-pane">
        <div>
          <div class="auth-brand">
            <span class="auth-brand-ico">
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="white" stroke-width="1.8" fill="none"><path d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z"/><path d="M6.5 10.5v5.2c3.6 2.8 7.4 2.8 11 0v-5.2M21 9v6"/></svg>
            </span>
            <span>Scholarship<span style="opacity:0.65">Navigator</span></span>
          </div>

          <h2 class="auth-hero-title">Your College Scholarship Journey <span>Starts Here.</span></h2>
          <p class="auth-hero-desc">Explore sample central, state, and private scholarship listings matched against your marks, college, and family income.</p>

          <div class="auth-features-list">
            <div class="auth-feature-item">
              <span class="auth-feature-check">✓</span>
              <span><strong>Step 1:</strong> Create or sign in to your account</span>
            </div>
            <div class="auth-feature-item">
              <span class="auth-feature-check">✓</span>
              <span><strong>Step 2:</strong> Add Your College & Academic Info</span>
            </div>
            <div class="auth-feature-item">
              <span class="auth-feature-check">✓</span>
              <span><strong>Step 3:</strong> Review matches and prepare applications</span>
            </div>
          </div>
        </div>

        <div class="auth-footer-badge">
          <span class="live-dot"></span>
          <span>Local account · Scholarship matches are estimates</span>
        </div>
      </div>

      <div class="auth-right-pane">
        <div class="auth-tab-switch">
          <button class="auth-tab-btn ${isLogin ? "active" : ""}" id="tab-login">Student Sign In</button>
          <button class="auth-tab-btn ${!isLogin ? "active" : ""}" id="tab-register">Register New Student</button>
        </div>

        <h3 class="auth-form-title">${isLogin ? "Welcome Back, Student!" : "Create Student Account"}</h3>
        <p class="auth-form-sub">${isLogin ? "Sign in to access your matched scholarships and edit your information." : "Enter your details to create your scholarship account."}</p>

        <form id="auth-form">
          ${!isLogin ? `
            <div class="auth-input-group">
              <label>Full Name</label>
              <input type="text" id="auth-name" placeholder="e.g. Gajanan Chavan" required value="${esc(state.profile.name)}">
            </div>
          ` : ""}

          <div class="auth-input-group">
            <label>Student Email or PRN / Roll No</label>
            <input type="email" id="auth-email" placeholder="student@example.com" required value="${esc(state.profile.email)}">
          </div>

          <div class="auth-input-group">
            <label>Password</label>
            <input type="password" id="auth-pass" placeholder="••••••••" value="student123" required>
          </div>

          <button type="submit" class="btn btn-primary btn-auth-submit">
            <span>${isLogin ? "Sign In to Portal →" : "Register & Add Info →"}</span>
          </button>
        </form>

        <div class="auth-demo-divider">OR ONE-CLICK DEMO ACCESS</div>

        <!-- 1-Click Demo Login Card -->
        <div class="demo-student-card" id="btn-quick-demo-login">
          <div class="demo-card-left">
            <div class="avatar avatar-lavender">GC</div>
            <div class="demo-card-text">
              <strong>Gajanan Chavan</strong>
              <span>B.Tech CSE @ G. H. Raisoni University</span>
            </div>
          </div>
          <button class="btn-demo-click">Instant Login ⚡</button>
        </div>
      </div>
    </div>
  `;

  $("#tab-login").onclick = () => { state.auth.authTab = "login"; renderAuthScreen(); };
  $("#tab-register").onclick = () => { state.auth.authTab = "register"; renderAuthScreen(); };

  $("#auth-form").onsubmit = async e => {
    e.preventDefault();
    const emailInput = $("#auth-email").value;
    const nameInput = $("#auth-name") ? $("#auth-name").value : state.profile.name;
    const isLogin = state.auth.authTab !== "register";
    const credentials = { email: emailInput, password: $("#auth-pass").value };
    if (!isLogin) credentials.name = nameInput;
    try {
      const response = await fetch(isLogin ? "/api/login" : "/api/register", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(credentials)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not sign in.");
      backendAuthenticated = true;
      state.auth.isLoggedIn = true;
      state.auth.username = result.user.name;
      state.profile.email = result.user.email;
      state.profile.name = result.user.name;
      mergeServerState(result.state);
      if (!result.state) {
        state.applications = [];
        state.documents = [];
        state.notifications = [];
        state.sentEmails = [];
        state.saved = new Set();
        state.profile.hasCompletedIntake = false;
      }
      state.appMode = "intake";
      persistState();
      toast(`Welcome, ${state.profile.name.split(" ")[0]}!`);
      renderIntakeScreen();
    } catch (err) {
      toast(err.message || "Unable to reach the backend. Run start.command first.");
    }
  };

  $("#btn-quick-demo-login").onclick = async () => {
    try {
      const response = await fetch("/api/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "gajanan.student@example.com", password: "student123" })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not sign in.");
      backendAuthenticated = true;
      state.auth.isLoggedIn = true;
      state.auth.username = result.user.name;
      state.profile.email = result.user.email;
      state.profile.name = result.user.name;
      mergeServerState(result.state);
      state.appMode = "intake";
      persistState();
      toast("Signed in to the demo account.");
      renderIntakeScreen();
    } catch (err) {
      toast(err.message || "Unable to reach the backend. Run start.command first.");
    }
  };
}

// -------------------------------------------------------------
// SCREEN 2: ADD YOUR INFORMATION (ONBOARDING WIZARD)
// -------------------------------------------------------------
function renderIntakeScreen() {
  const intakeRoot = $("#intake-view");
  if (!intakeRoot) return;
  intakeRoot.style.display = "block";
  $("#auth-view").style.display = "none";
  $("#portal-view").style.display = "none";

  const p = state.profile;
  document.body.classList.remove("portal-language-active");
  document.title = "Scholarship Navigator — Official Scholarship Information and Application Tracking";

  intakeRoot.innerHTML = `
    <div class="intake-view-wrap">
      <div class="intake-onboarding-header">
        <div class="intake-stepper-pill">
          <span>✦ STEP 2 OF 3</span> · ADD YOUR INFORMATION
        </div>
        <h1>Fill in Your Student & College Credentials</h1>
        <p>We compare your profile with ${scholarshipData.length} official scholarship listings and show schemes you may want to review.</p>
      </div>

      <form id="onboarding-intake-form">
        <!-- 1. College Details -->
        <div class="intake-card">
          <div class="intake-card-title"><span class="icon">🏛</span> College / University Details</div>
          <p class="intake-card-sub">Select your institute, ongoing course stream, and year.</p>

          <div class="field">
            <label>College / University Name</label>
            <input name="institution" id="intake-inst" value="${esc(p.institution)}" required placeholder="e.g. G. H. Raisoni University, IIT, COEP">
            <div class="chip-group">
              <button type="button" class="chip-btn ${p.institution.includes("Raisoni") ? "active" : ""}" data-chip-inst="G. H. Raisoni International Skill Tech University">G. H. Raisoni</button>
              <button type="button" class="chip-btn ${p.institution.includes("COEP") ? "active" : ""}" data-chip-inst="COEP Technological University, Pune">COEP Pune</button>
              <button type="button" class="chip-btn ${p.institution.includes("IIT") ? "active" : ""}" data-chip-inst="IIT Bombay">IIT Bombay</button>
              <button type="button" class="chip-btn ${p.institution.includes("SPPU") ? "active" : ""}" data-chip-inst="Savitribai Phule Pune University (SPPU)">SPPU Pune</button>
            </div>
          </div>

          <div class="field-grid">
            <div class="field">
              <label>Degree / Branch</label>
              <select name="course" id="intake-course">
                <option ${p.course.includes("Computer Science") ? "selected" : ""}>B.Tech Computer Science & Engineering</option>
                <option ${p.course.includes("AI") ? "selected" : ""}>B.Tech AI & Data Science</option>
                <option ${p.course.includes("Electronics") ? "selected" : ""}>B.Tech Electronics & Telecommunication</option>
                <option ${p.course.includes("Mechanical") ? "selected" : ""}>B.Tech Mechanical Engineering</option>
                <option ${p.course.includes("MBBS") ? "selected" : ""}>MBBS / Medical Sciences</option>
                <option ${p.course.includes("B.Com") ? "selected" : ""}>B.Com / BBA Management</option>
                <option ${p.course.includes("Diploma") ? "selected" : ""}>Diploma in Engineering</option>
              </select>
            </div>
            <div class="field">
              <label>Current Year & Semester</label>
              <div style="display:flex;gap:6px">
                <select name="year" style="flex:1.2">
                  <option ${p.year === "First year" ? "selected" : ""}>First year</option>
                  <option ${p.year === "Second year" ? "selected" : ""}>Second year</option>
                  <option ${p.year === "Third year" ? "selected" : ""}>Third year</option>
                  <option ${p.year === "Fourth year" ? "selected" : ""}>Fourth year</option>
                </select>
                <select name="semester" style="flex:0.8">
                  ${[1, 2, 3, 4, 5, 6, 7, 8].map(s => `<option ${String(p.semester) === String(s) ? "selected" : ""}>Sem ${s}</option>`).join("")}
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Academic Performance -->
        <div class="intake-card">
          <div class="intake-card-title"><span class="icon">📊</span> Academic Performance</div>
          <p class="intake-card-sub">Used to compare against merit cutoffs across central and private funds.</p>

          <div class="field-grid">
            <div class="field">
              <label>Cumulative GPA (10 pt scale)</label>
              <input type="number" step="0.1" min="4.0" max="10.0" name="gpa" id="intake-gpa" value="${esc(p.gpa || "8.6")}">
              <span class="field-hint">Auto-syncs with percentage</span>
            </div>
            <div class="field">
              <label>Overall Percentage (%)</label>
              <input type="number" min="40" max="100" name="percentage" id="intake-pct" value="${esc(p.percentage || "86")}">
              <span class="field-hint">Merit evaluation metric</span>
            </div>
          </div>
        </div>

        <!-- 3. Financial & Category Eligibility -->
        <div class="intake-card">
          <div class="intake-card-title"><span class="icon">🏷</span> Financial & Social Category</div>
          <p class="intake-card-sub">Government reservations, need-based funds, and state quotas.</p>

          <div class="field">
            <label>Annual Family Income (₹)</label>
            <input type="number" step="5000" name="income" id="intake-income" value="${esc(p.income || "180000")}" required>
            <div class="chip-group">
              <button type="button" class="chip-btn ${Number(p.income) <= 150000 ? "active" : ""}" data-chip-income="120000">&lt; ₹1.5 Lakh</button>
              <button type="button" class="chip-btn ${Number(p.income) > 150000 && Number(p.income) <= 250000 ? "active" : ""}" data-chip-income="180000">₹1.8L (MahaDBT/NSP)</button>
              <button type="button" class="chip-btn ${Number(p.income) > 250000 && Number(p.income) <= 450000 ? "active" : ""}" data-chip-income="350000">₹3.5L (Central)</button>
              <button type="button" class="chip-btn ${Number(p.income) > 450000 ? "active" : ""}" data-chip-income="600000">₹6.0L (Open)</button>
            </div>
          </div>

          <div class="field-grid">
            <div class="field">
              <label>Domicile State</label>
              <select name="domicile">
                ${["Maharashtra", "Karnataka", "Delhi", "Tamil Nadu", "Gujarat", "Uttar Pradesh", "Other"].map(st => `<option ${(p.domicile || "").toLowerCase() === st.toLowerCase() ? "selected" : ""}>${st}</option>`).join("")}
              </select>
            </div>
            <div class="field">
              <label>Social Category</label>
              <select name="category">
                ${["OBC", "General / Open", "SC", "ST", "EWS", "Minority"].map(cat => `<option ${(p.category || "").includes(cat) ? "selected" : ""}>${cat}</option>`).join("")}
              </select>
            </div>
          </div>

          <div class="field">
            <label>Gender</label>
            <div style="display:flex;gap:12px">
              <label style="display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;cursor:pointer">
                <input type="radio" name="gender" value="Male" ${p.gender !== "Female" ? "checked" : ""}> Male
              </label>
              <label style="display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;cursor:pointer">
                <input type="radio" name="gender" value="Female" ${p.gender === "Female" ? "checked" : ""}> Female (Unlocks Women in STEM & Tech Awards)
              </label>
            </div>
          </div>

          <label style="font-size:10px;font-weight:800;color:#65617f;margin-top:12px;display:block">Special Priority Criteria</label>
          <div class="criteria-grid">
            <label class="criteria-card">
              <input type="checkbox" name="isFirstGen" ${p.isFirstGen ? "checked" : ""}>
              <div class="criteria-card-text">
                <strong>First-Generation Student</strong>
                <small>First in family to attend college</small>
              </div>
            </label>
            <label class="criteria-card">
              <input type="checkbox" name="isFemaleStem" ${p.isFemaleStem || p.gender === "Female" ? "checked" : ""}>
              <div class="criteria-card-text">
                <strong>Women in STEM Candidate</strong>
                <small>Eligible for Google, Adobe & Tech Grants</small>
              </div>
            </label>
            <label class="criteria-card">
              <input type="checkbox" name="isRural" ${p.isRural ? "checked" : ""}>
              <div class="criteria-card-text">
                <strong>Rural / Village Schooling</strong>
                <small>Eligible for rural education grants</small>
              </div>
            </label>
            <label class="criteria-card">
              <input type="checkbox" name="isInnovator" ${p.isInnovator ? "checked" : ""}>
              <div class="criteria-card-text">
                <strong>Project Builder / Innovator</strong>
                <small>Has GitHub, patents, or projects</small>
              </div>
            </label>
            <label class="criteria-card">
              <input type="checkbox" name="isPwd" ${p.isPwd ? "checked" : ""}>
              <div class="criteria-card-text">
                <strong>Person with benchmark disability</strong>
                <small>40% or more, with valid certificate</small>
              </div>
            </label>
          </div>
        </div>

        <!-- 4. Contact & Email Target -->
        <div class="intake-card">
          <div class="intake-card-title"><span class="icon">✉</span> Student Contact & Email Dossier Target</div>
          <p class="intake-card-sub">Your official email where the application kit and matched scholarships will be dispatched.</p>

          <div class="field-grid">
            <div class="field">
              <label>Student Full Name</label>
              <input name="name" value="${esc(p.name)}" required>
            </div>
            <div class="field">
              <label>Destination Email Address</label>
              <input type="email" name="email" value="${esc(p.email)}" required placeholder="student@example.com">
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px">
            <button type="button" class="btn btn-secondary" id="btn-quick-intake-fill">⚡ Pre-fill Sample Data</button>
            <button type="submit" class="btn btn-primary btn-edit-info-pulse" style="padding:14px 24px;font-size:12px">
              <span>🚀 Save Information & Open College Portal →</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  `;

  // GPA <-> Percentage synchronization
  const gpaInput = $("#intake-gpa");
  const pctInput = $("#intake-pct");
  if (gpaInput && pctInput) {
    gpaInput.oninput = () => {
      const g = parseFloat(gpaInput.value);
      if (g && g <= 10) pctInput.value = Math.min(100, Math.round(g * 9.5));
    };
    pctInput.oninput = () => {
      const p = parseFloat(pctInput.value);
      if (p && p <= 100) gpaInput.value = (p / 9.5).toFixed(1);
    };
  }

  // Preset chips
  $$("[data-chip-inst]").forEach(b => {
    b.onclick = () => {
      $("#intake-inst").value = b.dataset.chipInst;
      $$("[data-chip-inst]").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
    };
  });
  $$("[data-chip-income]").forEach(b => {
    b.onclick = () => {
      $("#intake-income").value = b.dataset.chipIncome;
      $$("[data-chip-income]").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
    };
  });

  $("#btn-quick-intake-fill").onclick = () => {
    toast("Pre-filled sample student profile!");
  };

  $("#onboarding-intake-form").onsubmit = e => {
    e.preventDefault();
    saveIntakeFormData(new FormData(e.target));
    state.profile.hasCompletedIntake = true;
    state.appMode = "portal";
    persistState();
    toast("🎓 Information saved! Opening your personalized portal...");
    renderPortal();
  };
}

function saveIntakeFormData(f) {
  const p = state.profile;
  ["name", "email", "phone", "institution", "course", "year", "semester", "gpa", "percentage", "income", "domicile", "category", "gender"].forEach(k => {
    if (f.has(k)) p[k] = f.get(k);
  });
  p.isFirstGen = f.has("isFirstGen");
  p.isFemaleStem = f.has("isFemaleStem") || p.gender === "Female";
  p.isRural = f.has("isRural");
  p.isInnovator = f.has("isInnovator");
  p.isPwd = f.has("isPwd");
  p.completion = Math.min(100, Math.round(60 + (p.email ? 10 : 0) + (p.institution ? 10 : 0) + (p.percentage ? 10 : 0) + (p.income ? 10 : 0)));
}

// -------------------------------------------------------------
// SCREEN 3: MAIN SCHOLARSHIP PORTAL
// -------------------------------------------------------------
function renderPortal() {
  const portalRoot = $("#portal-view");
  if (!portalRoot) return;
  portalRoot.style.display = "block";
  $("#auth-view").style.display = "none";
  $("#intake-view").style.display = "none";

  persistState();
  updateBadges();

  const p = state.page;
  document.body.classList.add("portal-language-active");
  const pageTitles = {
    "college-dashboard": "College Portal & Matches",
    "edit-info": "Edit Your Information",
    discover: "Discover Scholarships",
    applications: "My Applications",
    documents: "Document Vault",
    deadlines: "Deadlines Calendar",
    emails: "Email Preview History",
    notifications: "Notifications"
  };

  document.title = `${pageTitles[p] || "College Portal"} · Scholarship Navigator`;
  const crumb = $("#crumb-title");
  if (crumb) crumb.textContent = pageTitles[p] || "College Portal";

  $$(".nav-link").forEach(b => {
    b.classList.toggle("active", b.dataset.page === p);
  });

  if (p === "college-dashboard") {
    renderCollegeDashboard();
  } else if (p === "edit-info") {
    renderEditInfoPage();
  } else if (p === "discover") {
    renderDiscover();
  } else if (p === "applications") {
    renderApplications();
  } else if (p === "documents") {
    renderDocuments();
  } else if (p === "deadlines") {
    renderDeadlines();
  } else if (p === "emails") {
    renderEmails();
  } else if (p === "notifications") {
    renderNotifications();
  } else {
    renderCollegeDashboard();
  }

  const languageSelect = $("#language-select");
  if (languageSelect) languageSelect.value = state.language || "en";
  translateInterface(portalRoot);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// -------------------------------------------------------------
// COLLEGE DASHBOARD RENDERER (PORTAL KHULNE KE BAAD)
// -------------------------------------------------------------
function renderCollegeDashboard() {
  const p = state.profile;
  const matches = calculateScholarshipMatches(p);

  let filtered = matches;
  if (state.collegeFilterTab === "top") filtered = matches.filter(m => m.calculatedMatch >= 88);
  else if (state.collegeFilterTab === "need") filtered = matches.filter(m => m.type === "Need-based");
  else if (state.collegeFilterTab === "merit") filtered = matches.filter(m => m.type === "Merit-based");
  else if (state.collegeFilterTab === "special") filtered = matches.filter(m => m.type === "Special category");

  const highestListedBenefit = Math.max(...matches.map(curr => curr.amount || 0));
  const topMatchScore = matches[0]?.calculatedMatch || 96;

  $("#page-content").innerHTML = `
    <div class="page-enter">
      <!-- ========================================================
           PROMINENT "EDIT YOUR INFO" BANNER AT THE TOP OF PORTAL
           ======================================================== -->
      <section class="student-status-banner">
        <div class="status-banner-left">
          <div class="avatar avatar-lavender banner-avatar">${getInitials(p.name)}</div>
          <div>
            <div class="status-banner-badge"><span class="live-dot"></span> STUDENT PROFILE</div>
            <h2 class="status-student-name">${esc(p.name)}</h2>
            <p class="status-student-meta">
              <span>🏛 ${esc(p.institution)}</span> ·
              <span>🎓 ${esc(p.course)} (${esc(p.year)})</span> ·
              <span>📊 GPA ${esc(p.gpa)} (${esc(p.percentage)}%)</span> ·
              <span>🏷 Category: ${esc(p.category)}</span> ·
              <span>📍 ${esc(p.domicile)}</span>
            </p>
          </div>
        </div>

        <div class="status-banner-right">
          <!-- PROMINENT EDIT YOUR INFO BUTTON -->
          <button class="btn btn-edit-info-pulse" id="btn-banner-edit-info" title="Edit your college credentials, GPA, income or stream">
            <span>✏️ Edit Your Info</span>
          </button>
          <button class="btn btn-secondary btn-small" id="btn-banner-email-dossier" style="background:rgba(255,255,255,0.18);color:#fff;border-color:rgba(255,255,255,0.3)">
            <span>📨 Email Dossier</span>
          </button>
        </div>
      </section>

      <!-- Quick Metrics Row -->
      <div class="college-metrics-grid">
        <div class="metric-mini-card">
          <div class="metric-mini-top"><span>PROFILE FITS TO REVIEW</span><span style="color:#6d59f3">◈</span></div>
          <div class="metric-mini-val count-up" data-value="${matches.filter(m => m.calculatedMatch >= 75).length}">0</div>
          <div class="metric-mini-sub">Indicative profile score only; check each scheme's official rules</div>
        </div>
        <div class="metric-mini-card">
          <div class="metric-mini-top"><span>HIGHEST LISTED BENEFIT</span><span style="color:#1da778">₹</span></div>
          <div class="metric-mini-val">${money(highestListedBenefit)}</div>
          <div class="metric-mini-sub">Not a guaranteed award</div>
        </div>
        <div class="metric-mini-card">
          <div class="metric-mini-top"><span>TOP MATCH RATING</span><span style="color:#e49b25">★</span></div>
          <div class="metric-mini-val count-up" data-value="${topMatchScore}">0</div>
          <div class="metric-mini-sub"><span class="trend">Top Tier</span> ${esc(matches[0]?.name.slice(0, 22))}...</div>
        </div>
        <div class="metric-mini-card">
          <div class="metric-mini-top"><span>EMAIL PREVIEWS</span><span style="color:#2f9ae0">✉</span></div>
          <div class="metric-mini-val count-up" data-value="${state.sentEmails.length}">0</div>
          <div class="metric-mini-sub">Target: ${esc(p.email)}</div>
        </div>
      </div>

      <!-- Split Grid: Suggestions on Left & Actions on Right -->
      <div class="college-split-grid">
        <!-- Main: Suggestions list -->
        <div class="suggestions-col">
          <!-- EMAIL DISPATCH CALL TO ACTION -->
          <div class="email-dispatch-cta">
            <div class="email-dispatch-cta-top">
              <div>
                <h3 class="email-dispatch-cta-title">📬 Send Scholarship Dossier to Student Email</h3>
                <p class="email-dispatch-cta-desc">Create a sample email summary with matched scholarships, deadlines, document checklists, and portal links for <strong>${esc(p.email)}</strong>. This local demo does not send email.</p>
              </div>
              <div style="font-size:26px">✉️</div>
            </div>

            <div class="email-input-row">
              <input type="email" id="cta-email-target" value="${esc(p.email)}" placeholder="Enter destination student email address">
              <button class="btn-dispatch" id="btn-trigger-email-dispatch">
                <span>📨 Preview Email Summary</span> <span>↗</span>
              </button>
            </div>

            <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">
              <button class="btn btn-small btn-secondary btn-real-email" id="btn-open-real-email" title="Open directly in your system email client (Outlook / Gmail / Windows Mail)">
                <span>📧 Open in Real Email Client (Gmail/Outlook)</span>
              </button>
              <button class="btn btn-small btn-secondary btn-real-email" id="btn-download-dossier" style="background:#fff;color:#282046" title="Download scholarship kit document">
                <span>📥 Download Application Kit (.html)</span>
              </button>
            </div>

            <div class="email-cta-footer">
              <span>Local demo preview only</span>
              <span>✓ No email is sent</span>
              <span>📄 Sample scholarship summary</span>
            </div>
          </div>

          <!-- Filter Tabs -->
          <div class="match-filter-tabs">
            <button class="match-tab-btn ${state.collegeFilterTab === "all" ? "active" : ""}" data-tab="all">All Suggestions (${matches.length})</button>
            <button class="match-tab-btn ${state.collegeFilterTab === "top" ? "active" : ""}" data-tab="top">⭐ Top Matches &gt;88%</button>
            <button class="match-tab-btn ${state.collegeFilterTab === "need" ? "active" : ""}" data-tab="need">₹ Need-Based</button>
            <button class="match-tab-btn ${state.collegeFilterTab === "merit" ? "active" : ""}" data-tab="merit">🎓 Merit-Based</button>
            <button class="match-tab-btn ${state.collegeFilterTab === "special" ? "active" : ""}" data-tab="special">🏢 STEM & Corporate</button>
          </div>

          <!-- Suggestions Cards -->
          <div class="suggestions-list">
            ${filtered.map((item, idx) => `
              <article class="suggestion-card ${item.calculatedMatch >= 90 ? "top-tier" : ""}">
                <div class="suggestion-header">
                  <div style="display:flex;align-items:center;gap:10px">
                    ${logo(item)}
                    <div>
                      <h4 class="suggestion-title" data-no-translate>${esc(item.name)}</h4>
                      <span class="suggestion-provider" data-no-translate>${esc(item.provider)}</span>
                    </div>
                  </div>
                  <div>
                    <span class="match-badge-large ${item.calculatedMatch >= 85 ? "high" : "medium"}">
                      ${item.calculatedMatch}% PROFILE FIT
                    </span>
                  </div>
                </div>

                <div class="match-reasons-wrap">
                  <div class="match-reasons-title">Possible profile signals · confirm official eligibility:</div>
                  ${item.matchReasons.slice(0, 3).map(r => `
                    <div class="match-reason-item">
                      <span class="check">•</span>
                      <span data-no-translate>${esc(r)}</span>
                    </div>
                  `).join("")}
                </div>

                <div style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0">
                  ${pill(item.type)}
                  ${pill(item.level, "blue")}
                  ${daysTag(item)}
                </div>

                <div class="suggestion-meta-row">
                  <div>
                    <div class="suggestion-award">${money(item.amount)}<small>${esc(item.benefit || "Check official scheme")}</small></div>
                  </div>
                  <div class="suggestion-actions">
                    <button class="btn btn-small btn-secondary btn-email-single" data-sch-id="${item.id}" title="Send this single scholarship to student's email">
                      ✉️ Email Scheme
                    </button>
                    <button class="btn btn-small btn-primary" data-track-id="${item.id}">
                      ${state.applications.some(a => a.scholarshipId === item.id) ? "Tracking ✓" : "＋ Track"}
                    </button>
                    <button class="btn btn-small btn-ghost" data-details="${item.id}">
                      Details ↗
                    </button>
                  </div>
                </div>
              </article>
            `).join("")}
          </div>
        </div>

        <!-- Right Side: Student Summary & Quick Edit card -->
        <div>
          <div class="intake-card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
              <div class="intake-card-title"><span class="icon">✏️</span> Student Profile Summary</div>
              <button class="btn btn-small btn-primary" id="btn-side-edit-info">Edit Info ↗</button>
            </div>
            <p class="intake-card-sub">Your active details matching scholarships:</p>

            <div class="activity-list">
              <div class="activity-item">
                <span class="activity-dot">🏛</span>
                <div style="flex:1">
                  <strong>${esc(p.institution)}</strong>
                  <p>${esc(p.course)} · ${esc(p.year)}</p>
                </div>
              </div>
              <div class="activity-item">
                <span class="activity-dot">📊</span>
                <div style="flex:1">
                  <strong>GPA ${esc(p.gpa)} (${esc(p.percentage)}%)</strong>
                  <p>Profile scores are indicative; scheme rules vary</p>
                </div>
              </div>
              <div class="activity-item">
                <span class="activity-dot">₹</span>
                <div style="flex:1">
                  <strong>Family Income: ₹${Number(p.income).toLocaleString("en-IN")}</strong>
                  <p>Check income and course rules for each scheme</p>
                </div>
              </div>
              <div class="activity-item">
                <span class="activity-dot">📍</span>
                <div style="flex:1">
                  <strong>${esc(p.domicile)} · Category: ${esc(p.category)}</strong>
                  <p>Some schemes have specific state/category rules</p>
                </div>
              </div>
            </div>

            <button class="btn btn-secondary" id="btn-re-open-edit" style="width:100%;margin-top:14px">
              ✏️ Modify Student Credentials
            </button>
          </div>

          <!-- Document Vault Quick Peek -->
          <div class="intake-card">
            <div class="intake-card-title"><span class="icon">▧</span> Prepared Documents</div>
            <p class="intake-card-sub">Supporting paperwork ready for applications:</p>
            <div class="activity-list">
              ${state.documents.slice(0, 3).map(d => `
                <div class="activity-item">
                  <span class="activity-dot">✓</span>
                  <div style="flex:1">
                    <strong>${esc(d.name)}</strong>
                    <p>${esc(d.filename)} · Status: ${esc(d.status)}</p>
                  </div>
                </div>
              `).join("")}
            </div>
            <button class="btn btn-ghost" data-page="documents" style="width:100%;text-align:center;margin-top:8px">
              Open Document Vault ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  animateNumbers();

  // Wire up "Edit Your Info" buttons
  const bannerEdit = $("#btn-banner-edit-info");
  if (bannerEdit) bannerEdit.onclick = () => navigate("edit-info");

  const sideEdit = $("#btn-side-edit-info");
  if (sideEdit) sideEdit.onclick = () => navigate("edit-info");

  const reOpenEdit = $("#btn-re-open-edit");
  if (reOpenEdit) reOpenEdit.onclick = () => navigate("edit-info");

  // Email triggers
  const bannerEmail = $("#btn-banner-email-dossier");
  if (bannerEmail) bannerEmail.onclick = () => simulateEmailSend(state.profile.email);

  const triggerEmailBtn = $("#btn-trigger-email-dispatch");
  if (triggerEmailBtn) {
    triggerEmailBtn.onclick = () => {
      const target = $("#cta-email-target").value || state.profile.email;
      simulateEmailSend(target);
    };
  }

  // Real Email Client trigger (mailto)
  const realEmailBtn = $("#btn-open-real-email");
  if (realEmailBtn) {
    realEmailBtn.onclick = () => openRealEmailClient(matches.slice(0, 5));
  }

  // Download application kit
  const downloadKitBtn = $("#btn-download-dossier");
  if (downloadKitBtn) {
    downloadKitBtn.onclick = () => downloadApplicationKit(matches.slice(0, 5));
  }

  // Tab buttons
  $$(".match-tab-btn").forEach(b => {
    b.onclick = () => {
      state.collegeFilterTab = b.dataset.tab;
      renderCollegeDashboard();
    };
  });

  // Single scheme email buttons
  $$(".btn-email-single").forEach(b => {
    b.onclick = () => simulateEmailSend(state.profile.email, Number(b.dataset.schId));
  });

  // Track buttons
  $$("[data-track-id]").forEach(b => {
    b.onclick = () => {
      const id = Number(b.dataset.trackId);
      if (!state.applications.some(a => a.scholarshipId === id)) {
        state.applications.push({
          id: Date.now(),
          scholarshipId: id,
          status: "PREPARING",
          updated: new Date().toISOString().slice(0, 10),
          reference: "",
          note: "Matched and tracked from College Portal"
        });
        persistState();
        toast("Scholarship added to your application tracker!");
        renderCollegeDashboard();
      } else {
        toast("Already tracked in your applications");
      }
    };
  });
}

// -------------------------------------------------------------
// EDIT YOUR INFORMATION PAGE
// -------------------------------------------------------------
function renderEditInfoPage() {
  const p = state.profile;

  $("#page-content").innerHTML = `
    <div class="page-enter">
      ${intro(
        "Edit Your Information",
        "Update your college, academic GPA, family income, or category details. Your scholarship matches will instantly recalculate.",
        `<button class="btn btn-primary" id="btn-save-edit-top">Save & Update Matches ✓</button>`
      )}

      <form id="edit-info-form">
        <div class="two-col">
          <!-- 1. College & Program -->
          <section class="panel form-card">
            <h3>College & Degree Details</h3>
            <p>Accreditation and current enrolled program.</p>

            <div class="field">
              <label>College / University Name</label>
              <input name="institution" id="edit-inst" value="${esc(p.institution)}" required>
              <div class="chip-group">
                <button type="button" class="chip-btn ${p.institution.includes("Raisoni") ? "active" : ""}" data-edit-chip-inst="G. H. Raisoni International Skill Tech University">G. H. Raisoni</button>
                <button type="button" class="chip-btn ${p.institution.includes("COEP") ? "active" : ""}" data-edit-chip-inst="COEP Technological University, Pune">COEP Pune</button>
                <button type="button" class="chip-btn ${p.institution.includes("IIT") ? "active" : ""}" data-edit-chip-inst="IIT Bombay">IIT Bombay</button>
                <button type="button" class="chip-btn ${p.institution.includes("SPPU") ? "active" : ""}" data-edit-chip-inst="Savitribai Phule Pune University (SPPU)">SPPU</button>
              </div>
            </div>

            <div class="field">
              <label>Degree / Branch</label>
              <select name="course">
                <option ${p.course.includes("Computer Science") ? "selected" : ""}>B.Tech Computer Science & Engineering</option>
                <option ${p.course.includes("AI") ? "selected" : ""}>B.Tech AI & Data Science</option>
                <option ${p.course.includes("Electronics") ? "selected" : ""}>B.Tech Electronics & Telecommunication</option>
                <option ${p.course.includes("Mechanical") ? "selected" : ""}>B.Tech Mechanical Engineering</option>
                <option ${p.course.includes("MBBS") ? "selected" : ""}>MBBS / Medical Sciences</option>
                <option ${p.course.includes("B.Com") ? "selected" : ""}>B.Com / BBA Management</option>
                <option ${p.course.includes("Diploma") ? "selected" : ""}>Diploma in Engineering</option>
              </select>
            </div>

            <div class="field-grid">
              <div class="field">
                <label>Current Year</label>
                <select name="year">
                  <option ${p.year === "First year" ? "selected" : ""}>First year</option>
                  <option ${p.year === "Second year" ? "selected" : ""}>Second year</option>
                  <option ${p.year === "Third year" ? "selected" : ""}>Third year</option>
                  <option ${p.year === "Fourth year" ? "selected" : ""}>Fourth year</option>
                </select>
              </div>
              <div class="field">
                <label>Semester</label>
                <select name="semester">
                  ${[1, 2, 3, 4, 5, 6, 7, 8].map(s => `<option ${String(p.semester) === String(s) ? "selected" : ""}>Sem ${s}</option>`).join("")}
                </select>
              </div>
            </div>
          </section>

          <!-- 2. Academic Score -->
          <section class="panel form-card">
            <h3>Academic Performance</h3>
            <p>GPA and percentage for merit-based criteria.</p>

            <div class="field-grid">
              <div class="field">
                <label>Cumulative GPA (10 pt scale)</label>
                <input type="number" step="0.1" min="4.0" max="10.0" name="gpa" id="edit-gpa" value="${esc(p.gpa)}">
                <span class="field-hint">Auto-syncs with percentage</span>
              </div>
              <div class="field">
                <label>Percentage (%)</label>
                <input type="number" min="40" max="100" name="percentage" id="edit-pct" value="${esc(p.percentage)}">
                <span class="field-hint">Used for cutoff matching</span>
              </div>
            </div>

            <div class="field">
              <label>Gender</label>
              <div style="display:flex;gap:12px;margin-top:4px">
                <label style="display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;cursor:pointer">
                  <input type="radio" name="gender" value="Male" ${p.gender !== "Female" ? "checked" : ""}> Male
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;cursor:pointer">
                  <input type="radio" name="gender" value="Female" ${p.gender === "Female" ? "checked" : ""}> Female (Women in STEM)
                </label>
              </div>
            </div>
          </section>

          <!-- 3. Financial & Category -->
          <section class="panel form-card">
            <h3>Financial Eligibility</h3>
            <p>Family income ceilings and quotas.</p>

            <div class="field">
              <label>Annual Family Income (₹)</label>
              <input type="number" step="5000" name="income" id="edit-income" value="${esc(p.income)}">
              <div class="chip-group">
                <button type="button" class="chip-btn ${Number(p.income) <= 150000 ? "active" : ""}" data-edit-chip-inc="120000">&lt; ₹1.5L</button>
                <button type="button" class="chip-btn ${Number(p.income) > 150000 && Number(p.income) <= 250000 ? "active" : ""}" data-edit-chip-inc="180000">₹1.8L</button>
                <button type="button" class="chip-btn ${Number(p.income) > 250000 && Number(p.income) <= 450000 ? "active" : ""}" data-edit-chip-inc="350000">₹3.5L</button>
                <button type="button" class="chip-btn ${Number(p.income) > 450000 ? "active" : ""}" data-edit-chip-inc="600000">₹6.0L</button>
              </div>
            </div>

            <div class="field-grid">
              <div class="field">
                <label>Domicile State</label>
                <select name="domicile">
                  ${["Maharashtra", "Karnataka", "Delhi", "Tamil Nadu", "Gujarat", "Other"].map(st => `<option ${(p.domicile || "").toLowerCase() === st.toLowerCase() ? "selected" : ""}>${st}</option>`).join("")}
                </select>
              </div>
              <div class="field">
                <label>Social Category</label>
                <select name="category">
                  ${["OBC", "General / Open", "SC", "ST", "EWS", "Minority"].map(cat => `<option ${(p.category || "").includes(cat) ? "selected" : ""}>${cat}</option>`).join("")}
                </select>
              </div>
            </div>
          </section>

          <!-- 4. Special Criteria & Contact -->
          <section class="panel form-card">
            <h3>Special Categories & Contact</h3>
            <p>Target notification destination.</p>

            <div class="field">
              <label>Student Full Name</label>
              <input name="name" value="${esc(p.name)}" required>
            </div>
            <div class="field">
              <label>Destination Email Address</label>
              <input type="email" name="email" value="${esc(p.email)}" required>
            </div>

            <label style="font-size:10px;font-weight:800;color:#65617f;margin-top:10px;display:block">Special Priority Flags</label>
            <div class="criteria-grid">
              <label class="criteria-card">
                <input type="checkbox" name="isFirstGen" ${p.isFirstGen ? "checked" : ""}>
                <div class="criteria-card-text">
                  <strong>First-Gen Learner</strong>
                  <small>First in family</small>
                </div>
              </label>
              <label class="criteria-card">
                <input type="checkbox" name="isFemaleStem" ${p.isFemaleStem || p.gender === "Female" ? "checked" : ""}>
                <div class="criteria-card-text">
                  <strong>Women in STEM</strong>
                  <small>Tech & CS grants</small>
                </div>
              </label>
              <label class="criteria-card">
                <input type="checkbox" name="isRural" ${p.isRural ? "checked" : ""}>
                <div class="criteria-card-text">
                  <strong>Rural Education</strong>
                  <small>Rural schooling</small>
                </div>
              </label>
              <label class="criteria-card">
                <input type="checkbox" name="isInnovator" ${p.isInnovator ? "checked" : ""}>
                <div class="criteria-card-text">
                  <strong>Project Builder</strong>
                  <small>GitHub/Projects</small>
                </div>
              </label>
              <label class="criteria-card">
                <input type="checkbox" name="isPwd" ${p.isPwd ? "checked" : ""}>
                <div class="criteria-card-text">
                  <strong>Person with benchmark disability</strong>
                  <small>40% or more, with valid certificate</small>
                </div>
              </label>
            </div>
          </section>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px">
          <button type="button" class="btn btn-secondary" onclick="navigate('college-dashboard')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-edit-info-pulse" style="padding:13px 22px">
            <span>✓ Save Information & Update Matches</span>
          </button>
        </div>
      </form>
    </div>
  `;

  // GPA <-> Percentage sync
  const gpa = $("#edit-gpa");
  const pct = $("#edit-pct");
  if (gpa && pct) {
    gpa.oninput = () => {
      const g = parseFloat(gpa.value);
      if (g && g <= 10) pct.value = Math.min(100, Math.round(g * 9.5));
    };
    pct.oninput = () => {
      const pc = parseFloat(pct.value);
      if (pc && pc <= 100) gpa.value = (pc / 9.5).toFixed(1);
    };
  }

  $$("[data-edit-chip-inst]").forEach(b => {
    b.onclick = () => {
      $("#edit-inst").value = b.dataset.editChipInst;
      $$("[data-edit-chip-inst]").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
    };
  });
  $$("[data-edit-chip-inc]").forEach(b => {
    b.onclick = () => {
      $("#edit-income").value = b.dataset.editChipInc;
      $$("[data-edit-chip-inc]").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
    };
  });

  const saveEdit = e => {
    if (e) e.preventDefault();
    saveIntakeFormData(new FormData($("#edit-info-form")));
    persistState();
    toast("Information updated! Matches recalculated.");
    navigate("college-dashboard");
  };

  $("#edit-info-form").onsubmit = saveEdit;
  $("#btn-save-edit-top").onclick = saveEdit;
}

// -------------------------------------------------------------
// EMAIL DISPATCH SIMULATOR & INBOX VIEWER
// -------------------------------------------------------------
function simulateEmailSend(targetEmail, singleScholarshipId = null) {
  const p = state.profile;
  const matches = calculateScholarshipMatches(p);
  const selectedItems = singleScholarshipId
    ? [scholarship(singleScholarshipId)]
    : matches.slice(0, 5);

  const aidSummary = selectedItems.length === 1
    ? money(selectedItems[0]?.amount)
    : "See individual schemes; amounts are not combined";

  // Animated dispatch modal
  openModal("Dispatching Scholarship Application Kit", `
    <div class="dispatch-overlay-content">
      <div class="dispatch-orb">✉️</div>
      <h3 style="font:800 16px var(--display);margin:0 0 6px;color:#221e3f">
        Sending Scholarship Dossier...
      </h3>
      <p style="font-size:11px;color:#85809e;margin:0 0 16px">
        Connecting to Mail Dispatch Gateway & generating report for <strong style="color:#5745dd">${esc(targetEmail)}</strong>
      </p>

      <div class="dispatch-progress-outer">
        <div class="dispatch-progress-inner" id="dispatch-progress-bar"></div>
      </div>

      <div class="dispatch-steps-list" id="dispatch-log-lines">
        <div class="dispatch-log-line active">
          <span class="dispatch-log-dot"></span>
          <span>Preparing a local email preview (demo mode)...</span>
        </div>
      </div>
    </div>
  `);

  const progressBar = $("#dispatch-progress-bar");
  const logContainer = $("#dispatch-log-lines");

  function addLog(msg, isLast = false) {
    if (!logContainer) return;
    const line = document.createElement("div");
    line.className = "dispatch-log-line active";
    line.innerHTML = `<span class="dispatch-log-dot" style="${isLast ? "background:#12b77a" : ""}"></span><span>${msg}</span>`;
    logContainer.appendChild(line);
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  setTimeout(() => {
    if (progressBar) progressBar.style.width = "35%";
    addLog(`Demo recipient selected: ${esc(targetEmail)} (no network email sent)`);
  }, 450);

  setTimeout(() => {
    if (progressBar) progressBar.style.width = "70%";
    addLog(`Compiling ${selectedItems.length} scholarship eligibility summaries & deadlines...`);
    addLog(`Attaching document checklists for ${esc(p.institution)}...`);
  }, 1050);

  setTimeout(() => {
    if (progressBar) progressBar.style.width = "100%";
    addLog(`Demo preview ready for ${esc(targetEmail)}. No email was sent.`, true);
  }, 1650);

  setTimeout(() => {
    const newEmailRecord = {
      id: "EM-" + Date.now().toString().slice(-4),
      to: targetEmail,
      studentName: p.name,
      collegeName: p.institution,
      course: p.course,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      subject: singleScholarshipId
        ? `🎓 Scholarship Application Dossier: ${selectedItems[0].name}`
        : `🎓 Your Curated Scholarship Application Dossier (${selectedItems.length} Matches Found)`,
      totalAid: aidSummary,
      scholarshipsCount: selectedItems.length,
      status: "Demo preview",
      items: selectedItems
    };

    state.sentEmails.unshift(newEmailRecord);

    state.notifications.unshift({
      title: "Scholarship email preview created",
      message: `A local demo preview for ${targetEmail} is ready. No email was sent.`,
      time: "Just now",
      icon: "✉",
      unread: true
    });

    persistState();
    toast(`✉️ Demo preview ready. No email was sent.`);
    displayEmailPreviewModal(newEmailRecord);
  }, 2200);
}

function displayEmailPreviewModal(emailRecord) {
  openModal("Dispatched Email Inbox View", `
    <div class="email-client-modal">
      <div class="email-client-topbar">
        <div style="display:flex;align-items:center;gap:8px">
          <span>📬 <strong>Inbox</strong> &gt; Scholarship Navigator Alerts</span>
        </div>
        <div>
          <span class="email-client-badge-verified">DEMO PREVIEW · NOT SENT</span>
        </div>
      </div>

      <div class="email-client-header">
        <h3 class="email-subject">${esc(emailRecord.subject)}</h3>
        <div class="email-participants">
          <div class="email-sender-avatar">SN</div>
          <div class="email-meta-info">
            <strong>Scholarship Navigator · Sample sender</strong>
            <span>To: ${esc(emailRecord.studentName)} &lt;${esc(emailRecord.to)}&gt; · ${emailRecord.date} at ${emailRecord.time}</span>
          </div>
        </div>
      </div>

      <div class="email-body-content">
        <div style="background:linear-gradient(135deg,#6552e6,#4733cf);color:#fff;border-radius:12px;padding:18px 20px;margin-bottom:18px">
          <div style="font-size:9px;font-weight:800;letter-spacing:1px;color:#ffd875">OFFICIAL STUDENT AID DOSSIER</div>
          <h2 style="font:800 17px var(--display);margin:6px 0 4px;color:#fff">Curated Opportunities for ${esc(emailRecord.collegeName)}</h2>
          <p style="font-size:10px;color:#d8d2ff;margin:0">Degree Program: ${esc(emailRecord.course)} · Listed benefit: <strong>${esc(emailRecord.totalAid)}</strong></p>
        </div>

        <p>Dear <strong>${esc(emailRecord.studentName)}</strong>,</p>
        <p>Based on the profile information saved in this browser for <strong>${esc(emailRecord.collegeName)}</strong>, here is a sample scholarship summary:</p>

        <div class="email-digest-box">
          <div style="font-size:10px;font-weight:800;color:#5745dd;text-transform:uppercase;margin-bottom:10px">
            Your Matched Scholarship Opportunities (${emailRecord.scholarshipsCount})
          </div>
          ${emailRecord.items.map((item, idx) => `
            <div class="email-digest-item">
              <div class="email-item-info">
                <strong>${idx + 1}. ${esc(item.name)}</strong>
                <span>Provider: ${esc(item.provider)} · Type: ${esc(item.type || "Scholarship")}</span>
              </div>
              <div class="email-item-right">
                <div class="amount">${money(item.amount)}</div>
                <div class="deadline">Deadline: ${dateLabel(item.deadline)}</div>
              </div>
            </div>
          `).join("")}
        </div>

        <h4 style="font:800 12px var(--display);margin:16px 0 8px;color:#221e3f">Required Supporting Documents Checklist</h4>
        <div class="activity-list" style="margin-bottom:16px">
          <div class="activity-item" style="padding:6px 0"><span class="activity-dot" style="width:22px;height:22px;font-size:10px">✓</span><div><strong>Latest Semester / Marksheet</strong><p>Attested copy showing passing grades.</p></div></div>
          <div class="activity-item" style="padding:6px 0"><span class="activity-dot" style="width:22px;height:22px;font-size:10px">✓</span><div><strong>College Bonafide Certificate</strong><p>Issued by ${esc(emailRecord.collegeName)}.</p></div></div>
          <div class="activity-item" style="padding:6px 0"><span class="activity-dot" style="width:22px;height:22px;font-size:10px">✓</span><div><strong>Annual Family Income Certificate</strong><p>Tahsil / Competent Revenue Office.</p></div></div>
          <div class="activity-item" style="padding:6px 0"><span class="activity-dot" style="width:22px;height:22px;font-size:10px">✓</span><div><strong>State Domicile Certificate</strong><p>State residential eligibility proof.</p></div></div>
        </div>

        <div class="alert-note" style="background:#f4f1ff;color:#5947d6;border-radius:10px;padding:12px;font-size:10px;line-height:1.7">
          ⓘ Keep track of application deadlines directly in your Scholarship Navigator workspace.
        </div>
      </div>

      <div class="modal-footer" style="padding:14px 20px;border-top:1px solid #f0ecf7;background:#faf9fd">
        <button class="btn btn-secondary" id="btn-print-email">🖨️ Print / Save PDF</button>
        <button class="btn btn-secondary" id="btn-copy-email">📋 Copy Summary</button>
        <button class="btn btn-primary" data-close>Done & Return to Portal</button>
      </div>
    </div>
  `);

  const printBtn = $("#btn-print-email");
  if (printBtn) printBtn.onclick = () => window.print();

  const copyBtn = $("#btn-copy-email");
  if (copyBtn) {
    copyBtn.onclick = () => {
      const summaryText = `Scholarship Dossier for ${emailRecord.studentName} at ${emailRecord.collegeName}:\n` +
        emailRecord.items.map(i => `• ${i.name} - ${money(i.amount)} (Deadline: ${i.deadline})`).join("\n");
      navigator.clipboard.writeText(summaryText);
      toast("Summary copied to clipboard!");
    };
  }
}

// Real Email Client Launcher (mailto:)
function openRealEmailClient(items) {
  const p = state.profile;
  const subject = encodeURIComponent(`Scholarship Application Dossier for ${p.name} - ${p.institution}`);
  const bodyText = `Hello ${p.name},\n\nHere are your personalized scholarship matches for ${p.institution} (${p.course}):\n\n` +
    items.map((it, idx) => `${idx + 1}. ${it.name}\nProvider: ${it.provider}\nAward: ${money(it.amount)}\nDeadline: ${it.deadline}\nOfficial Portal: ${it.portalUrl || "https://scholarships.gov.in"}\n`).join("\n") +
    `\nRequired Documents:\n- Marksheet\n- Bonafide Certificate\n- Income Certificate\n- Domicile Certificate\n\nBest regards,\nScholarship Navigator Support`;

  const mailtoUrl = `mailto:${encodeURIComponent(p.email)}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
  window.open(mailtoUrl, "_blank");
  toast("Opening your system email client (Outlook/Gmail)!");
}

// Downloadable Dossier File
function downloadApplicationKit(items) {
  const p = state.profile;
  const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Scholarship Application Kit - ${p.name}</title><style>body{font-family:sans-serif;padding:30px;line-height:1.6;color:#222}h1{color:#4834d4}.item{border:1px solid #ddd;padding:15px;margin-bottom:12px;border-radius:8px}</style></head><body><h1>Scholarship Application Dossier</h1><p><strong>Student:</strong> ${p.name} | <strong>College:</strong> ${p.institution} | <strong>Course:</strong> ${p.course} | <strong>GPA:</strong> ${p.gpa}</p><hr><h2>Matched Opportunities:</h2>${items.map(it => `<div class="item"><h3>${it.name}</h3><p><strong>Provider:</strong> ${it.provider} | <strong>Award:</strong> ${money(it.amount)} | <strong>Deadline:</strong> ${it.deadline}</p><p>${it.desc}</p></div>`).join("")}<h2>Checklist:</h2><ul><li>Semester Marksheet</li><li>College Bonafide</li><li>Income Certificate</li><li>Domicile Certificate</li></ul></body></html>`;
  
  const blob = new Blob([htmlContent], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Scholarship-Kit-${p.name.replace(/\s+/g, "_")}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  toast("Application kit file downloaded!");
}

// -------------------------------------------------------------
// EMAIL PREVIEWS HUB PAGE
// -------------------------------------------------------------
function renderEmails() {
  const list = state.sentEmails;

  $("#page-content").innerHTML = `
    <div class="page-enter">
      ${intro(
        "Email Preview History",
        "View sample email summaries created in this browser. No messages are sent.",
        `<button class="btn btn-primary" id="btn-new-email-blast">📨 Create Email Preview</button>`
      )}

      <div class="panel">
        <div class="panel-head">
          <div>
            <h3 class="panel-title">Outbox & Sent History</h3>
            <p class="panel-subtitle">${list.length} sample previews stored in this browser</p>
          </div>
          <div>${pill(`${list.length} Previews`, "blue")}</div>
        </div>
        <div class="panel-body">
          ${list.length ? `
            <div class="email-history-list">
              ${list.map(item => `
                <div class="email-history-card">
                  <div class="email-history-left">
                    <div class="email-history-ico">✉</div>
                    <div>
                      <strong style="font:800 12px var(--display);color:#242042;display:block">${esc(item.subject)}</strong>
                      <span style="font-size:10px;color:#8f8ba3;display:block;margin-top:3px">
                        To: <strong>${esc(item.to)}</strong> · ${item.date} at ${item.time} · Listed benefit: <strong>${esc(item.totalAid)}</strong> (${item.scholarshipsCount} schemes)
                      </span>
                    </div>
                  </div>
                  <div style="display:flex;align-items:center;gap:10px">
                    <span class="status-dot status-pending">${esc(item.status || "Demo preview")}</span>
                    <button class="btn btn-small btn-secondary btn-view-dispatched" data-email-id="${item.id}">
                      View Email Preview ↗
                    </button>
                  </div>
                </div>
              `).join("")}
            </div>
          ` : `
            <div class="empty-state">
              <div class="empty-icon">✉</div>
              <h3>No emails dispatched yet</h3>
              <p>Open the College Portal to create a sample email summary. No message will be sent.</p>
              <button class="btn btn-primary" onclick="navigate('college-dashboard')" style="margin-top:14px">Open College Portal</button>
            </div>
          `}
        </div>
      </div>
    </div>
  `;

  $$(".btn-view-dispatched").forEach(b => {
    b.onclick = () => {
      const rec = list.find(x => x.id === b.dataset.emailId);
      if (rec) displayEmailPreviewModal(rec);
    };
  });

  const blastBtn = $("#btn-new-email-blast");
  if (blastBtn) blastBtn.onclick = () => simulateEmailSend(state.profile.email);
}

// -------------------------------------------------------------
// DISCOVER SCHOLARSHIPS PAGE
// -------------------------------------------------------------
function renderDiscover() {
  const q = state.search.toLowerCase();
  const matches = calculateScholarshipMatches(state.profile);

  let list = matches.filter(s => {
    const text = (s.name + " " + s.provider + " " + s.desc + " " + s.type + " " + (s.tags || []).join(" ")).toLowerCase();
    const typeMatch = state.filter === "All types" || s.type === state.filter;
    return text.includes(q) && typeMatch;
  });

  if (state.sort === "Closest deadline") list.sort((a, b) => (a.deadline || "9999-12-31").localeCompare(b.deadline || "9999-12-31"));
  else if (state.sort === "Award amount") list.sort((a, b) => b.amount - a.amount);
  else if (state.sort === "Name A–Z") list.sort((a, b) => a.name.localeCompare(b.name));
  else list.sort((a, b) => b.calculatedMatch - a.calculatedMatch);

  $("#page-content").innerHTML = `
    <div class="page-enter">
      ${intro(
        "Discover Scholarships",
        `Browse ${scholarshipData.length} official programmes from NSP, UGC, AICTE, and Maharashtra MahaDBT for academic year ${window.scholarshipCatalogMeta?.academicYear || "2026-27"}.`,
        `<button class="btn btn-secondary" id="saved-filter">♡ Saved <span>${state.saved.size}</span></button>`
      )}

      <div class="panel-subtitle" style="margin:-12px 0 16px;padding:12px 14px;border-radius:10px;background:#f5f3ff;color:#514a70">
        Verified from official provider pages on ${window.scholarshipCatalogMeta?.lastVerified || "the date shown on each source"}. Application windows can change. Check the official page before applying.
      </div>
      <div class="filter-bar">
        <label class="search-box">
          <span>⌕</span>
          <input id="catalog-search" value="${esc(state.search)}" placeholder="Search scholarships, providers, keywords…">
        </label>
        <select class="filter-select" id="type-filter">
          ${["All types", "Merit-based", "Need-based", "Special category"].map(x => `<option ${state.filter === x ? "selected" : ""}>${x}</option>`).join("")}
        </select>
        <select class="filter-select" id="sort-filter">
          ${["Recommended", "Closest deadline", "Award amount", "Name A–Z"].map(x => `<option ${state.sort === x ? "selected" : ""}>${x}</option>`).join("")}
        </select>
        <span class="results-count">${list.length} opportunities found</span>
      </div>

      <div class="catalog-grid" id="catalog-grid">
        ${list.length ? list.map((s, i) => `
          <article class="catalog-card" style="animation-delay:${i * 35}ms">
            <div class="catalog-top">
              ${logo(s)}
              <button class="bookmark ${state.saved.has(s.id) ? "saved" : ""}" data-save="${s.id}" title="Save scholarship">
                ${state.saved.has(s.id) ? "♥" : "♡"}
              </button>
            </div>
            <h3 data-no-translate>${esc(s.name)}</h3>
            <div class="catalog-provider" data-no-translate>${esc(s.provider)}</div>
            <p class="catalog-desc" data-no-translate>${esc(schemeText(s, "desc"))}</p>
            <div class="catalog-tags">
              ${pill(s.type)}
              ${pill(s.level, "blue")}
              ${pill(`${s.calculatedMatch}% profile fit · indicative`, "green")}
              ${pill(schemeText(s, "status") || currentSchemeStatus(s), "blue")}
            </div>
            <div class="catalog-footer">
              <div>
                <div class="award">${money(s.amount)}<small data-no-translate>${esc(schemeText(s, "benefit") || "See official rules")}</small></div>
                <div class="deadline-small">◷ ${dateLabel(s.deadline)}</div>
              </div>
              <div style="display:flex;gap:5px">
                <button class="btn btn-small btn-secondary btn-catalog-email" data-sch-id="${s.id}" title="Email this scholarship">✉</button>
                <button class="details-btn" data-details="${s.id}">Explore ↗</button>
              </div>
            </div>
          </article>
        `).join("") : `
          <div class="panel" style="grid-column:1/-1">
            <div class="empty-state">
              <div class="empty-icon">⌕</div>
              <h3>No matching scholarships found</h3>
              <p>Try clearing your search terms or selecting 'All types'.</p>
              <button class="btn btn-secondary" id="clear-filters" style="margin-top:13px">Clear filters</button>
            </div>
          </div>
        `}
      </div>
    </div>
  `;

  const searchInput = $("#catalog-search");
  if (searchInput) {
    searchInput.oninput = e => {
      state.search = e.target.value;
      const pos = e.target.selectionStart;
      renderDiscover();
      const nextInput = $("#catalog-search");
      if (nextInput) {
        nextInput.focus();
        nextInput.setSelectionRange(pos, pos);
      }
    };
  }

  $("#type-filter").onchange = e => { state.filter = e.target.value; renderDiscover(); };
  $("#sort-filter").onchange = e => { state.sort = e.target.value; renderDiscover(); };

  $("#saved-filter").onclick = () => {
    const saved = state.saved;
    const filtered = scholarshipData.filter(s => saved.has(s.id));
    $("#catalog-grid").innerHTML = filtered.length ? filtered.map(s => `
      <article class="catalog-card">
        <div class="catalog-top">
          ${logo(s)}
          <button class="bookmark saved" data-save="${s.id}">♥</button>
        </div>
        <h3 data-no-translate>${esc(s.name)}</h3>
        <div class="catalog-provider" data-no-translate>${esc(s.provider)}</div>
        <p class="catalog-desc" data-no-translate>${esc(s.desc)}</p>
        <div class="catalog-tags">${pill(s.type)}${pill(s.level, "blue")}</div>
        <div class="catalog-footer">
          <div><div class="award">${money(s.amount)}</div><div class="deadline-small">◷ ${dateLabel(s.deadline)}</div></div>
          <button class="details-btn" data-details="${s.id}">Explore ↗</button>
        </div>
      </article>
    `).join("") : `<div class="panel" style="grid-column:1/-1"><div class="empty-state"><div class="empty-icon">♡</div><h3>No saved scholarships yet</h3><p>Click the heart icon on any card to save it here.</p></div></div>`;
  };

  const clear = $("#clear-filters");
  if (clear) clear.onclick = () => { state.search = ""; state.filter = "All types"; state.sort = "Recommended"; renderDiscover(); };

  $$(".btn-catalog-email").forEach(b => {
    b.onclick = () => simulateEmailSend(state.profile.email, Number(b.dataset.schId));
  });
}

// -------------------------------------------------------------
// MY APPLICATIONS TRACKER
// -------------------------------------------------------------
function renderApplications() {
  const rows = state.applications.map(a => ({ ...a, s: scholarship(a.scholarshipId) })).filter(a => a.s);

  $("#page-content").innerHTML = `
    <div class="page-enter">
      ${intro(
        "My Applications",
        "Track application progress from document gathering to verified submissions.",
        `<button class="btn btn-primary" onclick="navigate('college-dashboard')">＋ Match New Scholarship</button>`
      )}

      <div class="stats-grid">
        ${stat("Total Tracked", rows.length, "▤", "icon-purple", "Active scholarship pipeline")}
        ${stat("In Preparation", rows.filter(a => a.status === "PREPARING").length, "◷", "icon-orange", "Gathering paperwork")}
        ${stat("Ready to Apply", rows.filter(a => a.status === "READY_TO_APPLY").length, "✓", "icon-green", "Requirements verified")}
        ${stat("Submitted", rows.filter(a => a.status === "SUBMITTED_EXTERNALLY").length, "↗", "icon-pink", "Recorded submissions")}
      </div>

      ${panel("Application Pipeline", "Update statuses, tracking reference IDs, and notes", rows.length ? `
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>SCHOLARSHIP</th>
                <th>DEADLINE</th>
                <th>STATUS</th>
                <th>REFERENCE / NOTES</th>
                <th>LAST UPDATED</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map(a => `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px">
                      ${logo(a.s)}
                      <div>
                        <div class="table-primary">${esc(a.s.name)}</div>
                        <div class="table-secondary">${esc(a.s.provider)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    ${dateLabel(a.s.deadline)}
                    <div class="table-secondary">${Math.max(0, daysLeft(a.s.deadline))} days remaining</div>
                  </td>
                  <td>
                    <span class="status-dot ${statusClass(a.status)}">${statusName(a.status)}</span>
                  </td>
                  <td>
                    <div style="font-size:10px;font-weight:700;color:#35324e">${a.reference ? esc(a.reference) : '<span style="color:#aaa">No ref</span>'}</div>
                    <div class="table-secondary" style="max-width:200px;overflow:hidden;text-overflow:ellipsis">${esc(a.note || "")}</div>
                  </td>
                  <td>${dateLabel(a.updated)}</td>
                  <td>
                    <div style="display:flex;gap:6px">
                      <button class="details-btn" data-edit-app="${a.id}">Update</button>
                      <button class="btn btn-small btn-secondary btn-app-email" data-sch-id="${a.s.id}" title="Email this application record">✉</button>
                    </div>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      ` : `
        <div class="empty-state">
          <div class="empty-icon">▤</div>
          <h3>No applications tracked yet</h3>
          <p>Find matching opportunities in the College Portal to begin tracking.</p>
          <button class="btn btn-primary" onclick="navigate('college-dashboard')" style="margin-top:13px">Open College Portal</button>
        </div>
      `)}
    </div>
  `;

  animateNumbers();

  $$(".btn-app-email").forEach(b => {
    b.onclick = () => simulateEmailSend(state.profile.email, Number(b.dataset.schId));
  });
}

// -------------------------------------------------------------
// DOCUMENT VAULT
// -------------------------------------------------------------
function renderDocuments() {
  const docs = state.documents;

  $("#page-content").innerHTML = `
    <div class="page-enter">
      ${intro(
        "Document Vault",
        "Store verified marksheets, income certificates, domicile, and bonafide files for fast submissions.",
        `<button class="btn btn-primary" id="upload-document">＋ Upload document</button>`
      )}

      <div class="profile-banner">
        <div class="avatar avatar-lavender" style="font-size:20px">▧</div>
        <div>
          <h2>Your Certified Documents Vault</h2>
          <p>Organize verification paperwork to speed up application submissions.</p>
        </div>
        ${pill(`${docs.length} documents on file`, "blue")}
      </div>

      <div class="document-grid">
        ${docs.map(d => `
          <article class="document-card">
            <div class="doc-icon">${d.icon}</div>
            <h3>${esc(d.name)}</h3>
            <p>${esc(d.filename)}<br>Added ${dateLabel(d.date)}</p>
            <div class="doc-bottom">
              ${pill(d.status, d.status === "Reviewed" ? "green" : d.status === "Needs attention" ? "rose" : "amber")}
              <button class="text-action" data-doc="${d.id}">Manage ↗</button>
            </div>
          </article>
        `).join("")}
      </div>
    </div>
  `;

  $("#upload-document").onclick = () => openModal("Upload Supporting Document", `
    <form id="doc-form">
      <div class="field">
        <label>Document Category</label>
        <select name="name" required>
          ${[
            "Previous examination marksheet",
            "Annual Family Income certificate",
            "Domicile certificate",
            "College Bonafide certificate",
            "Admission fee receipt",
            "Category / Caste certificate"
          ].map(x => `<option>${x}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>Choose File</label>
        <input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" required>
        <p class="field-hint">PDF or Image up to 10MB.</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" type="button" data-close>Cancel</button>
        <button class="btn btn-primary" type="submit">Upload & Save</button>
      </div>
    </form>
  `);

  const docForm = $("#doc-form");
  if (docForm) {
    docForm.onsubmit = async e => {
      e.preventDefault();
      const f = new FormData(e.target);
      const file = f.get("file");
      if (!file || !file.name) { toast("Select a file first"); return; }
      if (file.size > 10 * 1024 * 1024) { toast("Choose a file smaller than 10 MB"); return; }
      const allowed = /\.(pdf|jpe?g|png|docx?)$/i;
      if (!allowed.test(file.name)) { toast("Choose a PDF, image, or Word document"); return; }
      try {
        const response = await fetch("/api/documents/upload", { method: "POST", body: f });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Document upload failed.");
        state.documents.unshift(result.document);
        persistState();
        closeModal();
        renderDocuments();
        toast("Document uploaded to your account storage.");
      } catch (err) {
        toast(err.message || "Upload failed. Check that the backend is running.");
      }
    };
  }
}

// -------------------------------------------------------------
// DEADLINE CALENDAR
// -------------------------------------------------------------
function renderDeadlines() {
  const dates = [...scholarshipData].filter(s => s.deadline).sort((a, b) => a.deadline.localeCompare(b.deadline));
  const now = new Date();
  const month = now.getMonth(), year = now.getFullYear();
  const first = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let cells = [];
  for (let i = 0; i < first; i++) {
    cells.push(`<div class="calendar-day muted-day">${new Date(year, month, 0).getDate() - first + i + 1}</div>`);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const ev = dates.find(s => s.deadline === key);
    cells.push(`
      <button class="calendar-day ${d === now.getDate() ? "today" : ""} ${ev ? "has-event" : ""} ${ev && daysLeft(ev.deadline) <= 7 ? "event-urgent" : ""}" ${ev ? `data-details="${ev.id}"` : ""}>
        ${d}
        ${ev ? `<span class="day-event">${esc(ev.name.split(" ").slice(0, 2).join(" "))}</span>` : ""}
      </button>
    `);
  }
  while (cells.length % 7) {
    cells.push(`<div class="calendar-day muted-day">${cells.length - first - daysInMonth + 1}</div>`);
  }

  $("#page-content").innerHTML = `
    <div class="page-enter">
      ${intro("Deadlines Calendar", "Track critical submission deadlines and never miss an award cutoff.")}

      <div class="section-grid">
        <div class="panel">
          <div class="panel-head">
            <div>
              <h3 class="panel-title">${now.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</h3>
              <p class="panel-subtitle">Officially listed scholarship cutoffs</p>
            </div>
            <div>${pill("Current Month", "green")}</div>
          </div>
          <div class="panel-body">
            <div class="calendar-grid">
              ${["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(d => `<div class="calendar-day-label">${d}</div>`).join("")}
              ${cells.join("")}
            </div>
          </div>
        </div>

        <div>
          ${panel("Upcoming Deadlines", "Sorted by closest application deadline", `
            <div class="deadline-list">
              ${dates.filter(s => daysLeft(s.deadline) >= 0).slice(0, 7).map(s => `
                <div class="deadline-item" data-details="${s.id}" style="cursor:pointer">
                  <div class="date-chip">
                    <small>${dateObj(s.deadline).toLocaleDateString("en-IN", { month: "short" }).toUpperCase()}</small>
                    <strong>${dateObj(s.deadline).getDate()}</strong>
                  </div>
                  <div class="deadline-info">
                    <strong>${esc(s.name)}</strong>
                    <span>${esc(s.provider)} · ${money(s.amount)}</span>
                  </div>
                  <div class="deadline-days">${Math.max(0, daysLeft(s.deadline))}d</div>
                </div>
              `).join("")}
            </div>
          `)}
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// NOTIFICATIONS
// -------------------------------------------------------------
function renderNotifications() {
  const n = state.notifications;

  $("#page-content").innerHTML = `
    <div class="page-enter">
      ${intro(
        "Notifications",
        "Recent alerts, deadline updates, and dispatched email reports.",
        `<button class="btn btn-secondary" id="mark-read">✓ Mark all as read</button>`
      )}

      <section class="panel">
        ${n.map((x, i) => `
          <div class="notification-card ${x.unread ? "unread" : ""}">
            <div class="notification-symbol">${x.icon}</div>
            <div class="notification-content">
              <strong>${esc(x.title)}</strong>
              ${x.unread ? ` <span class="unread-label">NEW</span>` : ""}
              <p>${esc(x.message)}</p>
              <small>${esc(x.time)}</small>
            </div>
            ${x.unread ? `<button class="text-action" data-read="${i}">Mark read</button>` : ""}
          </div>
        `).join("")}
      </section>
    </div>
  `;

  $("#mark-read").onclick = () => {
    n.forEach(x => x.unread = false);
    persistState();
    renderNotifications();
    toast("All notifications marked as read");
  };

  $$("[data-read]").forEach(b => {
    b.onclick = () => {
      n[Number(b.dataset.read)].unread = false;
      persistState();
      renderNotifications();
      toast("Notification marked read");
    };
  });
}

// -------------------------------------------------------------
// NAVIGATION & MODALS
// -------------------------------------------------------------
function navigate(page) {
  state.page = page;
  renderPortal();
}

async function logout() {
  if (backendAuthenticated) {
    clearTimeout(stateSaveTimer);
    try { await flushServerState(); } catch (err) { console.error("Final sync failed", err); }
    try { await fetch("/api/logout", { method: "POST" }); } catch (err) { console.error("Sign out request failed", err); }
  }
  backendAuthenticated = false;
  state.auth.isLoggedIn = false;
  state.auth.username = "";
  state.appMode = "login";
  persistState();
  toast("You have been signed out.");
  renderApp();
}

function renderApp() {
  if (state.appMode === "login" || !state.auth.isLoggedIn) {
    renderAuthScreen();
  } else if (state.appMode === "intake") {
    renderIntakeScreen();
  } else {
    renderPortal();
  }
}

function animateNumbers() {
  $$(".count-up").forEach(el => {
    const target = Number(el.dataset.value || 0);
    const start = performance.now();
    const duration = 650;
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * e);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

function toast(message) {
  const root = $("#toast-root");
  if (!root) return;
  root.className = "toast-wrap";
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `<span>✓</span>${esc(message)}`;
  root.appendChild(t);
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateY(8px)";
    setTimeout(() => { if (t && t.remove) t.remove(); }, 250);
  }, 2800);
}

function openModal(title, body) {
  const root = $("#modal-root");
  if (!root) return;
  root.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <section class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <div class="modal-head">
          <h2>${esc(title)}</h2>
          <button class="modal-close" data-close aria-label="Close">×</button>
        </div>
        <div class="modal-body">${body}</div>
      </section>
    </div>
  `;
  $("#modal-backdrop").addEventListener("click", e => {
    if (e.target.id === "modal-backdrop") closeModal();
  });
  $$("[data-close]").forEach(b => b.onclick = closeModal);
}

function closeModal() {
  const root = $("#modal-root");
  if (root) root.innerHTML = "";
}

function details(id) {
  const s = scholarship(Number(id));
  if (!s) return;
  const tracked = state.applications.some(a => a.scholarshipId === s.id);
  const match = calculateScholarshipMatches(state.profile).find(m => m.id === s.id)?.calculatedMatch;

  openModal("Scholarship Details", `
    <div style="display:flex;gap:12px;align-items:center;margin-bottom:17px">
      ${logo(s)}
      <div>
        <h3 data-no-translate style="font:800 15px var(--display);margin:0 0 5px;color:#221e3f">${esc(s.name)}</h3>
        <div class="catalog-provider" data-no-translate>${esc(s.provider)}</div>
      </div>
    </div>
    <div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:16px">
      ${pill(s.type)}
      ${pill(s.level, "blue")}
      ${pill(`${match}% indicative profile fit`, "green")}
    </div>
    <p data-no-translate style="font-size:11px;line-height:1.8;color:#7a7698">${esc(schemeText(s, "desc"))}</p>
    <div class="panel-subtitle" style="padding:12px;border-radius:10px;background:#f5f3ff;color:#514a70">
      <strong>Eligibility summary:</strong> <span data-no-translate>${esc(schemeText(s, "eligibilitySummary") || "Please check the official provider page.")}</span><br>
      <strong>Benefit:</strong> <span data-no-translate>${esc(schemeText(s, "benefit") || "Varies; check the official scheme rules.")}</span><br>
      <strong>Current listing:</strong> <span data-no-translate>${esc(schemeText(s, "status") || currentSchemeStatus(s))} · ${esc(schemeText(s, "applicationMode") || "Check the official portal")}</span>
    </div>
    <div class="field-hint" style="margin-top:10px">Official source: <a href="${esc(s.sourceUrl || s.portalUrl)}" target="_blank" rel="noopener noreferrer">${esc(s.sourceName || "Provider scheme details")} ↗</a>${s.guidelinesUrl ? ` · <a href="${esc(s.guidelinesUrl)}" target="_blank" rel="noopener noreferrer">Scheme guidelines ↗</a>` : ""}</div>
    <p class="field-hint">Profile fit is only a guide. The provider decides eligibility and awards. This catalogue was checked on ${esc(window.scholarshipCatalogMeta?.lastVerified || "the date shown on the source page")}.</p>
    
    <div class="two-col" style="margin:17px 0">
      <div style="background:#f8f6ff;border-radius:11px;padding:13px">
        <div class="field-hint">Benefit</div>
        <div class="award" style="font-size:20px;margin-top:6px;color:#189c6d">${money(s.amount)}</div>
      </div>
      <div style="background:#f8f6ff;border-radius:11px;padding:13px">
        <div class="field-hint">Application Deadline</div>
        <div style="font:800 13px var(--display);margin-top:8px;color:#352f55">${dateLabel(s.deadline)}</div>
        <div class="field-hint">${daysLeft(s.deadline) === null ? "Confirm on the official portal" : `${Math.max(0, daysLeft(s.deadline))} days remaining`}</div>
      </div>
    </div>

    <h4 style="font:800 12px var(--display);color:#221e3f">Documents to Prepare</h4>
    <div class="activity-list">
      ${s.docs.map(d => `
        <div class="activity-item">
          <span class="activity-dot">▤</span>
          <div><strong>${esc(d)}</strong><p>Required for submission</p></div>
        </div>
      `).join("")}
    </div>

    <div class="modal-footer" style="margin-top:18px">
      <a class="btn btn-secondary" href="${esc(s.portalUrl)}" target="_blank" rel="noopener noreferrer">Apply / check official portal ↗</a>
      <button class="btn btn-secondary btn-email-details" data-sch-id="${s.id}">✉ Email Scheme</button>
      <button class="btn btn-secondary" data-close>Close</button>
      <button class="btn btn-primary" id="track-scholarship-modal">
        ${tracked ? "Already Tracking ✓" : "＋ Track This Scholarship"}
      </button>
    </div>
  `);

  const trackBtn = $("#track-scholarship-modal");
  if (trackBtn) {
    trackBtn.onclick = () => {
      if (!tracked) {
        state.applications.push({
          id: Date.now(),
          scholarshipId: s.id,
          status: "PREPARING",
          updated: new Date().toISOString().slice(0, 10),
          reference: "",
          note: "Started from details overview"
        });
        persistState();
        toast("Scholarship added to your applications");
      }
      closeModal();
      navigate("applications");
    };
  }

  const emailDetailsBtn = $(".btn-email-details");
  if (emailDetailsBtn) {
    emailDetailsBtn.onclick = () => {
      closeModal();
      simulateEmailSend(state.profile.email, s.id);
    };
  }
}

function editApplication(id) {
  const a = state.applications.find(x => x.id === Number(id));
  if (!a) return;
  const s = scholarship(a.scholarshipId);

  openModal("Update Application Status", `
    <p style="font-size:11px;color:#85809f;margin:0 0 17px">
      Updating progress for <strong>${esc(s.name)}</strong>
    </p>
    <form id="app-edit-form">
      <div class="field">
        <label>Current Status</label>
        <select name="status">
          ${["PREPARING", "READY_TO_APPLY", "SUBMITTED_EXTERNALLY", "UNDER_REVIEW", "APPROVED", "REJECTED", "CLOSED"].map(x => `
            <option value="${x}" ${a.status === x ? "selected" : ""}>${statusName(x)}</option>
          `).join("")}
        </select>
      </div>
      <div class="field">
        <label>Portal / Tracking Reference Number</label>
        <input name="reference" value="${esc(a.reference)}" placeholder="e.g. MAHA-2026-9041">
      </div>
      <div class="field">
        <label>Personal Tracking Notes</label>
        <textarea name="note">${esc(a.note)}</textarea>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" id="btn-delete-app" style="margin-right:auto;color:#d74b70">Delete Application</button>
        <button type="button" class="btn btn-secondary" data-close>Cancel</button>
        <button class="btn btn-primary" type="submit">Save Updates</button>
      </div>
    </form>
  `);

  $("#app-edit-form").onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    a.status = f.get("status");
    a.reference = f.get("reference");
    a.note = f.get("note");
    a.updated = new Date().toISOString().slice(0, 10);
    persistState();
    closeModal();
    renderApplications();
    toast("Application status updated!");
  };

  const delBtn = $("#btn-delete-app");
  if (delBtn) {
    delBtn.onclick = () => {
      state.applications = state.applications.filter(x => x.id !== a.id);
      persistState();
      closeModal();
      renderApplications();
      toast("Application removed from tracking");
    };
  }
}

// Global Event Listeners
document.addEventListener("click", e => {
  const p = e.target.closest("[data-page]");
  if (p) {
    e.preventDefault();
    navigate(p.dataset.page);
    return;
  }
  const d = e.target.closest("[data-details]");
  if (d) {
    details(d.dataset.details);
    return;
  }
  const s = e.target.closest("[data-save]");
  if (s) {
    const id = Number(s.dataset.save);
    state.saved.has(id) ? state.saved.delete(id) : state.saved.add(id);
    persistState();
    renderDiscover();
    toast(state.saved.has(id) ? "Scholarship bookmarked ♥" : "Removed from bookmarks");
    return;
  }
  const a = e.target.closest("[data-edit-app]");
  if (a) {
    editApplication(a.dataset.editApp);
    return;
  }
  const doc = e.target.closest("[data-doc]");
  if (doc) {
    const dItem = state.documents.find(x => x.id === Number(doc.dataset.doc));
    if (dItem) {
      openModal("Document Record", `
        <div class="doc-icon">${dItem.icon}</div>
        <h3 style="font:800 14px var(--display);margin:0 0 5px">${esc(dItem.name)}</h3>
        <p style="font-size:11px;color:#8984a3;line-height:1.8">
          File: <strong>${esc(dItem.filename)}</strong><br>
          Added on: ${dateLabel(dItem.date)}<br>
          Review Status: <span class="status-dot status-ready">${esc(dItem.status)}</span>
        </p>
        <div class="modal-footer">
          ${dItem.storedName ? `<a class="btn btn-secondary" href="/api/documents/file/${encodeURIComponent(dItem.storedName)}">Download File</a>` : ""}
          <button class="btn btn-secondary" data-close>Close</button>
          <button class="btn btn-primary" id="btn-doc-verify">Mark Verified</button>
        </div>
      `);
      const vBtn = $("#btn-doc-verify");
      if (vBtn) {
        vBtn.onclick = () => {
          dItem.status = "Reviewed";
          persistState();
          closeModal();
          renderDocuments();
          toast("Document marked verified");
        };
      }
    }
    return;
  }
});

// Keyboard shortcuts
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    const gs = $("#global-search");
    if (gs) gs.focus();
  }
  if ((e.metaKey || e.ctrlKey) && ["1", "2", "3", "4", "5", "6"].includes(e.key)) {
    e.preventDefault();
    const mapping = {
      "1": "college-dashboard",
      "2": "edit-info",
      "3": "discover",
      "4": "applications",
      "5": "documents",
      "6": "deadlines"
    };
    navigate(mapping[e.key]);
  }
});

// Mobile menu toggle
const mobMenu = $("#mobile-menu");
if (mobMenu) mobMenu.onclick = () => $("#sidebar").classList.toggle("open");

// Global search bar
const globalSearch = $("#global-search");
if (globalSearch) {
  globalSearch.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      state.search = e.target.value;
      navigate("discover");
    }
  });
}

// Theme toggle
const themeBtn = $("#theme-toggle");
if (themeBtn) {
  themeBtn.onclick = () => {
    document.body.classList.toggle("soft-dark");
    persistState();
    toast(document.body.classList.contains("soft-dark") ? "Night mode enabled 🌙" : "Light mode enabled ☀️");
  };
}

// Topbar "Edit Your Info" button
const topbarEditBtn = $("#topbar-edit-info-btn");
if (topbarEditBtn) topbarEditBtn.onclick = () => navigate("edit-info");

// Logout buttons
const topLogout = $("#top-logout-btn");
if (topLogout) topLogout.onclick = logout;

const sideLogout = $("#btn-logout");
if (sideLogout) sideLogout.onclick = logout;

const languageSelect = $("#language-select");
const globalLanguageSelect = $("#global-language-select");
function changeLanguage(value) {
  state.language = value;
  persistState();
  renderApp();
  translateInterface(document.body);
  [languageSelect, globalLanguageSelect].forEach(select => { if (select) select.value = state.language; });
}
if (languageSelect) languageSelect.addEventListener("change", e => changeLanguage(e.target.value));
if (globalLanguageSelect) globalLanguageSelect.addEventListener("change", e => changeLanguage(e.target.value));

// Ripple click effect
document.addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b || b.disabled) return;
  const r = b.getBoundingClientRect();
  const d = document.createElement("span");
  d.className = "ripple-effect";
  d.style.left = (e.clientX - r.left || r.width / 2) + "px";
  d.style.top = (e.clientY - r.top || r.height / 2) + "px";
  b.appendChild(d);
  setTimeout(() => d.remove(), 650);
});

window.addEventListener("beforeunload", persistState);

// Bootstrap
const portalTranslationObserver = new MutationObserver(records => {
  if ((state.language || "en") === "en") return;
  records.forEach(record => record.addedNodes.forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE) translateInterface(node);
  }));
});
portalTranslationObserver.observe(document.body, { childList: true, subtree: true });
restoreState();
async function initializeApp() {
  try {
    const catalogResponse = await fetch("/api/scholarships", { cache: "no-store" });
    if (!catalogResponse.ok) throw new Error("Official catalog is unavailable");
    const catalog = await catalogResponse.json();
    scholarshipData = Array.isArray(catalog.schemes) ? catalog.schemes : [];
    window.scholarshipCatalogMeta = { academicYear: catalog.academicYear, lastVerified: catalog.lastVerified, notice: catalog.notice };
  } catch (err) {
    console.error("Could not load the official scholarship catalog.", err);
  }
  try {
    const response = await fetch("/api/state", { cache: "no-store" });
    if (!response.ok) throw new Error("Backend is not available");
    const result = await response.json();
    if (result.authenticated) {
      backendAuthenticated = true;
      state.auth.isLoggedIn = true;
      state.auth.username = result.user.name;
      state.profile.email = result.user.email;
      state.profile.name = result.user.name;
      mergeServerState(result.state);
      state.appMode = "portal";
    }
  } catch (err) {
    console.warn("Scholarship Navigator backend is not available. Start the local server to sign in.", err);
  }
  updateBadges();
  renderApp();
}
initializeApp();
