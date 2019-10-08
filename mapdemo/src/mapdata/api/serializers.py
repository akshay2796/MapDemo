from rest_framework import serializers

from mapdata.models import MapInfo


class MapInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MapInfo
        fields = ('from_location','to_location')