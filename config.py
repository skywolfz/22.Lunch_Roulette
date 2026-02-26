import os

class Config:
    """Base config"""
    # store database in the project root (mounted with write permissions)
    SQLALCHEMY_DATABASE_URI = 'sqlite:///lunch_roulette.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'lunch-roulette-dev-key-12345'

class DevelopmentConfig(Config):
    """Development config"""
    DEBUG = True

class ProductionConfig(Config):
    """Production config"""
    DEBUG = False

