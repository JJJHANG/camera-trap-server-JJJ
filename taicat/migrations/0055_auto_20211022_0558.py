# Generated by Django 3.2.8 on 2021-10-22 05:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('taicat', '0054_alter_homepagestat_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='image',
            name='created',
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
        migrations.AlterField(
            model_name='image',
            name='datetime',
            field=models.DateTimeField(db_index=True, null=True),
        ),
    ]
