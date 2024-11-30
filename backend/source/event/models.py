from django.db import models

# Create your models here.
class Role(models.Model):
    role_name = models.CharField(max_length=45)
    description = models.TextField()

class Account(models.Model):
    id = models.CharField(max_length=45, primary_key=True)
    username = models.CharField(max_length=50,null=True, blank=True)
    password = models.CharField(max_length=255,null=True, blank=True)
    creation_date = models.DateTimeField(null=True, blank=True)
    last_login = models.DateTimeField(null=True, blank=True)
# class Account(AbstractBaseUser):
#     username = models.CharField(max_length=50, unique=True)
#     password = models.CharField(max_length=255)
#     creation_date = models.DateTimeField(auto_now_add=True)
#     last_login = models.DateTimeField(blank=True, null=True)

#     # Required fields for authentication
#     is_active = models.BooleanField(default=True)

#     USERNAME_FIELD = 'username'
#     REQUIRED_FIELDS = []

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

class TypeOfVenue(models.Model):
    type_name = models.CharField(max_length=45,null=True)
    type_description = models.CharField(max_length=45,null=True)

class Venue(models.Model):
    venue_type = models.ForeignKey(TypeOfVenue,on_delete=models.CASCADE,null=True, blank=True) 
    venue_name = models.CharField(max_length=50,null=True, blank=True)  
    image = models.ImageField(upload_to='images/', null=True, blank=True)
    location = models.CharField(max_length=100, null=True, blank=True)
    category_event = models.CharField(max_length=50, null=True, blank=True)
    price = models.IntegerField(null=True, blank=True)
    area_size = models.CharField(max_length=5, null=True, blank=True)  
    capacity = models.IntegerField(null=True, blank=True)
    number_of_rooms = models.IntegerField(null=True, blank=True)
    parking_space = models.IntegerField(null=True, blank=True)
    outdoor_spaces = models.IntegerField(null=True, blank=True)
    additional_information = models.TextField(null=True, blank=True)
    venue_certification = models.CharField(max_length=255, null=True, blank=True)
    personal_identification = models.CharField(max_length=255, null=True, blank=True)
    venue_owner = models.ForeignKey(Account,on_delete=models.CASCADE, null=True, blank=True)

class VenueRequest(models.Model):
    venue_type = models.ForeignKey(TypeOfVenue,on_delete=models.CASCADE,null=True, blank=True) 
    venue_name = models.CharField(max_length=50,null=True, blank=True)
    image = models.ImageField(upload_to='images/', null=True, blank=True)
    location = models.CharField(max_length=100, null=True, blank=True)
    category_event = models.CharField(max_length=50, null=True, blank=True)
    price = models.IntegerField(null=True, blank=True)
    area_size = models.CharField(max_length=50, null=True, blank=True) 
    capacity = models.IntegerField(null=True, blank=True)
    number_of_rooms = models.IntegerField(null=True, blank=True)
    parking_space = models.IntegerField(null=True, blank=True)
    outdoor_spaces = models.IntegerField(null=True, blank=True)
    additional_information = models.TextField(null=True, blank=True)
    venue_certification = models.CharField(max_length=255, null=True, blank=True)
    personal_identification = models.CharField(max_length=255, null=True, blank=True)
    venue_owner = models.ForeignKey(Account,on_delete=models.CASCADE, null=True, blank=True)
    
class StatusBooking(models.Model):
    status =  models.CharField(max_length=25, null=True)
    description = models.TextField(null=True)

class Booking(models.Model):
    check_in = models.DateTimeField(null=True,blank=True)
    check_out = models.DateTimeField(null=True,blank=True)
    total_price = models.IntegerField(null=True,blank=True) 
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, null=True,blank=True)
    account = models.ForeignKey(Account, on_delete=models.CASCADE, null=True,blank=True)
    status_booking = models.ForeignKey(StatusBooking, on_delete=models.CASCADE, null=True,blank=True)

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

