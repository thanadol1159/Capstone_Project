# Generated by Django 4.2.20 on 2025-03-30 07:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('event', '0073_interested_remove_eventofvenue_categoryofevent_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='userdetail',
            name='interested',
            field=models.JSONField(blank=True, default=list, null=True),
        ),
        migrations.DeleteModel(
            name='Interested',
        ),
    ]
