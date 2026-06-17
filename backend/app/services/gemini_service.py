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

MOCK_ROADMAP = {
    "phases": [
        {"phase": 1, "title": "Foundation",       "duration": "2-3 weeks", "skills": ["Python", "SQL"],                        "resources": ["Python.org docs", "SQLZoo", "freeCodeCamp Python course"],  "goal": "Get comfortable with the core language and data querying"},
        {"phase": 2, "title": "Core ML Skills",   "duration": "4-6 weeks", "skills": ["Scikit-learn", "Pandas", "NumPy"],       "resources": ["Kaggle Learn", "Scikit-learn docs", "Hands-On ML book"],    "goal": "Build and evaluate basic ML models"},
        {"phase": 3, "title": "Deep Learning",    "duration": "4-6 weeks", "skills": ["TensorFlow", "PyTorch", "Deep Learning"], "resources": ["fast.ai", "TensorFlow tutorials", "PyTorch docs"],          "goal": "Understand neural networks and train deep learning models"},
        {"phase": 4, "title": "Production Skills","duration": "2-3 weeks", "skills": ["Docker", "MLOps", "Git"],                "resources": ["Docker docs", "MLflow docs", "GitHub Learning Lab"],         "goal": "Deploy models and work in a professional environment"},
    ],
    "total_duration": "12-18 weeks",
    "tip": "Build one project per phase and push it to GitHub to show employers real work."
}

MOCK_COMPANIES = {
    "machine learning engineer": [
        {"name": "Google",           "match": 92, "location": "Global / Remote",    "reason": "Strong Python + ML stack match"},
        {"name": "Careem",           "match": 88, "location": "Karachi, Pakistan",  "reason": "ML for ride-hailing optimization"},
        {"name": "Systems Limited",  "match": 80, "location": "Lahore, Pakistan",   "reason": "AI/ML consulting projects"},
        {"name": "Arbisoft",         "match": 78, "location": "Lahore, Pakistan",   "reason": "ML engineering for US clients"},
        {"name": "10Pearls",         "match": 75, "location": "Karachi, Pakistan",  "reason": "Data science and ML projects"},
        {"name": "Amazon",           "match": 72, "location": "Global / Remote",    "reason": "ML engineering for AWS services"},
    ],
    "data scientist": [
        {"name": "Teradata",         "match": 90, "location": "Global / Remote",    "reason": "Data science and analytics focus"},
        {"name": "Arbisoft",         "match": 85, "location": "Lahore, Pakistan",   "reason": "Data science for US product companies"},
        {"name": "Jazz",             "match": 80, "location": "Islamabad, Pakistan","reason": "Telecom data analytics team"},
        {"name": "Daraz",            "match": 78, "location": "Karachi, Pakistan",  "reason": "E-commerce data science"},
        {"name": "IBM",              "match": 74, "location": "Global / Remote",    "reason": "Data science consulting projects"},
        {"name": "Lums CSSPD",       "match": 70, "location": "Lahore, Pakistan",   "reason": "Research data science roles"},
    ],
    "frontend developer": [
        {"name": "Toptal",           "match": 88, "location": "Remote",             "reason": "Top React/JS talent network"},
        {"name": "Invozone",         "match": 84, "location": "Lahore, Pakistan",   "reason": "React-heavy project portfolio"},
        {"name": "Devsinc",          "match": 80, "location": "Lahore, Pakistan",   "reason": "Frontend for US SaaS clients"},
        {"name": "Programmers Force","match": 76, "location": "Lahore, Pakistan",   "reason": "Frontend product development"},
        {"name": "NetSol",           "match": 72, "location": "Lahore, Pakistan",   "reason": "Enterprise frontend engineering"},
        {"name": "Upwork",           "match": 70, "location": "Remote",             "reason": "Freelance frontend opportunities"},
    ],
}

DEFAULT_COMPANIES = [
    {"name": "Google",          "match": 85, "location": "Global / Remote",    "reason": "Strong technical skills match"},
    {"name": "Microsoft",       "match": 82, "location": "Global / Remote",    "reason": "Broad tech stack alignment"},
    {"name": "Careem",          "match": 78, "location": "Karachi, Pakistan",  "reason": "Fast-growing tech company in Pakistan"},
    {"name": "Systems Limited", "match": 74, "location": "Lahore, Pakistan",   "reason": "Leading Pakistani software house"},
    {"name": "Arbisoft",        "match": 70, "location": "Lahore, Pakistan",   "reason": "Top Pakistani product company"},
    {"name": "10Pearls",        "match": 68, "location": "Karachi, Pakistan",  "reason": "Digital transformation projects"},
]


