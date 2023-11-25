from flask import Flask, jsonify, Blueprint, request, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
import yaml
import uuid
import os

#####################
# Global Variables and Setup
#####################

version = Blueprint('v1', __name__, url_prefix='/api/v1')

with open("vault/credentials.yml", "r") as ymlfile:
    creds = yaml.safe_load(ymlfile)

username = creds["database"]["username"]
password = creds["database"]["password"]

app = Flask(__name__)
CORS(app, supports_credentials=True, withCredentials=True)
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{username}:{password}@online-tutoring-application.ccm0nvuvbmz8.us-east-2.rds.amazonaws.com:3306/ota_db'
db = SQLAlchemy(app)
app.config['UPLOAD_FOLDER'] = 'static/profile_image'


USER_FIELDS = {"first_name", "last_name", "netID", "email", "phone_num", "password"}
TUTOR_FIELDS = USER_FIELDS.union({"criminal"})
APPOINTMENT_FIELDS = {"subject", "tutor", "timeSlot"}
AUTHENTICATE_FIELDS = {"email", "password"}
PROTECTED_ENDPOINTS = ['v1.test_protected'] #, 'v1.subjects']
SEARCH_FIELDS = {"first_name", "last_name", "subject"}
UPLOAD_FOLDER = 'static/profile_image'
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg','svg'])

#####################
# Helper Functions
#####################

def datetime_to_str(expire_datetime):
    """
    Converts a datetime object to a string in the format 'YYYY-MM-DD HH:MM:SS'.
    """
    return expire_datetime.strftime('%Y-%m-%d %H:%M:%S')


def str_to_datetime(expire_str):
    """
    Converts a string in the format 'YYYY-MM-DD HH:MM:SS' to a datetime object.
    """
    return datetime.strptime(expire_str, '%Y-%m-%d %H:%M:%S')

def validate_fields(data, expected_fields):
    return all(field in data.keys() for field in expected_fields)

def user_exists(netID):
    # SQL returns number of users with netID in table.
    sql = text("SELECT COUNT(1) FROM users WHERE netID=:netID")
    result = db.session.execute(sql, {"netID": netID})
    return result.scalar() != 0

def user_session(session_id):
    # Fetches user_id given a session_id
    validate_auth_table()
    sql = text("""
        SELECT user_id FROM auth_table WHERE session_id = :session_id
    """)

    result = db.session.execute(sql, {"session_id": session_id}).fetchone()
    if result != None:
        return result[0], True
    else:
        return "Error: Session ID is either invalid or not for a user account.", False
    
def tutor_session(session_id):
    # Fetches user_id given a session_id
    validate_auth_table()
    sql = text("""
        SELECT tutor_id FROM auth_table WHERE session_id = :session_id
    """)

    result = db.session.execute(sql, {"session_id": session_id}).fetchone()
    if result != None:
        return result[0], True
    else:
        return "Error: Session ID is either invalid or not for a tutor account.", False
    
# Returns number of hours for given account using session_id
def total_hours(session_id):
    # Check if session id is for user account or tutor account
    user_id, isUser = user_session(session_id)
    tutor_id, isTutor = tutor_session(session_id)

    if isUser:
        sql = text("""
               SELECT num_hours FROM ota_db.user_leaderboard WHERE user_id = :user_id;
        """)
        result = db.session.execute(sql, {"user_id": user_id})
        if result != None:
            return result[0], True
        else:
            return 0, True
    elif isTutor:
        sql = text("""
               SELECT num_hours FROM ota_db.tutor_leaderboard WHERE tutor_id = :tutor_id;
        """)
        result = db.session.execute(sql, {"tutor_id": tutor_id})
        if result != None:
            return result[0], True
        else:
            return 0, True
    else:
        return "Error: Session ID is invalid, please log in.", False
        

# Returns sorted leaderboard of tutor hours
def tutor_hours_leaderboard():
    sql = text("""
               SELECT * FROM ota_db.tutor_leaderboard;
    """)
    result = db.session.execute(sql)
    response = list()
    for row in result:
        # Combine first and last name of tutors before sending
        response.append({'name': row[1] + ' ' + row[0], 'tutor_id': row[2], 'num_hours': row[3]})
    return response, True

# Returns sorted leaderboard of user hours
def user_hours_leaderboard():
    sql = text("""
               SELECT * FROM ota_db.user_leaderboard;
    """)
    result = db.session.execute(sql)
    response = list()
    for row in result:
        # Combine first and last name of tutors before sending
        response.append({'name': row[1] + ' ' + row[0], 'user_id': row[2], 'num_hours': row[3]})
    return response, True
    
def validate_auth_table():
    sql = text("""
               CALL validate_auth;
    """)
    db.session.execute(sql)

def clean_avail():
    sql = text("""
               CALL clean_avail;
    """)
    db.session.execute(sql)

# Getters:

# finds list of subjects given tutor_id
def subjects_of_tutor(tutor_id):
    sql = text("""
               SELECT class_name, class_num, department_id, department_name FROM ota_db.tutor_classes_readable WHERE tutor_id = :tutor_id
        """)
    result = db.session.execute(sql, {'tutor_id': tutor_id})
    if result == None:
        response = {
            'error': True,
            'status_code': 200,
            'message': 'No subjects found.'
        }
        return response
    response = list()
    for row in result:
        response.append({'class_name': row[0], 'class_num': row[1], 'department_id': row[2], 'department_name': row[3]})
    return response

# finds list of tutors given class_num, department_id
def tutors_of_subject(class_num, department_id):
    # recieves (tutor_id, first_name, last_name) arrays of matching tutors
    sql = text("""
            SELECT tutor_id, first_name, last_name FROM tutor_classes_readable 
            WHERE class_num = :class_num AND department_id = :department_id;
        """)
    
    result = db.session.execute(sql, {"class_num": class_num, "department_id": department_id})

    if result == None:
        response = {
            'error': True,
            'status_code': 200,
            'message': 'No tutors found.'
        }
        return response

    response = list()
    for row in result:
        # Combine first and last name of tutors before sending
        response.append({'name': row[1] + ' ' + row[2], 'tutor_id': row[0]})

    return response

def subjects_of_user(user_id):
    # finds available classes based on session id
    sql = text("""
            SELECT user_classes_readable.class_name, user_classes_readable.class_num, user_classes_readable.department_id, user_classes_readable.department_name
                FROM ota_db.user_classes_readable
                WHERE user_classes_readable.user_id = :user_id;
        """)
    
    result = db.session.execute(sql, {'user_id': user_id})

    if result == None:
        response = {
            'error': True,
            'status_code': 200,
            'message': 'No subjects found.'
        }
        return response

    # jsonify sql result
    response = list()
    for row in result:
        response.append({'class_name': row[0], 'class_num': row[1], 'department_id': row[2], 'department_name': row[3]})
    return response

