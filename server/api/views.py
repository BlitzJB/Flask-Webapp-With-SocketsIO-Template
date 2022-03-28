from .bp import api


@api.route('/')
def __index():
    return 'Hello, API!'

