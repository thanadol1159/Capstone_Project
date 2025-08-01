from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    Role,
    UserDetail,
    Venue,
    TypeOfVenue,
    VenueRequest,
    Booking,
    EventOfVenue,
    StatusBooking,
    Review,
    Notifications,
    FavoriteVenue,
    ReviewImage,
    VenueImage,
    VenueRequestImage,
    VenueRequestCategory,
    ReviewImage,
    VenueCategory,
    # Interested,
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

class VenueImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VenueImage
        fields = ['id', 'image']

class VenueCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = VenueCategory
        fields = ['id', 'category_event']

class VenueSerializer(serializers.ModelSerializer):
    venue_images = VenueImageSerializer(many=True, read_only=True)
    venue_category = VenueCategorySerializer(many=True, read_only=True)

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


    
class TypeOfvanueSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeOfVenue
        fields = '__all__'

class VenueRequestImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VenueRequestImage
        fields = ['id', 'image']

class VenueRequestCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = VenueRequestCategory
        fields = '__all__'

class VenueRequestSerializer(serializers.ModelSerializer):
    venueRequest_images = VenueRequestImageSerializer(many=True, read_only=True)
    venueRequest_category = VenueRequestCategorySerializer(many=True, read_only=True)

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

# class CategoryOfEventSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = CategoryOfEvent
#         fields = '__all__'

class EventOfVenueSerializer(serializers.ModelSerializer):
    venue = VenueSerializer()
    venue_request = VenueRequestSerializer()
    # category_of_event = CategoryOfEventSerializer()

    class Meta:
        model = EventOfVenue
        fields = '__all__'

class ReviewImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewImage
        fields = ['id', 'image']

class ReviewSerializer(serializers.ModelSerializer):
    review_images = ReviewImageSerializer(many=True, read_only=True)

    class Meta:
        model = Review
        fields = "__all__"

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

# class InterestedSerializer(serializers.ModelSerializer):
#     user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    
#     class Meta:
#         model = Interested
#         fields = '__all__'