'''
This function takes a session_id to determine a user/tutor, and returns a readable version of the user/tutor's upcoming appointments.
:param session_id: session cookie id
'''
def get_upcoming_appointments(session_id):
    # finds available classes based on session id
    user_id, tutor_id, authorized = get_id(session_id)

    if not authorized:  # invalid session id
        response = {
            'error': True,
            'status_code': 401,
            'message': 'Unauthorized access.',
            'result': None
        }

        return jsonify(response), 401
    
    formatted_data = {
        'user_id': user_id,
        'tutor_id': tutor_id
    }

    if user_id != None:
        sql = text("""
                SELECT upcoming_appointments.user_first_name, upcoming_appointments.user_last_name, upcoming_appointments.tutor_first_name, upcoming_appointments.tutor_first_name,
                    upcoming_appointments.class_name, upcoming_appointments.meeting_time, upcoming_appointments.appointment_id
                    FROM ota_db.upcoming_appointments 
                    WHERE upcoming_appointments.user_id = :user_id;
            """)
        result = db.session.execute(sql, formatted_data)
    else: # assume tutor_id exists
        sql = text("""
                SELECT upcoming_appointments.user_first_name, upcoming_appointments.user_last_name, upcoming_appointments.tutor_first_name, upcoming_appointments.tutor_first_name,
                    upcoming_appointments.class_name, upcoming_appointments.meeting_time, upcoming_appointments.appointment_id
                    FROM ota_db.upcoming_appointments 
                    WHERE upcoming_appointments.tutor_id = :tutor_id;
            """)
        result = db.session.execute(sql, formatted_data)

    if result == None:
        response = {
            'error': True,
            'status_code': 200,
            'message': 'No subjects found.'
        }
        return response

    # jsonify sql result
    response = list()
    for row in result:
        response.append({
            'student_name': row[0] + " " + row[1], 
            'tutor_name': row[2] + " " + row[3], 
            'class_name': row[4], 
            'meeting_time': row[5],
            'appointment_id': row[6]
            })
    return response

def insert_user(data):
    if user_exists(data['netID']):
            return "User with that netID already exists", False

    sql = text("""
        INSERT INTO users (first_name, last_name, netID, email, phone_num, password) 
        VALUES (:first_name, :last_name, :netID, :email, :phone_num, :password)
    """)
    try:
        result = db.session.execute(sql, data)
        db.session.commit()

        # Check if insert was successful
        if result.rowcount == 1:
            # Return the inserted data. 
            # If you need the actual row from the DB, you'll need to query it here.
            return data, True
        else:
            return "The insert was unsuccessful", False
    except IntegrityError:  # Catch any IntegrityError (like unique constraint violations)
        db.session.rollback()
        return "An error occurred while inserting the user.", False

def insert_tutor(data):
    sql = text("""
        INSERT INTO tutors (first_name, last_name, netID, email, phone_num, password, criminal) 
        VALUES (:first_name, :last_name, :netID, :email, :phone_num, :password, :criminal)
    """)
    try:
        result = db.session.execute(sql, data)
        db.session.commit()

        # Check if insert was successful
        if result.rowcount == 1:
            # Return the inserted data. 
            # If you need the actual row from the DB, you'll need to query it here.
            return data, True
        else:
            return "The insert was unsuccessful", False
    except IntegrityError:  # Catch any IntegrityError (like unique constraint violations)
        db.session.rollback()
        return "An error occurred while inserting the user.", False
    
def insert_appointment(data):
    sql = text("""
        INSERT INTO appointments (user_id, tutor_id, class_num, department_id, meeting_time) 
            VALUES (:user_id, :tutor_id, :class_num, :department_id, :meeting_time);
    """)
    try:
        result = db.session.execute(sql, data)
        db.session.commit()

        # Check if insert was successful
        if result.rowcount == 1:
            # Return the inserted data. 
            # If you need the actual row from the DB, you'll need to query it here.
            return data, True
        else:
            return "The insert was unsuccessful", False
    except IntegrityError:  # Catch any IntegrityError (like unique constraint violations)
        db.session.rollback()
        return "An error occurred while inserting the appointment.", False
    
def insert_user_favorite(data):
    validate_auth_table()
    query = text('''
        INSERT INTO ota_db.user_favorites (user_id, tutor_id) 
        VALUES ((SELECT user_id FROM ota_db.auth_table 
                 WHERE auth_table.session_id = :session_id), :tutor_id);
    ''')
        
    try:
        # execute query
        result = db.session.execute(query, data)
        db.session.commit()
    
        if result.rowcount == 1:
            return data, True
        else:
            return 'Failed to add tutor to the list.', False
    # catch integrity error
    except IntegrityError:
        # return to previous 
        db.session.rollback()
        return 'An error occurred while adding the tutor into the favorite list.', False
    
def delete_user_favorite(data):
    validate_auth_table()
    query = text('''
        DELETE FROM ota_db.user_favorites 
            WHERE user_id = (SELECT user_id FROM ota_db.auth_table 
                WHERE auth_table.session_id = :session_id) 
                AND tutor_id = :tutor_id;
    ''')

    try:
        # execute query
        result = db.session.execute(query, data)
        db.session.commit()
    
        if result.rowcount == 1:
            return data, True
        else:
            return 'Failed to remove tutor from the list.', False
    # catch integrity error
    except IntegrityError:
        # return to previous 
        db.session.rollback()
        return 'An error occurred while removing the tutor from the favorite list.', False
    
def authenticate(email, password):
    user_sql = text("""
        SELECT users.user_id 
        FROM users 
        WHERE users.email = :email AND users.password = :password
    """)
    
    tutor_sql = text("""
        SELECT tutors.tutor_id 
        FROM tutors 
        WHERE tutors.email = :email AND tutors.password = :password
    """)

    # Try to authenticate as a tutor first
    tutor_result = db.session.execute(tutor_sql, {"email": email, "password": password}).fetchone()
    if tutor_result:
        user_type = 'tutor'
        user_id = tutor_result[0]
    else:
        # If not a tutor, try to authenticate as a user
        user_result = db.session.execute(user_sql, {"email": email, "password": password}).fetchone()
        if user_result:
            user_type = 'user'
            user_id = user_result[0]
        else:
            return None, False  # Authentication failed

    # Generate a unique session_id
    session_id = uuid.uuid4().hex
    
    # Set an expiration time for the session
    expire = datetime.utcnow() + timedelta(hours=1)
    
    # Save the session to the database
    a, b = save_session_to_db(session_id, user_id, user_type, expire)
    
    print("session result message: " + str(a), flush=True)
    print("success in inserting session: " + str(b), flush=True)

    data = {
        "user_type": user_type,
        "user_id": user_id,
        "email": email,
        "session_id": session_id,
        "expire": expire
    }
    
    return data, True

def authenticate_user(email, password):
    user_sql = text("""
        SELECT users.user_id 
        FROM users 
        WHERE users.email = :email AND users.password = :password
    """)

    # Try to authenticate as a user
    user_result = db.session.execute(user_sql, {"email": email, "password": password}).fetchone()
    if user_result:
        user_type = 'user'
        user_id = user_result[0]
            # Generate a unique session_id
        session_id = uuid.uuid4().hex
        
        # Set an expiration time for the session
        expire = datetime.utcnow() + timedelta(hours=1)
        
        # Save the session to the database
        a, b = save_session_to_db(session_id, user_id, user_type, expire)
        
        print("session result message: " + str(a), flush=True)
        print("success in inserting session: " + str(b), flush=True)

        data = {
            "user_type": user_type,
            "user_id": user_id,
            "email": email,
            "session_id": session_id,
            "expire": expire
        }
        
        return data, True
    else:
        return None, False  # Authentication failed


