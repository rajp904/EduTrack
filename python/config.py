"""
EduTrack - Python PyMongo Database Configuration
Course: CSE494 - Intelligent NoSQL Databases

Provides database connection and collection handles for PyMongo operations.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

# Resolve root .env path
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR / '.env'
load_dotenv(dotenv_path=env_path)

MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/edutrack')
DB_NAME = 'edutrack'

def get_mongo_client(uri: str = MONGODB_URI) -> MongoClient:
    """Creates and returns a MongoClient instance."""
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        return client
    except Exception as e:
        print(f"❌ Failed to initialize MongoClient: {e}")
        raise

def get_database(client: MongoClient = None):
    """Returns the edutrack database handle."""
    if client is None:
        client = get_mongo_client()
    return client[DB_NAME]

def get_collections():
    """Returns handles to all primary collections."""
    client = get_mongo_client()
    db = get_database(client)
    return {
        'client': client,
        'db': db,
        'students': db['students'],
        'courses': db['courses'],
        'attendance': db['attendance'],
        'marks': db['marks']
    }
