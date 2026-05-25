from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from app.services.gemini_service import get_skills_for_role
from app.models.job_cache import JobCache

gemini_bp = Blueprint('gemini', __name__)


@gemini_bp.route('/job-skills', methods=['POST'])
@jwt_required()
def job_skills():
    print("KEY BEING USED:", current_app.config['GEMINI_API_KEY'])
    

    data = request.get_json()
    role = data.get('role', '').strip()

    if not role:
        return jsonify({"error": "role is required"}), 400

    try:
        result = get_skills_for_role(role)
        return jsonify({
            "role": role,
            "skills": result["skills"],
            "source": result["source"]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@gemini_bp.route('/cached-roles', methods=['GET'])
@jwt_required()
def cached_roles():
    roles = JobCache.query.all()
    return jsonify({
        "cached_roles": [r.role_name for r in roles],
        "count": len(roles)
    }), 200