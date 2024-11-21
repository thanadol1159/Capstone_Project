from django.contrib import admin
from .models import (
    Role,
    Account,
    UserDetail,
    Permission,
    RoleHasPermission,
    TypeOfVenue,
    Venue,
    VenueRequest,
    Booking,
    VenueApproval,
    CategoryOfEvent,
    EvnetOfVenue
)

# Register your models here.

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('id', 'role_name', 'description')
    search_fields = ('role_name',)


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'creation_date', 'last_login')
    search_fields = ('username',)


@admin.register(UserDetail)
class UserDetailAdmin(admin.ModelAdmin):
    list_display = ('id', 'account', 'first_name', 'last_name', 'email', 'phone_number')
    search_fields = ('first_name', 'last_name', 'email')
    list_filter = ('province', 'district', 'sub_district')


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'permission_name', 'description')
    search_fields = ('permission_name',)


@admin.register(RoleHasPermission)
class RoleHasPermissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'role', 'permission')
    search_fields = ('role__role_name', 'permission__permission_name')


@admin.register(TypeOfVenue)
class TypeOfVenueAdmin(admin.ModelAdmin):
    list_display = ('id', 'type_name', 'type_description')
    search_fields = ('type_name',)


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'venue_type', 'venue_name', 'location', 'price', 'capacity', 'parking_space'
    )
    search_fields = ('venue_name', 'location')
    list_filter = ('category',)


@admin.register(VenueRequest)
class VenueRequestAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'venue_type', 'venue_name', 'location', 'price', 'capacity', 'parking_space'
    )
    search_fields = ('venue_name', 'location')
    list_filter = ('category',)


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'id_booking', 'check_in', 'check_out', 'venue', 'account')
    search_fields = ('id_booking', 'venue__venue_name')
    list_filter = ('check_in', 'check_out')


@admin.register(VenueApproval)
class VenueApprovalAdmin(admin.ModelAdmin):
    list_display = ('id', 'id_venue_approval', 'status', 'comment', 'datetime', 'venue_request', 'account')
    search_fields = ('id_venue_approval', 'status')


@admin.register(CategoryOfEvent)
class CategoryOfEventAdmin(admin.ModelAdmin):
    list_display = ('id', 'category_name', 'category_detail')
    search_fields = ('category_name',)


@admin.register(EvnetOfVenue)
class EvnetOfVenueAdmin(admin.ModelAdmin):
    list_display = ('id', 'venue', 'venue_request', 'CategoryOfEvent')
    search_fields = ('venue__venue_name', 'CategoryOfEvent__category_name')
