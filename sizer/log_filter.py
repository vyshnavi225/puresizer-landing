import logging

from django.conf import settings


class AddOppSiteDetail(logging.Filter):

    def filter(self, record):
        record.opp = getattr(record, 'opp', '--')
        record.site = getattr(record, 'site', '--')
        return True


class ProductionSizingLog(logging.Filter):

    def filter(self, record):

        if not settings.DEBUG and 'services' in record.name:
            return False
        else:
            return True