def authenticate_tutor(email, password):
    tutor_sql = text("""
        SELECT tutors.tutor_id 
        FROM tutors 
        WHERE tutors.email = :email AND tutors.password = :password
    """)

    # Try to authenticate as a tutor
    tutor_result = db.session.execute(tutor_sql, {"email": email, "password": password}).fetchone()
    if tutor_result:
        user_type = 'tutor'
        user_id = tutor_result[0]
            # Generate a unique session_id
        session_id = uuid.uuid4().hex
        
        # Set an expiration time for the session
        expire = datetime.utcnow() + timedelta(hours=1)
        
        # Save the session to the database
        a, b = save_session_to_db(session_id, user_id, user_type, expire)
        
        print("session result message: " + str(a), flush=True)
        print("success in inserting session: " + str(b), flush=True)

        data = {
            "user_type": user_type,
            "user_id": user_id,
            "email": email,
            "session_id": session_id,
            "expire": expire
        }
        
        return data, True
    else:
        return None, False  # Authentication failed
    
def save_session_to_db(session_id, account_id, account_type, expire):
    # Save the session_id, user_id, and expiration to the auth_table in the database
    if account_type == 'user':
        user_id = account_id
        tutor_id = None

    elif account_type == 'tutor':
        user_id = None
        tutor_id = account_id

    data = {
        "session_id": session_id,
        "user_id": user_id,
        "tutor_id": tutor_id,
        "expire": datetime_to_str(expire)
    }

    print("data: " + str(data), flush=True)

    sql = text("""
        INSERT INTO auth_table (session_id, user_id, tutor_id, expire)
        VALUES (:session_id, :user_id, :tutor_id, :expire)
    """)

    try:
        result = db.session.execute(sql, data)
        db.session.commit()

        # Check if insert was successful
        if result.rowcount == 1:
            # Return the inserted data. 
            # If you need the actual row from the DB, you'll need to query it here.
            return data, True
        else:
            return "The insert was unsuccessful", False
    except IntegrityError:  # Catch any IntegrityError (like unique constraint violations)
        db.session.rollback()
        return "An error occurred while inserting the user.", False    

'''
This function checks whether the tutor already in the list associated to the user.
:param session_id: user session_id
:param tutor_id: tutor id 
:return: none if the tutor is not existed in the user's favorite list; otherwise, a row from db favorite list
'''
def in_favorites_list(session_id, tutor_id):
    # define query
    query = text('''
            SELECT F.user_id, F.tutor_id 
            FROM ota_db.user_favorites as F, ota_db.auth_table as A 
            WHERE A.user_id = F.user_id AND F.tutor_id = :tutor_id AND A.session_id = :session_id;
            ''')
    
    formatted_data = {
        'tutor_id': tutor_id,
        'session_id': session_id
    }
    
    # execute query
    result = db.session.execute(query, formatted_data)
    # True if found, False if not found
    return result.fetchone() != None

'''
This function takes a session_id to determine a user, and returns a readable version of the user's list of tutors and their subjects.
:param session_id: session cookie id
'''
def user_favorite_query(session_id):
    # retrieve list of favorite tutors
    validate_auth_table()
    sql = text("""
            SELECT ota_db.user_favorites_readable.tutor_id, ota_db.user_favorites_readable.first_name, 
                   ota_db.user_favorites_readable.last_name, image_path
            FROM ota_db.user_favorites_readable 
            LEFT JOIN ota_db.auth_table ON user_favorites_readable.user_id = auth_table.user_id
            LEFT JOIN ota_db.tutors ON user_favorites_readable.tutor_id = tutors.tutor_id
            WHERE auth_table.session_id = :session_id;
        """)
    
    # execute query
    result = db.session.execute(sql, {'session_id': session_id})
    rows = result.fetchall()

    # append each returned row into response
    fav_list = list()
    for row in rows:
        fav_list.append({
            'name': row[1] + ' ' + row[2], 
            'subject': subjects_of_tutor(row[0]),
            'image_path': row[3],
            'tutor_id': row[0]
        })

    return fav_list

'''
This function retrieves tutoring hours
:param tutor_id: tutor id
:return: number of tutoring hours
'''
def get_tutoring_hours(tutor_id):
    sql = text('''
            SELECT num_hours
            FROM ota_db.tutor_leaderboard
            WHERE tutor_id = :tutor_id;
        ''')
    
    # execute query
    result = db.session.execute(sql, {'tutor_id': tutor_id})
    rows = result.fetchone()

    if rows == None:
        return 0
    else:
        return rows[0]

'''
This function retrieves tutoring hours of user
:param tutor_id: tutor id
:return: number of tutoring hours of user
'''
def get_user_tutoring_hours(user_id):
    sql = text('''
            SELECT num_hours
            FROM ota_db.user_leaderboard
            WHERE user_id = {};
        '''.format(user_id))
    
    # execute query
    result = db.session.execute(sql)
    rows = result.fetchone()

    if rows == None:
        return 0
    else:
        return rows[0]
    
'''
This function retrieves user/tutor id associated to the session id.
:param session_id: session id
:return authorized: true if session id is valid; otherwise, false
:return user_id: user id if session id belongs to user; otherwise, None 
:return tutor_id: tutor id if session id belongs to user; otherwise, None 
'''
def get_id(session_id):
    if session_id == None:
        return None, None, False

    # retrieve id associated with session id
    validate_auth_table()
    sql = text("""
            SELECT user_id, tutor_id
            FROM ota_db.auth_table
            WHERE session_id = :session_id;
        """)
    
    # execute query
    result = db.session.execute(sql, {'session_id': session_id})
    row = result.fetchone()

    # check returned data
    if row == None:  # unauthorized
        authorized = False  
        user_id = None
        tutor_id = None

    else:  # authorized
        authorized = True

        # get id returned
        if row[0] == None:  # not user account -> tutor account
            user_id = None
            tutor_id = row[1]  # tutor_id

        else:  # user account
            user_id = row[0]  # user_id
            tutor_id = None

    return user_id, tutor_id, authorized

'''
This function retrieves profile information of user account.
:param user_id: user id
:return: object/dictionary contains profile information
'''
def get_user_profile(user_id):
    # retrieve profile information
    validate_auth_table()
    sql = text("""
            SELECT user_id, first_name, last_name, netID, email, phone_num, image_path
            FROM ota_db.users
            WHERE user_id = :user_id;
        """)
    
    # execute query
    result = db.session.execute(sql, {'user_id': user_id})
    row = result.fetchone()

    # check returned data
    if row == None:  # no data returned
        profile = None
        status_code = 200

        return profile, status_code

    else:   # data returned
        # retrieve subjects of user
        validate_auth_table()
        sql = text("""
                SELECT class_name
                FROM ota_db.user_classes_readable
                WHERE user_id = {};
            """.format(user_id))
        
        # execute query
        result = db.session.execute(sql)
        subjects = result.fetchall()

        # check returned data
        if subjects == None:  # no data returned
            subject_list = []

        else:
            # create list of subjects
            subject_list = []
            for subject in subjects:
                subject_list.append(subject[0])

        # create profile
        profile = {
            'name': row[1] + ' ' + row[2], 
            'netID': row[3],
            'email': row[4],
            'phone_num': row[5],
            'image_path': row[6],
            'tutor_id': row[0],
            'num_hours': get_user_tutoring_hours(user_id),
            'subject': subject_list
        }

        status_code = 201

    return profile, status_code

