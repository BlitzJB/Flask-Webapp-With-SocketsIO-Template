from .app import app

from flask import render_template, request

@app.route('/')
def __index():
    return render_template('index.html')

@app.route('/song')
def __song():
    return render_template('song.html')

@app.route('/search')
def __search():
    return render_template('search.html')