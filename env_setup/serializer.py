from rest_framework import serializers


class AppAccessSerializer(serializers.Serializer):

    username = serializers.CharField()
    app = serializers.ChoiceField(['fa-sizer', 'fb-sizer', 'fr-sizer'])
