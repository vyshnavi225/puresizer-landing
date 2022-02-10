"""
this module defines a class with all the strings used in the project.
"""
import json
import os


class Constants(object):

    # My vars - identity
    PASSWORD = 'password'
    ROLE = 'role'
    USERNAME = 'username'
    USER = "user"
    ADMIN = "admin"
    LOCAL = "local"
    OKTA = "okta"
    PURESTORAGE = 'purestorage'
    PLATFORM = "platform"
    EMAIL = "user_email"
    APP_ACCESS = "app_access"

    # My vars - authentication
    ACCESS_TOKEN = "access_token"
    ID_TOKEN = "id_token"
    USER_DATA = "user_data"
    ACTIVE = "active"
    CODE = "code"
    STATE = "state"
    EXPIRES_IN = "expires_in"
    HASH = "hash"
    ISS = "iss"

    # My vars - return key

    # My vars - ops
    ADD = "add"
    CHANGE = "change"
    ACCESS = "access"
    DELETE = "delete"

    # Apps
    FR_SIZER = 'fr-sizer'
    FA_SIZER = 'fa-sizer'
    FB_SIZER = 'fb-sizer'
