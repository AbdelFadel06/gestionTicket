import jwt
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import JsonResponse

User = get_user_model()
SECRET_KEY = getattr(settings, 'SECRET_KEY', 'fallback-secret-key')

def generate_tokens(user):
    """Génère access et refresh tokens"""
    # Access token (1 heure)
    access_payload = {
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(hours=1),
        'type': 'access'
    }
    access_token = jwt.encode(access_payload, SECRET_KEY, algorithm='HS256')

    # Refresh token (7 jours)
    refresh_payload = {
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(days=7),
        'type': 'refresh'
    }
    refresh_token = jwt.encode(refresh_payload, SECRET_KEY, algorithm='HS256')

    return {
        'access': access_token,
        'refresh': refresh_token
    }

def verify_token(token):
    """Vérifie et décode un token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return {'error': 'Token expiré'}
    except jwt.InvalidTokenError:
        return {'error': 'Token invalide'}

def get_user_from_token(token):
    """Récupère l'utilisateur depuis le token"""
    payload = verify_token(token)
    if 'error' in payload:
        return None

    try:
        return User.objects.get(id=payload['user_id'])
    except User.DoesNotExist:
        return None

def jwt_login_required(view_func):
    """Décorateur pour protéger les vues"""
    def wrapper(request, *args, **kwargs):
        auth_header = request.headers.get('Authorization', '')

        if not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token manquant'}, status=401)

        token = auth_header.split(' ')[1]
        user = get_user_from_token(token)

        if not user:
            return JsonResponse({'error': 'Utilisateur non authentifié'}, status=401)

        request.user = user
        return view_func(request, *args, **kwargs)

    return wrapper
