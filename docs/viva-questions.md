# CSE494 – Intelligent NoSQL Databases
## Comprehensive Viva & Oral Examination Guide: EduTrack

This document provides **28 carefully curated viva questions and model answers** designed to help you confidently explain every architectural, database, aggregation, and PyMongo decision made in the **EduTrack** project.

---

### **Section 1: NoSQL & MongoDB Architectural Fundamentals**

#### **Q1. What type of NoSQL database is MongoDB, and how does it store data?**
> **Answer:** MongoDB is a **document-oriented NoSQL database**. It stores records as **BSON documents** (Binary JSON) organized into **collections** (analogous to tables in an RDBMS). Documents allow rich nested structures, arrays, and typed data types (like `ObjectId`, `Date`, and `Decimal128`) that standard JSON lacks.

#### **Q2. Why did you choose MongoDB instead of a traditional relational database (MySQL/PostgreSQL) for EduTrack?**
> **Answer:**
> 1. **Flexible, Dynamic Schema:** Allows varied academic evaluation types (quizzes, project phases, lab exams) without rigid multi-table relational schema migrations.
> 2. **Powerful Native Aggregation Engine:** Complex metrics like student weighted attendance and course percentiles are computed inside MongoDB's C++ aggregation engine without pulling raw records into web servers.
> 3. **Native JSON/BSON Synergy:** Full-stack compatibility with JavaScript (Express/React) and Python (PyMongo) eliminates heavy ORM mapping layers.

#### **Q3. What is the MongoDB WiredTiger storage engine, and what advantages does it offer?**
> **Answer:** WiredTiger is the default storage engine in MongoDB. It provides **document-level concurrency control** (allowing simultaneous writes to different documents in the same collection), **transparent disk compression** (snappy/zlib), and a dedicated memory cache, yielding high write throughput and minimal disk footprint.

#### **Q4. What is the 16MB BSON document size limit in MongoDB, and why does it matter?**
> **Answer:** MongoDB limits any single document to a maximum of 16 megabytes. This ensures efficient memory usage in the RAM cache and prevents excessive network bandwidth consumption during transfers. In EduTrack, this limit was a key architectural factor in choosing **separate referenced collections** over embedding unlimited attendance arrays inside student documents.

---

### **Section 2: Document Schema Design Decisions**

#### **Q5. In EduTrack, why did you create separate collections for `attendance` and `marks` instead of embedding them as arrays in `students`?**
> **Answer:**
> 1. **Unbounded Growth:** 4 years of daily attendance across multiple courses can cause student documents to grow indefinitely, risking the 16MB document boundary.
> 2. **Write Contention:** Marking attendance for an entire class would lock multiple student documents simultaneously.
> 3. **Document Relocation:** Constantly appending to embedded arrays forces WiredTiger to relocate documents on disk.
> 4. **Compound Unique Indexing:** A separate `attendance` collection allows a compound unique index on `{ studentId, courseId, date }` to physically guarantee no duplicate entries exist.

#### **Q6. What is a MongoDB BSON `ObjectId`, and what information does it encode?**
> **Answer:** An `ObjectId` is a 12-byte unique identifier containing:
> - 4 bytes: Unix timestamp representing document creation time.
> - 5 bytes: Random value unique to the machine and process.
> - 3 bytes: An incrementing counter starting at a random number.  
> Because it contains a timestamp, `ObjectId` values are naturally roughly sorted by insertion time.

#### **Q7. How is referential integrity handled in MongoDB since it lacks relational foreign key constraints (`ON DELETE CASCADE`)?**
> **Answer:** MongoDB does not have automatic database-level foreign key constraints. In EduTrack, referential integrity is handled via **application-level cascading deletions**. In both `studentController.js` and `python/crud_operations.py`, when a student is deleted, the backend executes `deleteMany({ studentId: id })` across `attendance` and `marks` before deleting the student document, guaranteeing zero orphaned documents.

---

### **Section 3: Database-Level vs Application-Level Validation**

#### **Q8. What is the difference between database-level `$jsonSchema` validation and application-level Mongoose validation?**
> **Answer:**
> - **Database-Level (`$jsonSchema`):** Configured directly on the MongoDB collection using `collMod`. It is enforced by the database engine itself. Any client (Node.js, PyMongo, MongoDB Compass, mongosh) is strictly rejected with **Error Code 121 (`DocumentValidationFailure`)** if it violates constraints.
> - **Application-Level (Mongoose):** Defined in Node.js server schemas. It only intercepts requests passing through the Express app and does not protect the database if a Python script or admin tool writes directly to MongoDB.

