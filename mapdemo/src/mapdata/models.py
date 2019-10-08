from django.db import models

# Create your models here.

class MapInfo(models.Model):
    from_location = models.CharField(max_length=120)
    to_location = models.CharField(max_length=120)