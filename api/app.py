import time
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from flask_migrate import Migrate
from flask_cors import CORS

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Banana10!@localhost:5432/Inventory_Manager'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Model for inventory_items table
class InventoryItem(db.Model):
    __tablename__ = 'inventory_items'
    
    item_id = db.Column(db.Integer, primary_key=True)
    item_name = db.Column(db.String(50), nullable=False)
    item_description = db.Column(db.String(250))
    item_price = db.Column(db.Numeric, nullable=False)
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


@app.route('/time')
def get_current_time():
    return jsonify({'time': time.time()})



if __name__ == '__main__':
    app.run(debug=True)