#### **Q9. What specific validation rules did you enforce in MongoDB via `$jsonSchema`?**
> **Answer:**
> - `students`: Regex pattern validation on `email` (`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`), semester bounds between 1 and 8.
> - `courses`: Course code format regex (`^[A-Za-z]{2,5}[0-9]{3,4}$`), credits bounded between 1 and 6.
> - `attendance`: Status restricted strictly to enum values `['Present', 'Absent']`.
> - `marks`: `marksObtained >= 0` and `maximumMarks >= 1`.

#### **Q10. What happens if someone tries to insert negative marks using PyMongo?**
> **Answer:** Even though PyMongo has no Mongoose validation layer, MongoDB's storage engine intercepts the insert because of the `$jsonSchema` rule on `marksObtained`. PyMongo raises a `pymongo.errors.WriteError` with Error Code 121 (`DocumentValidationFailure`), completely rejecting the invalid record.

---

### **Section 4: Indexing Strategies**

#### **Q11. What indexes did you create in EduTrack, and what is the purpose of each?**
> **Answer:**
> 1. **Unique Index on `students.registrationNumber` and `students.email`:** Prevents duplicate student registrations.
> 2. **Unique Index on `courses.courseCode`:** Ensures distinct curriculum codes (e.g., `CSE494`).
> 3. **Compound Unique Index on `attendance.{ studentId: 1, courseId: 1, date: 1 }`:** Prevents marking attendance twice for the same student, course, and date.
> 4. **Text Index on `students.name`:** Enables fast full-text fuzzy searching.
> 5. **Compound Index on `marks.{ studentId: 1, courseId: 1 }`:** Optimizes student grade lookups.

#### **Q12. What is the difference between a single-field index and a compound index?**
> **Answer:** A single-field index indexes values of one key (e.g., `{ email: 1 }`). A **compound index** contains references to multiple fields in a defined order (e.g., `{ studentId: 1, courseId: 1, date: 1 }`). It can support queries that filter on the prefix fields of the index and can enforce unique combinations across multiple fields.

#### **Q13. How do indexes impact write (INSERT/UPDATE/DELETE) performance?**
> **Answer:** While indexes drastically speed up read queries by avoiding full collection scans (`COLLSCAN`), each insert, update, or delete requires updating both the collection data and the corresponding B-tree index structures. Therefore, indexes should be chosen deliberately based on query patterns.

---

### **Section 5: MongoDB Aggregation Pipelines**

#### **Q14. What is a MongoDB Aggregation Pipeline, and how does it compare to standard SQL queries?**
> **Answer:** An aggregation pipeline is a framework for data processing modeled on data-flow concepts. Documents enter a multi-stage pipeline where each stage transforms the stream (filtering with `$match`, transforming with `$project`, grouping with `$group`, joining with `$lookup`). It is analogous to SQL's `SELECT`, `WHERE`, `GROUP BY`, `JOIN`, and `HAVING` combined, but executed through composable stages.

#### **Q15. How did you compute attendance percentage in MongoDB aggregation using Present and Absent statuses?**
> **Answer:** In the aggregation pipeline for attendance, inside the `$group` stage, we sum up total classes and count the number of sessions where status equals `'Present'`:
> ```javascript
> {
>   $group: {
>     _id: "$studentId",
>     totalClasses: { $sum: 1 },
>     presentCount: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
>     absentCount: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } }
>   }
> }
> ```
> In the subsequent `$project` stage, the attendance percentage is computed directly as:
> ```javascript
> attendancePercentage: {
>   $round: [{ $multiply: [{ $divide: ["$presentCount", "$totalClasses"] }, 100] }, 2]
> }
> ```

#### **Q16. What is the `$lookup` stage, and when should it be used?**
> **Answer:** `$lookup` performs a left outer join to an unsharded collection in the same database to filter in documents from the "joined" collection. In EduTrack, we use `$lookup` to join `attendance` and `marks` with `students` and `courses` to display human-readable student names and course codes instead of raw ObjectIds.

#### **Q17. Why is `$unwind` usually placed after `$lookup`?**
> **Answer:** `$lookup` outputs the matched foreign documents as an array (e.g., `student: [{ ... }]`). The `$unwind` stage deconstructs this single-element array into a flat object (e.g., `student: { ... }`), making subsequent field projections like `$student.name` simpler and cleaner.

