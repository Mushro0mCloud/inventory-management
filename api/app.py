import time
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from sqlalchemy import text
from database import DB_URL

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = DB_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Model for inventory_items table
class InventoryItem(db.Model):
    __tablename__ = 'inventory_items'
    
    item_id = db.Column(db.Integer, primary_key=True)
    item_name = db.Column(db.String(50), nullable=False)
    item_description = db.Column(db.String(250))
    item_price = db.Column(db.String(50))
    item_amt = db.Column(db.Integer, nullable=False)

@app.route('/items')
def get_items():
    try:
        items = InventoryItem.query.all()
        return jsonify([{
            'item_id': item.item_id,
            'item_name': item.item_name,
            'item_description': item.item_description,
            'item_price': str(item.item_price),
            'item_amt': item.item_amt
        } for item in items])
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/items', methods=['POST'])
def create_item():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid JSON payload'}), 400

        item_name = data.get('item_name')
        item_description = data.get('item_description', '')
        item_price = data.get('item_price')
        item_amt = data.get('item_amt')

        if not item_name or item_price is None or item_amt is None:
            return jsonify({'error': 'item_name, item_price, and item_amt are required'}), 400

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
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    try:
        item = InventoryItem.query.get(item_id)
        if not item:
            return jsonify({'error': 'Item not found'}), 404

        db.session.delete(item)
        db.session.commit()
        return jsonify({'success': True}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/time')
def get_current_time():
    return jsonify({'time': time.time()})



if __name__ == '__main__':
    app.run(debug=True)

