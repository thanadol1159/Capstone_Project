# Generated by Django 4.2.16 on 2025-03-17 02:59

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('event', '0065_alter_venuerequestimage_venue_request'),
    ]

    operations = [
        migrations.AlterField(
            model_name='venuerequestimage',
            name='image',
            field=models.ImageField(upload_to='images/venues_request/'),
        ),
        migrations.AlterField(
            model_name='venuerequestimage',
            name='venue_request',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='event.venuerequest'),
        ),
    ]
