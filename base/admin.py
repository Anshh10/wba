from django.contrib import admin
from .models import Player, AuctionBid, activePlayer, User
from django.contrib.auth.admin import UserAdmin


class UserAdminConfig(UserAdmin):
    fieldsets = (
        (None, {'fields': ('email',
         'username', 'userbudget', 'accessGroup', 'password',)}),
        ('Permissions', {
         'fields': ('is_staff', 'is_active', 'is_superuser')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email',  'password1', 'password2', 'username', 'userbudget', 'accessGroup',
                       'is_staff', 'is_active', 'is_superuser',)}),
    )

    search_fields = ('email', 'username',
                     'accessGroup',)
    list_filter = ('accessGroup', )
    ordering = ('-username', )
    list_display = ('username', 'email', )


admin.site.register(User, UserAdminConfig)
admin.site.register(Player)
admin.site.register(AuctionBid)
admin.site.register(activePlayer)
