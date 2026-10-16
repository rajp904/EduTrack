# ACADEMIC PROJECT REPORT

---

# **EduTrack – Student Performance & Attendance Analytics System**
### Course: **CSE494 – Intelligent NoSQL Databases**
### Academic Term: Fall / Spring 2026

---

### **Submitted By:**
- **Student Name:** `[INSERT YOUR FULL NAME HERE]`
- **Registration Number:** `[INSERT YOUR REGISTRATION NUMBER HERE]`
- **Department:** `[e.g., Department of Computer Science & Engineering]`
- **Faculty / School:** `[e.g., School of Computing and Information Technology]`
- **University:** `[INSERT YOUR COLLEGE / UNIVERSITY NAME HERE]`

### **Under the Guidance of:**
- **Faculty Guide / Professor:** `[INSERT PROFESSOR / GUIDE NAME HERE]`
- **Designation:** `[e.g., Associate Professor, Dept of Computer Science]`

---

## **Abstract**

In contemporary academic institutions, maintaining accurate records of student attendance and continuous evaluation performance is critical for accreditation, early intervention, and outcome-based education (OBE). Traditional relational database management systems (RDBMS) often suffer from rigid tabular schemas, heavy object-relational mapping (ORM) overhead, and high join complexity when handling heterogeneous assessment schemes and multi-criteria queries.

This project presents **EduTrack – Student Performance & Attendance Analytics System**, a production-grade, document-oriented academic platform engineered on **MongoDB** and integrated natively with both **Node.js/Express** and **Python (PyMongo)**. The system implements a normalized document schema across four collections (`students`, `courses`, `attendance`, `marks`), avoiding the 16MB BSON boundary and write-contention penalties inherent in unbounded array embedding. Comprehensive data integrity is guaranteed via a two-tier validation architecture combining engine-level `$jsonSchema` constraints with application-level Mongoose validation. Furthermore, advanced analytical insights—such as course benchmark comparisons, leaderboard generation, and critical low-attendance warnings (&lt; 75% threshold with Present/Absent attendance)—are computed using five essential multi-stage MongoDB Aggregation Pipelines (`$match`, `$group`, `$project`, `$lookup`, `$unwind`, `$cond`, `$dateToString`). The resulting system provides an interactive React administrative dashboard and an independent menu-driven Python terminal CLI for academic assessment and viva demonstration.

---

## **1. Problem Statement**

Academic departments face numerous operational hurdles in managing student records:
1. **Unbounded Record Growth:** Tracking daily attendance and varied continuous assessments (quizzes, lab assignments, midterm exams, projects) across thousands of sessions creates high volume and variable schema requirements.
2. **Data Integrity Hazards:** Without robust constraints, erroneous data (e.g., negative assessment marks, marks exceeding maximum marks, invalid attendance status codes, or duplicate attendance submissions on the same day) can corrupt institutional records.
3. **Binary Attendance Tracking:** Academic departments require clear, non-ambiguous recording of physical presence (Present vs. Absent) without confusing intermediate states.
4. **Delayed Intervention:** Inability to perform real-time analytical calculations leaves faculty unable to identify students falling below the mandatory 75% attendance threshold until it is too late to offer academic condonation or remediation.

---

## **2. Objectives**

The primary engineering objectives of this project are:
1. **Document-Oriented Database Architecture:** Architect a high-performance MongoDB database named `edutrack` with four dedicated collections linked via BSON `ObjectId` references.
2. **Engine-Level Validation:** Implement strict database-level validation using MongoDB `$jsonSchema` through a migration script, rejecting invalid documents with Error Code 121 (`DocumentValidationFailure`) regardless of the client driver used.
3. **Optimized Indexing:** Establish unique and compound indexes to prevent duplicates (e.g., compound unique index on `{ studentId, courseId, date }`) and optimize lookup performance.
4. **Multi-Stage Aggregation Pipelines:** Design and deploy five essential MongoDB aggregation pipelines to calculate attendance ratios (Present and Absent only), course averages, score percentiles, and academic alerts.
5. **Dual Driver Integration:** Develop a full-featured RESTful API in **Node.js / Express** alongside an independent, menu-driven **Python (PyMongo)** module demonstrating CRUD, validation rejection, and aggregations on the shared database.
6. **Modern Responsive Web Interface:** Build an intuitive, state-of-the-art administrative web application using React, Vite, Tailwind CSS, and Recharts.

