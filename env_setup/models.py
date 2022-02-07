from django.db import models

# Create your models here.


class User(models.Model):
    username = models.TextField(default='')
    user_email = models.TextField(default='')
    first_name = models.TextField(default='')
    last_name = models.TextField(default='')
    last_update_time = models.DateTimeField(null=True, blank=True)
    password = models.TextField(default='')
    access_token = models.TextField(default='')
    id_token = models.TextField(default='')
    expire_time = models.DateTimeField(null=True, blank=True)
    role = models.TextField(default='')
    last_login_time = models.DateTimeField(null=True, blank=True)
    platform = models.TextField(default='')
    accepted_time = models.DateTimeField(null=True)

    class Meta:
        db_table = 'users'


class AppAccess(models.Model):
    username = models.TextField(default='')
    app = models.TextField(default='')
    app_role = models.TextField(default='')

    class Meta:
        db_table = 'app_access'


class DevParams(models.Model):
    params = models.TextField(default='')
    code_verifier = models.TextField(default='')

    class Meta:
        db_table = 'dev_params'
