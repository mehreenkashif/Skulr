import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler


def extract_features(user_skills: list, job_skills: list) -> np.ndarray:
    """
    Build 5 numerical features from skill comparison.
    These are the inputs to Logistic Regression.
    """
    if not job_skills:
        return np.zeros(5)

    user_set = set(s.lower() for s in user_skills)
    job_set = set(s.lower() for s in job_skills)

    matched = user_set & job_set
    missing = job_set - user_set

    skill_match_ratio = len(matched) / len(job_set)        
    coverage_score = min(len(user_set) / max(len(job_set), 1), 1.0)  
    gap_penalty = len(missing) / max(len(job_set), 1)    
    matched_count = min(len(matched) / 20.0, 1.0)         
    depth_score = min(len(user_set) / 30.0, 1.0)          
    return np.array([skill_match_ratio, coverage_score, gap_penalty, matched_count, depth_score])


def generate_lr_training_data(n_samples: int = 500):
    """
    Generate synthetic training data for Logistic Regression.
    Features: [match_ratio, coverage, gap_penalty, matched_count, depth]
    Label: 1 = job-ready, 0 = not ready
    """
    np.random.seed(99)
    X = []
    y = []

    for _ in range(n_samples):
        match_ratio = np.random.beta(2, 3)
        coverage = np.random.beta(2, 2)
        gap_penalty = 1 - match_ratio + np.random.normal(0, 0.05)
        gap_penalty = np.clip(gap_penalty, 0, 1)
        matched_count = match_ratio * np.random.uniform(0.8, 1.2)
        matched_count = np.clip(matched_count, 0, 1)
        depth = np.random.beta(2, 2)

        features = [match_ratio, coverage, gap_penalty, matched_count, depth]

        # Label based on realistic threshold
        score = (match_ratio * 0.5) + (coverage * 0.2) - (gap_penalty * 0.2) + (depth * 0.1)
        label = 1 if score > 0.40 else 0

        X.append(features)
        y.append(label)

    return np.array(X), np.array(y)


def calculate_readiness_score(user_skills: list, job_skills: list) -> dict:
    """
    Calculate Job Readiness Score using Logistic Regression.
    Returns score 0–100 and feature breakdown.
    """
    features = extract_features(user_skills, job_skills)
    features_2d = features.reshape(1, -1)

    # Train model
    X_train, y_train = generate_lr_training_data()
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_train)
    features_scaled = scaler.transform(features_2d)

    lr = LogisticRegression(max_iter=1000, random_state=42)
    lr.fit(X_scaled, y_train)

    # Get probability of being "job-ready"
    probability = lr.predict_proba(features_scaled)[0][1]

    # Scale to 0-100 with a minimum floor of 5 (never show 0)
    score = round(max(probability * 100, 5), 1)

    return {
        "readiness_score": score,
        "skill_match_ratio": round(features[0] * 100, 1),
        "coverage_score": round(features[1] * 100, 1),
        "gap_penalty": round(features[2] * 100, 1),
        "model": "logistic_regression",
        "interpretation": interpret_score(score)
    }


def interpret_score(score: float) -> str:
    if score >= 80:
        return "Strong match — you're ready to apply"
    elif score >= 60:
        return "Good foundation — a few key gaps to close"
    elif score >= 40:
        return "Developing — focus on the top missing skills"
    else:
        return "Early stage — build core skills first"