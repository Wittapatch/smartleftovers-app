from os import getenv

from dotenv import load_dotenv
from model import Food_Type, FoodItem
from pymongo import MongoClient

# This file keeps all the MongoDB code in one place.
# The Flask routes call these functions when they need to read or save food data.

load_dotenv()

# Get the MongoDB URI that we set in the terminal or Docker.
uri = getenv("MONGO_DB_URI")

if not uri:
    raise ValueError("Missing MONGO_DB_URI in the environment")

client = MongoClient(uri)


try:
    # Each user document is stored using the Firebase uid as the id.
    db = client.get_database("smart_leftovers")
    col = db.get_collection("user_data")
except Exception as e:
    raise Exception("Unable to find the collection due to the following error: ", e)

def add_user(_id:str):
    # Create the user only if they do not already exist.
    col.update_one(
        {"_id":_id},
        {"$setOnInsert":{"food_items":[]}},
        upsert=True,
    )

def delete_user(_id:str):
    # Delete the user and all their saved foods.
    col.delete_one({"_id":_id})

def filter_food_type(_id:str,food_type:Food_Type):
    # Look through the user's foods and return only the matching type.
    user_info = col.find_one({"_id":_id})
    result=[]
    if user_info is None:
        print("User Not Found")
    else:
        foods = user_info["food_items"]
        for food in foods:
            if food.get("food_type") == food_type:
                result.append(food)
        return result

def get_foods(_id:str):
    # If the user does not exist yet, create them and return an empty list.
    user_info = col.find_one({"_id":_id}, {"food_items": 1})

    if user_info is None:
        add_user(_id)
        return []

    return user_info.get("food_items", [])

def add_food(_id:str,name:str,expiry_date:str,purchase_date:str,food_type:Food_Type,quantity:float|None,unit:str,description:str,image_uri:str,image_data:str,use_extract_feature:bool):
    # Pydantic checks the food data and creates a unique food_id.
    food_item = FoodItem(
        image_uri=image_uri,
        image_data=image_data,
        name=name,
        expiry_date=expiry_date,
        purchase_date=purchase_date,
        food_type=food_type,
        quantity=quantity,
        unit=unit,
        description=description,
        use_extract_feature=use_extract_feature,
    )
    col.update_one(
        {"_id":_id},
        {"$push":{"food_items":food_item.model_dump(mode="json")}},
        upsert=True,
    )
    return food_item.food_id

def delete_food(_id:str,food_id:str):
    # Pull removes only the food item with this food_id.
    return col.update_one({"_id":_id},{"$pull":{"food_items":{"food_id":food_id}}})

def update_food(_id:str,food_id:str,name:str,expiry_date:str,purchase_date:str,food_type:Food_Type,quantity:float|None,unit:str,description:str,image_uri:str,image_data:str,use_extract_feature:bool):
    # The $ operator updates only the food item that matches this food_id.
    food_item = FoodItem(
        food_id=food_id,
        image_uri=image_uri,
        image_data=image_data,
        name=name,
        expiry_date=expiry_date,
        purchase_date=purchase_date,
        food_type=food_type,
        quantity=quantity,
        unit=unit,
        description=description,
        use_extract_feature=use_extract_feature,
    )
    col.update_one(
        {"_id":_id,"food_items.food_id":food_id},
        {"$set":{"food_items.$":food_item.model_dump(mode="json")}},
    )
# Quick test to check that the MongoDB connection works.
if __name__ == "__main__":
    try:
        test = client.admin.command("ping")
        print(f"Connected to MongoDB!:{test}")
    except Exception as e:
        print("Connection failed:", e)
