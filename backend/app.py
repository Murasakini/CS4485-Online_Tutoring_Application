from flask import Flask, jsonify, Blueprint, request
from flask_sqlalchemy import SQLAlchemy
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
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{username}:{password}@online-tutoring-application.ccm0nvuvbmz8.us-east-2.rds.amazonaws.com:3306/ota_db'
db = SQLAlchemy(app)


USER_FIELDS = {"first_name", "last_name", "netID", "email", "phone_num", "password"}
TUTOR_FIELDS = USER_FIELDS.union({"criminal"})
AUTHENTICATE_FIELDS = {"email", "password"}
PROTECTED_ENDPOINTS = ['v1.test_protected']


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
    return set(data.keys()) == expected_fields

def user_exists(netID):
    # SQL returns number of users with netID in table.
    sql = text("SELECT COUNT(1) FROM users WHERE netID=:netID")
    result = db.session.execute(sql, {"netID": netID})
    return result.scalar() != 0


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
    expire = datetime.now() + timedelta(hours=1)
    
    # Save the session to the database
    a, b = save_session_to_db(session_id, user_id, user_type, expire)
    
    print("session result message: " + str(a), flush=True)
    print("success in inserting session: " + str(b), flush=True)

    data = {
        "user_type": user_type,
        "user_id": user_id,
        "email": email,
        "session_id": session_id
    }
    
    return data, True
    
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
        "message": "Hello World!"
    }

@version.before_request
def verify_session():

    print("checking session...", flush=True)
    print(f"Accessed endpoint: {request.endpoint}", flush=True)

    if request.endpoint in PROTECTED_ENDPOINTS:
        print("endpoint is protected", flush=True)
        session_id = request.cookies.get('session_id')

        # SQL query first deletes expired session_ids, then checks if session_id exists in table
        sql = text("""
            CALL validate_auth;
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



@version.route("/signup/user", methods=["POST"])
def signup_user():
    data = request.get_json()

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
            'result': user_data
        }
        return jsonify(response), 200
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

if __name__ == "__main__":
    app.register_blueprint(version)
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