'''
This function retrieves profile information of tutor account.
:param tutor_id: tutor id
:return: object/dictionary contains profile information
'''
def get_tutor_profile(tutor_id):
    # retrieve profile information
    validate_auth_table()
    sql = text("""
            SELECT tutor_id, first_name, last_name, netID, email, phone_num, about_me, image_path
            FROM ota_db.tutors
            WHERE tutor_id = :tutor_id;
        """)
    
    # execute query
    result = db.session.execute(sql, {'tutor_id': tutor_id})
    row = result.fetchone()

    # check returned data
    if row == None:  # no data returned
        profile = None
        status_code = 200

    else:   # data returned
        # create profile
        profile = {
            'name': row[1] + ' ' + row[2], 
            'netID': row[3],
            'email': row[4],
            'phone_num': row[5],
            'about_me': 'N/A' if row[6] == None else row[6],
            'image_path': row[7],
            'subject': subjects_of_tutor(row[0]),
            'num_hours': get_tutoring_hours(row[0]),
            'tutor_id': row[0]
        }

        status_code = 201

    return profile, status_code

'''
This function checks if a filename has allowed extension.
:param filename: name of a file
:return: true if the extension in the allow list; otherwise return false
'''
def allowed_file(filename):
    # check if file extension in the allowed list
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

'''
This function creates a unique filename based on tutor/user id
:param user_id: user id
:param tutor_id: tutor id
:return: filename as {type}-{id}.jpg
'''
def create_filename(user_id, tutor_id):
    extension = 'jpg'
    if user_id == None:
        return f'tutor-{tutor_id}.{extension}'
    else:
        return f'user-{user_id}.{extension}'

'''
This function stores path of image in database
:param path: path in file system
:user_id: user id
:tutor_id: tutor id
:return: true if store successfully; otherwise, false
'''
def store_image_path(path, user_id, tutor_id):
    if user_id == None:  # tutor_id is provided
        data ={
            'image_path': path,
            'tutor_id': tutor_id
        }
        sql = text("""
                UPDATE ota_db.tutors 
                SET image_path = :image_path 
                WHERE tutor_id = :tutor_id;
            """)
        
    else:  # user_id is provided
        data ={
            'image_path': path,
            'user_id': user_id
        }
        sql = text("""
                UPDATE ota_db.users 
                SET image_path = :image_path 
                WHERE user_id = :user_id;
            """)
    try:
        # execute query
        result = db.session.execute(sql, data)
        db.session.commit()

        # check returned data
        if result == None:  # error occured
            return False
        else:
            return True
    
    # handle exception
    except:
        # return to previous 
        db.session.rollback()
        return False

'''
This function returns dictionary of department as key and list of subjects as value
:param subject_list: list of subjects in a form DEPARTMENT-subject
:return: dictionary of department as key and list of subjects as value
'''
def list_to_dict(subject_list):
    dept_subj_dict = {}

    # process each item (DEPARTMENT-subject)
    for item in subject_list:
        # split on '-'
        dept_subj = item.split('-')
        department = dept_subj[0].lower()  # key: department
        subject = dept_subj[1]  # value: subject

        # add subject into dict
        if department in dept_subj_dict:  # department exists as key
            dept_subj_dict[department].append(subject)  # append subject into current list
        
        else:  # department not exist as key
            dept_subj_dict[department] = [subject]  # add new key with list of 1 subject

    return dept_subj_dict

'''
This function updates subjects associated with the provided user/tutor id.
:param user_id: id of user
:param tutor_id: id of tutor
:param dept_subj_dict: dictionary with key is department, and value is a list of subjects
:return: true if update successfully; otherwise, false
'''
def update_subjects(user_id, tutor_id, dept_subj_dict):
    successful = False  # hold indicator of whether update successfully
    
    # check with type of id is used
    if user_id == None:  # tutor id
        table = 'tutor_classes'
        id_type = 'tutor_id'
        id = tutor_id

    else:  # user id
        table = 'user_classes'
        id_type = 'user_id'
        id = user_id

    # delete old subjects before updating
    sql = text("""
                DELETE FROM ota_db.{} 
                WHERE {} = :id;
            """.format(table, id_type))  # no user input for these value -> safe to use format
    
    data = {'id': id}

    try:
        # execute query
        result = db.session.execute(sql, data)
        db.session.commit()

        # check returned data
        if result == None:  # error occured while deleting
            return False

        else:  # no error while deleting

            # process each subject in each department
            for department, subjects in dept_subj_dict.items():
                for subject in subjects:
                    # insert subjects
                    sql = text("""
                                INSERT INTO ota_db.{} ({}, class_num, department_id) 
                                SELECT {}, C.class_num, C.department_id
                                FROM ota_db.classes C, ota_db.departments D
                                WHERE C.department_id = D.department_id AND 
                                    D.department_name = :department AND C.class_name = :subject;
                            """.format(table, id_type, id))  # no user input for these value -> safe to use format
                    
                    data = {
                        'department': department,
                        'subject': subject
                        }

                    try:
                        # execute query
                        result = db.session.execute(sql, data)
                        db.session.commit()

                        # check returned data
                        if result == None:  # error occured while updating
                            return False
                        
                        else:  # no error
                            successful = True
                        
                    except:
                        # return to previous 
                        db.session.rollback()
                        return False
        
        # end of loop of subject list
        return successful
    
    # handle exception
    except:
        # return to previous 
        db.session.rollback()
        return False

'''
This function updates name associated with the provided user/tutor id.
:param user_id: id of user
:param tutor_id: id of tutor
:param name: a name 
:return: true if update successfully; otherwise, false
'''
def update_name(user_id, tutor_id, name):
    # split first and last name
    first_last = name.split(' ')
    first = first_last[0]
    last = first_last[1] if len(first_last) > 1 else ''

    # check with type of id is used
    if user_id == None:  # tutor id
        table = 'tutors'
        id_type = 'tutor_id'
        id = tutor_id

    else:  # user id
        table = 'users'
        id_type = 'user_id'
        id = user_id

    # update name
    sql = text("""
                UPDATE ota_db.{}
                SET last_name = :last, first_name = :first 
                WHERE {} = :id;
            """.format(table, id_type))  # no user input for these value -> safe to use format
    
    data = {'last': last, 'first': first, 'id': id}

    try:
        # execute query
        result = db.session.execute(sql, data)
        db.session.commit()

        # check returned data
        if result == None:  # error occured while updating name
            return False

        else:  # no error while updating name
            return True
    
    # handle exception
    except:
        # return to previous 
        db.session.rollback()
        return False
    
