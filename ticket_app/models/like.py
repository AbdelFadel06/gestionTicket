from django.db import models
from .user import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from .timestamps import Timestamps

# Un Like pour Ticket et Commentaire
class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveBigIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    def __str__(self):
        return "%(author)s a aimé (%(object)s)" % {'author':self.user, 'object': self.content_object}

    class Meta:
        # indexes = [
        #     models.Index(fields=["content_type", "object_id"]), 
        # ]
        constraints = [
            models.UniqueConstraint(fields=['user', 'content_type', 'object_id'], name="unique_fields_list"),
        ]