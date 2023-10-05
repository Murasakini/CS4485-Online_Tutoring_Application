from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{username}:{password}@online-tutoring-application.ccm0nvuvbmz8.us-east-2.rds.amazonaws.com:3306/ota_db'
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

with app.app_context():
    connection = db.engine.connect()
    try:
        result = connection.execute(text("SELECT * FROM users"))
        print("Connection successful:", result.fetchone())
    except Exception as e:
        print("Error:", e)
    finally:
        connection.close()


@app.route("/", methods=["GET"])
def index():
    return {
        "message": "Hello World!"
    }



if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")