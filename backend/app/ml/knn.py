import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from app.nlp.skills_list import SKILLS as SKILLS_LIST


def build_skill_vector(skills: list) -> np.ndarray:
    skills_lower = [s.lower() for s in skills]
    return np.array([1 if skill.lower() in skills_lower else 0 for skill in SKILLS_LIST])


def generate_knn_training_data(n_samples: int = 300):
    np.random.seed(42)
    n_skills = len(SKILLS_LIST)
    X, y = [], []
    for _ in range(n_samples):
        overlap_ratio = np.random.beta(2, 2)
        user_vec = (np.random.rand(n_skills) < overlap_ratio).astype(int)
        if overlap_ratio > 0.55:   label = 1
        elif overlap_ratio < 0.30: label = 0
        else:                      label = np.random.choice([0, 1])
        X.append(user_vec)
        y.append(label)
    return np.array(X), np.array(y)


def run_knn_analysis(user_skills: list, job_skills: list, k: int = 5) -> dict:
    user_vec = build_skill_vector(user_skills)
    job_vec  = build_skill_vector(job_skills)

    X_train, y_train = generate_knn_training_data()
    knn = KNeighborsClassifier(n_neighbors=k, metric='cosine')
    knn.fit(X_train, y_train)

    hire_probability = knn.predict_proba(user_vec.reshape(1, -1))[0][1]

    matched_skills, missing_skills, bonus_skills = [], [], []
    for i, skill in enumerate(SKILLS_LIST):
        user_has = user_vec[i] == 1
        job_needs = job_vec[i] == 1
        if user_has and job_needs:     matched_skills.append(skill)
        elif not user_has and job_needs: missing_skills.append(skill)
        elif user_has and not job_needs: bonus_skills.append(skill)

    dot  = np.dot(user_vec, job_vec)
    norm = np.linalg.norm(user_vec) * np.linalg.norm(job_vec)
    cosine_sim = float(dot / norm) if norm > 0 else 0.0

    # Fix: scale hire probability by actual job match ratio
    # If 0 skills matched → hire prob must be 0
    total_required = len([s for s in job_skills if build_skill_vector([s]).sum() > 0 or True])
    match_ratio = len(matched_skills) / max(len(job_skills), 1)
    adjusted_hire_prob = hire_probability * match_ratio

    return {
        "matched_skills":       matched_skills,
        "missing_skills":       missing_skills,
        "bonus_skills":         bonus_skills,
        "cosine_similarity":    round(cosine_sim * 100, 1),
        "hire_probability_knn": round(adjusted_hire_prob * 100, 1),
        "total_required":       len(job_skills),
        "total_matched":        len(matched_skills),
        "total_missing":        len(missing_skills),
    }