# ── Groq API caller ────────────────────────────────────────────────────────────
def _call_groq(prompt: str, timeout: int = 15) -> str:
    """Call Groq API and return raw text response."""
    api_key = current_app.config.get('GROQ_API_KEY', '')
    if not api_key:
        raise ValueError("GROQ_API_KEY not set")

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 1500,
    }
    r = requests.post(url, json=payload, headers=headers, timeout=timeout)
    print(f"Groq status: {r.status_code}")
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"].strip()


def _parse_text(raw: str) -> dict:
    """Strip markdown fences and parse JSON."""
    raw = re.sub(r'^```json\s*', '', raw)
    raw = re.sub(r'\s*```$', '', raw)
    return json.loads(raw.strip())


# ── Public functions ───────────────────────────────────────────────────────────

def get_skills_for_role(role: str) -> dict:
    role_normalized = role.strip().lower()
    cached = JobCache.query.filter_by(role_name=role_normalized).first()
    if cached:
        return {"skills": json.loads(cached.required_skills), "source": "cache"}
    skills, source = _fetch_skills(role_normalized)
    db.session.add(JobCache(role_name=role_normalized, required_skills=json.dumps(skills)))
    db.session.commit()
    return {"skills": skills, "source": source}


def generate_roadmap(role: str, user_skills: list, missing_skills: list) -> dict:
    prompt = f"""You are a career coach. Create a learning roadmap for someone targeting "{role}".
They already know: {', '.join(user_skills) if user_skills else 'nothing yet'}
They need to learn: {', '.join(missing_skills) if missing_skills else 'nothing, they are ready!'}

Return ONLY valid JSON, no markdown, no backticks:
{{"phases":[{{"phase":1,"title":"Phase name","duration":"X weeks","skills":["skill1"],"resources":["resource1"],"goal":"What user can do after"}}],"total_duration":"X-Y weeks","tip":"One actionable tip"}}

Group missing skills into 3-4 logical phases ordered by dependency. Keep it practical."""
    try:
        raw = _call_groq(prompt)
        return _parse_text(raw)
    except Exception as e:
        print(f"Roadmap failed: {e}")
        return MOCK_ROADMAP


def generate_company_match(role: str, user_skills: list) -> dict:
    prompt = f"""You are a career advisor. A candidate targeting "{role}" has these skills: {', '.join(user_skills)}.
List 6 companies (mix of Pakistani and global tech companies) that would be a good match.

Return ONLY valid JSON, no markdown, no backticks:
{{"companies":[{{"name":"Company","match":85,"location":"City, Country","reason":"One sentence why this company fits"}}]}}"""
    try:
        raw = _call_groq(prompt)
        return _parse_text(raw)
    except Exception as e:
        print(f"Company match failed: {e}")
        return _mock_companies(role)


def _fetch_skills(role: str) -> tuple:
    prompt = f"""You are a job market expert. List the top 15 technical skills required for a "{role}" job in 2025.
Return ONLY a valid JSON array of strings. No explanation, no markdown, no backticks.
Example: ["Python", "SQL", "Machine Learning"]
Skills for {role}:"""
    try:
        raw = _call_groq(prompt, timeout=10)
        raw = re.sub(r'^```json\s*|\s*```$', '', raw).strip()
        return json.loads(raw), "groq"
    except Exception as e:
        print(f"Skills fetch failed: {e}")
        return _get_mock_skills(role), "mock"


def _get_mock_skills(role: str) -> list:
    for key in MOCK_SKILLS:
        if key in role.lower(): return MOCK_SKILLS[key]
    return ["Python", "SQL", "Git", "JavaScript", "React", "Node.js", "Docker", "AWS", "REST APIs", "MongoDB", "Linux", "TypeScript", "CI/CD", "Agile", "Communication"]


def _mock_companies(role: str) -> dict:
    for key in MOCK_COMPANIES:
        if key in role.lower(): return {"companies": MOCK_COMPANIES[key]}
    return {"companies": DEFAULT_COMPANIES}







# import json
# import re
# import requests
# from app.models.job_cache import JobCache
# from app import db
# from flask import current_app

# MOCK_SKILLS = {
#     "data scientist": ["Python", "SQL", "Machine Learning", "TensorFlow", "Pandas", "NumPy", "Scikit-learn", "Data Visualization", "Statistics", "Deep Learning", "R", "Tableau", "Big Data", "NLP", "Power BI"],
#     "web developer": ["HTML", "CSS", "JavaScript", "React", "Node.js", "REST APIs", "Git", "SQL", "TypeScript", "MongoDB", "Docker", "AWS", "Figma", "Python", "GraphQL"],
#     "machine learning engineer": ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "MLOps", "Docker", "Kubernetes", "SQL", "Deep Learning", "NLP", "Computer Vision", "AWS", "Git", "Statistics", "Spark"],
#     "backend developer": ["Python", "Node.js", "SQL", "REST APIs", "Docker", "AWS", "MongoDB", "PostgreSQL", "Git", "Linux", "Redis", "Kubernetes", "CI/CD", "Flask", "Django"],
#     "frontend developer": ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Git", "Figma", "REST APIs", "Redux", "Tailwind CSS", "Jest", "Webpack", "Vue.js", "GraphQL", "Responsive Design"],
#     "devops engineer": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Terraform", "Git", "Jenkins", "Ansible", "Python", "Bash", "Monitoring", "Networking", "Security", "Azure"]
# }

