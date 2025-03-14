from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status
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

from .models import (
    Role,
    # Account,
    UserDetail,
    Venue,
    TypeOfVenue,
    VenueRequest,
    Booking,
    # VenueApproval,
    CategoryOfEvent,
    EventOfVenue,
    StatusBooking,
    Review,
    Notifications,
    FavoriteVenue,
    VenueImage,
    VenueRequestImage,
)
from .serializers import (
    RoleSerializer,
    # AccountSerializer,
    UserSerializer,
    UserDetailSerializer,
    VenueSerializer,
    TypeOfvanueSerializer,
    VenueRequestSerializer,
    BookingSerializer,
    # VenueApprovalSerializer,
    CategoryOfEventSerializer,
    EventOfVenueSerializer,
    StatusBookingSerializer,
    ReviewSerializer,
    NotificationSerializer,
    CustomTokenObtainPairSerializer,
    FavoriteVenueSerializer
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
        
        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "Username already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(password) < 8:
            return Response(
                {"error": "Password must be at least 8 characters long"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
       
        user = User.objects.create_user(username=username, password=password, email=email)
        role, _ = Role.objects.get_or_create(role_name="User")

        user_detail = UserDetail.objects.create(
        user=user,
        email=email,  
        role=role  
        )

        return Response(
        {
            "message": "User created successfully!",
            "user_id": user.id,  
            "user_detail_id": user_detail.id,  
            "username": user.username,
            "email": user.email,
            "role": role.role_name
        },
        status=status.HTTP_201_CREATED,
        )

        # serializer = UserSerializer(data=request.data)
        # if serializer.is_valid():
        #     serializer.save()

        #     UserDetail.objects.create(
        #         user=User.objects.get(username=username),
        #         role=Role.objects.get(role_name='user')
        #     )

        #     return Response(
        #         {"message": "User created successfully!", "data": serializer.data},
        #         status=status.HTTP_201_CREATED,
        #     )
        # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request, *args, **kwargs):
        users = User.objects.all()  
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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
                status=status.HTTP_404_NOT_FOUND
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
            return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)

        return FileResponse(open(file_path, 'rb'), as_attachment=True)


    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            venue = serializer.save()

            # บันทึกภาพ
            venue_images = request.data.get("venue_images", [])
            for index, image_base64 in enumerate(venue_images):
                try:
                    format, imgstr = image_base64.split(';base64,')
                    ext = format.split('/')[-1]
                    file_name = f"venue_{venue.id}_{index}.{ext}"

                    venue_image = ContentFile(base64.b64decode(imgstr), name=file_name)
                    VenueImage.objects.create(venue=venue, image=venue_image)

                except Exception as e:
                    print(f"Error processing image {index}: {e}")

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
                status=status.HTTP_404_NOT_FOUND
            )
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            venue_request = serializer.save()

            venueRequest_images = request.data.get("venueRequest_images", [])

            for index, image_base64 in enumerate(venueRequest_images):
                try:
                    if ';base64,' in image_base64:
                        format, imgstr = image_base64.split(';base64,')
                        ext = format.split('/')[-1]
                    else:
                        raise ValueError("Invalid Base64 format")

                    missing_padding = len(imgstr) % 4
                    if missing_padding:
                        imgstr += '=' * (4 - missing_padding)

                    file_name = f"venueRequest_{venue_request.id}_{index}.{ext}"
                    image_file = ContentFile(base64.b64decode(imgstr, validate=True), name=file_name)

                    VenueRequestImage.objects.create(venue_request=venue_request, image=image_file)

                except Exception as e:
                    print(f"Error processing image {index}: {e}")
                    return Response({"error": f"Invalid Base64 encoding for image {index}"}, status=status.HTTP_400_BAD_REQUEST)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
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
            status=status.HTTP_400_BAD_REQUEST
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
                status=status.HTTP_404_NOT_FOUND
            )

class CategoryOfEventViewSet(viewsets.ModelViewSet):
    queryset = CategoryOfEvent.objects.all()
    serializer_class = CategoryOfEventSerializer

