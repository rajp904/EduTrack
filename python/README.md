# EduTrack - Python PyMongo Database Module
**Course:** CSE494 – Intelligent NoSQL Databases  
**Project:** EduTrack – Student Performance & Attendance Analytics System

---

## 1. Overview

This module provides direct Python integration with MongoDB using **PyMongo**. It connects to the exact same MongoDB database (`edutrack`) used by the Node.js/Express backend and React frontend.

The Python module demonstrates:
1. **PyMongo Driver Connectivity** to local or MongoDB Atlas instances via environment variables.
2. **Complete CRUD Operations** (`insert_one`, `insert_many`, `find`, `find_one`, `update_one`, `delete_many`, `delete_one`).
3. **Database-Level Validation Demonstration** showcasing how `$jsonSchema` and Unique Indexes actively reject invalid data at the MongoDB engine layer.
4. **Five Core Aggregation Pipelines** using stages like `$match`, `$group`, `$project`, `$sort`, `$limit`, `$lookup`, `$unwind`, and `$cond`.
5. **Interactive Viva CLI** in `main.py` allowing a professor to evaluate any feature on demand.

---

## 2. File Organization

```
python/
├── requirements.txt      # Python dependencies: pymongo, python-dotenv, tabulate
├── config.py             # MongoDB connection configuration & collection getters
├── connection_test.py    # Health check, ping test, and collection inspector
├── crud_operations.py    # Demonstrates INSERT, FIND, UPDATE, DELETE & cascade
├── validation_demo.py    # Demonstrates database-level constraint rejection
├── aggregations.py       # Executes complex academic analytics pipelines
├── main.py               # Menu-driven interactive CLI for viva demonstrations
└── README.md             # This documentation file
```

---

## 3. Setup and Execution

### Step 1: Create Virtual Environment and Install Dependencies

```bash
# From project root
cd python
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Run the Scripts

#### 1. Test Connection
```bash
python connection_test.py
```
*Pings the MongoDB server, prints server version (e.g. MongoDB 8.2), storage engine (WiredTiger), and active collection document counts.*

#### 2. Run CRUD Demonstration
```bash
python crud_operations.py
```
*Creates a test student, records attendance and marks, queries with projection, updates data, and safely deletes with cascading cleanup.*

#### 3. Run Validation Demonstration
```bash
python validation_demo.py
```
*Tests and catches WriteError (Code 121 - DocumentValidationFailure) for invalid email, invalid enum, and negative marks, plus DuplicateKeyError (Code 11000) for unique indexes.*

#### 4. Run Aggregation Pipelines
```bash
python aggregations.py
```
*Runs the 5 multi-stage aggregation pipelines and prints formatted tables of department distribution, course benchmarks, student averages, attendance breakdown (Present/Absent), and low-attendance warnings.*

#### 5. Launch Interactive Viva CLI
```bash
python main.py
```
*Provides a menu to present any feature interactively during academic viva or grading.*
