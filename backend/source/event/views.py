from django.shortcuts import render
import csv
from django.http import HttpResponse

# Create your views here.
from rest_framework import viewsets
from rest_framework import status as drf_status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from django.db import IntegrityError
from rest_framework_simplejwt.views import TokenObtainPairView
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import datetime,date
from django.db.models import Q
import pytz
import base64
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.core.files.base import ContentFile
from rest_framework.parsers import MultiPartParser, FormParser
import requests
from django.http import JsonResponse
import os
from django.conf import settings
from django.db import transaction

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
    VenueImage,
    VenueRequestImage,
    ReviewImage,
    VenueCategory,
    VenueRequestCategory,
    # Interested,
)
from .serializers import (
    RoleSerializer,
    UserSerializer,
    UserDetailSerializer,
    VenueSerializer,
    TypeOfvanueSerializer,
    VenueRequestSerializer,
    BookingSerializer,
    EventOfVenueSerializer,
    StatusBookingSerializer,
    ReviewSerializer,
    NotificationSerializer,
    CustomTokenObtainPairSerializer,
    FavoriteVenueSerializer,
    VenueCategorySerializer,
    VenueRequestCategorySerializer,
    # InterestedSerializer,
)

# ViewSets define the view behavior.

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['list','retrieve','create']: 
            return [AllowAny()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        username = request.data.get('username')  
        password = request.data.get('password')
        email = request.data.get('email')
        age = request.data.get('age')
        gender = request.data.get('gender')
        
        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "Username already exists"},
                status=drf_status.HTTP_400_BAD_REQUEST
            )
        
        if len(password) < 8:
            return Response(
                {"error": "Password must be at least 8 characters long"},
                status=drf_status.HTTP_400_BAD_REQUEST
            )
    
        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "Email already exists"},
                status=drf_status.HTTP_400_BAD_REQUEST
            )
        
       
        try:
            with transaction.atomic():
                user_serializer = UserSerializer(data={"username": username, "password": password, "email": email})
                if user_serializer.is_valid():
                    user = user_serializer.save()
                else:
                    return Response(user_serializer.errors, status=drf_status.HTTP_400_BAD_REQUEST)

                role, _ = Role.objects.get_or_create(role_name="User")

                user_detail = UserDetail.objects.create(
                    user=user,
                    email=email,  
                    role=role,
                    age=age,
                    gender=gender
                )

                return Response(
                    {
                        "message": "User created successfully!",
                        "user_id": user.id,
                        "user_detail_id": user_detail.id,
                        "username": user.username,
                        "email": user.email,
                        "role": role.role_name,
                        "age": user_detail.age,
                        "gender": user_detail.gender,
                    },
                    status=drf_status.HTTP_201_CREATED,
                )

        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def list(self, request, *args, **kwargs):
        users = User.objects.all()  
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=drf_status.HTTP_200_OK)

class UserDetailViewSet(viewsets.ModelViewSet):
    queryset = UserDetail.objects.all()
    serializer_class = UserDetailSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

class VenueViewSet(viewsets.ModelViewSet):
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer

    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.action == 'list' or self.action == 'retrieve':
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_venues(self, request):
        try:
            user = User.objects.get(username=request.user.username)
            venues = Venue.objects.filter(venue_owner=user)
            
            serializer = self.get_serializer(venues, many=True)
            return Response(serializer.data)
        
        except User.DoesNotExist:
            return Response(
                {"error": "user not found"}, 
                status=drf_status.HTTP_404_NOT_FOUND
            )
        
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def download_pdf(self, request, pk=None, file_type=None):
        venue_request = get_object_or_404(VenueRequest, pk=pk)
        
        if file_type == "certification" and venue_request.venue_certification:
            file_path = venue_request.venue_certification.path
        elif file_type == "identification" and venue_request.personal_identification:
            file_path = venue_request.personal_identification.path
        else:
            return Response({"error": "File not found"}, status=drf_status.HTTP_404_NOT_FOUND)

        return FileResponse(open(file_path, 'rb'), as_attachment=True)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        venue_images = request.FILES.getlist("venue_images")
        received_image_ids = request.data.getlist("venue_images_ids")

        # Determine if it's a full update (PUT) or a partial update (PATCH)
        is_put_request = request.method == "PUT"
        serializer = self.get_serializer(instance, data=data, partial=not is_put_request)

        if serializer.is_valid():
            venue = serializer.save()

            if is_put_request:
                # Only delete images if it's a full update (PUT)
                existing_image_ids = set(instance.venue_images.values_list("id", flat=True))
                images_to_delete = existing_image_ids - set(map(int, received_image_ids))
                VenueImage.objects.filter(id__in=images_to_delete).delete()

            for image in venue_images:
                VenueImage.objects.create(venue=venue, image=image)

            return Response(serializer.data, status=drf_status.HTTP_200_OK)

        return Response(serializer.errors, status=drf_status.HTTP_400_BAD_REQUEST)

    
    def create(self, request, *args, **kwargs):
        data = self.request.data
        venue_images = request.FILES.getlist("venue_images") 
        venue_category = request.data.getlist("venue_category")
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            venue = serializer.save()

            for image in venue_images:
                VenueImage.objects.create(venue=venue, image=image)

            for category in venue_category:
                VenueCategory.objects.create(venue=venue, category_event=category)

            return Response(serializer.data, status=drf_status.HTTP_201_CREATED)

        return Response(serializer.errors, status=drf_status.HTTP_400_BAD_REQUEST)

