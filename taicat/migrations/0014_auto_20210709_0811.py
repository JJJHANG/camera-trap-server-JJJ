# Generated by Django 3.2.2 on 2021-07-09 08:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('taicat', '0013_auto_20210709_0806'),
    ]

    operations = [
        migrations.AddField(
            model_name='contact',
            name='orcid',
            field=models.CharField(blank=True, max_length=1000, null=True),
        ),
        migrations.AlterField(
            model_name='contact',
            name='email',
            field=models.CharField(blank=True, max_length=1000, null=True),
        ),
    ]