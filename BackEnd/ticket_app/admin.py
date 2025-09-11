from django.contrib import admin
from .models import User, Ticket,  Comment, Attachment


admin.site.register(User)
admin.site.register(Ticket)
admin.site.register(Comment)
admin.site.register(Attachment)
