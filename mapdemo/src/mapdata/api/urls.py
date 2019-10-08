from django.conf.urls import url
from . import views

urlpatterns = [
    url('^map-data/$', views.map_data),
]
