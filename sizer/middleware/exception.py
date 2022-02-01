import traceback
from logging import getLogger

from django.core.exceptions import PermissionDenied, SuspiciousOperation
from django.http import JsonResponse
from rest_framework import status

from env_setup.exception import TokenExpired, ValidationError

from .. import settings

logger = getLogger()


class ExceptionMiddleware(object):
    def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization.

    def __call__(self, request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.

        response = self.get_response(request)

        # Code to be executed for each request/response after
        # the view is called.

        return response

    @staticmethod
    def process_exception(request, exception):
        if type(exception) is PermissionDenied:
            return JsonResponse(
                {
                    "error_msg": "You are not logged in. Try logging back into the application via "
                    "<a href='%s:%s/login'> portal"
                    % (settings.SERVER_ADDRESS, settings.PORT),
                    "status": "error",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if type(exception) is ValidationError:
            return JsonResponse(
                {"status": "error", "error_msg": exception.message},
                status=status.HTTP_403_FORBIDDEN,
            )

        if type(exception) is TokenExpired:
            return JsonResponse(
                {"status": "error", "error_msg": exception.message},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        else:
            message = "Oops, An unusual error has occurred. Please contact Puresizer team with the details"

            stack = traceback.format_exc()
            url = request.path
            logger.error("\nURL: %s,\n" "DETAILS: %s\n" % (url, str(stack)))

            return JsonResponse(
                {"status": "error", "error_msg": message},
                status=status.HTTP_403_FORBIDDEN,
            )
