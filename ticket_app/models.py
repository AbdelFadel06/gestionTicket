from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


class Role(models.Model):
    title = models.CharField(max_length=20)

    def __str__(self):
        return self.title



class Utilisateur(AbstractUser):
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True)
    fullname = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    profil_picture = models.ImageField(null=True, blank=True, upload_to='images/profils/')


    def __str__(self):
        return self.fullname


class Ticket(models.Model):
    PRIORITY_CHOICES = [
        ('basse', 'basse'),
        ('moyenne',  'moyenne'),
        ('haute', 'haute'),
        ('critique', 'critique')
    ]
    STATUS_CHOICES = [
        ('new', 'Nouveau'),
        ('in_progress', 'En cours'),
        ('resolved', 'Résolu'),
        ('closed', 'Fermé'),
    ]
    title = models.CharField(max_length=100)
    description = models.TextField()
    priority =  models.CharField(max_length=20,  choices=PRIORITY_CHOICES, default='basse')
    status =  models.CharField(max_length=20 , choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='tickets_client'
    )
    developer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tickets_dev'
    )


    def __str__(self):
        return self.title



class Commentaire(models.Model):
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE)
    utilisateur =  models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL, null=True)

    

class Piece_jointe(models.Model):
    title = models.CharField(max_length=100)
    image_url = models.ImageField(null=True, blank=True)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE)



