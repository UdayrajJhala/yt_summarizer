from django.db import models

class YoutubeSummary(models.Model):
    youtube_url = models.URLField()
    summary = models.TextField(blank=True)
    target_language = models.CharField(max_length=5, default='en')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.youtube_url
