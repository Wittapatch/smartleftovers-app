from datetime import date
from typing import Literal
from uuid import uuid4

from pydantic import BaseModel, Field

Food_Type = Literal["dairy,protein,vegetable,fruit,carbohydrate,drink,other"]
class FoodItem(BaseModel):
    food_id:str=Field(default_factory=lambda:str(uuid4()))
    name:str
    expiry_date:date | None = None
    food_type:Food_Type | None = None
    price:float|None = Field(None,ge=0)
    quantity:int|None = Field(None,ge=0)
