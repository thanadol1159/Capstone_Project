# Generated by Django 4.2.16 on 2025-02-07 20:26

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('event', '0034_eventofvenue_venue_request_alter_eventofvenue_venue'),
    ]

    operations = [
        migrations.AddField(
            model_name='review',
            name='review_image',
            field=models.FileField(blank=True, null=True, upload_to='images/reviews/'),
        ),
        migrations.AddField(
            model_name='userdetail',
            name='role',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='event.role'),
        ),
        migrations.AlterField(
            model_name='venue',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='images/venue/'),
        ),
        migrations.AlterField(
            model_name='venue',
            name='personal_identification',
            field=models.FileField(blank=True, null=True, upload_to='pdfs/personal/'),
        ),
        migrations.AlterField(
            model_name='venue',
            name='venue_certification',
            field=models.FileField(blank=True, null=True, upload_to='pdfs/venue/'),
        ),
        migrations.AlterField(
            model_name='venuerequest',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='images/venue/'),
        ),
        migrations.AlterField(
            model_name='venuerequest',
            name='personal_identification',
            field=models.FileField(blank=True, null=True, upload_to='pdfs/personal/'),
        ),
        migrations.AlterField(
            model_name='venuerequest',
            name='venue_certification',
            field=models.FileField(blank=True, null=True, upload_to='pdfs/venue/'),
        ),
    ]
