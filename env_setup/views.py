import configparser
import json
import re
import uuid
from datetime import datetime, timedelta
from logging import getLogger
from os import path

from django.conf import settings
from django.core import signing
from django.core.exceptions import ObjectDoesNotExist
from django.forms.models import model_to_dict
from django.http import HttpResponse, HttpResponseRedirect
from rest_framework import status
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView

import env_setup.utils as utils
from sizer import settings
from env_setup.exception import TokenExpired, ValidationError
from .constants import Constants
from .models import User, AppAccess
from .serializer import AppAccessSerializer

logger = getLogger(__name__)
config = configparser.ConfigParser()
config.read(path.join(settings.BASE_DIR, 'sizer/config.ini'))
version = config.get('VERSION', 'SIZING_TOOL')


# APP_URL = settings.APP_URL
# CLIENT_ID = settings.CLIENT_ID
# REDIRECT_URL = settings.REDIRECT_URL
# CLIENT_SECRET = settings.CLIENT_SECRET
# # random_hash = binascii.hexlify(os.urandom(16))
# POST_URL = '{0}/authorize?client_id={1}&response_type=' \
#            'code&scope=openid&redirect_uri={2}&state=state-' \
#     .format(APP_URL, CLIENT_ID, REDIRECT_URL)


def update_local_user(user, token, seconds):
    """
    update user when the okta user first logged in
    :param user: user object, exist user in database
    :param token: string, generate locally
    :param seconds: integer, return value from okta end
    :return user: user_obj
    """
    user.access_token = token
    user.last_login_time = datetime.utcnow()
    user.expire_time = datetime.utcnow() + timedelta(seconds=seconds)
    user.save()
    return user


def update_okta_user(user, access_token, seconds):
    """
    update okta user when the okta logged in
    :param user: user object, exist user in database
    :param access_token: string, return value from okta end
    :param seconds: integer, return value from okta end
    :return user: user object
    """
    user.last_login_time = datetime.utcnow()
    user.expire_time = datetime.utcnow() + timedelta(seconds=seconds)
    user.access_token = access_token
    return user


def create_okta_user(username, access_token, id_token, seconds):
    """
    Create okta user when the okta user first logged in
    :param username: string, return value from okta end
    :param access_token: string, return value from okta end
    :param id_token: string, return value from okta end
    :param seconds: integer, return value from okta end
    :return user: user object
    """
    user = User()
    user.username = username
    user.access_token = access_token
    user.last_login_time = datetime.utcnow()
    user.last_update_time = datetime.utcnow()
    user.expire_time = datetime.utcnow() + timedelta(seconds=seconds)
    user.id_token = id_token
    user.platform = Constants.OKTA
    user.role = Constants.USER
    return user


class BaseView(APIView):

    def __init__(self):

        super().__init__()
        self.username = 'default'
        self.role = 'user'
        self.platform = Constants.LOCAL
        self.user_email = 'user@purestorage.com'

    def dispatch(self, request, *args, **kwargs):
        # if settings.LOGIN_EXEMPT_URLS
        request_path = request.path_info.lstrip('/')
        exempts = []
        for url in settings.LOGIN_EXEMPT_URLS:
            exempts.append(re.match(url, request_path))
        if not any(exempts):
            self.user_validator(request.COOKIES.get('user_data', None))
        return super(BaseView, self).dispatch(request, *args, **kwargs)

    def user_validator(self, user_data):

        if settings.DEV_SIZER:
            self.username = 'admin'
            self.role = 'admin'
            self.platform = 'local'
            self.user_email = 'admin@purestorage.com'

        elif not user_data:
            raise TokenExpired

        else:
            user_data = signing.loads(user_data)
            token = user_data[Constants.ACCESS_TOKEN]
            username = user_data[Constants.USERNAME]

            if user_data[Constants.PLATFORM] == Constants.OKTA:

                try:
                    user = User.objects.get(username=username, platform=Constants.OKTA)
                    if (datetime.now(user.expire_time.tzinfo) - user.expire_time).total_seconds() > 0:
                        raise TokenExpired

                except ObjectDoesNotExist as ex:
                    raise TokenExpired from ex

                token_valid_res = utils.validate_token(token)

                if not token_valid_res.json().get(Constants.ACTIVE):
                    raise TokenExpired

            else:
                try:
                    # user = User.objects.filter(username=username, platform='local')
                    user = User.objects.get(username=username, platform=Constants.LOCAL)

                    if (datetime.now(user.expire_time.tzinfo) - user.expire_time).total_seconds() > 0:
                        raise TokenExpired

                except ObjectDoesNotExist as ex:
                    raise TokenExpired from ex

            self.username = user_data[Constants.USERNAME]
            self.role = user_data[Constants.ROLE]
            self.platform = user_data[Constants.PLATFORM]


