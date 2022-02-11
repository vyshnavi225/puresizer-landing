"""cosizer URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.http import HttpResponseRedirect
from django.urls import include, path, re_path
from django.views.static import serve

from env_setup.views import GetUserDetail, GetVersion, LocalAuthView, LogOutViews, OktaAuthView, AppAccessAPI, \
    AuthZeroView

from . import settings

urlpatterns = [

    path('admin', lambda r: HttpResponseRedirect('/landing-app/index.html')),
    # path('login', LogOutViews.as_view()),
    path('login/local', LocalAuthView.as_view()),
    path('login/okta', OktaAuthView.as_view()),
    path('login/authzero', AuthZeroView.as_view()),
    path('appaccess', AppAccessAPI.as_view()),
    path('userinfo', GetUserDetail.as_view()),
    path('logout', LogOutViews.as_view()),
    re_path(r'^version', GetVersion.as_view()),
    # re_path(r'^accept', AcceptDisclaimer.as_view()),
    path(r'', lambda r: HttpResponseRedirect('/landing-static/index.html')),
]
