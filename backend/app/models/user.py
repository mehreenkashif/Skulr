from app import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    target_role = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    skill_profile = db.relationship('SkillProfile', backref='user', lazy=True)
    learning_logs = db.relationship('LearningLog', backref='user', lazy=True)
    score_history = db.relationship('ScoreHistory', backref='user', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'target_role': self.target_role,
            'created_at': self.created_at.isoformat()
        }