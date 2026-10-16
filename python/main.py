"""
EduTrack - Python PyMongo Interactive CLI System
Course: CSE494 - Intelligent NoSQL Databases

Menu-driven console application for academic viva demonstrations of MongoDB & PyMongo.
"""

import sys
import os
from tabulate import tabulate
from config import get_collections, DB_NAME, MONGODB_URI
from connection_test import test_connection
from crud_operations import demonstrate_crud
from validation_demo import demonstrate_validation
from aggregations import run_aggregations

def clear_screen():
    # Only clear if running in standard interactive terminal
    pass

def print_header():
    print("\n" + "=" * 70)
    print(" 🎓 EDUTRACK: STUDENT PERFORMANCE & ATTENDANCE ANALYTICS")
    print(" Course: CSE494 - Intelligent NoSQL Databases")
    print(" PyMongo Database Interactive Demonstration Console")
    print("=" * 70)

def print_menu():
    print("""
 Select an option to demonstrate:
  [1] 🔌 Test MongoDB Connection & Server Health
  [2] 🛠️  Demonstrate PyMongo CRUD Operations (Insert, Query, Update, Delete)
  [3] 🛡️  Demonstrate MongoDB $jsonSchema & Index Validation Rejections
  [4] 📊 Execute Essential Aggregation Pipelines (5 Pipelines Demo)
  [5] 📂 View Live Database Summary & Document Statistics
  [6] 🔍 Search Student Records by Registration Number or Name
  [0] 🚪 Exit
""")

def view_db_summary():
    cols = get_collections()
    db = cols['db']
    print("\n--- 📂 LIVE DATABASE OVERVIEW ---")
    print(f" Database Name: {DB_NAME}")
    print(f" URI:           {MONGODB_URI}")
    
    table_data = []
    collections = sorted(db.list_collection_names())
    for name in collections:
        count = db[name].count_documents({})
        indexes = db[name].index_information()
        index_names = ", ".join(indexes.keys())
        table_data.append([name, count, len(indexes), index_names])
        
    print(tabulate(table_data, headers=["Collection", "Documents", "Indexes", "Index Keys"], tablefmt="grid"))
    cols['client'].close()

def search_student_interactive():
    cols = get_collections()
    students = cols['students']
    query = input("\n Enter student name or registration number to search: ").strip()
    if not query:
        print(" Search canceled.")
        return

    results = list(students.find({
        "$or": [
            {"registrationNumber": {"$regex": query, "$options": "i"}},
            {"name": {"$regex": query, "$options": "i"}},
            {"email": {"$regex": query, "$options": "i"}}
        ]
    }))

    if not results:
        print(f" No student found matching '{query}'.")
    else:
        table = []
        for s in results:
            table.append([
                s.get("registrationNumber"),
                s.get("name"),
                s.get("email"),
                s.get("department"),
                s.get("semester")
            ])
        print(f"\n Found {len(results)} student(s):")
        print(tabulate(table, headers=["Reg No", "Name", "Email", "Department", "Semester"], tablefmt="grid"))

    cols['client'].close()

def main():
    while True:
        print_header()
        print_menu()
        choice = input(" Enter your choice (0-6): ").strip()

        if choice == '1':
            test_connection()
        elif choice == '2':
            demonstrate_crud()
        elif choice == '3':
            demonstrate_validation()
        elif choice == '4':
            run_aggregations()
        elif choice == '5':
            view_db_summary()
        elif choice == '6':
            search_student_interactive()
        elif choice == '0':
            print("\n Exiting EduTrack PyMongo Console. Goodbye!\n")
            break
        else:
            print(" ⚠️  Invalid option. Please enter a number between 0 and 6.")

        input("\n Press [ENTER] to return to main menu...")

if __name__ == '__main__':
    main()
