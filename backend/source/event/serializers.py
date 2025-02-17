from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
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

class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDetail
        fields = '__all__'

class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = '__all__'

class TypeOfvanueSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeOfVenue
        fields = '__all__'

class VenueRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = VenueRequest
        fields = '__all__'

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

class Base64ImageField(serializers.ImageField):
    def to_internal_value(self, data):
        if isinstance(data, str) and data.startswith("data:image"):
            format, imgstr = data.split(";base64,")  
            ext = format.split("/")[-1]  
            return ContentFile(base64.b64decode(imgstr), name=f"temp.{ext}")  
        return super().to_internal_value(data)

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
