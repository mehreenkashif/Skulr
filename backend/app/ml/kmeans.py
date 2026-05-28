# backend/app/ml/kmeans.py
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

FRONTEND = {'react','css','html','javascript','ui','component','tailwind','vue','angular','typescript'}
BACKEND  = {'api','flask','django','node','express','rest','server','endpoint','database','sql','postgresql','mongodb'}
ML_DATA  = {'machine','learning','model','data','sklearn','neural','tensorflow','pandas','numpy','dataset','analysis'}
DEVOPS   = {'docker','cloud','aws','deploy','git','linux','kubernetes','ci','pipeline','container','devops'}


def cluster_learning_logs(entries):
    """
    K-Means: group learning log entries into topic clusters.
    Returns each entry tagged with a cluster label + summary count per cluster.
    """
    if not entries:
        return {'total_entries': 0, 'clusters': [], 'summary': {}}

    texts = [e['entry'] for e in entries]

    # Edge case: only one entry
    if len(texts) == 1:
        return {
            'total_entries': 1,
            'clusters': [{**entries[0], 'cluster_id': 0, 'label': 'General Learning'}],
            'summary': {'General Learning': 1}
        }

    # TF-IDF vectorization
    vectorizer = TfidfVectorizer(
        stop_words='english',
        max_features=300,
        ngram_range=(1, 2)
    )
    try:
        X = vectorizer.fit_transform(texts)
    except Exception:
        return {'total_entries': len(entries), 'clusters': [], 'summary': {}}

    k = min(5, len(texts))
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km.fit_predict(X)

    cluster_names = _label_clusters(vectorizer, km, k)

    result = []
    for i, entry in enumerate(entries):
        cid = int(labels[i])
        result.append({
            'id': entry.get('id'),
            'entry': entry['entry'],
            'date': entry.get('created_at', ''),
            'cluster_id': cid,
            'label': cluster_names.get(cid, 'General Learning')
        })

    summary = {}
    for r in result:
        summary[r['label']] = summary.get(r['label'], 0) + 1

    return {
        'total_entries': len(entries),
        'clusters': result,
        'summary': summary
    }


def _label_clusters(vectorizer, km, k):
    """Assign a human-readable name to each cluster from its top TF-IDF terms."""
    feature_names = vectorizer.get_feature_names_out()
    names = {}
    used = set()

    for i in range(k):
        top_idx = km.cluster_centers_[i].argsort()[-12:][::-1]
        top_terms = set(feature_names[j] for j in top_idx)

        scores = {
            'Frontend Development':    len(top_terms & FRONTEND),
            'Backend & APIs':          len(top_terms & BACKEND),
            'Data & Machine Learning': len(top_terms & ML_DATA),
            'DevOps & Cloud':          len(top_terms & DEVOPS),
        }

        best = max(scores, key=scores.get)

        if scores[best] == 0 or best in used:
            base = 'General Learning'
            best = base if base not in used else f'General Learning {i + 1}'

        used.add(best)
        names[i] = best

    return names