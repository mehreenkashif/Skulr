from app import db
from datetime import datetime

class LearningLog(db.Model):
    __tablename__ = 'learning_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    skill_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    minutes_spent = db.Column(db.Integer, default=0)
    logged_date = db.Column(db.Date, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'skill_name': self.skill_name,
            'description': self.description,
            'minutes_spent': self.minutes_spent,
            'logged_date': self.logged_date.isoformat(),
            'created_at': self.created_at.isoformat()
        }