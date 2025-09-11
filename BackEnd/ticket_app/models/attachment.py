from django.db import models
from .comment import Comment
from .ticket import Ticket
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class Attachment(models.Model):
    title = models.CharField(max_length=100)
    file = models.FileField(null=True,max_length=255,  blank=True, upload_to="storage/attachment/")
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, null=True, blank=True, related_name="attachments")
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True, blank=True, related_name="attachments")

    def clean(self):
        if not (self.ticket or self.comment):
            raise ValidationError(_("Veuillez joindre la pièce à un Ticket ou à un commentaire."))
        if self.ticket and self.comment:
            raise ValidationError(_("L'attachment ne peut être lié qu'à un seul objet (Ticket OU Commentaire)."))
