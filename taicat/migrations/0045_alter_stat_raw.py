# Generated by Django 3.2.8 on 2021-10-19 08:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('taicat', '0044_stat_raw'),
    ]

    operations = [
        migrations.AlterField(
            model_name='stat',
            name='raw',
            field=models.JSONField(blank=True, null=True),
        ),
    ]
