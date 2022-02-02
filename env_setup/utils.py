import base64
import binascii
import hashlib
import os
import secrets

import requests

import sizer.settings as env
from .models import DevParams

from logging import getLogger
logger = getLogger(__name__)

CLIENT_ID = env.CLIENT_ID
REDIRECT_URL = env.REDIRECT_URL
APP_URL = env.APP_URL

# POST_URL = (
#     "{0}/authorize?client_id={1}&response_type="
#     "code&scope=openid&redirect_uri={2}&state=state-".format(
#         APP_URL, CLIENT_ID, REDIRECT_URL
#     )
# )


def save_dev_params():
    """
    Save new hash code in dev_params
    """
    dev_param = DevParams()
    dev_param.params = binascii.hexlify(os.urandom(16))
    code_v = secrets.token_urlsafe(52)
    code_c = encode_verifier(code_v)
    dev_param.code_verifier = code_v
    dev_param.save()
    logger.info("state %s has been saved" % dev_param.params)
    return dev_param, code_c


def check_state(state):
    """
    Check whether state hash code is valid
    :param state: string
    :return validation_res: bool
    """
    split_state = state.split("-")[1].strip()

    dev_param = DevParams.objects.filter(params=split_state)
    if not dev_param:
        # logger.info("state %s does not exist" % state)
        return False, ""
    # logger.info("state %s has been deleted" % dev_param[0].params)
    code_v = dev_param[0].code_verifier
    dev_param[0].delete()
    return True, code_v


def get_token(code, code_verifier):
    """
    Get token from OKTA
    :param code: string, code that is used to get access token
    :return auth_res: authentication result, has token if success
    """
    logger.info(code)
    logger.info(set(code))
    logger.info(CLIENT_ID)
    data = f"""grant_type=authorization_code&client_id={CLIENT_ID}&redirect_uri={REDIRECT_URL}&code={code}&code_verifier={code_verifier}"""
    logger.info(data)
    auth_res = requests.post(
        f"{APP_URL}/token",
        data=data,
        headers={
            "accept": "application/json",
            "cache-control": "no-cache",
            "content-type": "application/x-www-form-urlencoded",
        },
    )
    return auth_res


def validate_token(token):
    """
    Check whether token is active
    """
    token_valid_res = requests.post(
        f"{APP_URL}/introspect",
        headers={
            "accept": "application/json",
            "cache-control": "no-cache",
            "content-type": "application/x-www-form-urlencoded",
        },
        data={
            "token": token,
            "token_type_hint": "access_token",
            "client_id": CLIENT_ID,
        },
    )

    return token_valid_res


# def random_md5like_hash():
#     available_chars= "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"
#     return ''.join(
#         random.choice(available_chars)
#         for _ in range(54))


def encode_verifier(code_verifier):
    code_challenge = hashlib.sha256(code_verifier.encode("utf-8")).digest()
    code_challenge = base64.urlsafe_b64encode(code_challenge).decode("utf-8")
    code_challenge = code_challenge.replace("=", "")
    return code_challenge


def construct_post_url(hex_code, code_c):
    _post_url = f"""{APP_URL}/authorize?client_id={CLIENT_ID}&response_type=\
        code&scope=openid&redirect_uri={REDIRECT_URL}&state=state-{hex_code}\
        &code_challenge_method=S256&code_challenge={code_c}"""

    return _post_url


if __name__ == "__main__":
    dev_params, _code_c = save_dev_params()
    post_url = construct_post_url(dev_params.params, _code_c)

    print(_code_c)
    print(post_url)
