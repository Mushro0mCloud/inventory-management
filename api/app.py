import os
import time
from datetime import datetime
from flask import Flask, jsonify, request
from sqlalchemy import text, create_engine
from database import DB_URL
from schema import db, init_db, create_tables, init_mongo, InventoryItem
from models import InventoryItems, Base
from flask_cors import CORS

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# this should be postgres configuration
app.config['SQLALCHEMY_DATABASE_URI'] = DB_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# mongodb configuration stuff
app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
app.config['MONGO_DB_NAME'] = os.getenv('MONGO_DB_NAME', 'inventory_management')
app.config['MONGO_COLLECTION_NAME'] = os.getenv('MONGO_COLLECTION_NAME', 'api_logs')

# Initialize database bindings
init_db(app)
api_log_collection = init_mongo(app)

# create table
engine = create_engine(DB_URL)
Base.metadata.create_all(engine)


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
    create_tables(app)
    app.run(host='0.0.0.0', debug=True)

