from rest_framework import serializers
from .models import AuctionBid, Player, activePlayer, User, ranNum
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class ranNumSerializer(serializers.ModelSerializer):
    class Meta:
        model = ranNum
        fields = '__all__'


class AuctionBidSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuctionBid
        fields = '__all__'


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'


class activePlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = activePlayer
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'userbudget', 'is_staff',
                  'accessGroup', 'is_active', 'date_joined', 'password']


class CrtUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'userbudget', 'is_staff',
                  'accessGroup', 'is_active', 'date_joined', 'password']


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['userbudget'] = user.userbudget
        token['accessGroup'] = user.accessGroup

        return token
