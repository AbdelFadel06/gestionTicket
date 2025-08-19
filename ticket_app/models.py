from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError


class Role(models.Model):
    title = models.CharField(max_length=20)

    def __str__(self):
        return self.title



class User(AbstractUser):
    role = models.ForeignKey(Role, on_delete=models.PROTECT, null=True)
    fullname = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    profile_picture = models.ImageField(null=True, blank=True, upload_to='images/profils/')
    

    def __str__(self):
        return f"{self.fullname} ({self.role})"


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
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
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
        return f"{self.title} ({self.get_status_display()})"
    
    def save(self, *args, **kwargs):
        if self.status == 'closed' and not self.closed_at:
            self.closed_at = timezone.now()
        elif self.status != 'closed' and self.closed_at:
            self.closed_at = None
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']



class Comment(models.Model):
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE)
    author =  models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE, related_name="comments")

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Commentaire par {self.author} sur {self.ticket}"

    

class Attachment(models.Model):
    title = models.CharField(max_length=100)
    file = models.FileField(null=True,max_length=255,  blank=True, upload_to="attachment/")
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, null=True, blank=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True, blank=True)


    def clean(self):
        if not (self.ticket or self.comment):
            raise ValidationError("L'attachment doit être lié à un Ticket ou un Commentaire.")
        if self.ticket and self.comment:
            raise ValidationError("L'attachment ne peut être lié qu'à un seul objet (Ticket OU Commentaire).")
