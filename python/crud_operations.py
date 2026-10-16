"""
EduTrack - PyMongo Complete CRUD Operations Demonstration
Course: CSE494 - Intelligent NoSQL Databases

Demonstrates INSERT, FIND (with filters), UPDATE, and DELETE operations using PyMongo,
including safe relationship cascade handling.
"""

from datetime import datetime, timezone
from bson import ObjectId
from tabulate import tabulate
from config import get_collections

def demonstrate_crud():
    cols = get_collections()
    students = cols['students']
    courses = cols['courses']
    attendance = cols['attendance']
    marks = cols['marks']

    print("=" * 70)
    print(" 🛠️  EduTrack: PyMongo CRUD Operations Demonstration")
    print("=" * 70)

    # Clean up any leftover demo record from prior runs
    demo_reg = "DEMO9999"
    demo_existing = students.find_one({"registrationNumber": demo_reg})
    if demo_existing:
        attendance.delete_many({"studentId": demo_existing["_id"]})
        marks.delete_many({"studentId": demo_existing["_id"]})
        students.delete_one({"_id": demo_existing["_id"]})

    # 1. CREATE / INSERT
    print("\n[1] 📝 INSERT OPERATION: Creating a new Student document...")
    new_student = {
        "registrationNumber": demo_reg,
        "name": "Demo Student",
        "email": "demo.student@edutrack.edu",
        "department": "Computer Science",
        "semester": 6,
        "enrollmentDate": datetime.now(timezone.utc),
        "createdAt": datetime.now(timezone.utc)
    }
    insert_result = students.insert_one(new_student)
    demo_student_id = insert_result.inserted_id
    print(f"  ✅ Inserted student with ObjectId: {demo_student_id}")

    # Find a course to record attendance and marks for
    sample_course = courses.find_one({"courseCode": "CSE494"})
    if not sample_course:
        sample_course = courses.find_one({})
    course_id = sample_course["_id"]

    print("  📝 INSERT OPERATION: Recording Attendance for demo student...")
    att_doc = {
        "studentId": demo_student_id,
        "courseId": course_id,
        "date": datetime.now(timezone.utc),
        "status": "Present",
        "remarks": "PyMongo demo live session",
        "createdAt": datetime.now(timezone.utc)
    }
    att_result = attendance.insert_one(att_doc)
    print(f"  ✅ Inserted attendance record with ObjectId: {att_result.inserted_id}")

    print("  📝 INSERT OPERATION: Inserting Assessment Marks for demo student...")
    marks_doc = {
        "studentId": demo_student_id,
        "courseId": course_id,
        "assessmentName": "NoSQL Lab Exam",
        "marksObtained": 28.5,
        "maximumMarks": 30.0,
        "assessmentDate": datetime.now(timezone.utc),
        "createdAt": datetime.now(timezone.utc)
    }
    marks_result = marks.insert_one(marks_doc)
    print(f"  ✅ Inserted marks record with ObjectId: {marks_result.inserted_id}")

    # 2. READ / FIND
    print("\n[2] 🔍 READ / QUERY OPERATIONS: Finding records using filters...")
    found_student = students.find_one({"_id": demo_student_id})
    print(f"  Found Student: {found_student['name']} ({found_student['registrationNumber']})")
    print(f"  Department:    {found_student['department']}, Semester: {found_student['semester']}")

    # Query with filter & projection
    print("\n  Listing 5 Students in 'Computer Science' department:")
    cs_students = list(students.find(
        {"department": "Computer Science"},
        {"registrationNumber": 1, "name": 1, "semester": 1, "_id": 0}
    ).limit(5))
    print(tabulate(cs_students, headers="keys", tablefmt="simple"))

    # 3. UPDATE
    print("\n[3] ✏️  UPDATE OPERATION: Updating student semester & marks...")
    update_res = students.update_one(
        {"_id": demo_student_id},
        {"$set": {"semester": 7, "name": "Demo Student (Promoted)"}}
    )
    print(f"  ✅ Students matched: {update_res.matched_count}, modified: {update_res.modified_count}")

    # Update marks
    marks_update = marks.update_one(
        {"studentId": demo_student_id},
        {"$set": {"marksObtained": 30.0}}
    )
    print(f"  ✅ Marks updated: matched {marks_update.matched_count}, modified {marks_update.modified_count}")

    updated_student = students.find_one({"_id": demo_student_id})
    print(f"  Verified Name after update: '{updated_student['name']}', Semester: {updated_student['semester']}")

    # 4. DELETE (with cascade handling)
    print("\n[4] 🗑️  DELETE OPERATION: Safely removing demo student & cascading records...")
    deleted_att = attendance.delete_many({"studentId": demo_student_id})
    deleted_mks = marks.delete_many({"studentId": demo_student_id})
    deleted_stu = students.delete_one({"_id": demo_student_id})

    print(f"  ✅ Deleted {deleted_att.deleted_count} attendance record(s)")
    print(f"  ✅ Deleted {deleted_mks.deleted_count} marks record(s)")
    print(f"  ✅ Deleted {deleted_stu.deleted_count} student record(s)")
    print("  🎉 Referential integrity preserved: No orphaned documents left!")

    cols['client'].close()

if __name__ == '__main__':
    demonstrate_crud()
