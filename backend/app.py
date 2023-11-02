from flask import Flask, jsonify, Blueprint, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
import yaml
import uuid

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


USER_FIELDS = {"first_name", "last_name", "netID", "email", "phone_num", "password"}
TUTOR_FIELDS = USER_FIELDS.union({"criminal"})
APPOINTMENT_FIELDS = {"subject", "tutor", "timeSlot"}
AUTHENTICATE_FIELDS = {"email", "password"}
PROTECTED_ENDPOINTS = ['v1.test_protected'] #, 'v1.subjects']


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
    
def save_session_to_db(session_id, user_id, user_type, expire):
    # Save the session_id, user_id, and expiration to the auth_table in the database
    if user_type == 'user':
        user_id = user_id
        tutor_id = None

    elif user_type == 'tutor':
        user_id = None
        tutor_id = user_id

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
    



#####################
# Routes
#####################

@app.route("/", methods=["GET"])
def index():
    return {
        "message": "Hello Worldss!"
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
            SELECT COUNT(1) FROM auth_table WHERE session_id = '{}';
        """.format(session_id))
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
        SELECT COUNT(1) FROM auth_table WHERE session_id = '{}';
    """.format(session_id))
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
            'sql': """
                SELECT COUNT(1) FROM auth_table WHERE session_id = '{}';
            """.format(session_id),
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
def tutors_of_subject():

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
        return jsonify(response), 200

    response = list()
    for row in result:
        # Combine first and last name of tutors before sending
        response.append({'name': row[1] + ' ' + row[2], 'tutor_id': row[0]})
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

    # finds available classes based on session id
    validate_auth_table()
    sql = text("""
            SELECT user_classes_readable.class_name, user_classes_readable.class_num, user_classes_readable.department_id, user_classes_readable.department_name
                FROM ota_db.user_classes_readable 
                LEFT JOIN ota_db.auth_table ON user_classes_readable.user_id=auth_table.user_id 
                WHERE auth_table.session_id = '{}';
        """.format(session_id))
    
    result = db.session.execute(sql)

    if result == None:
        response = {
            'error': True,
            'status_code': 200,
            'message': 'No subjects found.'
        }
        return jsonify(response), 200

    # jsonify sql result
    response = list()
    for row in result:
        response.append({'class_name': row[0], 'class_num': row[1], 'department_id': row[2], 'department_name': row[3], 'session_id': session_id})
    return jsonify(response), 200

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
            SELECT time_available FROM ota_db.tutors_availability WHERE tutor_id= {};
        """.format(tutor_id))
    
    result = db.session.execute(sql)

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
        response.append({'timestamp': row[0], 'id': i})
        i += 1
    return jsonify(response), 200


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
                DROP * FROM ota_db.tutors_availability WHERE time_available = "{}";
        """.format(data))
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