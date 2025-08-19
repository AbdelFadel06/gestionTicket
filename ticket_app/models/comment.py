from django.db import models
from .ticket import Ticket
from django.conf import settings

class Comment(models.Model):
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE)
    author =  models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE, related_name="comments")

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Commentaire par {self.author} sur {self.ticket}"
