# Generated by Django 4.2.16 on 2025-02-03 16:58

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('event', '0032_review_booking_venuerequest'),
    ]

    operations = [
        migrations.AddField(
            model_name='venuerequest',
            name='venue',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='event.venue'),
        ),
    ]
