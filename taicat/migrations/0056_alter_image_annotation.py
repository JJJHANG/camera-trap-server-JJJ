# Generated by Django 3.2.8 on 2021-10-22 06:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('taicat', '0055_auto_20211022_0558'),
    ]

    operations = [
        migrations.AlterField(
            model_name='image',
            name='annotation',
            field=models.JSONField(blank=True, db_index=True, default=dict),
        ),
    ]