class TypeOfvanueViewSet(viewsets.ModelViewSet):
    queryset = TypeOfVenue.objects.all()
    serializer_class = TypeOfvanueSerializer

    def get_permissions(self):
        if self.action == 'list' or self.action == 'retrieve':
            return [AllowAny()]
        return [IsAuthenticated()]

class VenueRequestViewSet(viewsets.ModelViewSet):
    queryset = VenueRequest.objects.all()
    serializer_class = VenueRequestSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.action == 'list' or self.action == 'retrieve':
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_venues(self, request):
        try:
            user = User.objects.get(username=request.user.username)
            venues = Venue.objects.filter(venue_owner=user)
            
            serializer = self.get_serializer(venues, many=True)
            return Response(serializer.data)
        
        except User.DoesNotExist:
            return Response(
                {"error": "user not found"}, 
                status=drf_status.HTTP_404_NOT_FOUND
            )
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        venueRequest_images = request.FILES.getlist("venueRequest_images")
        received_image_ids = request.data.getlist("venue_images_ids")

        # Use partial=True for PATCH, partial=False for PUT
        is_put_request = request.method == "PUT"
        serializer = self.get_serializer(instance, data=data, partial=not is_put_request)

        if serializer.is_valid():
            venue_request = serializer.save()

            if is_put_request:  
                # Only delete images if it's a full update (PUT)
                existing_image_ids = set(instance.venueRequest_images.values_list("id", flat=True))
                images_to_delete = existing_image_ids - set(map(int, received_image_ids))
                VenueRequestImage.objects.filter(id__in=images_to_delete).delete()

            if venueRequest_images:
                for image in venueRequest_images:
                    VenueRequestImage.objects.create(venue_request=venue_request, image=image)

            return Response(serializer.data, status=drf_status.HTTP_200_OK)

        return Response(serializer.errors, status=drf_status.HTTP_400_BAD_REQUEST)

        
    def create(self, request, *args, **kwargs):
        data = self.request.data
        venueRequest_images = [
            file for key, file in request.FILES.items() if key.startswith("venueRequest_images")
        ]

        venueRequest_category = request.data.getlist("venueRequest_category")
        
        serializer = self.get_serializer(data=data)
        
        if serializer.is_valid():
            venue_request = serializer.save()

            for image in venueRequest_images:
                VenueRequestImage.objects.create(venue_request=venue_request, image=image) 

            for category in venueRequest_category:
                VenueRequestCategory.objects.create(venue_request=venue_request, category_event=category)

            return Response(serializer.data, status=drf_status.HTTP_201_CREATED)

        print("Serializer Errors:", serializer.errors)
        return Response(serializer.errors, status=drf_status.HTTP_400_BAD_REQUEST)
        
class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'], url_path='venue=(?P<venue_id>[^/.]+)')
    def venue_bookings(self, request, venue_id=None):

        if venue_id:
            queryset = self.queryset.filter(venue_id=venue_id)
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        return Response(
            {"error": "Venue ID is required"},
            status=drf_status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_bookings(self, request):
        try:
            queryset = self.queryset.filter(user=request.user)
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=drf_status.HTTP_404_NOT_FOUND
            )

