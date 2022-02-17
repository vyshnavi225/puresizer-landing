from rest_framework import serializers
from sizer import settings


class AppAccessSerializer(serializers.Serializer):

    username = serializers.CharField()
    app = serializers.ChoiceField(settings.APP_LIST)
    app_role = serializers.ChoiceField(settings.ACCESS_LIST)


class AppListSerializer(serializers.Serializer):
    app_name = serializers.ChoiceField(settings.ACCESS_LIST)
    app_access = serializers.BooleanField()
    admin_access = serializers.BooleanField()


class AppAccessPOSTSerializer(serializers.Serializer):
    username = serializers.CharField()
    app_list = serializers.ListField(child=AppListSerializer(many=True))