'''
This function updates about me associated with the provided user/tutor id.
:param user_id: id of user
:param tutor_id: id of tutor
:param about_me: about me  
:return: true if update successfully; otherwise, false
'''
def update_about_me(tutor_id, about_me):
    # update about me
    sql = text("""
                UPDATE ota_db.tutors
                SET about_me = :about_me 
                WHERE tutor_id = :id;
            """)
    
    data = {'about_me': about_me, 'id': tutor_id}

    try:
        # execute query
        result = db.session.execute(sql, data)
        db.session.commit()

        # check returned data
        if result == None:  # error occured while updating about me
            return False

        else:  # no error while updating about me
            return True
    
    # handle exception
    except:
        # return to previous 
        db.session.rollback()
        return False


#####################
# Routes
#####################

@app.route("/", methods=["GET"])
def index():
    return {
        "message": "Hello Worldsss!"
    }

@version.route("/hello", methods=["GET"])
def hello():
    return {
        "message": "Hello World! From Nginx"
    }

@version.before_request
def verify_session():

    print("checking session...", flush=True)
    print(f"Accessed endpoint: {request.endpoint}", flush=True)

    if request.endpoint in PROTECTED_ENDPOINTS:
        print("endpoint is protected", flush=True)
        session_id = request.cookies.get('session_id')

        # SQL query first deletes expired session_ids, then checks if session_id exists in table
        validate_auth_table()
        sql = text("""
            SELECT COUNT(1) FROM auth_table WHERE session_id = :session_id;
        """)
        result = db.session.execute(sql, {"session_id": session_id}).fetchone()
        print(result, flush=True)

        if result == 1:
            print("session_id exists and is valid", flush=True)
        else:
            response = {
                'error': True,
                'status_code': 401,
                'message': 'Invalid or expired session.'
            }
            return jsonify(response), 401


@version.route("/verify_session", methods=["GET"])
def verify_session_manual():

    if not validate_fields(request.args, {'session_id'}):
        response = {
            'error': True,
            'status_code': 400,
            'message': 'Invalid or missing fields in request.'
        }
        return jsonify(response), 400
    
    session_id = request.args.get('session_id')
    # SQL query first deletes expired session_ids, then checks if session_id exists in table
    validate_auth_table()
    sql = text("""
        SELECT COUNT(1) FROM auth_table WHERE session_id = :session_id;
    """)
    result = db.session.execute(sql, {"session_id": session_id}).fetchone()
    print(result, flush=True)

    if result[0] == 1:
        response = {
            'error': False,
            'status_code': 201,
            'message': 'session_id exists and is valid.'
        }
        return jsonify(response), 201
    else:
        response = {
            'error': True,
            'status_code': 401,
            'message': 'Invalid or expired session.',
            'result': result[0]
        }
        return jsonify(response), 401

@version.route("/signup/user", methods=["POST"])
def signup_user():
    data = request.get_json()
    print(data, flush=True)

    if not validate_fields(data, USER_FIELDS):
        response = {
            'error': True,
            'status_code': 400,
            'message': 'Invalid or missing fields in request.'
        }
        return jsonify(response), 400

    inserted_data, success = insert_user(data)

    if success:
        response = {
            'error': False,
            'status_code': 201,
            'result': inserted_data
        }
        return jsonify(response), 201
    else:
        response = {
            'error': True,
            'status_code': 409, # 409 is the status code for a conflict
            'message': inserted_data  # This will contain the error message
        }
        return jsonify(response), 409 

    

@version.route("/subj_tutors", methods=["GET"])
def subj_tutors():
    if not validate_fields(request.args, {'subject'}):
        response = {
            'error': True,
            'status_code': 400,
            'message': 'Invalid or missing fields in request.'
        }
        return jsonify(response), 400
    
    # gets subject from request, in format "department_id/class_id"
    subject = request.args.get('subject').split('/')

    class_num = subject[1]
    department_id = subject[0]
    
    response = tutors_of_subject(class_num, department_id)
    
    return jsonify(response), 200

@version.route("/upcoming_appointments", methods=["GET"])
def upcoming_appointments():
    if not validate_fields(request.args, {'session_id'}):
        response = {
            'error': True,
            'status_code': 400,
            'message': 'Invalid or missing fields in request.'
        }
        return jsonify(response), 400
    
    # pulls a user's session_id from the browser
    session_id = request.args.get('session_id')

    response = get_upcoming_appointments(session_id)
    return jsonify(response), 200


@version.route("/subjects", methods=["GET"])
def subjects():

    if not validate_fields(request.args, {'session_id'}):
        response = {
            'error': True,
            'status_code': 400,
            'message': 'Invalid or missing fields in request.'
        }
        return jsonify(response), 400
    
    # pulls a user's session_id from the browser
    session_id = request.args.get('session_id')

    user_id, tutor_id, authorized = get_id(session_id)

    if not authorized:
        response = {
            'error': True,
            'status_code': 401,
            'message': 'Invalid login.'
        }
        return jsonify(response), 401

    if user_id != None:
        response = subjects_of_user(user_id)
        return jsonify(response), 200
    elif tutor_id != None:
        response = subjects_of_tutor(tutor_id)
        return jsonify(response), 200
    else:
        response = {
            'error': True,
            'status_code': 401,
            'message': 'Invalid login.'
        }
        return jsonify(response), 401
    
    

@version.route("/tutor_timeslots", methods=["GET"])
def tutor_timeslots():
    
    if not validate_fields(request.args, {'tutor_id'}):
        response = {
            'error': True,
            'status_code': 400,
            'message': 'Invalid or missing fields in request.'
        }
        return jsonify(response), 400
    
    tutor_id = request.args.get('tutor_id')

    # finds available times for a tutor
    clean_avail()
    sql = text("""
            SELECT time_available FROM ota_db.tutors_availability WHERE tutor_id = :tutor_id;
        """)
    
    result = db.session.execute(sql, {'tutor_id': tutor_id})

    if result == None:
        response = {
            'error': True,
            'status_code': 200,
            'message': 'Tutor has no available times.'
        }
        return jsonify(response), 200

    if result == None:
        response = {
            'error': False,
            'status_code': 200,
            'message': 'No subjects found.'
        }
        return jsonify(response), 200

    # jsonify sql result
    response = list()
    i = 0
    for row in result:
        response.append({'timestamp': datetime_to_str(row[0]), 'id': i})
        i += 1
    return jsonify(response), 200

@version.route("/total_hours", methods=["GET"])
def get_total_hours():
    if not validate_fields(request.args, {'session_id'}):
        response = {
            'error': True,
            'status_code': 400,
            'message': 'Invalid or missing fields in request.'
        }
        return jsonify(response), 400
    
    session_id = request.args.get('session_id')

    data, success = total_hours(session_id)

    if success:
        response = {
            'error': False,
            'status_code': 200,
            'message': data
        }
        return jsonify(response), 200
    else:
        response = {
            'error': True,
            'status_code': 400,
            'message': data  # This will contain the error message
        }
        return jsonify(response), 400
    
@version.route("/tutor_leaderboard", methods=["GET"])
def get_tutor_leaderboard():
    leaderboard, success = tutor_hours_leaderboard()
    if success:
        response = {
            'error': False,
            'status_code': 200,
            'message': leaderboard
        }
        return jsonify(response), 200
    else:
        response = {
            'error': True,
            'status_code': 400,
            'message': 'Error fetching leaderboard.'
        }
        return jsonify(response), 400