class EventOfVenueViewSet(viewsets.ModelViewSet):
    queryset = EventOfVenue.objects.all()
    serializer_class = EventOfVenueSerializer

class StatusBookingViewSet(viewsets.ModelViewSet):
    queryset = StatusBooking.objects.all()
    serializer_class = StatusBookingSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

def create(self, request):
    try:
        user = request.user
        venue_id = int(request.data.get("venue", 0))
        booking_id = int(request.data.get("booking", 0))
        create_at = request.data.get("createAt", "")
        review_detail = request.data.get("reviewDetail", "")
        clean = request.data.get("clean", 1)
        service = request.data.get("service", 1)
        value_for_money = request.data.get("value_for_money", 1)
        facilities = request.data.get("facilities", 1)
        matches_expectations = request.data.get("matches_expectations", 1) 
        environment = request.data.get("environment", 1)
        review_images = request.data.get("review_images", [])

        if not venue_id or not booking_id:
            return Response({"error": "Venue ID and Booking ID are required."}, status=status.HTTP_400_BAD_REQUEST)

        approved_status = StatusBooking.objects.filter(status="approved").first()
        if not approved_status:
            return Response({"error": "Approved status not found."}, status=status.HTTP_400_BAD_REQUEST)

        booking = Booking.objects.filter(
            id=booking_id, user=user, venue_id=venue_id, status_booking=approved_status
        ).first()

        if not booking:
            return Response({"error": "No completed booking found for this venue."}, status=status.HTTP_400_BAD_REQUEST)

        zones = pytz.timezone("Asia/Jakarta")
        current_time = datetime.now(zones)

        if not booking.check_out:
            return Response({"error": "Booking check-out time is missing."}, status=status.HTTP_400_BAD_REQUEST)

        if booking.check_out >= current_time:
            return Response({"error": "Cannot proceed, checkout time has not passed yet."}, status=status.HTTP_400_BAD_REQUEST)

        if booking.isReview:
            return Response({"error": "This booking has already been reviewed."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            review = serializer.save(user=user, venue_id=venue_id, booking=booking)

            for index, image_base64 in enumerate(review_images):
                try:
                    format, imgstr = image_base64.split(';base64,')
                    ext = format.split('/')[-1]
                    file_name = f"review_{review.id}_{index}.{ext}"

                    review_image = ContentFile(base64.b64decode(imgstr), name=file_name)
                    review.review_image.save(file_name, review_image)
                except Exception as e:
                    print(f"Error processing image {index}: {e}")

            booking.isReview = True
            booking.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class NotificationViewset(viewsets.ModelViewSet):
    queryset = Notifications.objects.all()
    serializer_class = NotificationSerializer

    @action(detail=False, methods=['DELETE'], url_path='delete-read')
    def delete_read(self, request):
        user_id = request.data.get('userId')
        if not user_id:
            return Response(
                {"error": "User ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )


        Notifications.objects.filter(user_id=user_id, isRead=True).delete()
        return Response(
            {"message": "Read notifications deleted"},
            status=status.HTTP_200_OK
        )
    
class FavoriteVenueViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteVenueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FavoriteVenue.objects.filter(user=self.request.user)

    def create(self, request):
        venue_id = request.data.get("venue_id")
        if not venue_id:
            return Response({"error": "Venue ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        venue = Venue.objects.filter(id=venue_id).first()
        if not venue:
            return Response({"error": "Venue not found"}, status=status.HTTP_404_NOT_FOUND)

        favorite, created = FavoriteVenue.objects.get_or_create(user=request.user, venue=venue)
        if not created:
            return Response({"message": "Venue is already in favorites"}, status=status.HTTP_200_OK)

        return Response(FavoriteVenueSerializer(favorite).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        favorite = FavoriteVenue.objects.filter(user=request.user, venue_id=pk).first()
        if not favorite:
            return Response({"error": "Favorite venue not found"}, status=status.HTTP_404_NOT_FOUND)

        favorite.delete()
        return Response({"message": "Venue removed from favorites"}, status=status.HTTP_204_NO_CONTENT)