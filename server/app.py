from flask import Flask

from .api import api


app = Flask(__name__, template_folder='../client/templates', static_folder='../client/static')
app.register_blueprint(api, url_prefix='/api')

# import json
# NOTE Socketsio handles config on its layer
# runconfig = json.load(open('runconfig.json'))
# class Config:
#     DEBUG = not runconfig.get('production', False)
#     SERVER_NAME = runconfig.get('host', '0.0.0.0') + ':' + str(runconfig.get('port', 5000))
# 
# app.config.from_object(Config)