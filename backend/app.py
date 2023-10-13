from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from flask import Blueprint, request
import yaml

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


#####################
# Helper Functions
#####################

def validate_fields(data, expected_fields):
    return set(data.keys()) == expected_fields

def user_exists(netID):
    sql = text("SELECT 1 FROM users WHERE netID=:netID")
    result = db.session.execute(sql, {"netID": netID})
    return result.scalar() is not None


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
        SELECT users.user_id, users.email, users.password 
        FROM users 
        WHERE users.email = :email
    """)
    
    tutor_sql = text("""
        SELECT tutors.tutor_id, tutors.email, tutors.password 
        FROM tutors 
        WHERE tutors.email = :email
    """)

    #execute tutor action first, as tutors should not be allowed to be users.
    tutor_result = db.session.execute(tutor_sql, {"email": email}).fetchone()
    user_result = db.session.execute(user_sql, {"email": email}).fetchone()

    if tutor_result and tutor_result[2] == password:
        data = {
            "user_type": "tutor",
            "user_id": tutor_result[0],
            "email": tutor_result[1],
            # "token": generate_token(user_result['user_id']),  # Waiting for token generation
        }
        return data, True

    elif user_result and user_result[2] == password:
        data = {
            "user_type": "user",
            "user_id": user_result[0],
            "email": user_result[1],
            # "token": generate_token(user_result['user_id']),  # Waiting for token generation
        }
        return data, True
    
    else:
        return None, False



#####################
# Routes
#####################

@app.route("/", methods=["GET"])
def index():
    return {
        "message": "Hello World!"
    }

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