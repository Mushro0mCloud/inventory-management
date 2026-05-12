from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass


# makes the table and puts it in postgres.
class InventoryItems(Base):
    __tablename__ = 'inventory_items'
    
    item_id = Column(Integer, primary_key=True, nullable=False)
    item_name = Column(String(50), nullable=False)
    item_description = Column(String(250))
    item_price = Column(String(50))
    item_amt = Column(Integer, nullable=False)