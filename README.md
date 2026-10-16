# EduTrack – Student Performance & Attendance Analytics System
### **Course: CSE494 – Intelligent NoSQL Databases**

EduTrack is a full-stack academic administration and performance analytics web application built on **MongoDB**, **Express.js**, **React (Vite + Tailwind CSS)**, and **Node.js**, integrated natively with an independent **Python (PyMongo)** database analytics module.

---

## 🌟 Key Features

1. **Document-Oriented Database Architecture:**
   - 4 normalized collections: `students`, `courses`, `attendance`, `marks`.
   - Connected via BSON `ObjectId` references (avoiding the 16MB document size limit and write contention of unbounded array embedding).
   - Compound unique index on `attendance.{ studentId, courseId, date }` physically preventing duplicate submissions.
   - Text search index on `students.name`.

2. **Two-Tier Data Validation:**
   - **Database Engine Validation (`$jsonSchema`):** Enforced directly inside MongoDB with `validationLevel: 'strict'`, rejecting invalid documents (Error Code 121) from any client.
   - **Application-Level Validation (Mongoose):** User-friendly validation and error formatting on the Node.js layer.

3. **Five Essential MongoDB Aggregation Pipelines:**
   - Student distribution by department (`$group`, `$sort`).
   - Course performance benchmarks (`$group`, `$lookup`, `$unwind`, `$project`).
   - Student-wise academic performance average (`$group`, `$lookup`, `$unwind`, `$project`, `$sort`).
   - Student attendance percentage & below 75% critical alert (Present and Absent only):
     $$\text{Attendance \%} = \frac{\text{Present Classes}}{\text{Total Classes}} \times 100$$
   - Top 5 academic performers leaderboard (`$group`, `$lookup`, `$sort`, `$limit`).

4. **Dedicated Python PyMongo Module (`python/`):**
   - Connects to the same shared MongoDB database (`edutrack`).
   - Demonstrates complete CRUD operations.
   - Validates engine-level constraint rejections (`validation_demo.py`).
   - Executes aggregation pipelines with ASCII tables (`tabulate`).
   - Interactive menu-driven console CLI (`main.py`) designed for academic viva demonstrations.

5. **Modern Academic Administration UI:**
   - Dark navy sidebar, clean white cards, subtle indigo/emerald accents.
   - Recharts visual charts: Bar charts, Area charts, Donut charts.
   - Full student CRUD with cascade deletion protections.
   - Course management with unique code checking.
   - Attendance tracker with single/batch recording, date filters, and CSV export.
   - Marks evaluation with bounds checking ($0 \le \text{Marks} \le \text{Max}$) and CSV export.
   - Dedicated Project Architecture & Schema inspector page.

---

## 🏗️ Project Architecture

```
EduTrack/
├── client/                  # React + Vite + Tailwind CSS + Recharts + Lucide + Axios
│   ├── src/
│   │   ├── api/             # Axios API client
│   │   ├── components/      # Sidebar, Navbar, StatCard, Badge, Modal, ConfirmDialog, etc.
│   │   ├── context/         # Global Toast notification context
│   │   ├── pages/           # Dashboard, Students, Details, Courses, Attendance, Marks, Analytics, ProjectInfo
│   │   ├── App.jsx          # Router & layout
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Tailwind directives & design tokens
│   ├── package.json
│   └── vite.config.js       # Vite configuration with /api proxy
│
├── server/                  # Node.js + Express (ES Modules)
│   ├── src/
│   │   ├── config/          # db.js (Mongoose connection)
│   │   ├── models/          # Student, Course, Attendance, Mark (Schemas & Indexes)
│   │   ├── controllers/     # student, course, attendance, marks, analytics controllers
│   │   ├── routes/          # API route definitions
│   │   └── middleware/      # Centralized error handler & ObjectId validator
│   ├── package.json
│   └── server.js            # Express server entry point (Port 5001)
│
├── mongodb/                 # Database Maintenance & Aggregation Scripts
│   ├── validators.js        # MongoDB $jsonSchema database-level validators
│   ├── indexes.js           # Index creation script (Compound Unique & Text)
│   ├── seed.js              # Realistic seed data (25 students, 6 courses, 202 attendance, 102 marks)
│   ├── queries.js           # Standalone execution of the 5 core aggregation pipelines
│   └── reset.js             # Clean database reset script
│
├── python/                  # Mandatory Python PyMongo Module
│   ├── requirements.txt     # pymongo, python-dotenv, tabulate
│   ├── config.py            # MongoDB connection settings
│   ├── connection_test.py   # Connection ping & WiredTiger engine inspection
│   ├── crud_operations.py   # Demonstrates INSERT, FIND, UPDATE, DELETE & cascade
│   ├── validation_demo.py   # Demonstrates MongoDB engine rejecting invalid data
│   ├── aggregations.py      # Executes aggregation pipelines in terminal
│   ├── main.py              # Menu-driven interactive viva console
│   └── README.md            # Python module documentation
│
├── docs/                    # Academic Deliverables
│   ├── project-report.md    # Complete college project report with placeholders
│   └── viva-questions.md    # 28 comprehensive viva questions with detailed answers
│
├── .env.example             # Environment template
├── .env                     # Local configuration
├── package.json             # Root orchestration scripts
└── README.md                # Master project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.0 or higher)
- **MongoDB** (Local Community Edition or MongoDB Atlas connection string)
- **Python 3.10+** (with `pip` and `venv`)

---

### Step 1: Database Setup & Seeding

1. Start your local MongoDB service:
   ```bash
   # On macOS (Homebrew):
   brew services start mongodb-community

   # On Windows / Linux:
   mongod --dbpath <data_dir>
   ```

2. Install root dependencies and seed the database:
   ```bash
   npm install
   npm run seed
   ```
   *This automatically runs `$jsonSchema` validators, creates unique and compound indexes, and seeds 25 students, 6 courses, 202 attendance records (Present and Absent only), and 102 marks records.*

---

### Step 2: Start the Web Application

You can launch both the backend and frontend simultaneously with a single command from the project root:

```bash
npm run dev
```

Or run them individually in separate terminals:

```bash
# Terminal 1: Backend Server (Port 5001)
npm run server

