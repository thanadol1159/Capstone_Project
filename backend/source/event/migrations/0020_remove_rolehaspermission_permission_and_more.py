# Generated by Django 4.2.16 on 2025-01-19 17:48

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('event', '0019_account_email'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='rolehaspermission',
            name='permission',
        ),
        migrations.RemoveField(
            model_name='rolehaspermission',
            name='role',
        ),
        migrations.AddField(
            model_name='account',
            name='role',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='event.role'),
        ),
        migrations.DeleteModel(
            name='Permission',
        ),
        migrations.DeleteModel(
            name='RoleHasPermission',
        ),
    ]
