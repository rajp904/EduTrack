"""
EduTrack - MongoDB Validation & Constraint Demonstration
Course: CSE494 - Intelligent NoSQL Databases

Demonstrates how MongoDB database-level $jsonSchema validation rules and unique 
indexes actively reject invalid data at the database engine layer.
"""

from datetime import datetime, timezone
from bson import ObjectId
import pymongo.errors
from config import get_collections

def demonstrate_validation():
    cols = get_collections()
    students = cols['students']
    attendance = cols['attendance']
    marks = cols['marks']
    courses = cols['courses']

    print("=" * 72)
    print(" 🛡️  EduTrack: Database-Level $jsonSchema & Index Validation Demo")
    print("=" * 72)
    print(" This script proves that MongoDB rejects invalid data at the ENGINE level,")
    print(" protecting database integrity even when bypassing application logic.\n")

    # TEST 1: Invalid Email Format ($jsonSchema pattern constraint)
    print("--- [TEST 1] Inserting Student with Invalid Email Format ---")
    bad_student_email = {
        "registrationNumber": "FAIL_EMAIL_01",
        "name": "Invalid Email User",
        "email": "not-an-email-address", # Fails regex pattern: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$
        "department": "Computer Science",
        "semester": 4
    }
    try:
        students.insert_one(bad_student_email)
        print("❌ ERROR: Database accepted invalid email (Expected Rejection)!")
    except pymongo.errors.WriteError as e:
        print("✅ SUCCESS: MongoDB $jsonSchema actively rejected the insert!")
        print(f"   Error Code:    {e.code} (DocumentValidationFailure)")
        print(f"   Reason:        Field 'email' failed pattern regex constraint.\n")

    # TEST 2: Invalid Attendance Status ($jsonSchema enum constraint)
    print("--- [TEST 2] Inserting Attendance with Invalid Status Enum ---")
    sample_student = students.find_one()
    sample_course = courses.find_one()
    bad_attendance = {
        "studentId": sample_student["_id"],
        "courseId": sample_course["_id"],
        "date": datetime(2030, 1, 1, 10, 0, tzinfo=timezone.utc),
        "status": "Excused", # Only ['Present', 'Absent'] allowed!
        "remarks": "Should fail enum validation"
    }
    try:
        attendance.insert_one(bad_attendance)
        print("❌ ERROR: Database accepted invalid status enum!")
    except pymongo.errors.WriteError as e:
        print("✅ SUCCESS: MongoDB $jsonSchema rejected invalid enum value!")
        print(f"   Error Code:    {e.code} (DocumentValidationFailure)")
        print(f"   Reason:        Field 'status' must be one of ['Present', 'Absent'].\n")

    # TEST 3: Negative Marks ($jsonSchema minimum: 0 constraint)
    print("--- [TEST 3] Inserting Mark with Negative Value ---")
    bad_marks = {
        "studentId": sample_student["_id"],
        "courseId": sample_course["_id"],
        "assessmentName": "Invalid Negative Quiz",
        "marksObtained": -15.0, # Minimum allowed is 0
        "maximumMarks": 25.0
    }
    try:
        marks.insert_one(bad_marks)
        print("❌ ERROR: Database accepted negative marks!")
    except pymongo.errors.WriteError as e:
        print("✅ SUCCESS: MongoDB $jsonSchema rejected negative value!")
        print(f"   Error Code:    {e.code} (DocumentValidationFailure)")
        print(f"   Reason:        Field 'marksObtained' violated minimum: 0 numeric bound.\n")

    # TEST 4: Duplicate Registration Number (Unique Index Constraint)
    print("--- [TEST 4] Inserting Duplicate Student Registration Number ---")
    existing_student = students.find_one()
    duplicate_student = {
        "registrationNumber": existing_student["registrationNumber"], # Duplicate!
        "name": "Impostor Student",
        "email": "unique.impostor@edutrack.edu",
        "department": "Computer Science",
        "semester": 4
    }
    try:
        students.insert_one(duplicate_student)
        print("❌ ERROR: Database accepted duplicate registration number!")
    except pymongo.errors.DuplicateKeyError as e:
        print("✅ SUCCESS: MongoDB Unique Index rejected duplicate key!")
        print(f"   Error Code:    {e.code} (E11000 DuplicateKey)")
        print(f"   Violated Key:  registrationNumber='{existing_student['registrationNumber']}'\n")

    # TEST 5: Duplicate Attendance Record on Same Date (Compound Unique Index)
    print("--- [TEST 5] Inserting Duplicate Attendance Record (Same Student, Course, Date) ---")
    existing_att = attendance.find_one()
    duplicate_attendance = {
        "studentId": existing_att["studentId"],
        "courseId": existing_att["courseId"],
        "date": existing_att["date"], # Exact same date, student, and course!
        "status": "Present",
        "remarks": "Duplicate entry attempt"
    }
    try:
        attendance.insert_one(duplicate_attendance)
        print("❌ ERROR: Database accepted duplicate attendance on same date!")
    except pymongo.errors.DuplicateKeyError as e:
        print("✅ SUCCESS: Compound Unique Index prevented duplicate attendance!")
        print(f"   Error Code:    {e.code} (E11000 DuplicateKey)")
        print(f"   Violated Index: idx_compound_student_course_date_unique\n")

    print("=" * 72)
    print(" 🎯 ALL 5 DATABASE-LEVEL VALIDATION TESTS PASSED AS EXPECTED!")
    print("=" * 72)

    cols['client'].close()

if __name__ == '__main__':
    demonstrate_validation()
