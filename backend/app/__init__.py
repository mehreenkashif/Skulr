from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app(config_name='default'):
    from config import config_map

    app = Flask(__name__)
    app.config.from_object(config_map[config_name])

    db.init_app(app)
    CORS(app, origins=app.config.get('CORS_ORIGINS'))

    from app.routes.health import health_bp
    app.register_blueprint(health_bp)

    with app.app_context():
        db.create_all()

    return app