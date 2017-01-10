import os
import json
from flask import Flask, request, Response
from flask import render_template, send_from_directory, url_for

# setting up template directory
#ASSETS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static/')

app = Flask(__name__)

#app.config.from_object('angular_flask.settings')

app.url_map.strict_slashes = False

import angular_flask.data_explore
import angular_flask.emotion
import angular_flask.controllers
