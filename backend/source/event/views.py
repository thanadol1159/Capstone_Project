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
        if self.action == 'create':
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




class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [AllowAny]

    def get_permissions(self):
        """
        Override to set specific permissions for different actions
        """
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

from rest_framework import status, viewsets
from rest_framework.response import Response
from datetime import datetime
import pytz
from .models import Booking, Review
from .serializers import ReviewSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def create(self, request):
        try:
            user = request.user 
            venue_id = request.data.get("venue")

            if not venue_id:
                return Response({"error": "Venue ID is required."}, status=status.HTTP_400_BAD_REQUEST)

            
            booking = Booking.objects.filter(user=user, venue_id=venue_id, status_booking=3).order_by('-check_out').first()

            if not booking:
                return Response({"error": "No completed booking found for this venue."}, status=status.HTTP_400_BAD_REQUEST)

            # Ensure timezone-aware datetime comparison
            zones = pytz.timezone("Asia/Jakarta")
            current_time = datetime.now(zones)

            if booking.check_out >= current_time:
                return Response({"error": "Cannot proceed, checkout time has not passed yet."}, status=status.HTTP_400_BAD_REQUEST)

            # Proceed with creating the review
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=user, venue_id=venue_id)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # if bookings.exists():
        #     expired_bookings = bookings.filter(checkout__lt=now)

        #     if expired_bookings.exists():
        #         return Response(
        #             {"error": "Cannot proceed, checkout time has already passed"},
        #             status=status.HTTP_400_BAD_REQUEST,
        #         )
        #     return Response(
        #         {"message": "User has an active booking"},
        #         status=status.HTTP_200_OK,
        #     )
        # else:
        #     return Response(
        #         {"error": "No booking found for this user"},
        #         status=status.HTTP_404_NOT_FOUND,
        #     )

class NotificationViewset(viewsets.ModelViewSet):
    queryset = Notifications.objects.all()
    serializer_class = NotificationSerializer