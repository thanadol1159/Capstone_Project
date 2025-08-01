# Generated by Django 4.2.16 on 2025-02-17 11:17

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('event', '0047_remove_eventofvenue_categoryofevent_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Booking',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('check_in', models.DateTimeField(blank=True, null=True)),
                ('check_out', models.DateTimeField(blank=True, null=True)),
                ('total_price', models.IntegerField(blank=True, null=True)),
                ('isReview', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='CategoryOfEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category_name', models.CharField(max_length=45)),
                ('category_detail', models.CharField(max_length=45)),
            ],
        ),
        migrations.CreateModel(
            name='Review',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reviewDetail', models.TextField()),
                ('createAt', models.DateTimeField()),
                ('point', models.IntegerField()),
                ('booking', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='event.booking')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Role',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role_name', models.CharField(max_length=45)),
                ('description', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='StatusBooking',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(max_length=25, null=True)),
                ('description', models.TextField(null=True)),
            ],
        ),
        migrations.CreateModel(
            name='TypeOfVenue',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type_name', models.CharField(max_length=45, null=True)),
                ('type_description', models.CharField(max_length=45, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Venue',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('venue_name', models.CharField(blank=True, max_length=50, null=True)),
                ('image', models.ImageField(blank=True, null=True, upload_to='images/venue/')),
                ('location', models.CharField(blank=True, max_length=100, null=True)),
                ('category_event', models.CharField(blank=True, max_length=50, null=True)),
                ('price', models.IntegerField(blank=True, null=True)),
                ('area_size', models.CharField(blank=True, max_length=50, null=True)),
                ('capacity', models.IntegerField(blank=True, null=True)),
                ('number_of_rooms', models.IntegerField(blank=True, null=True)),
                ('parking_space', models.IntegerField(blank=True, null=True)),
                ('outdoor_spaces', models.IntegerField(blank=True, null=True)),
                ('additional_information', models.TextField(blank=True, null=True)),
                ('venue_certification', models.FileField(blank=True, null=True, upload_to='pdfs/venue/')),
                ('personal_identification', models.FileField(blank=True, null=True, upload_to='pdfs/personal/')),
                ('status', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='event.statusbooking')),
                ('venue_owner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('venue_type', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='event.typeofvenue')),
            ],
        ),
        migrations.CreateModel(
            name='VenueRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('venue_name', models.CharField(blank=True, max_length=50, null=True)),
                ('image', models.ImageField(blank=True, null=True, upload_to='images/venue/')),
                ('location', models.CharField(blank=True, max_length=100, null=True)),
                ('category_event', models.CharField(blank=True, max_length=50, null=True)),
                ('price', models.IntegerField(blank=True, null=True)),
                ('area_size', models.CharField(blank=True, max_length=50, null=True)),
                ('capacity', models.IntegerField(blank=True, null=True)),
                ('number_of_rooms', models.IntegerField(blank=True, null=True)),
                ('parking_space', models.IntegerField(blank=True, null=True)),
                ('outdoor_spaces', models.IntegerField(blank=True, null=True)),
                ('additional_information', models.TextField(blank=True, null=True)),
                ('venue_certification', models.FileField(blank=True, null=True, upload_to='pdfs/venue/')),
                ('personal_identification', models.FileField(blank=True, null=True, upload_to='pdfs/personal/')),
                ('status', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='event.statusbooking')),
                ('venue', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='event.venue')),
                ('venue_owner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('venue_type', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='event.typeofvenue')),
            ],
        ),
        migrations.CreateModel(
            name='UserDetail',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(blank=True, max_length=30, null=True)),
                ('last_name', models.CharField(blank=True, max_length=30, null=True)),
                ('phone_number', models.CharField(blank=True, max_length=10, null=True)),
                ('email', models.EmailField(blank=True, max_length=45, null=True)),
                ('province', models.CharField(blank=True, max_length=45, null=True)),
                ('district', models.CharField(blank=True, max_length=45, null=True)),
                ('sub_district', models.CharField(blank=True, max_length=45, null=True)),
                ('address', models.CharField(blank=True, max_length=255, null=True)),
                ('dob', models.DateField(blank=True, null=True)),
                ('role', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='event.role')),
                ('user', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='userdetail', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='ReviewImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='images/reviews/')),
                ('review', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='event.review')),
            ],
        ),
        migrations.AddField(
            model_name='review',
            name='venue',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='event.venue'),
        ),
        migrations.CreateModel(
            name='Notifications',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('notifications_type', models.CharField(max_length=45)),
                ('create_at', models.DateTimeField()),
                ('message', models.TextField(blank=True, null=True)),
                ('isRead', models.BooleanField(default=False)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='EventOfVenue',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('CategoryOfEvent', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='event.categoryofevent')),
                ('venue', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='event.venue')),
                ('venue_request', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='event.venuerequest')),
            ],
        ),
        migrations.AddField(
            model_name='booking',
            name='status_booking',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='event.statusbooking'),
        ),
        migrations.AddField(
            model_name='booking',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='booking',
            name='venue',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='event.venue'),
        ),
        migrations.CreateModel(
            name='FavoriteVenue',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='favorite_venues', to=settings.AUTH_USER_MODEL)),
                ('venue', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='favorited_by', to='event.venue')),
            ],
            options={
                'unique_together': {('user', 'venue')},
            },
        ),
    ]
