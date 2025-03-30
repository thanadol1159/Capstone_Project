from django.contrib import admin
from .models import (
    Role,
    # Account,
    UserDetail,
    TypeOfVenue,
    Venue,
    VenueRequest,
    Booking,
    # VenueApproval,
    # CategoryOfEvent,
    EventOfVenue,
    StatusBooking,
    Review,
    Notifications
)

# Register your models here.

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('id', 'role_name', 'description')
    search_fields = ('role_name',)


# @admin.register(Account)
# class AccountAdmin(admin.ModelAdmin):
#     list_display = ('id', 'user', 'creation_date', 'last_login')
#     search_fields = ('user',)


@admin.register(UserDetail)
class UserDetailAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name', 'email', 'phone_number')
    search_fields = ('first_name', 'last_name', 'email')
    list_filter = ('province', 'district', 'sub_district')

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
    list_filter = ('category_event',)


@admin.register(VenueRequest)
class VenueRequestAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'venue_type', 'venue_name', 'location', 'price', 'capacity', 'parking_space'
    )
    search_fields = ('venue_name', 'location')
    # list_filter = ('category_event',)


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'check_in', 'check_out',)
    search_fields = ('id_booking', 'venue__venue_name')
    list_filter = ('check_in', 'check_out')

# @admin.register(CategoryOfEvent)
# class CategoryOfEventAdmin(admin.ModelAdmin):
#     list_display = ('id', 'category_name', 'category_detail')
#     search_fields = ('category_name',)


@admin.register(EventOfVenue)
class EventOfVenueAdmin(admin.ModelAdmin):
    list_display = ('id', 'venue')
    search_fields = ('venue__venue_name', 'CategoryOfEvent__category_name')

@admin.register(StatusBooking)
class StatusBookingAdmin(admin.ModelAdmin):
    list_display = ('id','status','description')
    # search_fields  = ('status')

@admin.register(Review)
class Review(admin.ModelAdmin):
    list_display = ('id','user','venue','reviewDetail','createAt')

@admin.register(Notifications)
class Notifications(admin.ModelAdmin):
    list_display =  ('id','notifications_type','create_at','user')