# MOCK_ROADMAP = {
#     "phases": [
#         {"phase": 1, "title": "Foundation",       "duration": "2-3 weeks", "skills": ["Python", "SQL"],                        "resources": ["Python.org docs", "SQLZoo", "freeCodeCamp Python course"],  "goal": "Get comfortable with the core language and data querying"},
#         {"phase": 2, "title": "Core ML Skills",   "duration": "4-6 weeks", "skills": ["Scikit-learn", "Pandas", "NumPy"],       "resources": ["Kaggle Learn", "Scikit-learn docs", "Hands-On ML book"],    "goal": "Build and evaluate basic ML models"},
#         {"phase": 3, "title": "Deep Learning",    "duration": "4-6 weeks", "skills": ["TensorFlow", "PyTorch", "Deep Learning"], "resources": ["fast.ai", "TensorFlow tutorials", "PyTorch docs"],          "goal": "Understand neural networks and train deep learning models"},
#         {"phase": 4, "title": "Production Skills","duration": "2-3 weeks", "skills": ["Docker", "MLOps", "Git"],                "resources": ["Docker docs", "MLflow docs", "GitHub Learning Lab"],         "goal": "Deploy models and work in a professional environment"},
#     ],
#     "total_duration": "12-18 weeks",
#     "tip": "Build one project per phase and push it to GitHub to show employers real work."
# }

# MOCK_COMPANIES = {
#     "machine learning engineer": [
#         {"name": "Google",           "match": 92, "location": "Global / Remote",    "reason": "Strong Python + ML stack match"},
#         {"name": "Careem",           "match": 88, "location": "Karachi, Pakistan",  "reason": "ML for ride-hailing optimization"},
#         {"name": "Systems Limited",  "match": 80, "location": "Lahore, Pakistan",   "reason": "AI/ML consulting projects"},
#         {"name": "Arbisoft",         "match": 78, "location": "Lahore, Pakistan",   "reason": "ML engineering for US clients"},
#         {"name": "10Pearls",         "match": 75, "location": "Karachi, Pakistan",  "reason": "Data science and ML projects"},
#         {"name": "Amazon",           "match": 72, "location": "Global / Remote",    "reason": "ML engineering for AWS services"},
#     ],
#     "data scientist": [
#         {"name": "Teradata",         "match": 90, "location": "Global / Remote",    "reason": "Data science and analytics focus"},
#         {"name": "Arbisoft",         "match": 85, "location": "Lahore, Pakistan",   "reason": "Data science for US product companies"},
#         {"name": "Jazz",             "match": 80, "location": "Islamabad, Pakistan","reason": "Telecom data analytics team"},
#         {"name": "Daraz",            "match": 78, "location": "Karachi, Pakistan",  "reason": "E-commerce data science"},
#         {"name": "IBM",              "match": 74, "location": "Global / Remote",    "reason": "Data science consulting projects"},
#         {"name": "Lums CSSPD",       "match": 70, "location": "Lahore, Pakistan",   "reason": "Research data science roles"},
#     ],
#     "frontend developer": [
#         {"name": "Toptal",           "match": 88, "location": "Remote",             "reason": "Top React/JS talent network"},
#         {"name": "Invozone",         "match": 84, "location": "Lahore, Pakistan",   "reason": "React-heavy project portfolio"},
#         {"name": "Devsinc",          "match": 80, "location": "Lahore, Pakistan",   "reason": "Frontend for US SaaS clients"},
#         {"name": "Programmers Force","match": 76, "location": "Lahore, Pakistan",   "reason": "Frontend product development"},
#         {"name": "NetSol",           "match": 72, "location": "Lahore, Pakistan",   "reason": "Enterprise frontend engineering"},
#         {"name": "Upwork",           "match": 70, "location": "Remote",             "reason": "Freelance frontend opportunities"},
#     ],
# }

