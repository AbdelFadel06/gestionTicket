# API de Gestion de Tickets

API développée avec **Django REST Framework (DRF)** pour gérer les tickets, les commentaires et les fichiers joints.
Elle inclut l’authentification par token et une documentation Swagger/OpenAPI.

---

# Fonctionnalités

    - Authentification via Token
    - Gestion des tickets (création, consultation, modification, suppression)
    - Gestion des commentaires associés aux tickets
    - Gestion des fichiers joints (attachments)
    - Documentation interactive avec **Swagger** et **Redoc**
    - Pagination et filtrage des tickets

---

# Technologies

    - **Python 3.x**
    - **Django 5.x**
    - **Django REST Framework**
    - **drf-spectacular** (Swagger / OpenAPI 3)
    - **django-filter** pour le filtrage
    - **SQLite** (base de données par défaut, peut être remplacée par PostgreSQL)
    - **django-extensions** (optionnel pour les commandes supplémentaires)

---

# Installation

    # 1. Cloner le dépôt :

            Cloner le projet

            git clone https://github.com/AbdelFadel06/gestionTicket.git

            cd ticket_project

    #2. Créer un environnement virtuel :

            python -m venv venv
            source venv/bin/activate  # Linux/Mac
            venv\Scripts\activate     # Windows

    #3. Installer les dépendances :

            pip install -r requirements.txt


    #4. Appliquer les migrations :

            python manage.py migrate


    #5. Créer un super utilisateur (admin) :

            python manage.py createsuperuser

    #6. Lancer le serveur :

            python manage.py runserver

---

# Endpoints principaux

Tickets

    GET /tickets/ → Liste des tickets

    POST /tickets/ → Créer un ticket

    GET /tickets/<id>/ → Détails d’un ticket

    PUT /tickets/<id>/ → Modifier un ticket

    DELETE /tickets/<id>/ → Supprimer un ticket

Commentaires

    GET /tickets/<ticket_id>/comments/ → Liste des commentaires

    POST /tickets/<ticket_id>/comments/ → Ajouter un commentaire

    Attachments

    GET /tickets/<ticket_id>/attachments/ → Liste des fichiers joints

    POST /tickets/<ticket_id>/attachments/ → Ajouter un fichier joint



# Documentation API

    Swagger UI : http://127.0.0.1:8000/swagger/
    Redoc : http://127.0.0.1:8000/redoc/
    Schéma OpenAPI JSON : http://127.0.0.1:8000/schema/
