import os

from flask import Flask, request, Response, jsonify
from flask import render_template, url_for, redirect, send_from_directory
from flask import send_file, make_response, abort
import logging

logger = logging.getLogger("controller")
logger.setLevel(logging.DEBUG)
fh = logging.FileHandler("logs.log")
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
fh.setFormatter(formatter)
logger.addHandler(fh)


from angular_flask import app
import data_explore as de 

# Get all
@app.route('/emetrics/api/v1.0/top_users',methods=['GET'])
def get_topusers():
    logger.debug("Inside the /emetrics/api/v1.0/top_users request")
    return jsonify(de.get_top_users_email_analytics())


@app.route('/emetrics/api/v1.0/user_last_n', methods=['POST'])
def get_lastn_emails():
    if not request.json or not 'user_email' in request.json:
        abort(400)

    # Pass this data in this webservice
    user_details = {
        'user_email' : request.json['user_email'],
        'email_count' : request.json['email_count']
    }

    last_n_filter = request.json.get('last_n_filter', None)

    return jsonify(de.get_filtered_user_email_analytics(user_details,last_n_filter))


# Get all
@app.route('/emetrics/api/v1.0/recipient_freq',methods=['POST'])
def get_reciepfreq():
    if not request.json or not 'user_email' in request.json:
        abort(400)

    logger.debug("Inside the /emetrics/api/v1.0/recipient_freq request")
    return jsonify(de.get_reciever_frequency(request.json['user_email']))


# Get all
@app.route('/emetrics/api/v1.0/emailwise_emotion_analytics',methods=['POST'])
def get_user_emotion_analytics():
    if not request.json or not 'user_email' in request.json:
        abort(400)

    logger.debug("Inside the /emetrics/api/v1.0/get_user_emotion_analytics request user : %s" %(request.json['user_email']))
    return jsonify(de.get_user_emotion_analytics(request.json['user_email']))


# Get all
@app.route('/emetrics/api/v1.0/email',methods=['GET'])
def get_emails():
    logger.debug("Inside the /emetrics/api/v1.0/email request")
    emailid = request.args.get('emailid')
    return jsonify(de.get_emails(emailid))



# routing for basic pages (pass routing onto the Angular app)
@app.route('/')
def basic_pages():
    return send_file("templates/index.html")


# special file handlers and error handlers
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'img/favicon.ico')


# @app.errorhandler(404)
# def page_not_found(e):
#     return render_template('templates/404.html'), 404
