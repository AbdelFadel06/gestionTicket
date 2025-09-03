from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_developer = models.BooleanField(verbose_name="Développeur", help_text="Précise si l'utilisateur doit être considéré comme un développeur.", default=False)
    profile_picture = models.ImageField(verbose_name="Photo de profil", null=True, blank=True, upload_to='storage/profils/')

    # # Remplacer le nom d'utilisateur par l'email
    # USERNAME_FIELD = 'email'
    # REQUIRED_FIELDS = []

    def __str__(self):
        return "%(fullname)s (%(profile)s)" % {'fullname':self.get_full_name(), 'profile': self.get_profile()}

    def get_profile(self):
        if self.is_superuser:
            return 'Admin'
        elif self.is_developer:
            return 'Developer'
        else:
            return 'User'