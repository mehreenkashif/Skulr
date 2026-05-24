from app import db
from datetime import datetime

class SkillProfile(db.Model):
    __tablename__ = 'skill_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    skill_name = db.Column(db.String(100), nullable=False)
    source = db.Column(db.String(50), default='resume')  # 'resume' or 'manual'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'skill_name': self.skill_name,
            'source': self.source,
            'created_at': self.created_at.isoformat()
        }