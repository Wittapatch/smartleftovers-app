from datetime import date
from os import getenv

from dotenv import load_dotenv
from model import Food_Type, FoodItem
from pymongo import MongoClient

load_dotenv()

uri = getenv("MONGO_URI")

client = MongoClient(uri)


try:
    db = client.get_database("smart_leftovers")
    col = db.get_collection("user_data")
except Exception as e:
    raise Exception("Unable to find the collection due to the following error: ", e)

def add_user(_id:str):
    col.insert_one({"_id":_id,"food_items":[]})

def delete_user(_id:str):
    col.delete_one({"_id":_id})

def filter_food_type(_id:str,food_type:Food_Type):
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


def add_food(_id:str,name:str,expiry_date:date,food_type:Food_Type,price:float,quantity:int,description:str):
    food_item = FoodItem(name=name,expiry_date=expiry_date,food_type=food_type,price=price,quantity=quantity,description=description)
    col.update_one({"_id":_id},{"$push":{"food_items":food_item.model_dump(mode="json")}})
    return food_item.food_id

def delete_food(_id:str,food_item:FoodItem):
    col.update_one({"_id":_id},{"$pull":{"food_items":FoodItem}})

def update_food(_id:str,food_id:str,name:str,expiry_date:date,food_type:Food_Type,price:float,quantity:int,description:str):
    food_item = FoodItem(food_id=food_id,name=name,expiry_date=expiry_date,food_type=food_type,price=price,quantity=quantity,description=description)
    col.update_one(
        {"_id":_id,"food_items.food_id":food_id},
        {"$set":{"food_items.$":food_item.model_dump(mode="json")}},
    )
#Check that connection to the MongoDB works
if __name__ == "__main__":
    try:
        test = client.admin.command("ping")
        print(f"Connected to MongoDB!:{test}")
    except Exception as e:
        print("Connection failed:", e)
