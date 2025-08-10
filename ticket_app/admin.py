from django.contrib import admin
from .models import Role, User, Ticket,  Comment, Attachment


admin.site.register(Role)
admin.site.register(User)
admin.site.register(Ticket)
admin.site.register(Comment)
admin.site.register(Attachment)
