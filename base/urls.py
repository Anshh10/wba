from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('bids/', views.auction_bids, name='Auction Bids'),
    path('player-bids/<str:player_id>', views.player_bids, name='Player Bids'),
    # path('bid/<str:id>/', views.getProduct, name='product'),

    path('user/create/', views.crtUsers.as_view(), name='users-create'),
    path('user/players/', views.getUsers, name='users-players'),
    path('login/jwt-token/', views.MyTokenObtainPairView.as_view(),
         name='token_obtain_pair'),
    path('login/jwt-token/refresh/',
         TokenRefreshView.as_view(), name='token_refresh'),

    path('players/', views.getPlayers, name='All Players'),
    path('player/<str:id>/', views.getPlayer, name='Player'),

    path('active-player/<str:id>/', views.getactivePlayer, name='Active Player'),

]
