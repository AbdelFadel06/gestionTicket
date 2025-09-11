from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_developer = models.BooleanField(default=False)
    profile_picture = models.ImageField(null=True, blank=True, upload_to='storage/profils/')

    def __str__(self):
        return "%(fullname)s (%(profile)s)" % {'fullname':self.get_full_name(), 'profile': self.get_profile()}

    def get_profile(self):
        if self.is_superuser:
            return 'Admin'
        elif self.is_developer:
            return 'Developer'
        else:
            return 'User'