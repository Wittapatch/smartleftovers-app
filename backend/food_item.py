from typing import Literal

from pydantic import BaseModel, Field

Food_Type = Literal["dairy,meat,vegetable,fruit,drink"]
class FoodItem(BaseModel):
    name:str
    expiry_date:str
    food_type:Food_Type
    price:float = Field(ge=0)
    quantity:int = Field(ge=0)