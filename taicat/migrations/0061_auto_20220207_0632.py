# Generated by Django 3.2.10 on 2022-02-07 06:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('taicat', '0060_rename_folder_path_image_file_path'),
    ]

    operations = [
        migrations.AddField(
            model_name='image',
            name='antler',
            field=models.CharField(blank=True, default='', max_length=1000, null=True),
        ),
        migrations.AddField(
            model_name='image',
            name='image_uuid',
            field=models.CharField(blank=True, db_index=True, default='', max_length=1000, null=True),
        ),
        migrations.AddField(
            model_name='image',
            name='remarks2',
            field=models.JSONField(blank=True, default=dict, null=True),
        ),
        migrations.AddField(
            model_name='image_info',
            name='image_uuid',
            field=models.CharField(blank=True, default='', max_length=1000, null=True),
        ),
        migrations.AlterField(
            model_name='image',
            name='animal_id',
            field=models.CharField(blank=True, default='', max_length=1000, null=True),
        ),
        migrations.AlterField(
            model_name='image',
            name='life_stage',
            field=models.CharField(blank=True, default='', max_length=1000, null=True),
        ),
        migrations.AlterField(
            model_name='image',
            name='remarks',
            field=models.TextField(blank=True, default='', null=True),
        ),
        migrations.AlterField(
            model_name='image',
            name='sex',
            field=models.CharField(blank=True, default='', max_length=1000, null=True),
        ),
        migrations.AlterField(
            model_name='image',
            name='species',
            field=models.CharField(blank=True, default='', max_length=1000, null=True),
        ),
    ]