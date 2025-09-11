from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
import json
from .auth import generate_tokens, verify_token, get_user_from_token, jwt_login_required
from django.contrib.auth import get_user_model

@csrf_exempt
def login_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Méthode non autorisée'}, status=405)

    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        # AUTHENTIFICATION MANUELLE
        User = get_user_model()

        try:
            user = User.objects.get(email=email)

            if user.check_password(password) and user.is_active:
                # Génération des tokens
                tokens = generate_tokens(user)

                return JsonResponse({
                    'message': 'Connexion réussie',
                    'tokens': tokens,
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'username': user.username
                    }
                })
            else:
                return JsonResponse({'error': 'Identifiants invalides'}, status=401)

        except User.DoesNotExist:
            return JsonResponse({'error': 'Identifiants invalides'}, status=401)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Données JSON invalides'}, status=400)

@csrf_exempt
def refresh_view(request):
    """Rafraîchir le token"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Méthode non autorisée'}, status=405)

    try:
        data = json.loads(request.body)
        refresh_token = data.get('refresh_token')

        if not refresh_token:
            return JsonResponse({'error': 'Refresh token requis'}, status=400)

        # Vérifier le refresh token
        payload = verify_token(refresh_token)
        if 'error' in payload:
            return JsonResponse({'error': payload['error']}, status=401)

        if payload.get('type') != 'refresh':
            return JsonResponse({'error': 'Mauvais type de token'}, status=401)

        # Régénérer un access token
        from django.contrib.auth import get_user_model
        User = get_user_model()

        user = User.objects.get(id=payload['user_id'])
        tokens = generate_tokens(user)

        return JsonResponse({
            'access': tokens['access']
        })

    except User.DoesNotExist:
        return JsonResponse({'error': 'Utilisateur non trouvé'}, status=404)

@csrf_exempt
@jwt_login_required
def protected_view(request):
    """Exemple de vue protégée"""
    return JsonResponse({
        'message': f'Bonjour {request.user.username}!',
        'user_id': request.user.id,
        'email': request.user.email
    })

@csrf_exempt
def register_view(request):
    """Inscription simplifiée"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Méthode non autorisée'}, status=405)

    try:
        data = json.loads(request.body)
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')

        if not all([email, username, password]):
            return JsonResponse({'error': 'Tous les champs sont requis'}, status=400)

        from django.contrib.auth import get_user_model
        User = get_user_model()

        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email déjà utilisé'}, status=400)

        # Création utilisateur
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        # Génération des tokens
        tokens = generate_tokens(user)

        return JsonResponse({
            'message': 'Compte créé avec succès',
            'tokens': tokens,
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username
            }
        }, status=201)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Données JSON invalides'}, status=400)







User = get_user_model()

@csrf_exempt
def debug_check_user(request, email):
    """Vue de debug pour vérifier l'utilisateur"""
    try:
        user = User.objects.get(email=email)
        return JsonResponse({
            'exists': True,
            'user_id': user.id,
            'email': user.email,
            'username': user.username,
            'is_active': user.is_active
        })
    except User.DoesNotExist:
        return JsonResponse({'exists': False, 'email': email})

@csrf_exempt
def debug_check_password(request):
    """Vue de debug pour vérifier le mot de passe"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')

            user = User.objects.get(email=email)
            password_match = user.check_password(password)

            return JsonResponse({
                'email': email,
                'password_provided': password,
                'password_match': password_match,
                'user_exists': True
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found', 'email': email})
    return JsonResponse({'error': 'POST method required'})
