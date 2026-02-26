from flask import Blueprint, render_template, request, jsonify
import random
from app import db
from app.models import Restaurant, Category

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    return render_template('index.html')

@main_bp.route('/admin')
def admin():
    """Restaurant administration page"""
    return render_template('admin.html')

@main_bp.route('/api/categories', methods=['GET'])
def get_categories():
    """Get all categories"""
    categories = Category.query.all()
    return jsonify([cat.to_dict() for cat in categories])

@main_bp.route('/api/restaurants', methods=['GET'])
def get_restaurants():
    """Get all restaurants"""
    restaurants = Restaurant.query.all()
    return jsonify([rest.to_dict() for rest in restaurants])

@main_bp.route('/api/restaurants', methods=['POST'])
def add_restaurant():
    """Add a new restaurant"""
    data = request.json
    name = data.get('name', '').strip()
    category_name = data.get('category', '').strip() or 'unknown'
    note = data.get('note', '').strip() or None
    
    if not name:
        return jsonify({'error': 'Restaurant name is required'}), 400
    
    # Get or create category
    category = Category.query.filter_by(name=category_name).first()
    if not category:
        category = Category(name=category_name)
        db.session.add(category)
        db.session.flush()
    
    # Add restaurant
    restaurant = Restaurant(name=name, category_id=category.id, note=note)
    db.session.add(restaurant)
    db.session.commit()
    
    return jsonify(restaurant.to_dict()), 201

@main_bp.route('/api/spin', methods=['POST'])
def spin():
    """Get a random restaurant from selected categories"""
    data = request.json
    selected_category_ids = data.get('category_ids', [])

    # if no categories explicitly selected, treat as all
    if not selected_category_ids:
        restaurants = Restaurant.query.all()
    else:
        restaurants = Restaurant.query.filter(
            Restaurant.category_id.in_(selected_category_ids)
        ).all()
    
    if not restaurants:
        return jsonify({'error': 'No restaurants in selected categories'}), 404
    
    chosen = random.choice(restaurants)
    return jsonify(chosen.to_dict()), 200

@main_bp.route('/api/restaurants/<int:restaurant_id>', methods=['DELETE'])
def delete_restaurant(restaurant_id):
    """Delete a restaurant"""
    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        return jsonify({'error': 'Restaurant not found'}), 404
    
    db.session.delete(restaurant)
    db.session.commit()
    return jsonify({'success': True}), 200
