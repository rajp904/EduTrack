"""
EduTrack - PyMongo Connection Test & Server Health
Course: CSE494 - Intelligent NoSQL Databases

Tests connection to MongoDB, validates server reachability, and inspects collections.
"""

import sys
from tabulate import tabulate
from config import get_mongo_client, DB_NAME, MONGODB_URI

def test_connection():
    print("=" * 65)
    print(" 🔌 EduTrack: PyMongo MongoDB Connection Verification")
    print("=" * 65)
    print(f" Target URI: {MONGODB_URI}")
    print(f" Target DB:  {DB_NAME}\n")

    try:
        client = get_mongo_client()
        # The ping command verifies that the connection is active
        res = client.admin.command('ping')
        print("✅ Ping successful! Response:", res)

        server_info = client.server_info()
        print(f"✅ MongoDB Server Version: {server_info.get('version', 'Unknown')}")
        print(f"✅ Storage Engine:         {server_info.get('storageEngine', {}).get('name', 'wiredTiger')}")

        db = client[DB_NAME]
        collections = db.list_collection_names()
        print(f"\n📂 Database '{DB_NAME}' contains {len(collections)} collections:\n")

        table_data = []
        for coll_name in sorted(collections):
            count = db[coll_name].count_documents({})
            indexes_count = len(db[coll_name].index_information())
            table_data.append([coll_name, count, indexes_count])

        print(tabulate(table_data, headers=["Collection Name", "Document Count", "Index Count"], tablefmt="grid"))
        print("\n🎉 PyMongo is successfully connected to the shared 'edutrack' database!\n")
        return True

    except Exception as e:
        print(f"\n❌ Connection test failed: {e}")
        print("\n💡 Troubleshooting:")
        print("1. Ensure local MongoDB service is running: brew services start mongodb-community")
        print("2. Check if MONGODB_URI in .env is correct.")
        return False

if __name__ == '__main__':
    success = test_connection()
    sys.exit(0 if success else 1)
