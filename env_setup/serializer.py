from rest_framework import serializers
from sizer import settings


class AppAccessSerializer(serializers.Serializer):

    username = serializers.CharField()
    app = serializers.ChoiceField(settings.APP_LIST)
    app_role = serializers.CharField()
