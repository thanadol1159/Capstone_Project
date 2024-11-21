"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
from event.views import (
    RoleViewSet,
    AccountViewSet,
    UserDetailViewSet,
    PermissionViewSet,
    RoleHasPermissionViewSet,
    VenueViewSet,
    TypeOfvanueViewSet,
    VenueRequestViewSet,
    BookingViewSet,
    VenueApprovalViewSet,
    CategoryOfEventViewSet,
    EvnetOfVenueViewSet,
    Home,
)

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'roles', RoleViewSet)
router.register(r'accounts', AccountViewSet)
router.register(r'user-details', UserDetailViewSet)
router.register(r'permissions', PermissionViewSet)
router.register(r'role-has-permissions', RoleHasPermissionViewSet)
router.register(r'venues', VenueViewSet)
router.register(r'types-of-venue', TypeOfvanueViewSet)
router.register(r'venue-requests', VenueRequestViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'venue-approvals', VenueApprovalViewSet)
router.register(r'categories-of-event', CategoryOfEventViewSet)
router.register(r'event-of-venues', EvnetOfVenueViewSet)

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),   
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
