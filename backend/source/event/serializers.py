from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .models import (
    Role,
    # Account,
    UserDetail,
    Venue,
    TypeOfVenue,
    VenueRequest,
    Booking,
    VenueApproval,
    CategoryOfEvent,
    EventOfVenue,
    StatusBooking,
    Review,
    Notifications,
)

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

# class AccountSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Account
#         fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'first_name', 'last_name']
        extra_kwargs = {
            'password': {'write_only': True} 
        }
        
    def create(self, validated_data):
        # ใช้ set_password เพื่อแฮชรหัสผ่านก่อนบันทึก
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
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

class VenueApprovalSerializer(serializers.ModelSerializer):
    venue_request = VenueRequestSerializer()
    user = UserSerializer()

    class Meta:
        model = VenueApproval
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
    user  = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    venue = serializers.PrimaryKeyRelatedField(queryset=Venue.objects.all())

    class  Meta:
        model = Review
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class  Meta:
        model = Notifications
        fields = '__all__'