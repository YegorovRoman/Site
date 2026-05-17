from django.contrib import admin
from .models import User, Review, Post, Recommendation, RegistrationRequest

admin.site.register(User)
admin.site.register(Review)
admin.site.register(Post)
admin.site.register(Recommendation)
admin.site.register(RegistrationRequest)
