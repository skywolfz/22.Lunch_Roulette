from app import db

class Category(db.Model):
    __tablename__ = 'category'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    restaurants = db.relationship('Restaurant', backref='category', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {'id': self.id, 'name': self.name}

class Restaurant(db.Model):
    __tablename__ = 'restaurant'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    note = db.Column(db.Text, nullable=True)  # optional note / hyperlink
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category.name if self.category else 'unknown',
            'category_id': self.category_id,
            'note': self.note
        }
