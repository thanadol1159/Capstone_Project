from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Account

@receiver(post_save, sender=Account)
def create_user_for_account(sender, instance, created, **kwargs):
    if created:
        user = User.objects.create(username=instance.username)
        user.set_password(instance.password)
        user.save()
