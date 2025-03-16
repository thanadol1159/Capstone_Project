from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import base64
from django.core.files.base import ContentFile
from .models import (
    Role,
    # Account,
    UserDetail,
    Venue,
    TypeOfVenue,
    VenueRequest,
    Booking,
    # VenueApproval,
    CategoryOfEvent,
    EventOfVenue,
    StatusBooking,
    Review,
    Notifications,
    FavoriteVenue,
    ReviewImage,
    VenueImage,
    VenueFile,
    VenueRequestFile,
    VenueRequestImage,
)

class CustomAccessToken(AccessToken):
    def __init__(self, user, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.payload['role'] = user.userdetail.role.role_name if hasattr(user, 'userdetail') else None

class CustomRefreshToken(RefreshToken):
    def __init__(self, user, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.payload['role'] = user.userdetail.role.role_name if hasattr(user, 'userdetail') else None

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def get_token(cls, user):
        token = super().get_token(user)

        token['user_id'] = user.id

        if hasattr(user, 'userdetail') and user.userdetail.role:
            token['role'] = user.userdetail.role.role_name 
        else:
            token['role'] = "User"  

        return token

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source="userdetail.role.role_name", read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username','password', 'email','role']
        extra_kwargs = {
            'password': {'write_only': True} 
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email'),
        )
        return user

class Base64ImageField(serializers.ImageField):
    def to_internal_value(self, data):
        if isinstance(data, str) and data.startswith("data:image"):
            format, imgstr = data.split(";base64,")  
            ext = format.split("/")[-1]  
            return ContentFile(base64.b64decode(imgstr), name=f"temp.{ext}")  
        return super().to_internal_value(data)
    
class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDetail
        fields = '__all__'

# class VenueImageSerializer(serializers.ModelSerializer):
#     image_url = serializers.SerializerMethodField()

#     class Meta:
#         model = VenueImage
#         fields = ['id', 'image_url']

#     def get_image_url(self, obj):
#         request = self.context.get('request')
#         if obj.image:
#             return request.build_absolute_uri(obj.image.url)
#         return None
class VenueImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VenueImage
        fields = ['id', 'image']

class VenueSerializer(serializers.ModelSerializer):
    venue_images = VenueImageSerializer(many=True, read_only=True)

    # venue_certification_url = serializers.SerializerMethodField()
    # personal_identification_url = serializers.SerializerMethodField()

    def get_venue_certification_url(self, obj):
        request = self.context.get('request')
        if obj.venue_certification:
            return request.build_absolute_uri(obj.venue_certification.url)
        return None

    def get_personal_identification_url(self, obj):
        request = self.context.get('request')
        if obj.personal_identification:
            return request.build_absolute_uri(obj.personal_identification.url)
        return None
    
    class Meta:
        model = Venue
        fields = '__all__'
    #     extra_fields = ['venue_images_read_only']

    # def create(self, validated_data):
    #     images_data = validated_data.pop("venue_images", [])  
    #     venue = Venue.objects.create(**validated_data)

    #     for image_data in images_data:
    #         VenueImage.objects.create(venue=venue, image=image_data)

    #     return venue

    
class TypeOfvanueSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeOfVenue
        fields = '__all__'

class VenueRequestSerializer(serializers.ModelSerializer):
    venueRequest_images = serializers.ListField(
        child=Base64ImageField(), write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = VenueRequest
        fields = '__all__'

    def create(self, validated_data):
        images_data = validated_data.pop("venueRequest_images", [])  
        venue_request = VenueRequest.objects.create(**validated_data) 
        for image_data in images_data:
            VenueRequestImage.objects.create(venue_request=venue_request, image=image_data)

        return venue_request

class StatusBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusBooking
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    user  = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    venue = serializers.PrimaryKeyRelatedField(queryset=Venue.objects.all())
    StatusBooking = StatusBookingSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'

class CategoryOfEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryOfEvent
        fields = '__all__'

class EventOfVenueSerializer(serializers.ModelSerializer):
    venue = VenueSerializer()
    venue_request = VenueRequestSerializer()
    category_of_event = CategoryOfEventSerializer()

    class Meta:
        model = EventOfVenue
        fields = '__all__'


class ReviewSerializer(serializers.ModelSerializer):
    review_images = serializers.ListField(
        child=Base64ImageField(), write_only=True
        , required=False, allow_null=True
    )

    class Meta:
        model = Review
        fields = "__all__"

    def create(self, validated_data):
        images_data = validated_data.pop("review_images", [])  
        review = Review.objects.create(**validated_data)

        for image_data in images_data:
            ReviewImage.objects.create(review=review, image=image_data)

        return review
    
class NotificationSerializer(serializers.ModelSerializer):
    class  Meta:
        model = Notifications
        fields = '__all__'

class FavoriteVenueSerializer(serializers.ModelSerializer):
    user  = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    venue = serializers.PrimaryKeyRelatedField(queryset=Venue.objects.all())

    class Meta:
        model = FavoriteVenue
        fields = '__all__'
