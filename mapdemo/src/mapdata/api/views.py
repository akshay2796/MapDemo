from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core import serializers
from django.http import JsonResponse

from mapdata.models import MapInfo
from .serializers import MapInfoSerializer
@api_view(['GET', 'POST'])
def map_data(request):
    """
    Input should be in the format:
    {"from_location": "location","to_location": "location"}
    """
    if request.method == 'POST':
        from_location = request.data['from_location']
        to_location = request.data['to_location']

        item = MapInfo(from_location=from_location, to_location=to_location)
        item.save()
        return Response({"message": "Map data added."})
    queryset = list(MapInfo.objects.values())
    return JsonResponse(queryset, json_dumps_params={'indent': 2}, safe=False)