from django.utils import timezone
from datetime import timedelta
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import AuctionBid, Player, User, activePlayer, ranNum
from .serializers import AuctionBidSerializer, PlayerSerializer, activePlayerSerializer, UserSerializer, CrtUserSerializer, MyTokenObtainPairSerializer, ranNumSerializer
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView


@api_view(['GET'])
def getUsers(request):
    if request.method == 'GET':
        user = User.objects.all()
        serializer = UserSerializer(user, many=True)

        return Response(serializer.data)


class crtUsers(APIView):
    def post(self, request):
        serializer = CrtUserSerializer(data=request.data, many=True)
        if serializer.is_valid():
            for user_data in serializer.validated_data:
                password = user_data.get('password')
                user_data['password'] = make_password(password)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def getUser(request, pk):
    try:
        response = User.objects.get(id=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = UserSerializer(response, many=False)
        return Response(serializer.data)

    if request.method == 'DELETE':
        response.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    elif request.method == 'PUT':
        try:
            user = User.objects.get(id=pk)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserSerializer(user, data=request.data)

        if serializer.is_valid():
            # Update user details
            serializer.save()

            # Update password if provided in the request
            password = request.data.get('contactNumber')
            if password:
                user.set_password(password)
                user.save()

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


@api_view(['GET', 'POST'])
def auction_bids(request):
    if request.method == 'GET':
        # Retrieve all auction bids
        bids = AuctionBid.objects.all()
        serializer = AuctionBidSerializer(bids, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = AuctionBidSerializer(data=request.data)
        if serializer.is_valid():
            bid = serializer.save()
            bid.lock_timestamp = timezone.now()  # Update the lock timestamp
            bid.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def player_bids(request, player_id):
    response = AuctionBid.objects.filter(player_id=player_id)
    serializer = AuctionBidSerializer(response, many=True)

    return Response(serializer.data)


@api_view(['GET', 'POST'])
def getPlayers(request):
    if request.method == 'GET':
        response = Player.objects.all()
        serializer = PlayerSerializer(response, many=True)

        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = PlayerSerializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT'])
def getPlayer(request, id):
    if request.method == 'GET':
        response = Player.objects.get(id=id)
        serializer = PlayerSerializer(response, many=False)

        return Response(serializer.data)

    elif request.method == 'PUT':
        response = Player.objects.get(id=id)
        serializer = PlayerSerializer(response, data=request.data)
        print(request.data)
        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
def getactivePlayers(request):
    if request.method == 'GET':
        response = activePlayer.objects.all()
        serializer = activePlayerSerializer(response, many=True)

        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = activePlayerSerializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT'])
def getactivePlayer(request, id):
    if request.method == 'GET':
        response = activePlayer.objects.get(id=id)
        serializer = activePlayerSerializer(response, many=False)

        return Response(serializer.data)

    elif request.method == 'PUT':
        response = activePlayer.objects.get(id=id)
        serializer = activePlayerSerializer(response, data=request.data)
        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
def getranNums(request):
    if request.method == 'GET':
        response = ranNum.objects.all()
        serializer = ranNumSerializer(response, many=True)

        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ranNumSerializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT'])
def getranNum(request, id):
    if request.method == 'GET':
        response = ranNum.objects.get(id=id)
        serializer = ranNumSerializer(response, many=False)

        return Response(serializer.data)

    elif request.method == 'PUT':
        response = ranNum.objects.get(id=id)
        serializer = ranNumSerializer(response, data=request.data)
        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# @api_view(['GET'])
# def getUser(request, pk):
#     try:
#         response = User.objects.get(id=pk)
#     except User.DoesNotExist:
#         return Response(status=status.HTTP_404_NOT_FOUND)

#     if request.method == 'GET':
#         serializer = UserSerializer(response, many=False)
#         return Response(serializer.data)
