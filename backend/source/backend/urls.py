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
from event.views import get_ml_prediction 
from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from event.views import (
    RoleViewSet,
    UserDetailViewSet,
    UserViewSet,
    VenueViewSet,
    TypeOfvanueViewSet,
    VenueRequestViewSet,
    BookingViewSet,
    EventOfVenueViewSet,
    StatusBookingViewSet,
    ReviewViewSet,
    NotificationViewset,
    CustomTokenObtainPairView,
    FavoriteVenueViewSet,
    VenueCategoryViewSet,
    VenueRequestCategoryViewSet,
    # InterestedViewSet,
)

from event.views import export_venues_to_csv

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'roles', RoleViewSet)
router.register(r'user-details', UserDetailViewSet)
router.register(r'users', UserViewSet, basename='user')
router.register(r'venues', VenueViewSet)
router.register(r'types-of-venue', TypeOfvanueViewSet)
router.register(r'venue-requests', VenueRequestViewSet)
router.register(r'bookings', BookingViewSet)
# router.register(r'venue-approvals', VenueApprovalViewSet)
# router.register(r'categories-of-event', CategoryOfEventViewSet)
router.register(r'event-of-venues', EventOfVenueViewSet)
router.register(r'status-bookings', StatusBookingViewSet, basename='status-booking')
router.register(r'reviews',ReviewViewSet)
router.register(r'notifications',NotificationViewset)
router.register(r'favorites', FavoriteVenueViewSet, basename='favorite')
router.register(r'venue-categories', VenueCategoryViewSet, basename='venue-category')
router.register(r'venue-request-categories', VenueRequestCategoryViewSet, basename='venue-request-category')
# router.register(r'interested', InterestedViewSet, basename='interested')


schema_view = get_schema_view(
    openapi.Info(
        title='',
        default_version='v1',
        description="API documentation with Swagger UI",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)
# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('api/', include(router.urls)),
    path('admin/', admin.site.urls),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),   
    re_path(r'^swagger/$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    re_path(r'^redoc/$', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('ml-predict/', get_ml_prediction, name='ml_predict'),
    path('export-venues/', export_venues_to_csv, name='export_venues'),
    # path('api/tokens/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    # path('api/tokens/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