---

## **3. Real-World Relevance**

1. **Outcome-Based Education (OBE) & NAAC/ABET Accreditation:** Institutional accreditation boards demand traceable continuous internal evaluation (CIE) data and attendance analytics.
2. **Early Warning System (EWS):** Real-time aggregation pipelines automatically flag students with attendance below 75%, allowing proctors and academic advisors to schedule counseling sessions immediately.
3. **Cross-Platform Microservice Architecture:** Demonstrating that Python data science scripts (PyMongo) and Node.js web services can safely read and write to the same MongoDB database under identical `$jsonSchema` rules reflects modern enterprise practice.

---

## **4. Technology Stack**

| Tier | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18 (Vite) | High-performance single page application framework |
| | Tailwind CSS v3 | Utility-first responsive design system with custom palette |
| | Recharts | Composable SVG-based charting library for analytics |
| | Lucide React | Modern, clean vector iconography |
| | Axios | Promise-based HTTP client with error interceptors |
| **Backend** | Node.js (v20+) | Event-driven JavaScript runtime environment |
| | Express.js | Modular REST API routing and middleware framework |
| | Mongoose v8 | Schema definition, ODM, and application-level validation |
| **Python Module** | Python 3.10+ | Scientific computing and backend scripting language |
| | PyMongo v4 | Official synchronous MongoDB driver for Python |
| | Tabulate | Formatted terminal table rendering for viva CLI |
| | Python-Dotenv | Environment variable management |
| **Database** | MongoDB v7.0/v8.2 | Document-oriented NoSQL database with WiredTiger storage engine |

---

## **5. System Architecture**

```
+-------------------------------------------------------------------------+
|                              PRESENTATION LAYER                         |
|   +-----------------------------------------------------------------+   |
|   |          React.js + Vite Single Page Application (Client)       |   |
|   |  - Dashboard View        - Students CRUD         - Courses CRUD |   |
|   |  - Attendance Tracker    - Marks & Evaluations   - Analytics    |   |
|   |  - Database Architecture & Schema Inspector                     |   |
|   +-----------------------------------------------------------------+   |
+------------------------------------+------------------------------------+
                                     | Axios HTTP / REST (JSON)
                                     v
+------------------------------------+------------------------------------+
|                              BACKEND LAYER                              |
|   +-----------------------------------------------------------------+   |
|   |            Node.js + Express.js REST API Server (Port 5001)     |   |
|   |  - Centralized Error Handling   - Mongoose ODM Models           |   |
|   |  - ObjectId Validation Filters  - Aggregation Controllers       |   |
|   +-----------------------------------------------------------------+   |
+------------------------------------+------------------------------------+
                                     | Mongoose / Native MongoDB Driver
                                     |
+------------------------------------+------------------------------------+
|                         PYTHON INTEGRATION LAYER                        |
|   +-----------------------------------------------------------------+   |
|   |             Python 3 PyMongo Driver Module (python/)            |   |
|   |  - connection_test.py (Health)  - crud_operations.py (CRUD)     |   |
|   |  - validation_demo.py ($json)   - aggregations.py (Pipelines)   |   |
|   |  - main.py (Interactive Academic Viva CLI Demonstration)        |   |
|   +-----------------------------------------------------------------+   |
+------------------------------------+------------------------------------+
                                     | PyMongo BSON Protocol
                                     v
+-------------------------------------------------------------------------+
|                           DATABASE ENGINE LAYER                         |
|   +-----------------------------------------------------------------+   |
|   |                  MongoDB Server (Database: edutrack)            |   |
|   |                                                                 |   |
|   |  [Collections]       [Engine Validation]     [Active Indexes]   |   |
|   |  - students          - $jsonSchema Rules     - Compound Unique  |   |
|   |  - courses           - Enum Constraints      - Single Unique    |   |
|   |  - attendance        - Numeric Bounds (>=0)  - Text Search      |   |
|   |  - marks             - Type Strictness       - Range & Lookups  |   |
|   +-----------------------------------------------------------------+   |
+-------------------------------------------------------------------------+
```

