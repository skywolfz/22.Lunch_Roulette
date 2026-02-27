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

    # tracking stats
    # view_count column left for legacy but no longer used
    view_count = db.Column(db.Integer, nullable=False, default=0)
    spin_count = db.Column(db.Integer, nullable=False, default=0)
    
    def to_dict(self):
        # note: view_count is tracked globally as page visits, not per item
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category.name if self.category else 'unknown',
            'category_id': self.category_id,
            'note': self.note,
            'spin_count': self.spin_count
        }


class Stats(db.Model):
    __tablename__ = 'stats'
    key = db.Column(db.String(50), primary_key=True)
    value = db.Column(db.Integer, nullable=False, default=0)