@version.route("/user_leaderboard", methods=["GET"])
def get_user_leaderboard():
    leaderboard, success = user_hours_leaderboard()
    if success:
        response = {
            'error': False,
            'status_code': 200,
            'message': leaderboard
        }
        return jsonify(response), 200
    else:
        response = {
            'error': True,
            'status_code': 400,
            'message': 'Error fetching leaderboard.'
        }
        return jsonify(response), 400



@version.route("/create/appointment", methods=["POST"])
def create_appointment():
    data = request.get_json()

    if not validate_fields(data, APPOINTMENT_FIELDS):
        response = {
            'error': True,
            'status_code': 400,
            'message': 'Invalid or missing fields in request.'
        }
        return jsonify(response), 400
    
    # get user_id from session_id
    session_id = data.get('session_id')
    user_id, success = user_session(session_id)

    # gets subject from request, in format "department_id/class_id"
    subject = data.get('subject').split('/')

    class_num = subject[1]
    department_id = subject[0]

    formatted_data = {
            "user_id": user_id,
            "tutor_id": data.get("tutor"),
            "class_num": class_num,
            "department_id": department_id,
            "meeting_time": data.get("timeSlot"),
    }
    
     # If validation passes, you can continue with inserting the data into the database.
    inserted_data, success = insert_appointment(formatted_data)

    if success:
        # remove tutor's availability from the database
        sql = text("""
                DELETE FROM ota_db.tutors_availability WHERE time_available = :meeting_time AND tutor_id = :tutor_id;
        """)
        db.session.execute(sql, formatted_data)
        db.session.commit()

        response = {
            'error': False,
            'status_code': 201,
            'result': inserted_data
        }
        return jsonify(response), 201
    else:
        response = {
            'error': True,
            'status_code': 409, # 409 is the status code for a conflict
            'message': inserted_data  # This will contain the error message
        }
        return jsonify(response), 409

@version.route("/signup/tutor", methods=["POST"])
def signup_tutor():
    data = request.get_json()

    if not validate_fields(data, TUTOR_FIELDS):
        response = {
            'error': True,
            'status_code': 400,
            'message': 'Invalid or missing fields in request.'
        }
        return jsonify(response), 400

    # If validation passes, you can continue with inserting the data into the database.
    inserted_data, success = insert_tutor(data)

    if success:
        response = {
            'error': False,
            'status_code': 201,
            'result': inserted_data
        }
        return jsonify(response), 201
    else:
        response = {
            'error': True,
            'status_code': 409, # 409 is the status code for a conflict
            'message': inserted_data  # This will contain the error message
        }
        return jsonify(response), 409 
    

@version.route("/login", methods=["POST"])
def login():
    
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not validate_fields(data, AUTHENTICATE_FIELDS):
        response = {
            'error': True,
            'status_code': 400,
            'message': 'Invalid or missing fields in request.'
        }
        return jsonify(response), 400
    
    user_data, authenticated = authenticate(email, password)

    if authenticated:
        response = {
            'error': False,
            'status_code': 200,
            'message': 'Login successful, cookie created.',
            'cookie_data': user_data
        }
        return response, 200
    else:
        response = {
            'error': True,
            'status_code': 401,
            'message': 'Invalid email or password.'
        }
        return jsonify(response), 401
    
@version.route("/login/user", methods=["POST"])
def login_user():
    
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not validate_fields(data, AUTHENTICATE_FIELDS):
        response = {
            'error': True,
            'status_code': 400,
            'message': 'Invalid or missing fields in request.'
        }
        return jsonify(response), 400
    
    user_data, authenticated = authenticate_user(email, password)

    if authenticated:
        response = {
            'error': False,
            'status_code': 200,
            'message': 'Login successful, cookie created.',
            'cookie_data': user_data
        }
        return response, 200
    else:
        response = {
            'error': True,
            'status_code': 401,
            'message': 'Invalid email or password.'
        }
        return jsonify(response), 401

@version.route("/login/tutor", methods=["POST"])
def login_tutor():
    
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not validate_fields(data, AUTHENTICATE_FIELDS):
        response = {
            'error': True,
            'status_code': 400,
            'message': 'Invalid or missing fields in request.'
        }
        return jsonify(response), 400
    
    user_data, authenticated = authenticate_tutor(email, password)

    if authenticated:
        response = {
            'error': False,
            'status_code': 200,
            'message': 'Login successful, cookie created.',
            'cookie_data': user_data
        }
        return response, 200
    else:
        response = {
            'error': True,
            'status_code': 401,
            'message': 'Invalid email or password.'
        }
        return jsonify(response), 401

@version.route("/test_protected", methods=["GET"])
def test_protected():
    return {
        "message": "This is a protected endpoint."
    }

#------------favorite tutors and search tutors------------
# get favorite tutor list endpoint
@version.route("/favorite_tutors", methods=["GET"])
def get_favorite_tutors():
    
    # pulls a user's session_id from the browser
    session_id = request.args.get('session_id')
    
    # get list of user favorites
    fav_list = user_favorite_query(session_id)

    response = {
        'error': False,
        'status_code': 201,
        'message': 'Retrieve favorite tutors list successfully.',
        'result': fav_list
    }

    return jsonify(response), 201
    
# endpoint to add a tutor into favorite list
@version.route("/add_favorite_tutors", methods=["POST"])
def add_favorite_tutors():

    # get data sent along with the request
    data = request.get_json()
    session_id = data.get("session_id")  
    tutor_id = data.get("tutor_id")

    formatted_data = {
        "session_id": session_id,
        "tutor_id": tutor_id
    }
    # session_id = 'bc5fddbc24c7434a94d4c9f2ee217e23'
    # tutor_id = 106

    # check if the tutor is already in user's favorite list
    if not in_favorites_list(session_id=session_id, tutor_id=tutor_id):  # tutor wasn't in list
        inserted_data, success = insert_user_favorite(formatted_data)
        if success:
                response = {
                    'error': False,
                    'status_code': 201,
                    'message': 'Added tutor to the list successfully.'
                }
                status_code = 201
        else:
            response = {
                'error': True,
                'status_code': 409,
                'message': inserted_data
            }
            status_code = 409
    else:  # tutor existed
        response = response = {
            'error': False,
            'status_code': 403,
            'message': 'The tutor is already in the list.'
        }
        status_code = 403

    return jsonify(response), status_code

# endpoint to remove a tutor from the favorite list
@version.route("/remove_favorite_tutor", methods=["POST"])
def remove_favorite_tutor():

    # get data sent along with the request
    data = request.get_json()
    session_id = data.get("session_id")  
    tutor_id = data.get("tutor_id")

    # validate session id
    _, _, authorized = get_id(session_id)
    if not authorized:  # invalid session id
        response = {
            'error': True,
            'status_code': 401,
            'message': 'Unauthorized access.'
        }

        return jsonify(response), 401
    
    formatted_data = {
        "session_id": session_id,
        "tutor_id": tutor_id
    }

    # check if the tutor is actually in user's favorite list
    if in_favorites_list(session_id=session_id, tutor_id=tutor_id):  
        deleted_data, success = delete_user_favorite(formatted_data)
        if success:
                response = {
                    'error': False,
                    'status_code': 201,
                    'message': 'Removed tutor from the list successfully.'
                }
                status_code = 201
        else:
            response = {
                'error': True,
                'status_code': 409,
                'message': deleted_data
            }
            status_code = 409

    else:  # tutor wasn't in list
        response = response = {
            'error': False,
            'status_code': 403,
            'message': 'The tutor is not in your favorite list.'
        }
        status_code = 403

    return jsonify(response), status_code

