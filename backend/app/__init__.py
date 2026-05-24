from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
jwt = JWTManager()
bcrypt = Bcrypt()

def create_app(config_name='development'):
    app = Flask(__name__)

    from config import config_map
    app.config.from_object(config_map[config_name])

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)

    # Register blueprints
    from app.routes.health import health_bp
    from app.routes.auth import auth_bp
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)

    # Import models so SQLAlchemy creates tables
    from app.models import User, SkillProfile, LearningLog, JobCache, ScoreHistory

    # Create all tables
    with app.app_context():
        db.create_all()

    return app