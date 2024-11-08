from django.contrib import admin
from .models import (
    Account, UserDetail, Role, Permission, RoleHasPermission, Venue, TypeOfvanue, 
    VenueRequest, Booking, VenueApproval, CategoryOfEvent, EvnetOfVenue
)

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('username', 'creation_date', 'last_login')
    search_fields = ('username',)

@admin.register(UserDetail)
class UserDetailAdmin(admin.ModelAdmin):
    list_display = ('account', 'first_name', 'last_name', 'phone_number', 'email', 'province')
    search_fields = ('first_name', 'last_name', 'email')

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('role_name', 'description')
    search_fields = ('role_name',)

@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('permission_name', 'description')
    search_fields = ('permission_name',)

@admin.register(RoleHasPermission)
class RoleHasPermissionAdmin(admin.ModelAdmin):
    list_display = ('role', 'permission')
    list_filter = ('role', 'permission')

@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ('venue_name', 'price', 'min_capacity', 'max_capacity', 'parking_space')
    search_fields = ('venue_name',)
    list_filter = ('typeOfvanue',)

@admin.register(TypeOfvanue)
class TypeOfvanueAdmin(admin.ModelAdmin):
    list_display = ('type_name', 'type_description')
    search_fields = ('type_name',)

@admin.register(VenueRequest)
class VenueRequestAdmin(admin.ModelAdmin):
    list_display = ('venue_name', 'price', 'min_capacity', 'max_capacity', 'parking_space')
    search_fields = ('venue_name',)

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id_booking', 'check_in', 'check_out', 'venue', 'account')
    search_fields = ('id_booking',)
    list_filter = ('venue',)

@admin.register(VenueApproval)
class VenueApprovalAdmin(admin.ModelAdmin):
    list_display = ('id_venue_approval', 'status', 'comment', 'datetime', 'venue_request', 'account')
    list_filter = ('status',)

@admin.register(CategoryOfEvent)
class CategoryOfEventAdmin(admin.ModelAdmin):
    list_display = ('category_name', 'category_detail')
    search_fields = ('category_name',)

@admin.register(EvnetOfVenue)
class EvnetOfVenueAdmin(admin.ModelAdmin):
    list_display = ('venue', 'venue_request', 'CategoryOfEvent')
    list_filter = ('CategoryOfEvent', 'venue')