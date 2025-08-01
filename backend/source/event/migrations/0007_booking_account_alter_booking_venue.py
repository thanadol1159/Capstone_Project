# Generated by Django 4.2.16 on 2024-11-25 18:11

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('event', '0006_remove_booking_account'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='account',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='event.account'),
        ),
        migrations.AlterField(
            model_name='booking',
            name='venue',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='event.venue'),
        ),
    ]
