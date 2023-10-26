from Google import Create_Service
import base64
import random
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import mysql.connector # connect method
from datetime import datetime, timedelta

# databse
db_config = {
    "host": "online-tutoring-application.ccm0nvuvbmz8.us-east-2.rds.amazonaws.com",
    "user": "admin",
    "password": "vBmEAMqtHS4cqgVe6b3nFMGCuRVLzw",
    "database": "ota_db"
}

# Gmail setting
CLIENT_SECRET_FILE = 'client_secret.json'
API_NAME = 'gmail'
API_VERSION = 'v1'
SCOPES = ['https://mail.google.com/']

# create Gmail service 
service = Create_Service(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES)

def search_email_user(user_id):
    search_query = "SELECT email FROM users WHERE user_id = " + str(user_id)
    cursor.execute(search_query)
    email_address = cursor.fetchall()

    return email_address

try:
    connection = mysql.connector.connect(**db_config)

    if connection.is_connected():
        cursor = connection.cursor()

        # WHEN RECEIVED 2FA CODE FROM USER/TUTOR

        
    

except mysql.connector.Error as error:
    print("Error: {}".format(error))

finally:
    if 'connection' in locals():
        connection.close()
