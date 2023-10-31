from Google import Create_Service
import base64
import random
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import mysql.connector # connect method
from datetime import datetime, timedelta
from flask import *
import json

#app = Flask(___name__)
# version = Blueprint('v1', __name__, url_prefix='/api/v1')

# databse setting
'''
db_config = {
    "host": "online-tutoring-application.ccm0nvuvbmz8.us-east-2.rds.amazonaws.com",
    "user": "admin",
    "password": "vBmEAMqtHS4cqgVe6b3nFMGCuRVLzw",
    "database": "ota_db"
}
'''

db_config = {
    "host": "online-tutoring-application.ccm0nvuvbmz8.us-east-2.rds.amazonaws.com",
    "user": "DBAccess",
    "password": "4485Project",
    "database": "ota_db"
}

# Gmail setting
CLIENT_SECRET_FILE = 'client_secret.json'
API_NAME = 'gmail'
API_VERSION = 'v1'
SCOPES = ['https://mail.google.com/']

# create Gmail service 
service = Create_Service(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES)

connection = mysql.connector.connect(**db_config)
cursor = connection.cursor()

def search_email_user(user_id):
    search_query = "SELECT email FROM users WHERE user_id = " + str(user_id)
    cursor.execute(search_query)
    email_address = cursor.fetchall()

    return email_address

def search_email_tutor(tutor_id):
    search_query = "SELECT email FROM tutors WHERE tutor_id = " + str(tutor_id)
    cursor.execute(search_query)
    email_address = cursor.fetchall()

    return email_address

def insert_2fa_user(rand, exp_time, user_id):
    insert_query = "INSERT INTO 2fa_table (2fa_code, expire, user_id, tutor_id) VALUES (%s, %s, %s, NULL)"
    data_to_insert = (rand, exp_time, user_id)
    print(data_to_insert)

    cursor.execute(insert_query, data_to_insert)

    connection.commit() # commit the changes
    print(cursor.rowcount, "record inserted.")

def insert_2fa_tutor(rand, exp_time, tutor_id):
    insert_query = "INSERT INTO 2fa_table (2fa_code, expire, user_id, tutor_id) VALUES (%s, %s, NULL, %s)"
    data_to_insert = (rand, exp_time, tutor_id)
    print(data_to_insert)

    cursor.execute(insert_query, data_to_insert)

    connection.commit() # commit the changes
    print(cursor.rowcount, "record inserted.")

def delete_expired_2fa():
    cursor.callproc('validate_2fa') # delete expired 2fa code
    connection.commit()

def send_email(email, rand):
    emailMsg = 'You have requested a secure verification code to log into your account.\n\nPlease enter this secure verification code: ' \
        + str(rand) + '\n\nIf you are not attempting to log into your account, please reset your password.\nPLEASE DO NOT REPLY TO THIS MESSAGE'
    mimeMessage = MIMEMultipart()
    mimeMessage['to'] = email[0][0]
    #mimeMessage['to'] = 'jxp163630@utdallas.edu'   # testing utd email address
    mimeMessage['subject'] = 'Secure two-step verification notification'
    mimeMessage.attach(MIMEText(emailMsg, 'plain'))
    raw_string = base64.urlsafe_b64encode(mimeMessage.as_bytes()).decode()

    message = service.users().messages().send(userId='me', body={'raw': raw_string}).execute()
    print(message)

def send_email_tutor(user_id):
    try:
        connection = mysql.connector.connect(**db_config)

        if connection.is_connected():
            cursor = connection.cursor()

            email = search_email_tutor(user_id)             # search tutor's email address
            rand = random.randint(100000,999999)            # generates 6-digit random intiger
            send_email(email, rand)                         # send 2fa code
            insert_2fa_tutor(rand, datetime.now(), user_id) # record 2fa to database 

    except mysql.connector.Error as error:
        print("Error: {}".format(error))

    finally:
        if 'connection' in locals():
            connection.close()

def send_email_user(user_id):
    try:
        connection = mysql.connector.connect(**db_config)

        if connection.is_connected():
            cursor = connection.cursor()

            email = search_email_user(user_id)              # search user's email address
            rand = random.randint(100000,999999)            # generates 6-digit random intiger
            send_email(email, rand)                         # send 2fa code
            insert_2fa_user(rand, datetime.now(), user_id)  # record 2fa to database 

    except mysql.connector.Error as error:
        print("Error: {}".format(error))

    finally:
        if 'connection' in locals():
            connection.close()

############################ TEST ############################ 

try:
    connection = mysql.connector.connect(**db_config)

    if connection.is_connected():
        cursor = connection.cursor()
        
        user_id_num = 101   # intiger number of user id
        tutor_id_num = 102    # intiger number of tutor id
        
        email = search_email_user(user_id_num)
        rand = random.randint(100000,999999)
        send_email(email, rand)
        insert_2fa_user(rand, (datetime.now() + timedelta(minutes=10)), 102) # datetime.now() is current timestamp and timedelta adds 10 minutes to it
        #delete_expired_2fa()

except mysql.connector.Error as error:
    print("Error: {}".format(error))

finally:
    if 'connection' in locals():
        connection.close()
        
############################ TEST ############################

'''
@app.route('/TwoFactorAuthentication', methods=['POST'])
def send_2fa_email():
    try:
        # Get user_id or tutor_id from the request data
        user_id = request.json.get('user_id')  # Adjust this based on your JSON structure

        if user_id is not None:
            # Check if it's a user or tutor based on your logic
            if is_user(user_id):
                send_email_user(user_id)
            elif is_tutor(user_id):
                send_email_tutor(user_id)
            else:
                return jsonify({'message': 'Invalid user or tutor'}), 400

            return jsonify({'message': '2FA email sent successfully'}), 200
        else:
            return jsonify({'message': 'user_id or tutor_id missing in request data'}), 400

    except Exception as e:
        return jsonify({'message': 'Error: {}'.format(str(e)}), 500


# Define the is_user and is_tutor functions based on your logic

app.register_blueprint(version)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0") '''
