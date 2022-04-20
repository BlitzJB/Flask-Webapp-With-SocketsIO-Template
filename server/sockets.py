from .views import app

from flask_socketio import SocketIO, Namespace, emit, join_room, leave_room
from flask import request

socket = SocketIO(app)

class NameSpace(Namespace):
    def on_connect(self):
        print('Connected with ' + request.sid)

    def on_click(self, data): # on_<event_name>
        print('Clicked')
        print(data)
        emit('resp', data)

socket.on_namespace(NameSpace('/'))