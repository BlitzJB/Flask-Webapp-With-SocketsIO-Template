from server import socket, app

# TODO: Setup gunicorn for production deployment

import json

runconfig = json.load(open('runconfig.json'))
PRODUCTION = runconfig.get('production', False)
HOST = runconfig.get('host', '0.0.0.0')
PORT = runconfig.get('port', 5000)

if __name__ == '__main__':
    socket.run(app, debug=not PRODUCTION, host=HOST, port=PORT)
