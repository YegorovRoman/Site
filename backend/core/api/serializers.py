from rest_framework import serializers
from .models import User, Review, Recommendation, Post, RegistrationRequest
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password


# <-----------------------------User--------------------------->


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        validated_data['username'] = validated_data['email']
        user = User.objects.create_user(**validated_data)
        return user


class RegistrationRequestSerializer(serializers.ModelSerializer):
    # Принудительно форматируем ссылку на фото заявки
    face_photo = serializers.SerializerMethodField()

    class Meta:
        model = RegistrationRequest
        fields = ['id', 'email', 'password', 'first_name', 'last_name', 'face_photo']

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return RegistrationRequest.objects.create(**validated_data)

    def get_face_photo(self, obj):
        if obj.face_photo:
            url = str(obj.face_photo)
            if url.startswith('http'):
                return url
            return obj.face_photo.url
        return None


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        # DRF аутентифицирует по username, поэтому подменяем email на username для authenticate
        username = attrs.get('email')
        password = attrs.get('password')
        
        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("Неверный email или пароль.")
            
        # Сериализатор ожидает, что метод validate вернет валидированные данные (словарь attrs)
        attrs['user'] = user
        return attrs


class ProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'avatar', 'first_name', 'last_name')

    def get_avatar(self, obj):
        if obj.avatar:
            url = str(obj.avatar)
            if url.startswith('http'):
                return url
            return obj.avatar.url
        return None

# <-----------------------------------Review--------------------------------->

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'text', 'rating', 'user', 'user_name', 'user_avatar']
        read_only_fields = ['user']

    def get_user_name(self, obj):
        return f'{obj.user.first_name} {obj.user.last_name}'

    def get_user_avatar(self, obj):
        if obj.user.avatar:
            url = str(obj.user.avatar)
            if url.startswith('http'):
                return url
            return obj.user.avatar.url
        return None


# <---------------------------------------Post---------------------------------->

class PostSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_avatar = serializers.SerializerMethodField()
    img = serializers.SerializerMethodField()
    img_url = serializers.CharField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Post
        fields = ['id', 'text', 'user', 'img', 'img_url', 'video', 'created_at', 'name', 'user_name', 'user_avatar']
        read_only_fields = ['user', 'created_at']

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    def get_user_avatar(self, obj):
        if obj.user.avatar:
            url = str(obj.user.avatar)
            if url.startswith('http'):
                return url
            return obj.user.avatar.url
        return None

    def get_img(self, obj):
        if obj.img:
            url = str(obj.img)
            if url.startswith('http'):
                return url
        return None

    def create(self, validated_data):
        img_url = validated_data.pop('img_url', None)
        post = super().create(validated_data)
        if img_url:
            post.img = img_url
            post.save()
        return post

    def update(self, instance, validated_data):
        img_url = validated_data.pop('img_url', None)
        instance = super().update(instance, validated_data)
        if img_url:
            instance.img = img_url
            instance.save()
        return instance

    


# <-----------------------------------------Recommendation-------------------->

class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        fields = ['id', 'text', 'user', 'rating']
        read_only_fields = ['user']