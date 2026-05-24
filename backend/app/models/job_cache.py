from app import db
from datetime import datetime

class JobCache(db.Model):
    __tablename__ = 'job_cache'

    id = db.Column(db.Integer, primary_key=True)
    role_name = db.Column(db.String(100), unique=True, nullable=False)
    required_skills = db.Column(db.Text, nullable=False)  # stored as JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'role_name': self.role_name,
            'required_skills': self.required_skills,
            'created_at': self.created_at.isoformat()
        }