# class LoginAuthView(APIView):
#     '''
#     return the redirect url for local login
#     '''

#     def get(self, request):
#         return Response({'redirect_url': 'localhost:8080'})


class OktaAuthView(APIView):
    """
    OKTA authentication APIs
    """

    def get(self, request):
        """
        Go through the okta check process and redirect user back to app tiles
        page if login successfully
        """
        if settings.DEV_SIZER:
            username = 'admin'
            access_token = 'abcd'
            id_token = 'wxyz'
            seconds = 60000
        else:
            if not request.GET.get(Constants.CODE, ''):
                dev_params, code_c = utils.save_dev_params()
                post_url = utils.construct_post_url(dev_params.params, code_c)
                logger.info('Code Detected:' + post_url)
                return HttpResponseRedirect(post_url)

            code = request.GET.get(Constants.CODE, '')
            state = request.GET.get(Constants.STATE, '')
            logger.info('Received state: ' + state)

            valid, code_v_ret = utils.check_state(state)

            if not valid:
                logger.info('State Check Failed')
                raise ValidationError(Constants.OKTA)

            auth_res = utils.get_token(code, code_v_ret)

            logger.info(auth_res.json())

            if not auth_res.json().get(Constants.ACCESS_TOKEN):
                logger.info('No Access Token Received')
                raise ValidationError(Constants.OKTA)

            access_token = auth_res.json()[Constants.ACCESS_TOKEN]
            id_token = auth_res.json()[Constants.ID_TOKEN]
            seconds = auth_res.json().get(Constants.EXPIRES_IN)

            token_valid_res = utils.validate_token(access_token)

            if not token_valid_res.json().get(Constants.ACTIVE):
                raise TokenExpired

            username = token_valid_res.json().get(Constants.USERNAME)

        try:
            user = User.objects.get(username=username, platform=Constants.OKTA)
            user = update_okta_user(user, access_token, seconds)

        except ObjectDoesNotExist:
            user = create_okta_user(username, access_token, id_token, seconds)

            # Give access to fa-sizer by default
            try:
                AppAccess.objects.get(username=username, app=Constants.FA_SIZER)
            except ObjectDoesNotExist as e:
                logger.error('No app access for user {}. Now provided.'.format(username))
                app_access = AppAccess.objects.create(username=username, app=Constants.FA_SIZER)
                app_access.save()

        logger.info(model_to_dict(user))
        user.save()

        user_data = {
            'username': user.username,
            'platform': user.platform,
            'access_token': user.access_token,
            'role': user.role,
        }

        response = HttpResponseRedirect('/landing-app/index.html')
        # response = HttpResponseRedirect('/index.html')
        response.set_cookie(Constants.USER_DATA, signing.dumps(user_data), httponly=True, max_age=60000)

        return response

    def post(self, request):
        """
        redirect user to okta login page
        """
        dev_params, code_c = utils.save_dev_params()
        post_url = utils.construct_post_url(dev_params.params, code_c)

        logger.info('Post URL: ' + post_url)

        return Response({'redirect_url': post_url})


