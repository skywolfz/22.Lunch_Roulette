from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import DevelopmentConfig
from sqlalchemy import text

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
            db.session.execute(text('ALTER TABLE restaurant ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0'))
        if 'spin_count' not in cols:
            db.session.execute(text('ALTER TABLE restaurant ADD COLUMN spin_count INTEGER NOT NULL DEFAULT 0'))
        db.session.commit()
        
        # Seed themes if not already in database
        from app.models import Theme
        if Theme.query.count() == 0:
            themes = [
                Theme(name='light', display_name='Light'),
                Theme(name='dark', display_name='Dark'),
                Theme(name='nord', display_name='Nord'),
                Theme(name='dracula', display_name='Dracula'),
                Theme(name='solarized', display_name='Solarized'),
                Theme(name='ocean', display_name='Ocean'),
            ]
            for theme in themes:
                db.session.add(theme)
            db.session.commit()
    
    from app.routes import main_bp
    app.register_blueprint(main_bp)
    
    return app
