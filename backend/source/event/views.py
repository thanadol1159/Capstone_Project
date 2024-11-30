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

from .models import (
    Role,
    Account,
    UserDetail,
    Permission,
    RoleHasPermission,
    Venue,
    TypeOfVenue,
    VenueRequest,
    Booking,
    VenueApproval,
    CategoryOfEvent,
    EvnetOfVenue,
    StatusBooking,
)
from .serializers import (
    RoleSerializer,
    AccountSerializer,
    UserDetailSerializer,
    PermissionSerializer,
    RoleHasPermissionSerializer,
    VenueSerializer,
    TypeOfvanueSerializer,
    VenueRequestSerializer,
    BookingSerializer,
    VenueApprovalSerializer,
    CategoryOfEventSerializer,
    EvnetOfVenueSerializer,
    StatusBookingSerializer,
    # AccountLoginSerializer,
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

    def post(self, request, *args, **kwargs):
        # Receive data from Request
        username = request.data.get('username')
        password = request.data.get('password')

        # Validate input
        if not username or not password:
            return Response(
                {"error": "Username and password are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if username already exists
        if Account.objects.filter(username=username).exists() or User.objects.filter(username=username).exists():
            return Response(
                {"error": "Username already exists"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create Account
        account = Account.objects.create(username=username, password=password)

        # Create User 
        user = User.objects.create(username=username)
        user.set_password(password)
        user.save()

        return Response(
            {"message": "Account and User created successfully!"}, 
            status=status.HTTP_201_CREATED
        )

# class RegisterView(APIView):
#     def post(self, request, *args, **kwargs):
#         username = request.data.get('username')
#         password = request.data.get('password')

#         if not username or not password:
#             return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

#         if Account.objects.filter(username=username).exists():
#             return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

#         # สร้าง Account และ User
#         hashed_password = make_password(password)  # Hash password ก่อนเก็บ
#         account = Account.objects.create(username=username, password=hashed_password)
#         User.objects.create_user(username=account.username, password=password)

#         return Response({"message": "Account created successfully"}, status=status.HTTP_201_CREATED)

class UserDetailViewSet(viewsets.ModelViewSet):
    queryset = UserDetail.objects.all()
    serializer_class = UserDetailSerializer

class PermissionViewSet(viewsets.ModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer

class RoleHasPermissionViewSet(viewsets.ModelViewSet):
    queryset = RoleHasPermission.objects.all()
    serializer_class = RoleHasPermissionSerializer

class VenueViewSet(viewsets.ModelViewSet):
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer

class TypeOfvanueViewSet(viewsets.ModelViewSet):
    queryset = TypeOfVenue.objects.all()
    serializer_class = TypeOfvanueSerializer

class VenueRequestViewSet(viewsets.ModelViewSet):
    queryset = VenueRequest.objects.all()
    serializer_class = VenueRequestSerializer

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

class VenueApprovalViewSet(viewsets.ModelViewSet):
    queryset = VenueApproval.objects.all()
    serializer_class = VenueApprovalSerializer

class CategoryOfEventViewSet(viewsets.ModelViewSet):
    queryset = CategoryOfEvent.objects.all()
    serializer_class = CategoryOfEventSerializer

class EvnetOfVenueViewSet(viewsets.ModelViewSet):
    queryset = EvnetOfVenue.objects.all()
    serializer_class = EvnetOfVenueSerializer

class StatusBookingViewSet(viewsets.ModelViewSet):
    queryset = StatusBooking.objects.all()
    serializer_class = StatusBookingSerializer

class Home(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        content = {'message': 'Hello, World!'}
        return Response(content)
    
class SuperuserOnlyAPIView(APIView):
    def get(self, request):
        if request.user.is_superuser:
            return Response({"message": "You are a superuser!"})
        return Response({"message": "Access denied"}, status=403)

# class AccountLoginView(APIView):
#     def post(self, request):
#         serializer = AccountLoginSerializer(data=request.data)
#         if serializer.is_valid():
#             return Response(serializer.validated_data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)