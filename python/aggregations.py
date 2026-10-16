"""
EduTrack - PyMongo Academic Aggregation Pipelines
Course: CSE494 - Intelligent NoSQL Databases

Executes advanced MongoDB aggregation pipelines using stages:
$match, $group, $project, $sort, $limit, $lookup, $unwind, $cond, $dateToString
"""

from tabulate import tabulate
from config import get_collections

def run_aggregations():
    cols = get_collections()
    students = cols['students']
    courses = cols['courses']
    attendance = cols['attendance']
    marks = cols['marks']

    print("=" * 75)
    print(" 📊 EduTrack: PyMongo MongoDB Aggregation Pipelines Execution")
    print("=" * 75)

    # 1. Total Student Count by Department
    print("\n[Pipeline 1] 🎓 Total Student Count by Department ($group, $sort)")
    p1 = [
        {"$group": {"_id": "$department", "total": {"$sum": 1}}},
        {"$sort": {"total": -1}}
    ]
    res1 = list(students.aggregate(p1))
    print(tabulate([[r["_id"], r["total"]] for r in res1], headers=["Department", "Total Students"], tablefmt="grid"))

    # 2. Average Marks Percentage per Course
    print("\n[Pipeline 2] 📚 Course-Wise Performance Analysis ($group, $lookup, $unwind, $project)")
    p2 = [
        {
            "$group": {
                "_id": "$courseId",
                "totalAssessments": {"$sum": 1},
                "avgPercentage": {
                    "$avg": {"$multiply": [{"$divide": ["$marksObtained", "$maximumMarks"]}, 100]}
                },
                "highestPercentage": {
                    "$max": {"$multiply": [{"$divide": ["$marksObtained", "$maximumMarks"]}, 100]}
                },
                "lowestPercentage": {
                    "$min": {"$multiply": [{"$divide": ["$marksObtained", "$maximumMarks"]}, 100]}
                }
            }
        },
        {
            "$lookup": {
                "from": "courses",
                "localField": "_id",
                "foreignField": "_id",
                "as": "course"
            }
        },
        {"$unwind": "$course"},
        {
            "$project": {
                "code": "$course.courseCode",
                "name": "$course.courseName",
                "total": "$totalAssessments",
                "avg": {"$round": ["$avgPercentage", 2]},
                "high": {"$round": ["$highestPercentage", 2]},
                "low": {"$round": ["$lowestPercentage", 2]}
            }
        },
        {"$sort": {"avg": -1}}
    ]
    res2 = list(marks.aggregate(p2))
    table2 = [[r["code"], r["name"], r["total"], f"{r['avg']}%", f"{r['high']}%", f"{r['low']}%"] for r in res2]
    print(tabulate(table2, headers=["Code", "Course Name", "Assessments", "Avg %", "Highest %", "Lowest %"], tablefmt="grid"))

    # 3. Top 5 Students by Average Marks
    print("\n[Pipeline 3] 🏆 Top 5 Academic Performers ($group, $lookup, $sort, $limit)")
    p3 = [
        {
            "$group": {
                "_id": "$studentId",
                "avgMarks": {
                    "$avg": {"$multiply": [{"$divide": ["$marksObtained", "$maximumMarks"]}, 100]}
                },
                "examsCount": {"$sum": 1}
            }
        },
        {
            "$lookup": {
                "from": "students",
                "localField": "_id",
                "foreignField": "_id",
                "as": "student"
            }
        },
        {"$unwind": "$student"},
        {
            "$project": {
                "reg": "$student.registrationNumber",
                "name": "$student.name",
                "dept": "$student.department",
                "exams": "$examsCount",
                "avg": {"$round": ["$avgMarks", 2]}
            }
        },
        {"$sort": {"avg": -1}},
        {"$limit": 5}
    ]
    res3 = list(marks.aggregate(p3))
    table3 = [[idx + 1, r["reg"], r["name"], r["dept"], r["exams"], f"{r['avg']}%"] for idx, r in enumerate(res3)]
    print(tabulate(table3, headers=["Rank", "Reg Number", "Name", "Department", "Exams", "Avg Score %"], tablefmt="grid"))

    # 4. Attendance Rate per Student & Course (Present / Absent)
    print("\n[Pipeline 4] 📋 Student Attendance Breakdown (Present & Absent only)")
    p4 = [
        {
            "$group": {
                "_id": {"studentId": "$studentId", "courseId": "$courseId"},
                "totalClasses": {"$sum": 1},
                "present": {"$sum": {"$cond": [{"$eq": ["$status", "Present"]}, 1, 0]}},
                "absent": {"$sum": {"$cond": [{"$eq": ["$status", "Absent"]}, 1, 0]}}
            }
        },
        {
            "$project": {
                "studentId": "$_id.studentId",
                "courseId": "$_id.courseId",
                "total": "$totalClasses",
                "present": 1,
                "absent": 1,
                "percentage": {
                    "$round": [{"$multiply": [{"$divide": ["$present", "$totalClasses"]}, 100]}, 1]
                }
            }
        },
        {
            "$lookup": {
                "from": "students",
                "localField": "studentId",
                "foreignField": "_id",
                "as": "student"
            }
        },
        {"$unwind": "$student"},
        {
            "$lookup": {
                "from": "courses",
                "localField": "courseId",
                "foreignField": "_id",
                "as": "course"
            }
        },
        {"$unwind": "$course"},
        {
            "$project": {
                "reg": "$student.registrationNumber",
                "name": "$student.name",
                "course": "$course.courseCode",
                "total": 1,
                "present": 1,
                "absent": 1,
                "pct": "$percentage"
            }
        },
        {"$sort": {"pct": -1}},
        {"$limit": 6}
    ]
    res4 = list(attendance.aggregate(p4))
    table4 = [[r["reg"], r["name"], r["course"], r["total"], r["present"], r["absent"], f"{r['pct']}%"] for r in res4]
    print(tabulate(table4, headers=["Reg No", "Student Name", "Course", "Total", "Present", "Absent", "Attendance %"], tablefmt="grid"))

    # 5. Low-Attendance Warning (< 75%)
    print("\n[Pipeline 5] ⚠️  Low-Attendance Critical Alert (< 75% Threshold)")
    p5 = [
        {
            "$group": {
                "_id": {"studentId": "$studentId", "courseId": "$courseId"},
                "totalClasses": {"$sum": 1},
                "present": {"$sum": {"$cond": [{"$eq": ["$status", "Present"]}, 1, 0]}},
                "absent": {"$sum": {"$cond": [{"$eq": ["$status", "Absent"]}, 1, 0]}}
            }
        },
        {
            "$project": {
                "studentId": "$_id.studentId",
                "courseId": "$_id.courseId",
                "total": "$totalClasses",
                "present": 1,
                "absent": 1,
                "percentage": {"$round": [{"$multiply": [{"$divide": ["$present", "$totalClasses"]}, 100]}, 1]}
            }
        },
        {"$match": {"percentage": {"$lt": 75.0}}},
        {
            "$lookup": {
                "from": "students",
                "localField": "studentId",
                "foreignField": "_id",
                "as": "student"
            }
        },
        {"$unwind": "$student"},
        {
            "$lookup": {
                "from": "courses",
                "localField": "courseId",
                "foreignField": "_id",
                "as": "course"
            }
        },
        {"$unwind": "$course"},
        {
            "$project": {
                "reg": "$student.registrationNumber",
                "name": "$student.name",
                "course": "$course.courseCode",
                "total": 1,
                "present": 1,
                "absent": 1,
                "pct": "$percentage"
            }
        },
        {"$sort": {"pct": 1}}
    ]
    res5 = list(attendance.aggregate(p5))
    table5 = [[r["reg"], r["name"], r["course"], r["total"], r["present"], r["absent"], f"{r['pct']}%", "CRITICAL (<75%)"] for r in res5]
    print(tabulate(table5, headers=["Reg No", "Student Name", "Course", "Total Classes", "Present", "Absent", "Attendance %", "Action Status"], tablefmt="grid"))

    print("\n✅ All PyMongo Aggregation Pipelines executed cleanly!")
    cols['client'].close()

if __name__ == '__main__':
    run_aggregations()
