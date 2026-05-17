from django.urls import path
from .views import (register, login, reviews_list_create, profile, logout, review_delete_update,
                    post_list_create, post_get_delete_update, recommendation_list_create, recommendation_delete_update,
                    reject_registration, registration_requests, approve_registration)

urlpatterns = [
    path('register', register),
    path('login', login),
    path('logout', logout),
    path('profile', profile),
    path('reviews/<int:id_post>', reviews_list_create),
    path('reviews/<int:id_review>/delete', review_delete_update),
    path('posts', post_list_create),
    path('posts/<int:id_post>', post_get_delete_update),
    path('recommendations', recommendation_list_create),
    path('recommendations/<int:id_recommendation>', recommendation_delete_update),
    path('registration-request', registration_requests),
    path('approve-registration/<int:id>', approve_registration),
    path('reject-registration/<int:id>', reject_registration),
]