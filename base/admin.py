from django.contrib import admin
from .models import Player, AuctionBid, activePlayer, User, ranNum
from django.contrib.auth.admin import UserAdmin


class UserAdminConfig(UserAdmin):
    fieldsets = (
        (None, {'fields': (
         'email', 'userbudget', 'accessGroup', 'password',)}),
        ('Permissions', {
         'fields': ('is_staff', 'is_active', 'is_superuser')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email',  'password1', 'password2', 'email', 'userbudget', 'accessGroup',
                       'is_staff', 'is_active', 'is_superuser',)}),
    )

    search_fields = ('email',
                     'accessGroup',)
    list_filter = ('accessGroup', )
    ordering = ('-email', )
    list_display = ('email',)


class BidResponseAdmin(admin.ModelAdmin):
    # Fields to display in the list view
    list_display = ('teamname', 'amount', 'player_id')
    search_fields = ('player_id', 'id')  # Fields to search for responses


admin.site.register(User, UserAdminConfig)
admin.site.register(Player)
admin.site.register(AuctionBid, BidResponseAdmin)
admin.site.register(activePlayer)
admin.site.register(ranNum)