# endpoint to find tutors
@version.route("/find_tutors", methods=["POST"])
def find_tutors():
    ###
    # Due to multiple classes can a tutor register, if class name is included in the search field, 
    # we use different SQL query to retrieve data 
    ###

    # pulls a user's session_id from the browser
    # get data sent along with the request
    data = request.get_json()

    _, _, authorized = get_id(data.get('session_id'))
    if not authorized:  # invalid session id
        response = {
            'error': True,
            'status_code': 401,
            'message': 'Unauthorized access.'
        }

        return jsonify(response), 401

    # define conditions in where clause
    where_conditions = ''
    for key, value in data.items():
        if key == 'session_id' or len(value) == 0:
            continue
        
        where_conditions += ' AND ' + str(key) + ' = :' +  str(key)

    # case 1: class name is not included
    if data.get('class_name') == None or data.get('class_name') == '':
        
        # retrieve list of tutors based on search fields
        validate_auth_table()
        sql = text("""
                SELECT tutor_id, first_name, last_name, image_path
                FROM ota_db.tutors
                WHERE EXISTS (SELECT * FROM ota_db.auth_table WHERE session_id = :session_id)
            """ + where_conditions + ';')
        
        # execute query
        result = db.session.execute(sql, data)
        rows = result.fetchall()

        # create list of tutors returned from db 
        tutor_list = list()
        for row in rows:
            tutor_list.append({
                'name': row[1] + ' ' + row[2], 
                'subject': subjects_of_tutor(row[0]),
                'image_path': row[3],
                'tutor_id': row[0]
            })

        if len(tutor_list) == 0:
            response = {
                'error': False,
                'status_code': 200,
                'message': 'No data found.',
                'result': []
            }
            status_code = 200

        else:
            response = {
                'error': False,
                'status_code': 201,
                'message': 'Found tutors.',
                'result': tutor_list
            }
            status_code = 201
    # end of case 1

    # case 2: class name is included       
    else:
        # retrieve list of tutors based on search fields
        validate_auth_table()
        sql = text("""
                SELECT R.tutor_id, R.first_name, R.last_name, R.class_name, T.image_path
                FROM ota_db.tutor_classes_readable as R, ota_db.tutors as T
                WHERE R.tutor_id = T.tutor_id AND EXISTS (SELECT * FROM ota_db.auth_table WHERE session_id = '{}') 
            """ + where_conditions + ';')
        
        # execute query
        result = db.session.execute(sql, data)
        rows = result.fetchall()

        if len(rows) == 0:  # no data found
            response = {
                'error': False,
                'status_code': 201,
                'message': 'No data found.',
                'result': []
            }
            status_code = 201

        else:   # at least 1 data found
            # create list of tutors returned from db 
            tutor_list = list()
            for row in rows:
                subject_list = [row[3]]  # put subject into a list
                tutor_list.append({
                    'name': row[1] + ' ' + row[2], 
                    'subject': subject_list,
                    'image_path': row[4],
                    'tutor_id': row[0]
                })
            
            response = {
                'error': False,
                'status_code': 201,
                'message': 'Found tutors.',
                'result': tutor_list
            }
            status_code = 201

    return jsonify(response), status_code

#------------my profile------------
# endpoint to get my profile
@version.route("/my_profile", methods=["GET"])
def my_profile():
    # pulls a user's session_id from the browser
    session_id = request.args.get('session_id')
    
    # determine session id belongs to tutor or user
    user_id, tutor_id, authorized = get_id(session_id)

    if not authorized:  # invalid session id
        response = {
            'error': True,
            'status_code': 401,
            'message': 'Unauthorized access.'
        }

        return jsonify(response), 401

    # valid session id
    elif user_id == None:  # not user account -> tutor account
        # get profile
        profile, status_code = get_tutor_profile(tutor_id)
    
    else:  # user account
        # get profile
        profile, status_code = get_user_profile(user_id)

    # build response
    if profile == None:  # no profile found
        response = {
            'error': True,
            'status_code': status_code,  # 200
            'message': 'Some problems occurred while retrieving the profile.',
            'result': None
        }

    else:  # profile found
        response = {
            'error': False,
            'status_code': status_code,  # 201
            'message': 'Retrieve profile information successfully.',
            'result': profile
        }

    return jsonify(response), status_code

# endpoint to get tutor profile
@version.route("/tutor_profile", methods=["GET"])
def tutor_profile():
    # pulls a user's session_id and tutor_id from the browser
    session_id = request.args.get('session_id')
    tutor_id = request.args.get('tutor_id')
    
    # validate session id
    _, _, authorized = get_id(session_id)
    
    if not authorized:  # invalid session id
        response = {
            'error': True,
            'status_code': 401,
            'message': 'Unauthorized access.'
        }

        return jsonify(response), 401

    else:  # valid session id
        # get profile
        profile, status_code = get_tutor_profile(tutor_id)

        # build response
        if profile == None:  # no profile found
            response = {
                'error': True,
                'status_code': status_code,  # 200
                'message': 'Some problems occurred while retrieving the profile.',
                'result': None
            }

        else:  # profile found
            response = {
                'error': False,
                'status_code': status_code,   # 201
                'message': 'Retrieve profile information successfully.',
                'result': profile
            }

        return jsonify(response), status_code
    
# endpoint to get tutor profile
@version.route("/media_upload", methods=["POST"])
def media_upload():
    session_id = request.form['session_id']  

    # validate session id
    user_id, tutor_id, authorized = get_id(session_id)
    
    if not authorized:  # invalid session id
        response = {
            'error': True,
            'status_code': 401,
            'message': 'Unauthorized access.'
        }

        return jsonify(response), 401
      
    # check if file is alongs with the request
    if 'file' not in request.files:  # file not in the request
        response = {
            'error': True,
            'status_code': 400,
            'message': 'An image is not provided.'
        }

        status_code = 400

        return jsonify(response), status_code
    
    # file in the request
    file = request.files['file']  # store file 

    # check if filename is missing
    if file.filename == '':  # missing filename
        response = {
            'error': True,
            'status_code': 400,
            'message': 'No image was selected.'
        }

        status_code = 400

        return jsonify(response), status_code
    
    # check if file not null and extension is legit
    if file and allowed_file(file.filename):
        filename = create_filename(user_id=user_id, tutor_id=tutor_id)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        file_path = app.config['UPLOAD_FOLDER'] + '/' + filename

        # save image path to db
        successful = store_image_path(file_path, user_id=user_id, tutor_id=tutor_id)

        if successful:  # store path successfully
            response = {
                'error': False,
                'status_code': 201,
                'message': 'Image uploaded successfully.',
                'file_path': file_path
            }

            status_code = 201

            return jsonify(response), status_code
        
        else:  # fail to store path
            response = {
                'error': True,
                'status_code': 409,
                'message': 'Failed to store the image path in database.',
                'file_path': file_path
            }

            status_code = 409

            return jsonify(response), status_code
        
    else:  # invalid file extension or file is none
        response = {
            'error': True,
            'status_code': 400,
            'message': 'File extension is invalid, or error occurred while uploading the image.'
        }

        status_code = 400

        return jsonify(response), status_code

