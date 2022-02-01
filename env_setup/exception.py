from sizer import settings


class ValidationError(Exception):
    def __init__(self, message):
        self.message = message
        self.process()
        super(ValidationError, self).__init__(self.message)

    def process(self):
        self.message = f"Your validation through {self.message} failed, please try to login again"


class TokenExpired(Exception):
    def __init__(self):
        msg = f"""You are not logged in. Try logging back into the application via \
              <a href='{settings.SERVER_ADDRESS}:{settings.PORT}/login'> portal"""
        self.message = msg
        super(TokenExpired, self).__init__(msg)
