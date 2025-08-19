from django.db import models
from django.contrib.auth.models import AbstractUser
from .role import Role

class User(AbstractUser):
    role = models.ForeignKey(Role, on_delete=models.PROTECT, null=True)
    fullname = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    profile_picture = models.ImageField(null=True, blank=True, upload_to='storage/profils/')


    def __str__(self):
        return f"{self.fullname} ({self.role})"
