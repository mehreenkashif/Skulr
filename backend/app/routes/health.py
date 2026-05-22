from flask import Blueprint, jsonify
from datetime import datetime, timezone

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'app': 'Skulr Backend',
        'time': datetime.now(timezone.utc).isoformat()
    }), 200

@health_bp.route('/health/db', methods=['GET'])
def health_db():
    from app import db
    from sqlalchemy import text
    try:
        db.session.execute(text('SELECT 1'))
        return jsonify({
            'status': 'ok',
            'database': 'connected'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'database': 'unreachable',
            'detail': str(e)
        }), 500