@version.route("/get_image", methods = ['GET'])
def get_image():
    # pulls a user's session_id and tutor_id from the browser
    session_id = request.args.get('session_id')
    tutor_id = request.args.get('tutor_id')
    user_id = None  # initialize 

    # get id from session id
    if tutor_id == None:  # tutor id is not provided -> my profile
        # determine type of account
        user_id, tutor_id, authorized = get_id(session_id)

    else:  # tutor id is provided -> tutor profile
        # check authorized only
        _, _, authorized = get_id(session_id)

    if not authorized:  # invalid session id
        response = {
            'error': True,
            'status_code': 401,
            'message': 'Unauthorized access.'
        }

        return jsonify(response), 401
    
    # get filename 
    filename = create_filename(user_id=user_id, tutor_id=tutor_id)

    # return file
    try:
        image = send_from_directory(directory=app.config["UPLOAD_FOLDER"], path=filename, as_attachment=True)
       
        return image, 201
    
    except FileNotFoundError:
        return None, 404
    

#------------enroll/modify subjects------------
# endpoint to return a list of departments name
@version.route("/get_departments", methods = ['GET'])
def get_departments():
    # pulls a user's session_id and tutor_id from the browser
    session_id = request.args.get('session_id')
    
    # validate session id
    _, _, authorized = get_id(session_id)
    
    if not authorized:  # invalid session id
        response = {
            'error': True,
            'status_code': 401,
            'message': 'Unauthorized access.'
        }

        return jsonify(response), 401

    else:  # valid session id
        query = text('''
                    SELECT department_name 
                    FROM ota_db.departments;
                ''')
        
        # execute query
        result = db.session.execute(query)
        rows = result.fetchall()

        # make list of departments
        departments = list()
        for row in rows:
            departments.append(row[0])

        # make response
        if len(departments) == 0:
            response = {
                'error': True,
                'status_code': 200,
                'message': 'Failed to retrieve a list of departments.'
            }

            status_code = 200
            
        else:
            response = {
                'error': False,
                'status_code': 201,
                'result': departments,
                'message': 'Retrieved a list of departments successfully.'
            }

            status_code = 201

        return jsonify(response), status_code
    
# endpoint to return list of subjects associated with their departments
@version.route("/get_subjects_of_departments", methods = ['POST'])
def get_subjects_of_departments():
    data = request.get_json()  # get body data

    # pulls a user's session_id and tutor_id from the browser
    session_id = data.get('session_id')
    department_list = data.get('departments')
    
    # validate session id
    user_id, tutor_id, authorized = get_id(session_id)
    
    if not authorized:  # invalid session id
        response = {
            'error': True,
            'status_code': 401,
            'message': 'Unauthorized access.'
        }

        return jsonify(response), 401

    if department_list == None or len(department_list) == 0:
        response = {
            'error': False,
            'status_code': 200,
            'result': department_list,
            'message': 'No department was specified.'
        }

        return jsonify(response), 200

    else:  # valid session id
        # join department name together and create quotation marks
        group_of_dept_name = "', '".join(department_list)
        group_of_dept_name = "'" + group_of_dept_name + "'"

        # query
        query = text('''
                    SELECT D.department_name, C.class_name
                    FROM ota_db.departments D, ota_db.classes C
                    WHERE D.department_id = C.department_id AND 
                          D.department_name IN ({});
                '''.format(group_of_dept_name))  # there is no user input -> safe to use format
        
        # execute query
        result = db.session.execute(query)
        rows = result.fetchall()

        # make list of subjects in a form DEPARTMENT-subject
        subject_list = list()
        for row in rows: 
            subject_list.append(f'{row[0]}-{row[1]}')

        # make response
        if len(subject_list) == 0:
            response = {
                'error': True,
                'status_code': 200,
                'result': subject_list,
                'message': 'Failed to retrieve a list of subjects.'
            }

            status_code = 200
            
        else:
            response = {
                'error': False,
                'status_code': 201,
                'result': subject_list,
                'message': 'Retrieved a list of subjects successfully.'
            }

            status_code = 201

        return jsonify(response), status_code
    
# endpoint to update subject to account
@version.route("/update_profile", methods = ['POST'])
def update_profile():
    data = request.get_json()  # get body data

    # pulls a user's session_id and tutor_id from the browser
    session_id = data.get('session_id')
    updated_info = {
        'subject_list': data.get('updated_info').get('subjects'),
        'name': data.get('updated_info').get('name'),
        'about_me': data.get('updated_info').get('about_me'),
    }

    # validate session id
    user_id, tutor_id, authorized = get_id(session_id)
    
    if not authorized:  # invalid session id
        response = {
            'error': True,
            'status_code': 401,
            'message': 'Unauthorized access.'
        }

        return jsonify(response), 401
    
    # initialize response
    error = False
    message = ''
    status_code = 200

    # update subjects 
    if updated_info['subject_list'] != None and len(updated_info['subject_list']) > 0:  # updated subject list was provided
        dept_subj_dict = list_to_dict(updated_info['subject_list'])  # get dictionary department as key and list of subjects as value
        successful = update_subjects(user_id=user_id, tutor_id=tutor_id, dept_subj_dict=dept_subj_dict)  # call function to update

        if successful:  # update successfully
            message = 'Updated subjects successfully. '
            status_code = 201

        else:  # update fail
            error = True
            status_code = 409
            message = 'Failed to update subjects. '

    # update name
    if updated_info['name'] != None and len(updated_info['name']) > 0:   # updated name was provided
        successful = update_name(user_id=user_id, tutor_id=tutor_id, name=updated_info['name'])  # call function to update

        if successful:  # update successfully
            message += 'Updated name successfully. '
            status_code = 201 if status_code != 409 else 409

        else:  # update fail
            error = True
            status_code = 409
            message = 'Failed to update name. '

    # update about me
    if tutor_id != None and updated_info['about_me'] != None and len(updated_info['about_me']) > 0:  # updated about me was provided
        successful = update_about_me(tutor_id=tutor_id, about_me=updated_info['about_me'])  # call function to update

        if successful:  # update successfully
            message += 'Updated about me successfully. '
            status_code = 201 if status_code != 409 else 409

        else:  # update fail
            error = True
            status_code = 409
            message = 'Failed to update about me. '

    # build response
    response = {
                'error': error,
                'status_code': status_code,
                'message': 'No update was made.' if len(message) == 0 else message
            }

    return jsonify(response), status_code

#####################
# Main
#####################

app.register_blueprint(version)

if __name__ == "__main__":
    #app.register_blueprint(version)
    app.run(debug=True, host="0.0.0.0")
    


# class User(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     username = db.Column(db.String(80), unique=True, nullable=False)
#     email = db.Column(db.String(120), unique=True, nullable=False)

# with app.app_context():
#     connection = db.engine.connect()
#     try:
#         result = connection.execute(text("SELECT * FROM users"))
#         print("Connection successful:", result.fetchone())
#     except Exception as e:
#         print("Error:", e)
#     finally:
#         connection.close()