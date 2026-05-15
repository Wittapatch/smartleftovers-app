from os import getenv

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

uri = getenv("MONGO_URI")

client = MongoClient(uri)

try:
    db = client.get_database("smart_leftovers")
    col = db.get_collection("user_data")
except Exception as e:
    raise Exception("Unable to find the collection due to the following error: ", e)

if __name__ == "__main__":
    try:
        test = client.admin.command("ping")
        print(f"Connected to MongoDB!:{test}")
    except Exception as e:
        print("Connection failed:", e)