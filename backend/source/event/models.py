from django.db import models

# Create your models here.
class Role(models.Model):
    role_name = models.CharField(max_length=45)
    description = models.TextField()

class Account(models.Model):
    username = models.CharField(max_length=50)
    password = models.CharField(max_length=255)
    creation_date = models.DateTimeField()
    last_login = models.DateTimeField()

class UserDetail(models.Model):
    account = models.OneToOneField(Account, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    phone_number = models.CharField(max_length=10)
    email = models.EmailField(max_length=45)
    province = models.CharField(max_length=45)
    district = models.CharField(max_length=45)
    sub_district = models.CharField(max_length=45)
    address = models.CharField(max_length=255)
    dob = models.DateField()


class Permission(models.Model):
    permission_name = models.CharField(max_length=50)
    description = models.TextField()

class RoleHasPermission(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)

class Venue(models.Model):
    venue_name = models.CharField(max_length=50)
    price = models.IntegerField()
    min_capacity = models.IntegerField()
    max_capacity = models.IntegerField()
    parking_space = models.IntegerField()
    additional_information = models.TextField()
    venue_certification = models.CharField(max_length=255, null=True, blank=True)
    personal_certification = models.CharField(max_length=255, null=True, blank=True)
    typeOfvanue = models.ForeignKey('TypeOfvanue', on_delete=models.SET_NULL, null=True, blank=True)
    venue_request = models.ForeignKey('VenueRequest', on_delete=models.SET_NULL, null=True, blank=True)

class TypeOfvanue(models.Model):
    type_name = models.CharField(max_length=45)
    type_description = models.CharField(max_length=45)

class VenueRequest(models.Model):
    venue_name = models.CharField(max_length=50)
    price = models.IntegerField()
    min_capacity = models.IntegerField()
    max_capacity = models.IntegerField()
    parking_space = models.IntegerField()
    additional_information = models.TextField()
    venue_certification = models.CharField(max_length=255, null=True, blank=True)
    personal_certification = models.CharField(max_length=255, null=True, blank=True)
    typeOfvanue = models.ForeignKey(TypeOfvanue, on_delete=models.SET_NULL, null=True, blank=True)

class Booking(models.Model):
    id_booking = models.CharField(max_length=45)
    check_in = models.DateTimeField()
    check_out = models.DateTimeField()
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)

class VenueApproval(models.Model):
    id_venue_approval = models.CharField(max_length=45)
    status = models.CharField(max_length=45)
    comment = models.CharField(max_length=45)
    datetime = models.DateTimeField()
    venue_request = models.ForeignKey(VenueRequest, on_delete=models.CASCADE)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)

class CategoryOfEvent(models.Model):
    category_name = models.CharField(max_length=45)
    category_detail = models.CharField(max_length=45)

class EvnetOfVenue(models.Model):
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE)
    venue_request = models.ForeignKey(VenueRequest, on_delete=models.CASCADE)
    CategoryOfEvent = models.ForeignKey(CategoryOfEvent, on_delete=models.CASCADE)
