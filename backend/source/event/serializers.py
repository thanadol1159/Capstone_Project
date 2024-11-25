from rest_framework import serializers
from .models import (
    Role,
    Account,
    UserDetail,
    Permission,
    RoleHasPermission,
    Venue,
    TypeOfVenue,
    VenueRequest,
    Booking,
    VenueApproval,
    CategoryOfEvent,
    EvnetOfVenue,
    StatusBooking,

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

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = '__all__'

class RoleHasPermissionSerializer(serializers.ModelSerializer):
    role = RoleSerializer()
    permission = PermissionSerializer()

    class Meta:
        model = RoleHasPermission
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
    venue = serializers.PrimaryKeyRelatedField(queryset=Venue.objects.all())
    # account = AccountSerializer(read_only=True)
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

class EvnetOfVenueSerializer(serializers.ModelSerializer):
    venue = VenueSerializer()
    venue_request = VenueRequestSerializer()
    category_of_event = CategoryOfEventSerializer()

    class Meta:
        model = EvnetOfVenue
        fields = '__all__'

