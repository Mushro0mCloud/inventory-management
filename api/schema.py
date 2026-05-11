from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from pymongo import MongoClient


db = SQLAlchemy()
migrate = Migrate()


class InventoryItem(db.Model):
    __tablename__ = 'inventory_items'

    item_id = db.Column(db.Integer, primary_key=True)
    item_name = db.Column(db.String(50), nullable=False)
    item_description = db.Column(db.String(250))
    item_price = db.Column(db.String(50))
    item_amt = db.Column(db.Integer, nullable=False)


def init_db(app):
    app.config.setdefault('SQLALCHEMY_TRACK_MODIFICATIONS', False)
    db.init_app(app)
    migrate.init_app(app, db)


def create_tables(app):
    with app.app_context():
        db.create_all()


def init_mongo(app):
    mongo_uri = app.config.get('MONGO_URI', 'mongodb://localhost:27017/')
    mongo_db_name = app.config.get('MONGO_DB_NAME', 'inventory_management')
    mongo_collection_name = app.config.get('MONGO_COLLECTION_NAME', 'api_logs')

    mongo_client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    mongo_client.admin.command('ping')

    db_handle = mongo_client[mongo_db_name]
    if mongo_collection_name not in db_handle.list_collection_names():
        db_handle.create_collection(mongo_collection_name)

    return db_handle[mongo_collection_name]
