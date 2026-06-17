from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
jwt = JWTManager()
bcrypt = Bcrypt()

def create_app(config_name='development'):
    app = Flask(__name__)
    CORS(app)

    from config import config_map
    app.config.from_object(config_map[config_name])

    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)

    from app.routes.health import health_bp
    from app.routes.auth import auth_bp
    from app.routes.resume import resume_bp
    from app.routes.gemini import gemini_bp
    from app.routes.ml import ml_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(resume_bp, url_prefix="/resume")
    app.register_blueprint(gemini_bp, url_prefix='/gemini')
    app.register_blueprint(ml_bp)

    from app.models import User, SkillProfile, LearningLog, JobCache, ScoreHistory

    with app.app_context():
        db.create_all()

    return app