#### **Q18. How did you generate the Low Attendance Warning Report (&lt; 75%)?**
> **Answer:**
> 1. `$group` calculates totalClasses and presentCount, computing attendance percentage per student.
> 2. `$match` filters documents where `attendancePercentage < 75.0`.
> 3. `$lookup` and `$unwind` fetch student contact details and course titles.
> 4. `$sort` orders records from lowest attendance to highest.

#### **Q19. How did you format dates for monthly attendance trends in MongoDB?**
> **Answer:** We used the `$dateToString` operator in the `$group` stage:
> `_id: { $dateToString: { format: "%Y-%m", date: "$date" } }`.  
> This groups all daily records by calendar month (e.g., `"2024-02"`), allowing calculation of monthly attendance velocity.

---

### **Section 6: PyMongo Driver & Python Integration**

#### **Q20. What is PyMongo, and how does it communicate with MongoDB?**
> **Answer:** PyMongo is the official Python distribution containing tools for interacting with MongoDB. It connects via network sockets over the standard MongoDB wire protocol, converting Python dictionaries into BSON and vice-versa.

#### **Q21. How does the Python module in EduTrack connect to the same database as the Node.js backend?**
> **Answer:** Both modules read the shared connection string `MONGODB_URI` from the project `.env` file (`mongodb://localhost:27017/edutrack`). Both connect to the exact same database and collections, ensuring complete data consistency across Node.js and Python.

#### **Q22. What happens in `validation_demo.py`?**
> **Answer:** `validation_demo.py` demonstrates five live database constraint tests:
> 1. Attempting to insert an invalid email format (caught by `$jsonSchema` pattern, WriteError 121).
> 2. Attempting to insert an invalid attendance status enum `'Excused'` (caught by `$jsonSchema` enum restricting values to `['Present', 'Absent']`, WriteError 121).
> 3. Attempting to insert negative marks `-15.0` (caught by `$jsonSchema` minimum bound, WriteError 121).
> 4. Attempting to insert duplicate student registration number (caught by Unique Index, DuplicateKeyError 11000).
> 5. Attempting to insert duplicate attendance for same student, course, and date (caught by Compound Unique Index, DuplicateKeyError 11000).

#### **Q23. What is the difference between `find_one()` and `find()` in PyMongo?**
> **Answer:** `find_one()` returns a single Python dictionary matching the query criteria (or `None`). `find()` returns a **Cursor** instance that can be iterated over in a loop or converted into a Python list, streaming documents lazily to preserve memory.

---

### **Section 7: REST API, Frontend & Practical Viva Questions**

#### **Q24. What HTTP status codes are used in EduTrack's REST API?**
> **Answer:**
> - `200 OK`: Successful GET / PUT / DELETE operation.
> - `201 Created`: Successful POST insertion of a student, course, attendance, or mark document.
> - `400 Bad Request`: Validation failure (e.g., negative marks or malformed ObjectId).
> - `404 Not Found`: Entity with requested ID does not exist.
> - `409 Conflict`: Duplicate key violation (e.g., registration number already taken or duplicate attendance date).
> - `500 Internal Server Error`: Unhandled database exception.

#### **Q25. How does the frontend prevent duplicate key errors before submitting attendance?**
> **Answer:** While the database physically rejects duplicates with Error 11000, the React frontend also provides immediate UI feedback by checking existing records and disabling redundant submissions, improving user experience.

#### **Q26. How is CSV export implemented for Attendance and Marks in the browser?**
> **Answer:** The frontend builds standard RFC-4180 CSV strings from the filtered records array in state, creates a dynamic `data:text/csv;charset=utf-8,` URI, attaches it to an invisible anchor element, and triggers programmatic download without needing extra server-side dependencies.

#### **Q27. How would this database architecture scale to 50,000+ students?**
> **Answer:**
> 1. **Sharding:** We can shard the `attendance` and `marks` collections horizontally using a compound shard key like `{ studentId: 1, date: 1 }`.
> 2. **Replica Sets:** Deploy a replica set (Primary-Secondary-Secondary) to distribute read analytics queries to secondary nodes using read preference `secondaryPreferred`.
> 3. **Archiving:** Older semester records can be archived into a time-series or cold collection.

#### **Q28. What command would you run right now to show your professor that PyMongo is working?**
> **Answer:**
> ```bash
> cd /Users/prince/Desktop/EduTrack
> python/venv/bin/python python/main.py
> ```
> This launches the interactive menu where we can select `[1]` to ping the database, `[3]` to demonstrate schema validation rejection, or `[4]` to execute aggregation pipelines.