class AuthZeroView(APIView):
    """
    AuthZero authentication APIs
    """

    def get(self, request):
        """
        Go through the AuthZero check process and redirect user back to app tiles
        page if login successfully
        """
        if settings.DEV_SIZER:
            username = 'admin'
            access_token = 'abcd'
            id_token = 'wxyz'
            seconds = 60000
        else:
            if not request.GET.get(Constants.CODE, ''):
                dev_params, code_c = utils.save_dev_params()
                authorize_url = utils.authzero_authorize_url(dev_params.params, code_c)
                logger.info('Code Detected:' + authorize_url)
                return HttpResponseRedirect(authorize_url)

            code = request.GET.get(Constants.CODE, '')
            state = request.GET.get(Constants.STATE, '')
            logger.info('Received state: ' + state)

            valid, code_v_ret = utils.check_state(state)

            if not valid:
                logger.info('State Check Failed')
                raise ValidationError(Constants.PURESTORAGE)

            token_response = utils.authzero_get_token(code, code_v_ret)

            logger.info('\n\n\nTOKEN JSON RESPONSE - ', token_response.json(), '\n\n\n')

            if not token_response.json().get(Constants.ACCESS_TOKEN):
                logger.info('No Access Token Received')
                raise ValidationError(Constants.PURESTORAGE)

            access_token = token_response.json()[Constants.ACCESS_TOKEN]
            id_token = token_response.json()[Constants.ID_TOKEN]
            seconds = token_response.json().get(Constants.EXPIRES_IN)

            # TODO - Introspect here
            introspect_response = utils.introspect_token(access_token)

            if not introspect_response.json().get(Constants.ACTIVE):
                raise TokenExpired

            username = introspect_response.json().get(Constants.USERNAME)

        try:
            user = User.objects.get(username=username, platform=Constants.OKTA)
            user = update_okta_user(user, access_token, seconds)

        except ObjectDoesNotExist:
            user = create_okta_user(username, access_token, id_token, seconds)

            # Give access to fa-sizer by default
            try:
                AppAccess.objects.get(username=username, app=Constants.FA_SIZER)
            except ObjectDoesNotExist as e:
                logger.error('No app access for user {}. Now provided.'.format(username))
                app_access = AppAccess.objects.create(username=username, app=Constants.FA_SIZER)
                app_access.save()

        logger.info(model_to_dict(user))
        user.save()

        user_data = {
            'username': user.username,
            'platform': user.platform,
            'access_token': user.access_token,
            'role': user.role,
        }

        response = HttpResponseRedirect('/landing-app/index.html')
        # response = HttpResponseRedirect('/index.html')
        response.set_cookie(Constants.USER_DATA, signing.dumps(user_data), httponly=True, max_age=60000)

        return response