# DEFAULT_COMPANIES = [
#     {"name": "Google",          "match": 85, "location": "Global / Remote",    "reason": "Strong technical skills match"},
#     {"name": "Microsoft",       "match": 82, "location": "Global / Remote",    "reason": "Broad tech stack alignment"},
#     {"name": "Careem",          "match": 78, "location": "Karachi, Pakistan",  "reason": "Fast-growing tech company in Pakistan"},
#     {"name": "Systems Limited", "match": 74, "location": "Lahore, Pakistan",   "reason": "Leading Pakistani software house"},
#     {"name": "Arbisoft",        "match": 70, "location": "Lahore, Pakistan",   "reason": "Top Pakistani product company"},
#     {"name": "10Pearls",        "match": 68, "location": "Karachi, Pakistan",  "reason": "Digital transformation projects"},
# ]


# def _call_api(prompt: str, timeout: int = 15):
#     api_key = current_app.config['GEMINI_API_KEY']
#     url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key={api_key}"
#     return requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=timeout)


# def _parse_json(response) -> dict:
#     raw = response.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
#     raw = re.sub(r'^```json\s*', '', raw)
#     raw = re.sub(r'\s*```$', '', raw)
#     return json.loads(raw)


# def get_skills_for_role(role: str) -> dict:
#     role_normalized = role.strip().lower()
#     cached = JobCache.query.filter_by(role_name=role_normalized).first()
#     if cached:
#         return {"skills": json.loads(cached.required_skills), "source": "cache"}
#     skills, source = _call_gemini(role_normalized)
#     db.session.add(JobCache(role_name=role_normalized, required_skills=json.dumps(skills)))
#     db.session.commit()
#     return {"skills": skills, "source": source}


# def generate_roadmap(role: str, user_skills: list, missing_skills: list) -> dict:
#     prompt = f"""You are a career coach. Create a learning roadmap for someone targeting "{role}".
# They already know: {', '.join(user_skills) if user_skills else 'nothing yet'}
# They need to learn: {', '.join(missing_skills) if missing_skills else 'nothing, they are ready!'}

# Return ONLY valid JSON in this exact format, no markdown, no backticks:
# {{"phases":[{{"phase":1,"title":"Phase name","duration":"X weeks","skills":["skill1"],"resources":["resource1"],"goal":"What user can do after"}}],"total_duration":"X-Y weeks","tip":"One actionable tip"}}

# Group missing skills into 3-4 logical phases ordered by dependency. Keep it practical."""
#     try:
#         r = _call_api(prompt)
#         if r.status_code == 429: return MOCK_ROADMAP
#         r.raise_for_status()
#         return _parse_json(r)
#     except Exception as e:
#         print(f"Roadmap failed: {e}")
#         return MOCK_ROADMAP


# def generate_company_match(role: str, user_skills: list) -> dict:
#     prompt = f"""You are a career advisor. A candidate targeting "{role}" has these skills: {', '.join(user_skills)}.
# List 6 companies (mix of Pakistani and global tech companies) that would be a good match.

# Return ONLY valid JSON, no markdown, no backticks:
# {{"companies":[{{"name":"Company","match":85,"location":"City, Country","reason":"One sentence why this company fits"}}]}}"""
#     try:
#         r = _call_api(prompt)
#         print(f"Gemini company-match status: {r.status_code}") 
#         if r.status_code == 429: return _mock_companies(role)
#         r.raise_for_status()
#         return _parse_json(r)
#     except Exception as e:
#         print(f"Company match failed: {e}")
#         return _mock_companies(role)


# def _call_gemini(role: str) -> tuple:
#     prompt = f"""You are a job market expert. List the top 15 technical skills required for a "{role}" job in 2025.
# Return ONLY a valid JSON array of strings. No explanation, no markdown, no backticks.
# Example: ["Python", "SQL", "Machine Learning"]
# Skills for {role}:"""
#     try:
#         r = _call_api(prompt, timeout=10)
#         if r.status_code == 429: return _get_mock_skills(role), "mock"
#         r.raise_for_status()
#         return json.loads(re.sub(r'^```json\s*|\s*```$', '', _parse_json.__wrapped__(r) if hasattr(_parse_json, '__wrapped__') else r.json()["candidates"][0]["content"]["parts"][0]["text"].strip())), "gemini"
#     except Exception as e:
#         print(f"Gemini skills failed: {e}")
#         return _get_mock_skills(role), "mock"


# def _get_mock_skills(role: str) -> list:
#     for key in MOCK_SKILLS:
#         if key in role.lower(): return MOCK_SKILLS[key]
#     return ["Python", "SQL", "Git", "JavaScript", "React", "Node.js", "Docker", "AWS", "REST APIs", "MongoDB", "Linux", "TypeScript", "CI/CD", "Agile", "Communication"]


# def _mock_companies(role: str) -> dict:
#     for key in MOCK_COMPANIES:
#         if key in role.lower(): return {"companies": MOCK_COMPANIES[key]}
#     return {"companies": DEFAULT_COMPANIES}