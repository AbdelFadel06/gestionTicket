from rest_framework import serializers
from django.utils.translation import gettext as _

def validate_file_size(file):
    # 5 MB = 5 * 1024 * 1024 bytes
    max_size = 5 * 1024 * 1024
    if file.size > max_size:
        raise serializers.ValidationError(_('La taille du fichier ne doit pas dépasser 5 Mo.'))