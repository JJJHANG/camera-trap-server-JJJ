# Generated by Django 4.0.4 on 2023-08-30 01:58

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0015_alter_uploadhistory_status'),
    ]

    operations = [
        migrations.RenameField(
            model_name='announcement',
            old_name='mod_date',
            new_name='last_updated',
        ),
    ]