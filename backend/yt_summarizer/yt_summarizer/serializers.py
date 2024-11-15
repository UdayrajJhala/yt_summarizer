from rest_framework import serializers
from .models import YoutubeSummary

class YoutubeSummarizerSerializer(serializers.ModelSerializer):
    target_language = serializers.CharField(required=False, default='en')
    
    class Meta:
        model = YoutubeSummary
        fields = ['youtube_url', 'summary', 'target_language']
