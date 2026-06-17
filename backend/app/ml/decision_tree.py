# backend/app/ml/decision_tree.py
from sklearn.tree import DecisionTreeClassifier
import numpy as np

CORE_SKILLS = {
    'python', 'javascript', 'java', 'sql', 'react', 'node.js',
    'machine learning', 'deep learning', 'docker', 'aws', 'git',
    'typescript', 'postgresql', 'mongodb', 'rest api', 'flask', 'django'
}
          
def rank_skill_gaps(user_skills, job_skills):
    """
    Decision Tree: rank missing skills by learning priority.
    Features: position in job list, is it a core skill, frequency tier.
    Returns sorted list with priority label High/Medium/Low + reason.
    """
    user_set = set(s.lower() for s in user_skills)
    missing = [s for s in job_skills if s.lower() not in user_set]

    if not missing:
        return []

    n = len(job_skills)

    # Build synthetic training data
    X, y = [], []
    for i, skill in enumerate(job_skills):
        position_score = round(1 - (i / n), 3)
        is_core = 1 if skill.lower() in CORE_SKILLS else 0
        freq_tier = 1.0 if i < n * 0.33 else (0.6 if i < n * 0.66 else 0.3)

        X.append([position_score, is_core, freq_tier])

        if i < n * 0.33:
            y.append(2)   # High
        elif i < n * 0.66:
            y.append(1)   # Medium
        else:
            y.append(0)   # Low

    X = np.array(X)
    y = np.array(y)

    dt = DecisionTreeClassifier(max_depth=3, random_state=42)
    dt.fit(X, y)

    priority_map = {2: 'High', 1: 'Medium', 0: 'Low'}
    result = []

    for skill in missing:
        i = job_skills.index(skill) if skill in job_skills else n - 1
        position_score = round(1 - (i / n), 3)
        is_core = 1 if skill.lower() in CORE_SKILLS else 0
        freq_tier = 1.0 if i < n * 0.33 else (0.6 if i < n * 0.66 else 0.3)

        features = np.array([[position_score, is_core, freq_tier]])
        label = int(dt.predict(features)[0])
        proba = float(max(dt.predict_proba(features)[0]))

        result.append({
            'skill': skill,
            'priority': priority_map[label],
            'priority_score': round(proba * 100, 1),
            'reason': _reason(label, is_core, position_score)
        })

    order = {'High': 0, 'Medium': 1, 'Low': 2}
    result.sort(key=lambda x: order[x['priority']])
    return result


def _reason(label, is_core, position):
    if label == 2:
        if is_core:
            return "Core industry skill — demanded across nearly all job postings"
        return "Listed early in requirements — employers expect this before interviews"
    elif label == 1:
        return "Mid-tier skill — commonly paired with your existing skills"
    else:
        return "Specialized skill — learn this after covering high-priority gaps"