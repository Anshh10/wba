from django.db import models

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import timedelta
# Create your models here.


class Player(models.Model):
    id = models.AutoField(primary_key=True, editable=False)
    name = models.CharField(max_length=50000, null=True, blank=True)
    role = models.CharField(max_length=50000, null=True, blank=True)
    BattingType = models.CharField(max_length=50000, null=True, blank=True)
    BattingInnings = models.CharField(max_length=50000, null=True, blank=True)
    BattingRuns = models.CharField(max_length=50000, null=True, blank=True)
    BallsFaced = models.CharField(max_length=50000, null=True, blank=True)
    NoDismissal = models.CharField(max_length=50000, null=True, blank=True)
    BattingAverage = models.CharField(max_length=50000, null=True, blank=True)
    BattingStrikeRate = models.CharField(
        max_length=50000, null=True, blank=True)
    Balls = models.CharField(max_length=50000, null=True, blank=True)
    BowlingType1 = models.CharField(max_length=50000, null=True, blank=True)
    BowlingType2 = models.CharField(max_length=50000, null=True, blank=True)
    RunsConceded = models.CharField(max_length=50000, null=True, blank=True)
    BowlingWickets = models.CharField(max_length=50000, null=True, blank=True)
    BowlingAverage = models.CharField(max_length=50000, null=True, blank=True)
    BowlingEconomy = models.CharField(max_length=50000, null=True, blank=True)
    BowlingStrikeRate = models.CharField(
        max_length=50000, null=True, blank=True)
    Stumping = models.CharField(max_length=50000, null=True, blank=True)
    basePrice = models.CharField(max_length=50000, null=True, blank=True)
    nationality = models.CharField(max_length=50000, null=True, blank=True)
    image = models.CharField(max_length=50000, null=True, blank=True)
    amt = models.CharField(max_length=50000, null=True, blank=True)
    assignedTo = models.CharField(max_length=50000, null=True, blank=True)

    def __str__(self):
        return str(self.id) + " " + self.name


class CustomUserManager(BaseUserManager):

    def create_user(self, email, password=None, **other_fields):
        if not email:
            raise ValueError('Email must be provided')

        if not password:
            raise ValueError('Password must be provided')

        email = self.normalize_email(email)

        user = self.model(
            email=email,
            **other_fields
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email,  password=None, **other_fields):
        other_fields.setdefault('is_staff', True)
        other_fields.setdefault('is_superuser', True)
        other_fields.setdefault('is_active', True)
        other_fields.setdefault('accessGroup', 'admin')

        if other_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True')

        if other_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True')

        return self.create_user(
            email=email,
            password=password,
            **other_fields
        )


class User(AbstractBaseUser, PermissionsMixin):
    id = models.AutoField(primary_key=True, editable=False)

    email = models.EmailField('email address', unique=True)
    accessGroup = models.CharField(max_length=500, null=True, blank=True)
    userbudget = models.CharField(max_length=2000, null=True, blank=True)

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []   # email + password only


class AuctionBid(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.CharField(max_length=2550, null=True, blank=True)
    player_id = models.CharField(max_length=2550, null=True, blank=True)
    teamname = models.CharField(max_length=2550, null=True, blank=True)
    lock_timestamp = models.DateTimeField(null=True, blank=True)

    def is_locked(self):
        if self.lock_timestamp:
            return (timezone.now() - self.lock_timestamp) < timedelta(seconds=5)
        return False


class ranNum(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True)
    num = models.CharField(max_length=2550, null=True, blank=True)


class activePlayer(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True)
    activePlayer_id = models.OneToOneField(
        Player, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return str(self.activePlayer_id)
