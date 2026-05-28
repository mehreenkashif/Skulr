from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models.user import User
from app.models.skill_profile import SkillProfile
from app.models.job_cache import JobCache
from app.models.score_history import ScoreHistory
from app.ml.knn import run_knn_analysis
from app.ml.logistic_regression import calculate_readiness_score

from app.ml.decision_tree import rank_skill_gaps
from app.ml.kmeans import cluster_learning_logs
from app.models.learning_log import LearningLog
from app.models.job_cache import JobCache
import json

ml_bp = Blueprint('ml', __name__, url_prefix='/ml')


def get_user_skills(user_id: int) -> list:
    profiles = SkillProfile.query.filter_by(user_id=user_id).all()
    return [p.skill_name for p in profiles]


def get_job_skills(role: str) -> list:
    role_lower = role.lower().strip()
    cached = JobCache.query.filter_by(role_name=role_lower).first()
    if not cached:
        return []
    import json
    data = json.loads(cached.required_skills)
    return data if isinstance(data, list) else data.get("skills", [])


@ml_bp.route('/analyze', methods=['POST'])
@jwt_required()
def analyze():
    """
    Run full ML analysis: KNN skill matching + Logistic Regression score.
    Saves score to history.
    Body: { "role": "data scientist" }
    """
    current_user_id = get_jwt_identity()
    body = request.get_json()

    if not body or not body.get('role'):
        return jsonify({"error": "role is required"}), 400

    role = body['role'].strip()

    user_skills = get_user_skills(current_user_id)
    if not user_skills:
        return jsonify({"error": "No skills found. Please upload your resume first."}), 400

    job_skills = get_job_skills(role)
    if not job_skills:
        return jsonify({"error": f"No job data for '{role}'. Call /gemini/job-skills first."}), 400

    # Run both ML models
    knn_result = run_knn_analysis(user_skills, job_skills)
    lr_result = calculate_readiness_score(user_skills, job_skills)

    # Save score to history
    snapshot = ScoreHistory(
        user_id=current_user_id,
        target_role=role,
        score=lr_result['readiness_score']
    )
    db.session.add(snapshot)
    db.session.commit()

    # Update user's target role
    user = db.session.get(User, current_user_id)
    user.target_role = role
    db.session.commit()

    return jsonify({
        "role": role,
        "user_skills": user_skills,
        "job_skills": job_skills,
        "knn": knn_result,
        "readiness": lr_result,
    }), 200


@ml_bp.route('/score-history', methods=['GET'])
@jwt_required()
def score_history():
    """Return score history for current user."""
    current_user_id = get_jwt_identity()
    history = ScoreHistory.query.filter_by(user_id=current_user_id)\
                                .order_by(ScoreHistory.created_at.asc()).all()

    return jsonify({
        "history": [
            {
                "score": h.score,
                "role": h.target_role,
                "date": h.created_at.isoformat()
            } for h in history
        ]
    }), 200
@ml_bp.route('/skill-priority', methods=['POST'])
@jwt_required()
def skill_priority():
    """Decision Tree: return ranked skill gaps for current user."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.target_role:
        return jsonify({'error': 'Set a target role first via /ml/analyze'}), 400

    user_skills = [
        sp.skill_name
        for sp in SkillProfile.query.filter_by(user_id=user_id).all()
    ]

    cached = JobCache.query.filter_by(
        role_name=user.target_role.lower()
    ).first()

    if not cached:
        return jsonify({
            'error': 'No job data cached for this role — call /ml/analyze first'
        }), 404

    job_skills = (
        json.loads(cached.required_skills)
        if isinstance(cached.required_skills, str)
        else cached.required_skills
    )

    ranked = rank_skill_gaps(user_skills, job_skills)

    return jsonify({
        'role': user.target_role,
        'total_missing': len(ranked),
        'ranked_gaps': ranked
    }), 200


@ml_bp.route('/cluster-logs', methods=['POST'])
@jwt_required()
def cluster_logs():
    """K-Means: cluster this user's learning log entries by topic."""
    user_id = get_jwt_identity()

    logs = LearningLog.query.filter_by(user_id=user_id)\
        .order_by(LearningLog.created_at.desc()).all()

    if not logs:
        return jsonify({
            'message': 'No learning logs found — add entries first',
            'clusters': []
        }), 200

    entries = [
        {
            'id': log.id,
            'entry': log.entry,
            'created_at': str(log.created_at)
        }
        for log in logs
    ]

    result = cluster_learning_logs(entries)
    return jsonify(result), 200
