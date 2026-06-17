from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.gemini_service import get_skills_for_role, generate_roadmap, generate_company_match
from app.models.job_cache import JobCache
from app.models.skill_profile import SkillProfile
from app.models.user import User
import json

gemini_bp = Blueprint('gemini', __name__)


@gemini_bp.route('/job-skills', methods=['POST'])
@jwt_required()
def job_skills():
    data = request.get_json() or {}
    role = data.get('role', '').strip()
    if not role: return jsonify({"error": "role is required"}), 400
    try:
        result = get_skills_for_role(role)
        return jsonify({"role": role, "skills": result["skills"], "source": result["source"]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@gemini_bp.route('/cached-roles', methods=['GET'])
@jwt_required()
def cached_roles():
    roles = JobCache.query.all()
    return jsonify({"cached_roles": [r.role_name for r in roles], "count": len(roles)}), 200


@gemini_bp.route('/roadmap', methods=['POST'])
@jwt_required()
def roadmap():
    uid  = get_jwt_identity()
    user = User.query.get(uid)
    body = request.get_json() or {}
    role = (body.get('target_role') or (user.target_role if user else '')).strip()
    if not role: return jsonify({'error': 'Set a target role first'}), 400
    user_skills = [p.skill_name for p in SkillProfile.query.filter_by(user_id=uid).all()]
    cached = JobCache.query.filter_by(role_name=role.lower()).first()
    if not cached: return jsonify({'error': f"No job data for '{role}'. Run analysis first."}), 404
    job_skills_list = json.loads(cached.required_skills) if isinstance(cached.required_skills, str) else cached.required_skills
    missing = [s for s in job_skills_list if s.lower() not in {u.lower() for u in user_skills}]
    return jsonify(generate_roadmap(role, user_skills, missing)), 200


@gemini_bp.route('/company-match', methods=['POST'])
@jwt_required()
def company_match():
    uid  = get_jwt_identity()
    user = User.query.get(uid)
    body = request.get_json() or {}
    role = (body.get('target_role') or (user.target_role if user else '')).strip()
    if not role: return jsonify({'error': 'Set a target role first'}), 400
    user_skills = [p.skill_name for p in SkillProfile.query.filter_by(user_id=uid).all()]
    return jsonify(generate_company_match(role, user_skills)), 200