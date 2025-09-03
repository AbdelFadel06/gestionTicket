from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError

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
    title = models.CharField(max_length=100, verbose_name="titre")
    description = models.TextField()
    priority =  models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='basse', verbose_name="priorité")
    status =  models.CharField(max_length=20, choices=STATUS_CHOICES, default='new', verbose_name="statut")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        related_name='tickets_author'
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

    class Meta:
        ordering = ['-created_at']
        # constraints = [
        #     models.UniqueConstraint(fields=['fields_list'], name="unique_fields_list"),
        #     models.CheckConstraint(check=models.Q(price__gt=0), name='prix_doit_etre_positif')
        # ]
        # constraints = [
        #     # Cette contrainte garantit que le prix est toujours positif
        #     models.CheckConstraint(
        #         check=Q(prix__gt=0),
        #         name='prix_positif'
        #     )
        # ]
        # # Cette meta constraint garantit que la combinaison utilisateur/service est unique
        # unique_together = ('utilisateur', 'service')
        # constraints = [
        #     models.UniqueConstraint(
        #         fields=['utilisateur', 'service'], name="unique_person_group"
        #     ),
        #     models.UniqueConstraint(
        #         fields=['utilisateur', 'service'], name="unique_person_group"
        #     )
        # ]

