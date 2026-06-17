from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.skill_profile import SkillProfile
from app.models.job_cache import JobCache
from app.models.score_history import ScoreHistory
from app.models.learning_log import LearningLog
from app.ml.knn import run_knn_analysis
from app.ml.logistic_regression import calculate_readiness_score
from app.ml.decision_tree import rank_skill_gaps
from app.ml.kmeans import cluster_learning_logs
import json

ml_bp = Blueprint('ml', __name__, url_prefix='/ml')

def get_user_skills(user_id):
    return [p.skill_name for p in SkillProfile.query.filter_by(user_id=user_id).all()]

def get_job_skills(role):
    cached = JobCache.query.filter_by(role_name=role.lower().strip()).first()
    if not cached: return []
    data = json.loads(cached.required_skills) if isinstance(cached.required_skills, str) else cached.required_skills
    return data if isinstance(data, list) else data.get('skills', [])

@ml_bp.route('/analyze', methods=['POST'])
@jwt_required()
def analyze():
    body = request.get_json() or {}
    role = (body.get('target_role') or body.get('role', '')).strip()
    if not role: return jsonify({'error': 'role is required'}), 400
    uid = get_jwt_identity()
    user_skills = get_user_skills(uid)
    if not user_skills: return jsonify({'error': 'Upload your resume first'}), 400
    job_skills = get_job_skills(role)
    if not job_skills: return jsonify({'error': f"No job data for '{role}'. Call /gemini/job-skills first"}), 400
    knn = run_knn_analysis(user_skills, job_skills)
    lr  = calculate_readiness_score(user_skills, job_skills)
    db.session.add(ScoreHistory(user_id=uid, target_role=role, score=lr['readiness_score']))
    user = db.session.get(User, uid)
    user.target_role = role
    db.session.commit()
    return jsonify({'role': role, 'user_skills': user_skills, 'job_skills': job_skills, 'knn': knn, 'readiness': lr}), 200

@ml_bp.route('/score-history', methods=['GET'])
@jwt_required()
def score_history():
    uid = get_jwt_identity()
    rows = ScoreHistory.query.filter_by(user_id=uid).order_by(ScoreHistory.created_at.asc()).all()
    return jsonify({'history': [{'score': h.score, 'role': h.target_role, 'date': h.created_at.isoformat()} for h in rows]}), 200

@ml_bp.route('/skill-priority', methods=['POST'])
@jwt_required()
def skill_priority():
    uid  = get_jwt_identity()
    user = User.query.get(uid)
    body = request.get_json() or {}
    role = (body.get('target_role') or body.get('role') or (user.target_role if user else '')).strip()
    if not role: return jsonify({'error': 'Set a target role first'}), 400
    user_skills = get_user_skills(uid)
    cached = JobCache.query.filter_by(role_name=role.lower()).first()
    if not cached: return jsonify({'error': f"No job data for '{role}'"}), 404
    job_skills = json.loads(cached.required_skills) if isinstance(cached.required_skills, str) else cached.required_skills
    ranked = rank_skill_gaps(user_skills, job_skills)
    return jsonify({'role': role, 'total_missing': len(ranked), 'ranked_gaps': ranked}), 200

@ml_bp.route('/cluster-logs', methods=['POST'])
@jwt_required()
def cluster_logs():
    uid  = get_jwt_identity()
    logs = LearningLog.query.filter_by(user_id=uid).order_by(LearningLog.created_at.desc()).all()
    if not logs: return jsonify({'message': 'No logs yet', 'clusters': []}), 200
    entries = [{'id': l.id, 'entry': l.skill_name, 'created_at': str(l.created_at)} for l in logs]
    return jsonify(cluster_learning_logs(entries)), 200

@ml_bp.route('/learning/log', methods=['POST'])
@jwt_required()
def add_log():
    uid   = get_jwt_identity()
    entry = (request.get_json() or {}).get('entry', '').strip()
    if not entry: return jsonify({'error': 'Entry cannot be empty'}), 400
    log = LearningLog(user_id=uid, skill_name=entry, description=entry)
    db.session.add(log)
    db.session.commit()
    return jsonify({'message': 'Log saved', 'id': log.id}), 201

@ml_bp.route('/learning/logs', methods=['GET'])
@jwt_required()
def get_logs():
    uid  = get_jwt_identity()
    logs = LearningLog.query.filter_by(user_id=uid).order_by(LearningLog.created_at.desc()).all()
    return jsonify({'logs': [
        {'id': l.id, 'entry': l.skill_name, 'created_at': str(l.created_at)}
        for l in logs
    ]}), 200