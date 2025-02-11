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

        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            getIdUser =  serializer.data
            print("created new user")
            print(getIdUser.get_id())
            # UserDetail.objects.filter(username=request.data.get('username')).update(
            #     user=User.objects.get(username=request.data.get('username'))
            # )

            return Response(
                {"message": "User created successfully!", "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request, *args, **kwargs):
        users = User.objects.all()  
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserDetailViewSet(viewsets.ModelViewSet):
    queryset = UserDetail.objects.all()
    serializer_class = UserDetailSerializer

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
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        try:
            user = User.objects.get(username=request.user.username)
            queryset = Booking.objects.filter(user=user)

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


        # checkout_bookings = bookings.checkout
        zones = pytz.timezone("Asia/Jakarta")
        currentDateAndTime = datetime.now(zones)
        current_time = currentDateAndTime.strftime("%H:%M:%S")
        # bkk =  pytz("Thailand/Bang_kok")
        # booking = request.data.get('booking')
        booking  =  Booking.objects.filter(id=1)
        booking_status = booking[0].status_booking.status
        booking_Time =  booking[0].check_out
        print(booking_Time)
        print(booking_status)
        print(currentDateAndTime)
        # change status of booking

        if booking_Time <  currentDateAndTime and booking_status == "approved":
            return  Response(
                {"message": "User has an active booking"},
                status=status.HTTP_200_OK,
            )
        else:
             return Response(
                    {"error": "Cannot proceed, checkout time was not past current date"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
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