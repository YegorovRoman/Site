from django.core.serializers import serialize
from django.shortcuts import render
from .serializers import (LoginSerializer, RegisterSerializer, PostSerializer, RecommendationSerializer,
                          ReviewSerializer, ProfileSerializer, RegistrationRequestSerializer)
from .models import User, Review, Post, Recommendation, RegistrationRequest
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_403_FORBIDDEN, HTTP_404_NOT_FOUND, HTTP_400_BAD_REQUEST, HTTP_201_CREATED, HTTP_422_UNPROCESSABLE_ENTITY
from django.shortcuts import get_object_or_404, get_list_or_404
from rest_framework.parsers import MultiPartParser, FormParser
import cloudinary.uploader

# <----------------- Work with the model User ------------------->

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def register(request):
    data = request.data.dict()
    if 'face_photo' in request.FILES:
        result = cloudinary.uploader.upload(request.FILES['face_photo'])
        data['face_photo'] = result['secure_url']
    serializer = RegistrationRequestSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response({'data': 'success'}, status=HTTP_201_CREATED)
    return Response({'detail': 'register failed', 'error': serializer.errors}, status=HTTP_422_UNPROCESSABLE_ENTITY)

@api_view(['POST'])
def approve_registration(request, id):
    if not request.user.is_staff:
        return Response({'detail': 'permission denied'},status=HTTP_403_FORBIDDEN)
    registration = get_object_or_404(RegistrationRequest, id=id)
    if registration.is_approved:
        return Response({'detail': 'already approved'}, status=HTTP_400_BAD_REQUEST)
    user = User.objects.create(
        email=registration.email,
        username=registration.email,
        password=registration.password,
        first_name=registration.first_name,
        last_name=registration.last_name)
    registration.is_approved = True
    registration.save()
    return Response({'data': 'user approved'}, status=HTTP_201_CREATED)

@api_view(['GET'])
def registration_requests(request):
    if not request.user.is_authenticated:
        return Response({'detail': 'not authenticated'},status=HTTP_403_FORBIDDEN)
    if not request.user.is_staff:
        return Response({'detail': 'permission denied'},status=HTTP_403_FORBIDDEN)
    requests = RegistrationRequest.objects.filter(is_approved=False, is_rejected=False).order_by('-created_at')
    serializer = RegistrationRequestSerializer(requests,many=True)
    return Response({'data': serializer.data},status=HTTP_200_OK)

@api_view(['POST'])
def reject_registration(request, id):
    if not request.user.is_staff:
        return Response({'detail': 'permission denied'}, status=HTTP_403_FORBIDDEN)
    registration = get_object_or_404(RegistrationRequest, id=id)
    registration.is_rejected = True
    registration.save()
    return Response({'data': 'rejected'}, status=HTTP_200_OK)

@api_view(['POST'])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']  # ← добавь ['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'data': {'token': token.key, 'is_staff': user.is_staff}}, status=HTTP_200_OK)
    return Response({'detail': 'register failed', 'error': serializer.errors}, status=HTTP_422_UNPROCESSABLE_ENTITY)


@api_view(['POST'])
def logout(request):
    if not request.user.is_authenticated:
        return Response({'detail': 'not authenticated'}, status=HTTP_403_FORBIDDEN)
    request.user.auth_token.delete()
    return Response({'data': 'success'}, status=HTTP_200_OK)


@api_view(['GET', 'PATCH'])
@parser_classes([MultiPartParser, FormParser])
def profile(request):
    if not request.user.is_authenticated:
        return Response({'detail': 'not authenticated'}, status=HTTP_403_FORBIDDEN)
    user = User.objects.get(id=request.user.id)
    if request.method == 'GET':
        serializer = ProfileSerializer(user)
        return Response({'data': serializer.data}, status=HTTP_200_OK)
    elif request.method == 'PATCH':
        if 'avatar' in request.FILES:
            file = request.FILES['avatar']
            result = cloudinary.uploader.upload(file)
            user.avatar = result['secure_url']
            user.save()
            serializer = ProfileSerializer(user)
            return Response({'data': serializer.data}, status=HTTP_200_OK)
        serializer = ProfileSerializer(instance=user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'data': serializer.data}, status=HTTP_200_OK)
        return Response({'detail': 'update failed', 'error': serializer.errors}, status=HTTP_422_UNPROCESSABLE_ENTITY)
        

# <----------------- Work with the model Post ----------------------->

@api_view(['POST', 'GET'])
@parser_classes([MultiPartParser, FormParser])
def post_list_create(request):
    if not request.user.is_authenticated:
        return Response({'detail': 'not authenticated'}, status=HTTP_403_FORBIDDEN)
    
    if request.method == 'POST':
        data = request.data.dict()
        print(f"FILES: {request.FILES}")
        print(f"DATA: {request.data}")
        if 'img' in request.FILES:
            print("IMG FOUND!")
            result = cloudinary.uploader.upload(request.FILES['img'])
            print(f"CLOUDINARY RESULT: {result}")
            data['img_url'] = result['secure_url']
        serializer = PostSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({'data': serializer.data}, status=HTTP_201_CREATED)
        return Response({'detail': 'register failed', 'error': serializer.errors}, status=HTTP_422_UNPROCESSABLE_ENTITY)
        
    elif request.method == 'GET':
        posts = Post.objects.all()
        serializer = PostSerializer(posts, many=True)
        return Response({'data': serializer.data}, status=HTTP_200_OK)

