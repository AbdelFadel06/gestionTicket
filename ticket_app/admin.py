from django.contrib import admin
from .models import Ticket, Comment, Attachment
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm, SetUnusablePasswordMixin, AdminUserCreationForm
from django.contrib.auth import get_user_model

User = get_user_model()

# admin.site.register(User)

# Formulaire de création d'utilisateur
class CustomUserCreationForm(UserCreationForm):
    usable_password = SetUnusablePasswordMixin.create_usable_password_field()
    class Meta:
        model = User
        fields = ('email', 'username', 'is_developer', 'last_name', 'first_name', 'is_staff', 'usable_password') # Ajoutez ici les champs requis pour la création

# Formulaire de modification d'utilisateur
class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 'is_active', 'is_staff', 'is_superuser') # Ajoutez ici tous les champs que vous voulez modifier
        
# Classe Admin personnalisée pour votre modèle CustomUser

# Créez une classe Admin personnalisée pour votre modèle CustomUser
class CustomUserAdmin(UserAdmin):
    # Utiliser les formulaires personnalisés
    # form = CustomUserChangeForm
    add_form = CustomUserCreationForm

    # Définition des groupes de champs pour le formulaire de création
    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "",
            {
                "classes": ("m-0",),
                "fields": ("is_staff","is_active", "is_developer"),
            },
        ),
        (
            'Informations personnelles',
            {
                "classes": ("wide",),
                "fields": ('first_name', 'last_name', 'profile_picture'),
            },
        ),
        ('Adresse Email', {'fields': ('email',)}),
    )
    
    # La liste des champs à afficher sur l'écran de liste
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff','is_developer')
    
    # # La liste des champs par lesquels on peut filtrer les utilisateurs
    # list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    
    # # La liste des champs par lesquels on peut rechercher
    # search_fields = ('username', 'email', 'first_name', 'last_name')
    
    # # Les champs en lecture seule sur le formulaire
    # readonly_fields = ('last_login', 'date_joined')
    
    # Définition des groupes de champs dans le formulaire
    fieldsets = (
        (
            None, {
                'fields': (
                    ('password',), 
                    ('is_superuser',), 
                    ('groups',), 
                    ('user_permissions',), 
                    ('username',), 
                    ('email'),
                )
            }
        ),
        (
            None, {
                'fields': (
                    ('first_name',),
                    ('last_name',),
                )
            }
        ),
        (
            None, {
                'fields': (
                    ('is_staff',),
                    ('is_active',),
                    ('profile_picture',),
                )
            }
        ),
        (
            'Dates importantes', {
                'fields': (
                    ('last_login',),
                    ('date_joined',),
                )
            }
        ),
        # ('Informations personnelles', {'fields': ('first_name', 'last_name', 'email')}),
        # ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        # ('Dates importantes', {'fields': ('last_login', 'date_joined')}),
    )

    # La méthode save_model est appelée lorsque l'objet est sauvegardé via l'interface d'administration
    def save_model(self, request, obj, form, change):
        # Si le mot de passe a été modifié, le hacher
        if 'password' in form.changed_data:
            obj.set_password(obj.password)
        # Sauvegarder l'objet utilisateur
        super().save_model(request, obj, form, change)

# Pour les utilisateurs existants, ré-enregistrer le modèle avec la classe Admin personnalisée
# admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

class CustomTicketAdmin(admin.ModelAdmin):
    list_display = ('title', 'priority', 'status', 'author')

admin.site.register(Ticket, CustomTicketAdmin)
# admin.site.register(Comment)
# admin.site.register(Attachment)
