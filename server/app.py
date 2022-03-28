from flask import Flask

from .api import api


app = Flask(__name__, template_folder='../client/templates', static_folder='../client/static')

app.register_blueprint(api, url_prefix='/api')