class AppAccessAPI(BaseView):

    def get(self, request, *args, **kwargs):

        # user_data = request.COOKIES.get('user_data', None)
        # user_data = signing.loads(user_data)
        # Get the apps that the logged in user can access

        data = dict()

        data['username'] = self.username
        data['role'] = self.role
        data['platform'] = self.platform

        data['apps'] = list()

        for app_obj in AppAccess.objects.filter(username=self.username):
            data['apps'].append({
                'app_name': app_obj.app,
                'url': settings.APP_URLS[app_obj.app],
                'app_role': app_obj.app_role
            })

        return Response({'status': 'success',
                         'data': data}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        """
            This gives users access to particular app(s). Can be only performed by admins.
        """
        data = JSONParser().parse(request)

        if self.role != Constants.ADMIN:
            return Response({'status': 'error',
                             'error_msg': 'You cannot perform this operation.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = AppAccessSerializer(data=data)
        if not serializer.is_valid():
            return Response({'status': 'error',
                             'error_msg': 'Invalid data provided'}, status=status.HTTP_400_BAD_REQUEST)

        username = serializer.data['username']  # Username of the user to be given access to
        app = serializer.data['app']  # app

        try:
            User.objects.get(username=username)
        except ObjectDoesNotExist as e:
            logger.error(f'Username does not exist{e}')
            return Response({'status': 'error',
                             'error_msg': 'Username does not exist.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(AppAccess.objects.filter(username=username, app=app)) != 0:
            return Response({'status': 'error',
                             'error_msg': 'The user already has access to the app.'},
                            status=status.HTTP_400_BAD_REQUEST)

        app_access = AppAccess.objects.create(username=username, app=app)
        app_access.save()

        return Response({'status': 'success'}, status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):

        if self.role != Constants.ADMIN:
            Response({'status': 'error',
                      'error_msg': 'You cannot perform this operation.'}, status=status.HTTP_403_FORBIDDEN)

        data = dict()
        data['username'] = request.GET.get('username')
        data['app'] = request.GET.get('app')

        serializer = AppAccessSerializer(data=data)
        if not serializer.is_valid():
            return Response({'status': 'error',
                             'error_msg': 'Invalid data provided'}, status=status.HTTP_400_BAD_REQUEST)

        username = serializer.data['username']
        app = serializer.data['app']

        try:
            User.objects.get(username=username)
        except ObjectDoesNotExist as e:
            logger.error(f'Username does not exist{e}')
            return Response({'status': 'error',
                             'error_msg': 'Username does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        if len(AppAccess.objects.filter(username=username, app=app)) == 0:
            return Response({'status': 'error',
                             'error_msg': 'The user doesnt have access to the app.'},
                            status=status.HTTP_400_BAD_REQUEST)

        AppAccess.objects.filter(username=username, app=app).delete()

        return Response({'status': 'success'}, status=status.HTTP_200_OK)


class LoginAuthView(APIView):
    """
    return the redirect url for local login
    """

    def get(self, request):
        return Response(
            {'redirect_url': 'https://dev.salestools.purestorage.com/login.html'}
        )


class LocalAuthView(LoginAuthView):
    """
    local login APIs
    """

    @staticmethod
    def validate_user(username, password, platform):
        '''
        Validate whether user exist in database
        '''
        if not User.objects.filter(
                username=username, password=password, platform=platform
        ):
            return False, None
        return True, str(uuid.uuid4())

    def post(self, request):
        """
        Login through local database
        """
        if not request.data.get(Constants.USERNAME) or not request.data.get(
                Constants.PASSWORD
        ):
            return Response(
                {
                    'status': 'error',
                    'error_message': f'''field {Constants.USERNAME} or \
                        {Constants.PASSWORD} is missing''',
                }
            )

        content = request.data

        username = content[Constants.USERNAME]
        password = content[Constants.PASSWORD]
        valid, token = self.validate_user(username, password, Constants.LOCAL)
        if not valid:
            raise ValidationError(Constants.LOCAL)

        try:
            user_obj = User.objects.get(username=username, platform=Constants.LOCAL)

        except ObjectDoesNotExist as ex:
            raise ValidationError(Constants.LOCAL) from ex

        user_obj = update_local_user(user_obj, token, 3600)

        # get the apps that the user can access
        access_apps = [app.app for app in AppAccess.objects.filter(username=username)]

        user_data = {
            'username': user_obj.user_name,
            'platform': user_obj.platform,
            'access_token': user_obj.access_token,
            'role': user_obj.role,
        }
        response = HttpResponseRedirect('/landing/index.html')
        response.set_cookie(
            Constants.USER_DATA, json.dumps(user_data), httponly=True, max_age=60000
        )
        return response


class LogoutViews(APIView):
    """
    clear the browser cookie and redirect user to login page
    """

    def post(self, request):
        response = HttpResponseRedirect(settings.LOGOUT_REDIRECT_ADDR)
        response.delete_cookie(Constants.USER_DATA)
        return response


class GetVersion(BaseView):
    def get(self, _):
        return HttpResponse(version)


class GetUserDetail(BaseView):
    def get(self, _):
        return Response({'name': self.username,
                         'role': self.role,
                         'platform': self.platform}, status=status.HTTP_200_OK)

# class WorkloadDetail(BaseView):
#     def get(self, _):
#         return Response(
#             CohesityConstants.WORKLOAD_DETAIL, status=status.HTTP_200_OK
#         )


# class AcceptDisclaimer(BaseView):
#     def post(self, _):
#         user = User.objects.get(username=self.username, platform=self.platform)
#         user.accepted_time = datetime.utcnow()
#         user.save()
#         return Response(
#             {
#                 'name': self.username,
#                 'role': self.role,
#                 'platform': self.platform,
#                 'accepted': False if not user.accepted_time else True,
#                 'accepted_time': user.accepted_time,
#             },
#             status=status.HTTP_200_OK,
#         )


# Create your views here.
