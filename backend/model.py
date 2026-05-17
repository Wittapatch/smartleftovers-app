from uuid import uuid4

from pydantic import BaseModel, Field

Food_Type = str

class FoodItem(BaseModel):
    # Shape of one food item as stored in MongoDB and returned to the app.
    food_id:str=Field(default_factory=lambda:str(uuid4()))
    image_uri:str|None = None
    image_data:str|None = None
    name:str
    expiry_date:str | None = None
    purchase_date:str|None = None
    food_type:Food_Type | None = None
    quantity:float|None = Field(None,ge=0)
    unit:str|None = None
    description:str|None = None
    use_extract_feature:bool = False