@api_view(['GET', 'DELETE', 'PATCH'])
def post_get_delete_update(request, id_post):
    if not request.user.is_authenticated:
        return Response({'detail': 'not authenticated'}, status=HTTP_403_FORBIDDEN)
    post = get_object_or_404(Post, id=id_post)
    if request.method == 'GET':
        reviews = Review.objects.filter(post=post)  # Лучше передавать объект, а не id
        summ_reviews = reviews.count()  # Используйте count() вместо len()
        if summ_reviews > 0:
            summ_rating = sum(review.rating for review in reviews)
            rating = summ_rating / summ_reviews
        else:
            rating = 0  # Если нет отзывов, рейтинг 0
        serializer = PostSerializer(post)
        return Response({
            'data': serializer.data,
            'reviews_count': summ_reviews,  # Изменено имя для ясности
            'rating': round(rating, 1)  # Округляем рейтинг
        }, status=HTTP_200_OK)
    elif request.method == 'DELETE':
        if post.user != request.user:
            if not request.user.is_staff:
                return Response({'detail': 'not authenticated'}, status=HTTP_403_FORBIDDEN)
        post.delete()
        return Response({'data': 'success'}, status=HTTP_200_OK)
    elif request.method == 'PATCH':
        if post.user != request.user:
            if not request.user.is_staff:
                return Response({'detail': 'not authenticated'}, status=HTTP_403_FORBIDDEN)
        if 'img' in request.FILES:
            result = cloudinary.uploader.upload(request.FILES['img'])
            post.img = result['secure_url']
            post.save()
        serializer = PostSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'data': serializer.data}, status=HTTP_200_OK)
        return Response({'detail': 'register failed', 'error': serializer.errors}, status=HTTP_422_UNPROCESSABLE_ENTITY)



# <------------------------- Work with the model Review ------------------->

@api_view(['GET', 'POST'])
def reviews_list_create(request, id_post):
    if not request.user.is_authenticated:
        return Response({'detail': 'not authenticated'}, status=HTTP_403_FORBIDDEN)
    if request.method == 'GET':
        reviews = get_list_or_404(Review, post=id_post)
        serializer = ReviewSerializer(reviews, many=True)
        return Response({'data': serializer.data}, status=HTTP_200_OK)
    elif request.method == 'POST':
        post = get_object_or_404(Post, id=id_post)
        serializer = ReviewSerializer(data=request.data, context={'post': post, 'user': request.user})
        if serializer.is_valid():
            serializer.save()
            return Response({'data': serializer.data}, status=HTTP_201_CREATED)
        return Response({'detail': 'register failed', 'error': serializer.errors}, status=HTTP_422_UNPROCESSABLE_ENTITY)

@api_view(['DELETE', 'PATCH'])
def review_delete_update(request, id_review):
    if not request.user.is_authenticated:
        return Response({'detail': 'not authenticated'}, status=HTTP_403_FORBIDDEN)
    review = get_object_or_404(Review, id=id_review)
    if review.user != request.user:
        if not request.user.is_staff:
            return Response({'detail': 'not authenticated'}, status=HTTP_403_FORBIDDEN)
    if request.method == 'DELETE':
        review.delete()
        return Response({'data': 'success'}, status=HTTP_200_OK)
    elif request.method == 'PATCH':
        serializer = ReviewSerializer(review, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'data': serializer.data}, status=HTTP_200_OK)
        return Response({'detail': 'register failed', 'error': serializer.errors}, status=HTTP_422_UNPROCESSABLE_ENTITY)


# <-------------------------------Work with the Recommendation---------------------->

@api_view(['GET', 'POST'])
def recommendation_list_create(request):
    if not request.user.is_authenticated:
        return Response({'detail': 'not authenticated'}, status=HTTP_403_FORBIDDEN)
    if request.method == 'GET':
        recommendations = Recommendation.objects.all()
        serializer = RecommendationSerializer(recommendations, many=True)
        return Response({'data': serializer.data}, status=HTTP_200_OK)
    elif request.method == 'POST':
        serializer = RecommendationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({'data': serializer.data}, status=HTTP_200_OK)
        return Response({'detail': 'register failed', 'error': serializer.errors}, status=HTTP_422_UNPROCESSABLE_ENTITY)


@api_view(['DELETE', 'PATCH'])
def recommendation_delete_update(request, id_recommendation):
    if not request.user.is_authenticated:
        return Response({'detail': 'not authenticated'}, status=HTTP_403_FORBIDDEN)
    recommendation = get_object_or_404(Recommendation, id=id_recommendation)
    if recommendation.user != request.user:
        if not request.user.is_staff:
            return Response({'detail': 'not authenticated'}, status=HTTP_403_FORBIDDEN)
    if request.method == 'DELETE':
        recommendation.delete()
        return Response({'data': 'success'}, status=HTTP_200_OK)
    elif request.method == 'PATCH':
        serializer = RecommendationSerializer(recommendation, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'data': serializer.data}, status=HTTP_200_OK)
        return Response({'detail': 'register failed', 'error': serializer.errors}, status=HTTP_422_UNPROCESSABLE_ENTITY)