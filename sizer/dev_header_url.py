from django.conf.urls.static import static
import re
from django.http import HttpResponseRedirect
from django.urls import path, include, re_path
from django.views.static import serve
from sizer import settings

urlpatterns = [
    path('landing/', include('sizer.urls')),
    path(r'', lambda r: HttpResponseRedirect('/landing-static/index.html')),
    re_path(r'^(?P<path>.*)$', serve, {'document_root': settings.UI_ROOT, 'show_indexes': True})
]
