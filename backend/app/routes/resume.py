import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.skill_profile import SkillProfile
from app.nlp.resume_parser import parse_resume

resume_bp = Blueprint("resume", __name__)

ALLOWED_EXTENSIONS = {"pdf"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@resume_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_resume():
    user_id = get_jwt_identity()
    if "resume" not in request.files:
        return jsonify({"error": "No file uploaded. Use key 'resume'"}), 400
    file = request.files["resume"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "Only PDF files are accepted"}), 400
    upload_folder = os.path.join(current_app.root_path, "uploads")
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, f"{uuid.uuid4().hex}.pdf")
    file.save(file_path)
    try:
        result = parse_resume(file_path)
    except Exception as e:
        os.remove(file_path)
        return jsonify({"error": f"Failed to parse resume: {str(e)}"}), 500
    os.remove(file_path)
    if not result["skills"]:
        return jsonify({"message": "Resume uploaded but no recognizable skills found.", "skills": []}), 200
    SkillProfile.query.filter_by(user_id=user_id).delete()
    for skill in result["skills"]:
        db.session.add(SkillProfile(user_id=user_id, skill_name=skill))
    db.session.commit()
    return jsonify({"message": "Resume parsed successfully", "skill_count": result["skill_count"], "skills": result["skills"]}), 200

@resume_bp.route("/skills", methods=["GET"])
@jwt_required()
def get_skills():
    user_id = get_jwt_identity()
    profiles = SkillProfile.query.filter_by(user_id=user_id).all()
    if not profiles:
        return jsonify({"message": "No skills found. Upload your resume first.", "skills": []}), 200
    skills = [p.skill_name for p in profiles]
    return jsonify({"skill_count": len(skills), "skills": skills}), 200

@resume_bp.route("/add-skill", methods=["POST"])
@jwt_required()
def add_skill():
    user_id = get_jwt_identity()
    skill = (request.get_json() or {}).get('skill', '').strip().lower()
    if not skill:
        return jsonify({'error': 'Skill is required'}), 400
    exists = SkillProfile.query.filter_by(user_id=user_id, skill_name=skill).first()
    if exists:
        return jsonify({'message': 'Skill already in profile'}), 200
    db.session.add(SkillProfile(user_id=user_id, skill_name=skill))
    db.session.commit()
    return jsonify({'message': f'{skill} added to your profile'}), 201