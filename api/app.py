import os
import time
from datetime import datetime
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from pymongo import MongoClient
from sqlalchemy import text
from database import DB_URL

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# this should be postgres configuration
app.config['SQLALCHEMY_DATABASE_URI'] = DB_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# mongodb configuration stuff
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'inventory_management')
MONGO_COLLECTION_NAME = os.getenv('MONGO_COLLECTION_NAME', 'api_logs')

# Initialize MongoDB client for logging
mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
mongo_client.admin.command('ping')
api_log_collection = mongo_client[MONGO_DB_NAME][MONGO_COLLECTION_NAME]
app.logger.info('Connected to MongoDB at %s, database: %s, collection: %s', MONGO_URI, MONGO_DB_NAME, MONGO_COLLECTION_NAME)

# determines action type based on HTTP and endpoint
def get_request_action(method, path):
    if method == 'POST' and path == '/items':
        return 'ADD_INVENTORY'
    if method == 'DELETE' and path.startswith('/items/'):
        return 'DELETE_INVENTORY'
    if method == 'PUT' and path.startswith('/items/'):
        return 'EDIT_INVENTORY'
    return None

# this runs before processing API requests and logs them into the mongodb collection.
@app.before_request
def log_api_request():
    action = get_request_action(request.method, request.path)
    if action is None:
        return

    log_doc = {
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'method': request.method,
        'endpoint': request.path,
        'action': action,
#        'user_agent': request.headers.get('User-Agent', '')
    }

    api_log_collection.insert_one(log_doc)

# this is just initialization, we could've put this on the top of the file but whatever.
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# model for inventory_items table. grabs data from postgres
class InventoryItem(db.Model):
    __tablename__ = 'inventory_items'
    
    item_id = db.Column(db.Integer, primary_key=True)
    item_name = db.Column(db.String(50), nullable=False)
    item_description = db.Column(db.String(250))
    item_price = db.Column(db.String(50))
    item_amt = db.Column(db.Integer, nullable=False)

# shows the items.
@app.route('/items')
def get_items():
        items = InventoryItem.query.all()
        return jsonify([{
            'item_id': item.item_id,
            'item_name': item.item_name,
            'item_description': item.item_description,
            'item_price': str(item.item_price),
            'item_amt': item.item_amt
        } for item in items])

# creates a new item. unfortunately, despite the fact that i tried my best to find the smallest available ID, it still appears at the very end of the database. i hope i'm stupid aand there actually is a way to fix this.
@app.route('/items', methods=['POST'])
def create_item():
        data = request.get_json()

        item_name = data.get('item_name')
        item_description = data.get('item_description', '')
        item_price = data.get('item_price')
        item_amt = data.get('item_amt')

        next_id_query = text(
            "SELECT MIN(seq_id) AS next_id "
            "FROM generate_series(1, (SELECT COALESCE(MAX(item_id), 0) + 1 FROM inventory_items)) AS seq_id "
            "LEFT JOIN inventory_items i ON i.item_id = seq_id "
            "WHERE i.item_id IS NULL"
        )
        next_id = db.session.execute(next_id_query).scalar()
        if next_id is None:
            next_id = 1

        item = InventoryItem(
            item_id=next_id,
            item_name=item_name,
            item_description=item_description,
            item_price=str(item_price),
            item_amt=int(item_amt)
        )
        db.session.add(item)
        db.session.commit()

        return jsonify({
            'item_id': item.item_id,
            'item_name': item.item_name,
            'item_description': item.item_description,
            'item_price': item.item_price,
            'item_amt': item.item_amt
        }), 201

# this one completely deletes whatever item we have selected.
@app.route('/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
        item = InventoryItem.query.get(item_id)

        db.session.delete(item)
        db.session.commit()
        return jsonify({'success': True}), 200

# this one edits the data of an existing item.
@app.route('/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
        data = request.get_json()

        item = InventoryItem.query.get(item_id)

        item.item_name = data.get('item_name', item.item_name)
        item.item_description = data.get('item_description', item.item_description)
        item.item_price = str(data.get('item_price', item.item_price))
        item.item_amt = int(data.get('item_amt', item.item_amt))

        db.session.commit()

        return jsonify({
            'item_id': item.item_id,
            'item_name': item.item_name,
            'item_description': item.item_description,
            'item_price': item.item_price,
            'item_amt': item.item_amt
        }), 200


#i left this here as a remnant just to test if the backend was working haha
@app.route('/time')
def get_current_time():
    return jsonify({'time': time.time()})



if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)