# Terminal 2: Frontend Client (Port 5173)
npm run client
```

Open your browser at: **[http://localhost:5173](http://localhost:5173)**

---

### Step 3: Run the Python PyMongo Module (Viva Demo)

From the project root:

```bash
# 1. Activate Python virtual environment
source python/venv/bin/activate    # On Windows: python\venv\Scripts\activate

# 2. Test Connection & Inspect Collections
python python/connection_test.py

# 3. Demonstrate PyMongo CRUD Operations
python python/crud_operations.py

# 4. Demonstrate Database-Level Validation Rejection ($jsonSchema)
python python/validation_demo.py

# 5. Execute Aggregation Pipelines in Terminal
python python/aggregations.py

# 6. Launch the Menu-Driven Interactive Viva Console
python python/main.py
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/health` | Health check & service status |
| **GET** | `/api/students` | List students with search, filters, pagination |
| **GET** | `/api/students/:id` | Student profile + attendance % + marks history |
| **POST** | `/api/students` | Create new student |
| **PUT** | `/api/students/:id` | Update student details |
| **DELETE**| `/api/students/:id` | Delete student with cascade cleanup |
| **GET** | `/api/courses` | List all curriculum courses |
| **POST** | `/api/courses` | Create new course (unique code enforced) |
| **PUT** | `/api/courses/:id` | Update course details |
| **DELETE**| `/api/courses/:id` | Delete course with cascade cleanup |
| **GET** | `/api/attendance` | Attendance records with date range & status filters |
| **POST** | `/api/attendance` | Record attendance (Single or Batch) |
| **PUT** | `/api/attendance/:id` | Update attendance status / remarks |
| **DELETE**| `/api/attendance/:id` | Delete attendance record |
| **GET** | `/api/marks` | Assessment marks records with filters |
| **POST** | `/api/marks` | Add marks (validates $0 \le \text{Marks} \le \text{Max}$) |
| **PUT** | `/api/marks/:id` | Update assessment marks |
| **DELETE**| `/api/marks/:id` | Delete marks record |
| **GET** | `/api/analytics/dashboard` | Main admin KPIs, charts, and trends |
| **GET** | `/api/analytics/course-performance` | Course-wise average %, highest, lowest |
| **GET** | `/api/analytics/student-performance` | Top 5 performers & at-risk list ($<50\%$) |
| **GET** | `/api/analytics/low-attendance` | Critical low-attendance list ($<75\%$) |

---

## 🧪 Verification & Reliability Highlights

- **Duplicate Prevention:** Verified that compound index `idx_compound_student_course_date_unique` prevents marking the same student multiple times on the same date.
- **Negative Marks Rejection:** Verified that `$jsonSchema` actively rejects negative marks with MongoDB error code 121.
- **Invalid Email Rejection:** Verified that `$jsonSchema` actively rejects emails failing the standard regex pattern.
- **Referential Integrity:** Verified that deleting a student cascades deletion to all associated attendance and marks records, preventing orphaned documents.
- **Shared Data Store:** Verified that Node.js and Python operate on the identical MongoDB `edutrack` database and reflect live updates.

---

## 📜 Academic Deliverables

- **Project Report:** Located at `docs/project-report.md`. Includes title page placeholders, abstract, problem statement, architecture diagram, schema definitions, validation comparison, and screenshot checklist.
- **Viva Questions & Answers:** Located at `docs/viva-questions.md`. Includes 28 technical viva questions and accurate answers covering NoSQL concepts, MongoDB internals, aggregation pipelines, and PyMongo.
