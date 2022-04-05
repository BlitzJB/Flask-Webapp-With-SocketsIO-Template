from server import app

# TODO: Setup gunicorn for production deployment

import json

runconfig = json.load(open('config.json'))
PRODUCTION = runconfig.get('production', False)
HOST = runconfig.get('host', '0.0.0.0')
PORT = runconfig.get('port', 5000)

if __name__ == '__main__':
    app.run(debug = not PRODUCTION, host = HOST, port = PORT)