from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import (
    Role,
    Account,
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

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'

class UserDetailSerializer(serializers.ModelSerializer):
    account = AccountSerializer()

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
    account  = serializers.PrimaryKeyRelatedField(queryset=Account.objects.all())
    venue = serializers.PrimaryKeyRelatedField(queryset=Venue.objects.all())
    StatusBooking = StatusBookingSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'

class VenueApprovalSerializer(serializers.ModelSerializer):
    venue_request = VenueRequestSerializer()
    account = AccountSerializer()

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
    account  = serializers.PrimaryKeyRelatedField(queryset=Account.objects.all())
    venue = serializers.PrimaryKeyRelatedField(queryset=Venue.objects.all())

    class  Meta:
        model = Review
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class  Meta:
        model = Notifications
        fields = '__all__'