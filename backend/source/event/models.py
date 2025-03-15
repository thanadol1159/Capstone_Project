from django.db import models
from django.contrib.auth.models import User
# Create your models here.


class Role(models.Model):
    role_name = models.CharField(max_length=45)
    description = models.TextField()

class UserDetail(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE,null=True, blank=True,related_name="userdetail")
    first_name = models.CharField(max_length=30,null=True, blank=True)
    last_name = models.CharField(max_length=30,null=True, blank=True)
    phone_number = models.CharField(max_length=10,null=True, blank=True)
    email = models.EmailField(max_length=45,null=True, blank=True)
    province = models.CharField(max_length=45,null=True, blank=True)
    district = models.CharField(max_length=45,null=True, blank=True)
    sub_district = models.CharField(max_length=45,null=True, blank=True)
    address = models.CharField(max_length=255,null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    role = models.ForeignKey(Role, on_delete=models.CASCADE,null=True, blank=True)

class TypeOfVenue(models.Model):
    type_name = models.CharField(max_length=45,null=True)
    type_description = models.CharField(max_length=45,null=True)

class StatusBooking(models.Model):
    status =  models.CharField(max_length=25, null=True)
    description = models.TextField(null=True)
    
class Venue(models.Model):
    venue_type = models.ForeignKey(TypeOfVenue,on_delete=models.CASCADE,null=True, blank=True) 
    venue_name = models.CharField(max_length=50,null=True, blank=True)  
    image = models.ImageField(upload_to='images/venue/', null=True, blank=True)
    location = models.CharField(max_length=100, null=True, blank=True)
    category_event = models.CharField(max_length=50, null=True, blank=True)
    price = models.IntegerField(null=True, blank=True)
    area_size = models.CharField(max_length=50, null=True, blank=True)  
    capacity = models.IntegerField(null=True, blank=True)
    number_of_rooms = models.IntegerField(null=True, blank=True)
    parking_space = models.IntegerField(null=True, blank=True)
    outdoor_spaces = models.IntegerField(null=True, blank=True)
    additional_information = models.TextField(null=True, blank=True)
    venue_certification = models.FileField(upload_to='pdfs/venue/',null=True, blank=True)
    personal_identification = models.FileField(upload_to='pdfs/personal/',null=True, blank=True)
    venue_owner = models.ForeignKey(User, on_delete=models.CASCADE,null=True, blank=True)
    status = models.ForeignKey(StatusBooking, on_delete=models.CASCADE,null=True, blank=True)

class VenueRequest(models.Model):
    venue_type = models.ForeignKey(TypeOfVenue,on_delete=models.CASCADE,null=True, blank=True) 
    venue_name = models.CharField(max_length=50,null=True, blank=True)
    image = models.ImageField(upload_to='images/venue/', null=True, blank=True)
    location = models.CharField(max_length=100, null=True, blank=True)
    category_event = models.CharField(max_length=50, null=True, blank=True)
    price = models.IntegerField(null=True, blank=True)
    area_size = models.CharField(max_length=50, null=True, blank=True) 
    capacity = models.IntegerField(null=True, blank=True)
    number_of_rooms = models.IntegerField(null=True, blank=True)
    parking_space = models.IntegerField(null=True, blank=True)
    outdoor_spaces = models.IntegerField(null=True, blank=True)
    additional_information = models.TextField(null=True, blank=True)
    venue_certification = models.FileField(upload_to='pdfs/venue/',null=True, blank=True)
    personal_identification = models.FileField(upload_to='pdfs/personal/',null=True, blank=True)
    venue_owner = models.ForeignKey(User, on_delete=models.CASCADE,null=True, blank=True)
    status = models.ForeignKey(StatusBooking, on_delete=models.CASCADE,null=True, blank=True)
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE,null=True, blank=True)

class Booking(models.Model):
    check_in = models.DateTimeField(null=True,blank=True)
    check_out = models.DateTimeField(null=True,blank=True)
    total_price = models.IntegerField(null=True,blank=True) 
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, null=True,blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE,null=True, blank=True)
    status_booking = models.ForeignKey(StatusBooking, on_delete=models.CASCADE, null=True,blank=True)
    isReview = models.BooleanField(default=False)

class CategoryOfEvent(models.Model):
    category_name = models.CharField(max_length=45)
    category_detail = models.CharField(max_length=45)

class EventOfVenue(models.Model):
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE,null=True, blank=True)
    venue_request = models.ForeignKey(VenueRequest, on_delete=models.CASCADE,null=True, blank=True)
    CategoryOfEvent = models.ForeignKey(CategoryOfEvent, on_delete=models.CASCADE)

# class Review(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE,null=True, blank=True)
#     venue = models.ForeignKey(Venue, on_delete=models.CASCADE, null=True,blank=True)
#     reviewDetail = models.TextField()
#     createAt = models.DateTimeField()
#     review_image = models.FileField(upload_to='images/reviews/',null=True, blank=True)
#     point = models.IntegerField()
#     booking = models.ForeignKey(Booking, on_delete=models.CASCADE, null=True, blank=True)

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, null=True, blank=True)
    reviewDetail = models.TextField()
    createAt = models.DateTimeField()
    point = models.IntegerField()
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, null=True, blank=True)

class ReviewImage(models.Model):
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="images/reviews/")
    
class Notifications(models.Model):
    notifications_type =  models.CharField(max_length=45,)
    create_at = models.DateTimeField()
    message =  models.TextField(null=True,blank=True)
    user  = models.ForeignKey(User, on_delete=models.CASCADE,null=True, blank=True)
    isRead = models.BooleanField(default=False)

class FavoriteVenue(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favorite_venues")
    venue = models.ForeignKey("Venue", on_delete=models.CASCADE, related_name="favorited_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "venue")