class EventOfVenueViewSet(viewsets.ModelViewSet):
    queryset = EventOfVenue.objects.all()
    serializer_class = EventOfVenueSerializer

class StatusBookingViewSet(viewsets.ModelViewSet):
    queryset = StatusBooking.objects.all()
    serializer_class = StatusBookingSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = super().get_queryset()
        venue_id = self.request.query_params.get('venue')
        
        if venue_id:
            try:
                venue_id = int(venue_id)
                queryset = queryset.filter(venue_id=venue_id)
            except ValueError:
                pass 
        
        return queryset

    def create(self, request):
        try:
            user = request.user
            venue_id = int(request.data.get("venue", 0))
            booking_id = int(request.data.get("booking", 0))
            review_images = request.FILES.getlist("review_images")

            if not venue_id or not booking_id:
                return Response({"error": "Venue ID and Booking ID are required."}, status=drf_status.HTTP_400_BAD_REQUEST)

            approved_status = StatusBooking.objects.filter(status="approved").first()
            if not approved_status:
                return Response({"error": "Approved status not found."}, status=drf_status.HTTP_400_BAD_REQUEST)

            booking = Booking.objects.filter(
                id=booking_id, user=user, venue_id=venue_id, status_booking=approved_status
            ).first()

            if not booking:
                return Response({"error": "No completed booking found for this venue."}, status=drf_status.HTTP_400_BAD_REQUEST)

            zones = pytz.timezone("Asia/Jakarta")
            current_time = datetime.now(zones)

            if not booking.check_out:
                return Response({"error": "Booking check-out time is missing."}, status=drf_status.HTTP_400_BAD_REQUEST)

            if booking.check_out >= current_time:
                return Response({"error": "Cannot proceed, checkout time has not passed yet."}, status=drf_status.HTTP_400_BAD_REQUEST)

            if booking.isReview:
                return Response({"error": "This booking has already been reviewed."}, status=drf_status.HTTP_400_BAD_REQUEST)

            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                review = serializer.save(user=user, venue_id=venue_id, booking=booking)
                
                for image in review_images:
                    ReviewImage.objects.create(review=review, image=image)

                booking.isReview = True
                booking.save()

                return Response(serializer.data, status=drf_status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=drf_status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class NotificationViewset(viewsets.ModelViewSet):
    queryset = Notifications.objects.all()
    serializer_class = NotificationSerializer

    @action(detail=False, methods=['DELETE'], url_path='delete-read')
    def delete_read(self, request):
        user_id = request.data.get('userId')
        if not user_id:
            return Response(
                {"error": "User ID is required"},
                status=drf_status.HTTP_400_BAD_REQUEST
            )


        Notifications.objects.filter(user_id=user_id, isRead=True).delete()
        return Response(
            {"message": "Read notifications deleted"},
            status=drf_status.HTTP_200_OK
        )
    
class FavoriteVenueViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteVenueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FavoriteVenue.objects.filter(user=self.request.user)

    def create(self, request):
        venue_id = request.data.get("venue_id")
        if not venue_id:
            return Response({"error": "Venue ID is required"}, status=drf_status.HTTP_400_BAD_REQUEST)

        venue = Venue.objects.filter(id=venue_id).first()
        if not venue:
            return Response({"error": "Venue not found"}, status=drf_status.HTTP_404_NOT_FOUND)

        favorite, created = FavoriteVenue.objects.get_or_create(user=request.user, venue=venue)
        if not created:
            return Response({"message": "Venue is already in favorites"}, status=drf_status.HTTP_200_OK)

        return Response(FavoriteVenueSerializer(favorite).data, status=drf_status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        favorite = FavoriteVenue.objects.filter(user=request.user, venue_id=pk).first()
        if not favorite:
            return Response({"error": "Favorite venue not found"}, status=drf_status.HTTP_404_NOT_FOUND)

        favorite.delete()
        return Response({"message": "Venue removed from favorites"}, status=drf_status.HTTP_204_NO_CONTENT)
    
class VenueCategoryViewSet(viewsets.ModelViewSet):
    queryset = VenueCategory.objects.all()
    serializer_class = VenueCategorySerializer

class VenueRequestCategoryViewSet(viewsets.ModelViewSet):
    queryset = VenueRequestCategory.objects.all()
    serializer_class = VenueRequestCategorySerializer

# class InterestedViewSet(viewsets.ModelViewSet):
#     queryset = Interested.objects.all()
#     serializer_class = InterestedSerializer

#     def get_permissions(self):
#         if self.action == 'list' or self.action == 'retrieve':
#             return [AllowAny()]
#         return [IsAuthenticated()]

FLASK_API_URL = "https://capstone24.sit.kmutt.ac.th/nk1/ml-api/predict_category"
# FLASK_API_URL = "https://ml:5000/predict_category"
# FLASK_API_URL = "/ml-api/predict_category"
# FLASK_API_RELOAD = "http://ml:5000/reload"




def get_ml_prediction(request):
    try:
        # รับ user_id จากพารามิเตอร์
        user_id = request.GET.get('user_id')
        if not user_id:
            return JsonResponse({"error": "user_id parameter is required"}, status=400)
        
        response = requests.get(FLASK_API_URL)
        if response.status_code == 200:
            data = response.json()
            results = data.get("results", [])
            print("Results:", results)
            print("User ID from params:", user_id)

            # ค้นหา predicted_category ของ user นี้
            predict_category = next((item["predicted_category"] for item in results if str(item["user_id"]) == str(user_id)), None)

            if not predict_category:
                return JsonResponse({"error": "No predicted category found for this user"}, status=404)

            # ค้นหา Venue ที่มี category_event ตรงกับ predicted_category
            venue_ids = VenueCategory.objects.filter(category_event=predict_category).values_list('venue_id', flat=True)
            venues = Venue.objects.filter(id__in=venue_ids).select_related('venue_type', 'venue_owner', 'status').prefetch_related('venue_category')

            # แปลงข้อมูล Venue เป็น JSON response
            venue_list = []
            for venue in venues:
                venue_list.append({
                    "id": venue.id,
                    "venue_name": venue.venue_name,
                    "location": venue.location,
                    "price": venue.price,
                    "area_size": venue.area_size,
                    "capacity": venue.capacity,
                    "number_of_rooms": venue.number_of_rooms,
                    "parking_space": venue.parking_space,
                    "outdoor_spaces": venue.outdoor_spaces,
                    "additional_information": venue.additional_information,
                    "venue_type": venue.venue_type.type_name if venue.venue_type else None,
                    "venue_owner": venue.venue_owner.username if venue.venue_owner else None,
                    "status": venue.status.status if venue.status else None,
                    "categories": [cat.category_event for cat in venue.venue_category.all()]  # ดึง category ทั้งหมดของ Venue นี้
                })

            return JsonResponse(venue_list, safe=False)

        else:
            return JsonResponse({"error": "Failed to get prediction"}, status=response.status_code)

    except requests.exceptions.RequestException as e:
        return JsonResponse({"error": str(e)}, status=500)

import csv
from django.http import HttpResponse
from .models import Venue  # Ensure Venue is correctly imported


FLASK_UPLOAD_URL = "https://capstone24.sit.kmutt.ac.th/nk1/ml-api/upload_csv"  # ใช้ชื่อ container ของ ML
# FLASK_UPLOAD_URL = "http://ml:5000/upload_csv"  # ใช้ชื่อ container ของ ML
# FLASK_UPLOAD_URL = "/ml-api/upload_csv"



def export_venues_to_csv(request):
    file_name = "test_precategory.csv"
    file_path = os.path.join(settings.MEDIA_ROOT, file_name)

    if os.path.exists(file_path):
        os.remove(file_path)

    with open(file_path, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["user_id", "age", "gender", "interested"])

        users = UserDetail.objects.all()
        for user in users:
            user_id = getattr(user.user, "id", "")  # ป้องกัน AttributeError
            age = user.age if user.age is not None else ""
            gender = user.gender if user.gender else ""
            interested = ", ".join(user.interested) if user.interested else ""

            writer.writerow([user_id, age, gender, interested])
    try:
        with open(file_path, "rb") as file:
            response = requests.post(FLASK_UPLOAD_URL, files={"file": file})

        if response.status_code == 200:
            return JsonResponse({"message": "CSV uploaded successfully", "response": response.json()})
        else:
            return JsonResponse({"error": "Failed to upload CSV", "details": response.text}, status=500)
    
    except requests.exceptions.RequestException as e:
        return JsonResponse({"error": str(e)}, status=500)