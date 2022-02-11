"""
WSGI config for sizer project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/wsgi/
"""

import os
import django
from django.core.handlers.wsgi import WSGIHandler
from django.core.wsgi import get_wsgi_application


class WSGIEnvironment(WSGIHandler):

    def __call__(self, environ, start_response):

        # Load env variable using SetEnv in Apache/mod_wsgi setup
        # os.environ['SIZER_INSTANCE'] = environ['SIZER_INSTANCE']
        return super().__call__(environ, start_response)


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sizer.settings")
django.setup(set_prefix=False)
application = WSGIEnvironment()