---

## **6. Database Schema Design & Rationale**

### **6.1 Why Separate Collections Over Unbounded Embedding?**

A common beginner trap in MongoDB design is embedding attendance and marks directly into a student document as arrays:
```javascript
// ANTI-PATTERN: UNBOUNDED ARRAY EMBEDDING
{
  "_id": ObjectId("..."),
  "name": "Student",
  "attendance": [ /* hundreds of session objects */ ],
  "marks": [ /* dozens of marks objects */ ]
}
```

**Flaws of Unbounded Embedding:**
1. **Document Size Growth:** MongoDB imposes a hard limit of 16MB per BSON document. An undergraduate over 4 years with 40 courses, 200 sessions per course, and hundreds of assessments risks exceeding or fragmenting documents.
2. **Concurrency Bottlenecks:** When a teacher marks attendance for an entire class simultaneously, updating embedded arrays locks each student document concurrently, leading to high write contention.
3. **Document Relocation Overhead:** Constantly appending elements to embedded arrays causes MongoDB's WiredTiger storage engine to repeatedly reallocate space and relocate documents on disk, degrading I/O performance.

**EduTrack Solution:**
EduTrack establishes **four normalized collections** connected through referenced `ObjectId` identifiers:
1. `students` (Core biographical & departmental data)
2. `courses` (Curriculum offerings, credits, faculty coordinator)
3. `attendance` (Individual session log with compound unique constraint)
4. `marks` (Individual assessment results with boundary constraints)

---

### **6.2 Document Structures and Schemas**

#### **Collection 1: `students`**
```json
{
  "_id": { "$oid": "6ad0e94e3db2f8109ee8744a" },
  "registrationNumber": "REG2024002",
  "name": "Diya Sharma",
  "email": "diya.sharma@edutrack.edu",
  "department": "Computer Science",
  "semester": 6,
  "enrollmentDate": { "$date": "2022-08-01T00:00:00.000Z" },
  "createdAt": { "$date": "2024-01-15T10:00:00.000Z" }
}
```

#### **Collection 2: `courses`**
```json
{
  "_id": { "$oid": "6ad0e94e3db2f8109ee87443" },
  "courseCode": "CSE494",
  "courseName": "Intelligent NoSQL Databases",
  "department": "Computer Science",
  "credits": 4,
  "semester": 6,
  "facultyName": "Dr. Rajesh Sharma",
  "createdAt": { "$date": "2024-01-10T09:00:00.000Z" }
}
```

#### **Collection 3: `attendance`**
```json
{
  "_id": { "$oid": "6ad0e94e3db2f8109ee87460" },
  "studentId": { "$oid": "6ad0e94e3db2f8109ee8744a" },
  "courseId": { "$oid": "6ad0e94e3db2f8109ee87443" },
  "date": { "$date": "2024-02-05T09:00:00.000Z" },
  "status": "Present",
  "remarks": "Regular lecture",
  "createdAt": { "$date": "2024-02-05T09:00:00.000Z" }
}
```

#### **Collection 4: `marks`**
```json
{
  "_id": { "$oid": "6ad0e94e3db2f8109ee87510" },
  "studentId": { "$oid": "6ad0e94e3db2f8109ee8744a" },
  "courseId": { "$oid": "6ad0e94e3db2f8109ee87443" },
  "assessmentName": "Midterm Exam",
  "marksObtained": 48.5,
  "maximumMarks": 50,
  "assessmentDate": { "$date": "2024-03-20T10:00:00.000Z" }
}
```

---

## **7. Validation Strategies: Database-Level vs Application-Level**

### **7.1 The Two-Tier Paradigm**

A key design highlight of EduTrack is the distinction between application-level validation and database engine validation:

| Dimension | Application-Level Validation (Node / Mongoose) | Database-Level Validation (MongoDB $jsonSchema) |
| :--- | :--- | :--- |
| **Executing Engine** | Node.js V8 Runtime | MongoDB WiredTiger Storage Engine |
| **Protection Scope** | Only HTTP requests routed via Express API | Universal (Protects PyMongo, Compass, shell, CLI) |
| **Failure Code** | HTTP 400 Bad Request (`ValidationError`) | Mongo Error Code 121 (`DocumentValidationFailure`) |
| **Configuration** | Defined in `models/*.js` using Mongoose Schemas | Executed via `collMod` / `db.createCollection` script |

### **7.2 Database-Level `$jsonSchema` Rules**
Configured in `mongodb/validators.js`:
- `students`: Requires `registrationNumber`, `name`, `email`, `department`, `semester`. Enforces email regex pattern: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$`.
- `courses`: Requires `courseCode` matching regex `^[A-Za-z]{2,5}[0-9]{3,4}$`, `credits` (1–6), `semester` (1–8).
- `attendance`: Restricts `status` to exact enum `['Present', 'Absent']`. Requires valid `studentId` and `courseId` ObjectIds.
- `marks`: Requires `marksObtained >= 0` and `maximumMarks >= 1`.

---

## **8. Indexing Strategy**

To eliminate full collection scans (`COLLSCAN`) and enforce physical uniqueness:

1. **`students` Indexes:**
   - `{ registrationNumber: 1 }` (Unique: `true`) — Prevents duplicate student registrations.
   - `{ email: 1 }` (Unique: `true`) — Prevents email collisions.
   - `{ department: 1, semester: 1 }` — Optimizes filtered queries by department and semester.
   - `{ name: "text" }` — Powers full-text keyword search across student names.

2. **`courses` Indexes:**
   - `{ courseCode: 1 }` (Unique: `true`) — Guarantees unique course codes across curriculum.
   - `{ department: 1 }` — Speeds up department course listings.

3. **`attendance` Indexes:**
   - **`{ studentId: 1, courseId: 1, date: 1 }` (Compound Unique: `true`):** Prevents accidental duplicate attendance entries for the same student in the same course on the same day.
   - `{ courseId: 1, date: -1 }` — Optimizes course attendance history by date descending.
   - `{ studentId: 1, status: 1 }` — Accelerates student-specific attendance aggregations.

4. **`marks` Indexes:**
   - `{ studentId: 1, courseId: 1 }` — Speeds up student academic grade sheet lookups.
   - `{ courseId: 1, assessmentName: 1 }` — Accelerates course-specific evaluation summaries.

---

## **9. Mandatory MongoDB Aggregation Pipelines**

EduTrack implements ten academic aggregation pipelines. Here are five detailed pipelines with stage-by-stage explanations:

### **Pipeline 1: Attendance Percentage per Student & Course (Present & Absent Only)**
**Objective:** Calculate effective attendance percentage by awarding 100% credit for 'Present' and 0% for 'Absent'.

**Pipeline Definition:**
```javascript
[
  // Stage 1: Group by studentId and courseId, computing total and present sessions
  {
    $group: {
      _id: { studentId: "$studentId", courseId: "$courseId" },
      totalClasses: { $sum: 1 },
      presentCount: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
      absentCount: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } }
    }
  },
  // Stage 2: Project attendance percentage avoiding division by zero
  {
    $project: {
      studentId: "$_id.studentId",
      courseId: "$_id.courseId",
      totalClasses: 1,
      presentCount: 1,
      absentCount: 1,
      attendancePercentage: {
        $round: [
          { $multiply: [{ $divide: ["$presentCount", "$totalClasses"] }, 100] },
          1
        ]
      }
    }
  },
  // Stage 3 & 4: Look up student and course details
  { $lookup: { from: "students", localField: "studentId", foreignField: "_id", as: "student" } },
  { $unwind: "$student" },
  { $lookup: { from: "courses", localField: "courseId", foreignField: "_id", as: "course" } },
  { $unwind: "$course" }
]
```

---

### **Pipeline 2: Low-Attendance Warning Report (&lt; 75% Threshold)**
**Objective:** Filter down to all student-course pairs with attendance rate below 75% and calculate recovery shortfall.

**Pipeline Definition:**
```javascript
[
  // Stage 1: Group and compute attendance rate
  {
    $group: {
      _id: { studentId: "$studentId", courseId: "$courseId" },
      totalClasses: { $sum: 1 },
      presentCount: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
      absentCount: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } }
    }
  },
  {
    $project: {
      studentId: "$_id.studentId",
      courseId: "$_id.courseId",
      totalClasses: 1,
      presentCount: 1,
      absentCount: 1,
      attendancePercentage: {
        $round: [{ $multiply: [{ $divide: ["$presentCount", "$totalClasses"] }, 100] }, 1]
      }
    }
  },
  // Stage 2: Filter strictly below threshold
  { $match: { attendancePercentage: { $lt: 75.0 } } },
  // Stage 3 & 4: Lookup student metadata
  { $lookup: { from: "students", localField: "studentId", foreignField: "_id", as: "student" } },
  { $unwind: "$student" },
  { $lookup: { from: "courses", localField: "courseId", foreignField: "_id", as: "course" } },
  { $unwind: "$course" },
  { $sort: { attendancePercentage: 1 } }
]
```

---

### **Pipeline 3: Course-Wise Average Performance & Range**
**Objective:** Benchmark all courses by computing average marks percentage, highest score, and lowest score.

**Pipeline Definition:**
```javascript
[
  {
    $project: {
      courseId: 1,
      percentage: { $multiply: [{ $divide: ["$marksObtained", "$maximumMarks"] }, 100] }
    }
  },
  {
    $group: {
      _id: "$courseId",
      totalAssessments: { $sum: 1 },
      highestPercentage: { $max: "$percentage" },
      lowestPercentage: { $min: "$percentage" },
      avgPercentage: { $avg: "$percentage" }
    }
  },
  { $lookup: { from: "courses", localField: "_id", foreignField: "_id", as: "course" } },
  { $unwind: "$course" },
  {
    $project: {
      courseCode: "$course.courseCode",
      courseName: "$course.courseName",
      facultyName: "$course.facultyName",
      totalAssessments: 1,
      avgPercentage: { $round: ["$avgPercentage", 2] },
      highestPercentage: { $round: ["$highestPercentage", 2] },
      lowestPercentage: { $round: ["$lowestPercentage", 2] }
    }
  },
  { $sort: { avgPercentage: -1 } }
]
```

---

### **Pipeline 4: Monthly Attendance Velocity & Trend**
**Objective:** Aggregate attendance rate grouped by calendar month using `$dateToString`.

**Pipeline Definition:**
```javascript
[
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
      totalRecords: { $sum: 1 },
      present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
      absent: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } }
    }
  },
  { $sort: { _id: 1 } },
  {
    $project: {
      month: "$_id",
      totalRecords: 1,
      present: 1,
      absent: 1,
      attendanceRate: {
        $round: [
          { $multiply: [{ $divide: ["$present", "$totalRecords"] }, 100] },
          1
        ]
      }
    }
  }
]
```

---

### **Pipeline 5: Top 5 Performers Academic Leaderboard**
**Objective:** Calculate overall score percentage per student across all courses and rank top 5 performers.

**Pipeline Definition:**
```javascript
[
  {
    $group: {
      _id: "$studentId",
      avgPercentage: {
        $avg: { $multiply: [{ $divide: ["$marksObtained", "$maximumMarks"] }, 100] }
      },
      assessmentsCount: { $sum: 1 }
    }
  },
  { $match: { assessmentsCount: { $gte: 2 } } },
  { $lookup: { from: "students", localField: "_id", foreignField: "_id", as: "student" } },
  { $unwind: "$student" },
  {
    $project: {
      regNo: "$student.registrationNumber",
      name: "$student.name",
      department: "$student.department",
      avgPercentage: { $round: ["$avgPercentage", 2] },
      assessmentsCount: 1
    }
  },
  { $sort: { avgPercentage: -1 } },
  { $limit: 5 }
]
```

---

## **10. PyMongo Implementation**

The dedicated Python module located in `python/` connects to the same `edutrack` database using `pymongo>=4.6.0`.

### **Key Python Scripts:**
1. **`python/config.py`:** Initializes the connection using `os.getenv('MONGODB_URI')` and exposes database handles.
2. **`python/connection_test.py`:** Sends a ping command, reports the MongoDB version (MongoDB 8.2), storage engine (WiredTiger), and lists document counts across all collections.
3. **`python/crud_operations.py`:** Demonstrates inserting a student, recording attendance/marks, querying with projection, updating semester, and safely deleting with cascading deletion of child records.
4. **`python/validation_demo.py`:** Proves MongoDB engine-level enforcement by intentionally submitting invalid data (invalid email pattern, invalid attendance status enum, negative marks, duplicate registration numbers) and catching `pymongo.errors.WriteError` (Code 121) and `pymongo.errors.DuplicateKeyError` (Code 11000).
5. **`python/aggregations.py`:** Executes five complex pipelines and renders formatted terminal ASCII tables using `tabulate`.
6. **`python/main.py`:** Interactive menu-driven console application tailored for viva presentations.

---

## **11. Application Screenshots Checklist**

> **Note for Student:** Insert screenshots from your running local instance (`http://localhost:5173`) into the designated placeholders below before final submission:

- [ ] **Screenshot 1: Admin Dashboard**  
  *Insert screenshot of Dashboard showing 4 metric cards, Course Performance bar chart, Attendance Ratio donut chart, and Monthly velocity.*  
  `[INSERT SCREENSHOT: Dashboard Overview]`

- [ ] **Screenshot 2: Students Directory & Live Search**  
  *Insert screenshot of `/students` showing the student table, search filter for 'Diya', and registration pills.*  
  `[INSERT SCREENSHOT: Students Directory]`

- [ ] **Screenshot 3: Individual Student Profile & Gauge**  
  *Insert screenshot of `/students/:id` showing Diya Sharma's 100% attendance rate, assessment list, and grade badges.*  
  `[INSERT SCREENSHOT: Student Details & Performance]`

- [ ] **Screenshot 4: Attendance Tracker & Policy Banner**  
  *Insert screenshot of `/attendance` showing the attendance policy notice, status filter (Present and Absent only), and Export CSV button.*  
  `[INSERT SCREENSHOT: Attendance Tracker]`

- [ ] **Screenshot 5: Low Attendance Warning Report (&lt; 75%)**  
  *Insert screenshot of `/analytics` tab 'Low Attendance Warning' listing the 9 flagged students with shortfall counts.*  
  `[INSERT SCREENSHOT: Low Attendance Warning Report]`

