import json
import re
import requests
from app.models.job_cache import JobCache
from app import db
from flask import current_app


MOCK_SKILLS = {
    "data scientist": ["Python", "SQL", "Machine Learning", "TensorFlow", "Pandas", "NumPy", "Scikit-learn", "Data Visualization", "Statistics", "Deep Learning", "R", "Tableau", "Big Data", "NLP", "Power BI"],
    "web developer": ["HTML", "CSS", "JavaScript", "React", "Node.js", "REST APIs", "Git", "SQL", "TypeScript", "MongoDB", "Docker", "AWS", "Figma", "Python", "GraphQL"],
    "machine learning engineer": ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "MLOps", "Docker", "Kubernetes", "SQL", "Deep Learning", "NLP", "Computer Vision", "AWS", "Git", "Statistics", "Spark"],
    "backend developer": ["Python", "Node.js", "SQL", "REST APIs", "Docker", "AWS", "MongoDB", "PostgreSQL", "Git", "Linux", "Redis", "Kubernetes", "CI/CD", "Flask", "Django"],
    "frontend developer": ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Git", "Figma", "REST APIs", "Redux", "Tailwind CSS", "Jest", "Webpack", "Vue.js", "GraphQL", "Responsive Design"],
    "devops engineer": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Terraform", "Git", "Jenkins", "Ansible", "Python", "Bash", "Monitoring", "Networking", "Security", "Azure"]
}


def get_skills_for_role(role: str) -> dict:
    role_normalized = role.strip().lower()

    cached = JobCache.query.filter_by(role_name=role_normalized).first()
    if cached:
        return {
            "skills": json.loads(cached.required_skills),
            "source": "cache"
        }

    skills = _call_gemini(role_normalized)

    new_cache = JobCache(
        role_name=role_normalized,
        required_skills=json.dumps(skills)
    )
    db.session.add(new_cache)
    db.session.commit()

    return {
        "skills": skills,
        "source": "gemini"
    }


def _call_gemini(role: str) -> list:
    api_key = current_app.config['GEMINI_API_KEY']
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"

    prompt = f"""You are a job market expert. List the top 15 technical skills required for a "{role}" job in 2025.

Return ONLY a valid JSON array of strings. No explanation, no markdown, no backticks.
Example format: ["Python", "SQL", "Machine Learning"]

Skills for {role}:"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }

    try:
        response = requests.post(url, json=payload, timeout=10)

        if response.status_code == 429:
            print("Rate limited — using mock skills")
            return _get_mock_skills(role)

        response.raise_for_status()
        data = response.json()
        raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
        cleaned = raw_text.strip()
        cleaned = re.sub(r'^```json\s*', '', cleaned)
        cleaned = re.sub(r'\s*```$', '', cleaned)
        return json.loads(cleaned)

    except Exception as e:
        print(f"Gemini call failed: {e} — using mock skills")
        return _get_mock_skills(role)


def _get_mock_skills(role: str) -> list:
    for key in MOCK_SKILLS:
        if key in role.lower():
            return MOCK_SKILLS[key]
    return ["Python", "SQL", "Git", "JavaScript", "React", "Node.js", "Docker", "AWS", "REST APIs", "MongoDB", "Linux", "TypeScript", "CI/CD", "Agile", "Communication"]