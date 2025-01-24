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
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Account
from django.core.exceptions import ValidationError

from .models import (
    Role,
    Account,
    UserDetail,
    Venue,
    TypeOfVenue,
    VenueRequest,
    Booking,
    VenueApproval,
    CategoryOfEvent,
    EventOfVenue,
    StatusBooking,
    Review,
    Notifications,
)
from .serializers import (
    RoleSerializer,
    AccountSerializer,
    UserDetailSerializer,
    VenueSerializer,
    TypeOfvanueSerializer,
    VenueRequestSerializer,
    BookingSerializer,
    VenueApprovalSerializer,
    CategoryOfEventSerializer,
    EventOfVenueSerializer,
    StatusBookingSerializer,
    ReviewSerializer,
    NotificationSerializer,
)

# ViewSets define the view behavior.
class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    
class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]
    
def create(self, request, *args, **kwargs):
    username = request.data.get('username')  # ใช้ request.data แทน request.REQUEST
    password = request.data.get('password')
    
    # ตรวจสอบว่า username และ password ถูกส่งมาหรือไม่
    if not username or not password:
        return Response(
            {"error": "Username and password are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # ตรวจสอบว่า username ซ้ำหรือไม่
    if Account.objects.filter(username=username).exists() or User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # ตรวจสอบความยาว password
    if len(password) < 8:
        return Response(
            {"error": "Password must be at least 8 characters long"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # สร้าง Account และ User
        Account.objects.create(username=username, password=make_password(password))
        User.objects.create_user(username=username, password=password)
    except IntegrityError as e:
        # จัดการกรณีที่เกิดข้อผิดพลาดกับฐานข้อมูล
        return Response(
            {"error": "An error occurred while creating the account"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception as e:
        # จัดการข้อผิดพลาดอื่น ๆ
        return Response(
            {"error": f"Unexpected error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return Response(
        {"message": "Account and User created successfully!"},
        status=status.HTTP_201_CREATED
    )
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        try:
            account = Account.objects.get(username=user.username)
            token['account_id'] = account.id  
        except Account.DoesNotExist:
            token['account_id'] = None  # Or handle the case when the account is not found
        
        return token

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]
    
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
            account = Account.objects.get(username=request.user.username)
            venues = Venue.objects.filter(venue_owner=account)
            
            serializer = self.get_serializer(venues, many=True)
            return Response(serializer.data)
        
        except Account.DoesNotExist:
            return Response(
                {"error": "Account not found"}, 
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
            account = Account.objects.get(username=request.user.username)
            venues = Venue.objects.filter(venue_owner=account)
            
            serializer = self.get_serializer(venues, many=True)
            return Response(serializer.data)
        
        except Account.DoesNotExist:
            return Response(
                {"error": "Account not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        try:
            account = Account.objects.get(username=request.user.username)
            queryset = Booking.objects.filter(account=account)

            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        
        except Account.DoesNotExist:
            return Response(
                {"error": "Account not found"},
                status=status.HTTP_404_NOT_FOUND
            )

class VenueApprovalViewSet(viewsets.ModelViewSet):
    queryset = VenueApproval.objects.all()
    serializer_class = VenueApprovalSerializer

class CategoryOfEventViewSet(viewsets.ModelViewSet):
    queryset = CategoryOfEvent.objects.all()
    serializer_class = CategoryOfEventSerializer

class EventOfVenueViewSet(viewsets.ModelViewSet):
    queryset = EventOfVenue.objects.all()
    serializer_class = EventOfVenueSerializer

class StatusBookingViewSet(viewsets.ModelViewSet):
    queryset = StatusBooking.objects.all()
    serializer_class = StatusBookingSerializer

# class Home(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         content = {'message': 'Hello, World!'}
#         return Response(content)
    
# class SuperuserOnlyAPIView(APIView):
#     def get(self, request):
#         if request.user.is_superuser:
#             return Response({"message": "You are a superuser!"})
#         return Response({"message": "Access denied"}, status=403)

# class AccountLoginView(APIView):
#     def post(self, request):
#         serializer = AccountLoginSerializer(data=request.data)
#         if serializer.is_valid():
#             return Response(serializer.validated_data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

class NotificationViewset(viewsets.ModelViewSet):
    queryset = Notifications.objects.all()
    serializer_class = NotificationSerializer