- [ ] **Screenshot 6: Database & Architecture Documentation Page**  
  *Insert screenshot of `/project-info` showing the schema breakdown and $jsonSchema vs Mongoose comparison.*  
  `[INSERT SCREENSHOT: Architecture & Schema Page]`

- [ ] **Screenshot 7: PyMongo Terminal Execution**  
  *Insert terminal screenshot of running `python/venv/bin/python python/main.py` demonstrating option 3 (Validation Rejections) or option 4 (Aggregations).*  
  `[INSERT SCREENSHOT: PyMongo Terminal Console]`

---

## **12. Results and Conclusion**

The **EduTrack – Student Performance & Attendance Analytics System** successfully satisfies all requirements for the **CSE494 – Intelligent NoSQL Databases** course:
1. **Document-Oriented Integrity:** Demonstrated that normalized referencing with BSON `ObjectId` and compound unique indexes prevents write-contention and unbounded document growth.
2. **Two-Tier Validation:** Successfully verified that MongoDB `$jsonSchema` actively rejects invalid records at the storage engine level with Error Code 121, even when bypassing the web API.
3. **Powerful Analytics:** Implemented five essential MongoDB aggregation pipelines computing attendance ratios, course benchmarks, rank leaderboards, and academic alerts.
4. **Seamless Dual Driver Execution:** Proven that Node.js (Mongoose) and Python (PyMongo) interoperate flawlessly on the exact same database instance without schema discrepancies.
5. **Academic Readiness:** Provided complete source code, seed automation, test suites, and interactive tools for grading and viva defense.
