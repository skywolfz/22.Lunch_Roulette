from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import DevelopmentConfig

db = SQLAlchemy()

def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    db.init_app(app)
    
    with app.app_context():
        from app import models
        db.create_all()
        # add new columns if the database was created earlier
        inspector = db.inspect(db.engine)
        # SQLite doesn't support IF NOT EXISTS for ALTER, so inspect current columns
        cols = []
        if inspector.has_table('restaurant'):
            cols = [c['name'] for c in inspector.get_columns('restaurant')]
        if 'view_count' not in cols:
            db.session.execute('ALTER TABLE restaurant ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0')
        if 'spin_count' not in cols:
            db.session.execute('ALTER TABLE restaurant ADD COLUMN spin_count INTEGER NOT NULL DEFAULT 0')
        db.session.commit()
    
    from app.routes import main_bp
    app.register_blueprint(main_bp)
    
    return app
