# app.py

from flask import Flask, render_template, request, redirect, url_for,jsonify,make_response
from flask_cors import CORS
import subprocess
import sqlite3
import pyaudio
import wave
from inference_sdk import InferenceHTTPClient
import os
import tempfile
import pandas as pd
import threading
from subprocess import Popen
from pymongo import MongoClient
import pymongo
import hashlib
from werkzeug.security import check_password_hash
import jwt
from datetime import datetime, timezone, timedelta
import certifi
# from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from test import add_inventory
from delete import delete_inventory
from notification import trigger_notifications_manually
import json
app = Flask(__name__)
app.config['SECRET_KEY'] = 'GMfo_IV0iSTCX2AMNliveWXWV05NXRny4jhEmKRHy8A'
CORS(app, origins=['http://localhost:3000']) 

CLIENT = InferenceHTTPClient(
    api_url="https://detect.roboflow.com",
    api_key="sSJT2IiCCbjL5cMmg5ET"  # Replace with your actual API key
)


# Set parameters for audio recording
FORMAT = pyaudio.paInt16  # Audio format (16-bit PCM)
CHANNELS = 1              # Number of audio channels (mono)
RATE = 44100              # Sampling rate (samples per second)
CHUNK = 1024              # Number of frames per buffer

# Initialize PyAudio object
audio = pyaudio.PyAudio()

# Initialize variables for recording
frames = []
recording = False

client = pymongo.MongoClient('mongodb+srv://aakashguptace2020:nl3RxwkkyelI5l0P@cluster0.q0iiic2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', tlsCAFile=certifi.where())

db = client['Bhashini_user']  # Replace 'mydatabase' with your database name
users_collection = db['users']

user_id =''
# Function to start recording audio
def start_recording():
    global recording, frames
    frames = []
    recording = True
    
    # Open audio stream
    stream = audio.open(format=FORMAT,
                        channels=CHANNELS,
                        rate=RATE,
                        input=True,
                        frames_per_buffer=CHUNK)

    print("Recording started.")
    while recording:
        data = stream.read(CHUNK)
        frames.append(data)
    
    # Close the audio stream
    stream.stop_stream()
    stream.close()

# Function to stop recording audio
def stop_recording():
    global recording
    print("Recording stopped")
    recording = False

@app.route('/start_recording')
def start_rec():
    global recording_thread
    recording_thread = threading.Thread(target=start_recording)
    recording_thread.start()
    # return redirect(url_for('index'))
    return jsonify({'status': 'python-start'})

@app.route('/stop_recording')
def stop_rec():
    stop_recording()
    recording_thread.join()
    # Create a WAV file to write the audio data
    output_file = wave.open("recorded_audio.wav", "wb")
    output_file.setnchannels(CHANNELS)
    output_file.setsampwidth(audio.get_sample_size(FORMAT))
    output_file.setframerate(RATE)
    # Write recorded audio data to file
    for frame in frames:
        output_file.writeframes(frame)
    output_file.close()
    
    # return redirect(url_for('index'))
    return jsonify({'status': 'python-stopped'})

@app.route('/execute-python-file', methods=['POST'])
def execute_python_file():
    try:
        
        # Extract user_id from the POST request data
        data = request.get_json()
        user_id = data['user_id']
        print(user_id)
        # Call the add_inventory function with the user_id
        add_inventory(user_id)
        
        # Return a successful response
        return jsonify({'status': 'Python file executed successfully!'}), 200

    except Exception as e:
        # Return an error response
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/delete_python')
def delete_python():
    delete_inventory()
    # Assuming the Python file you want to execute is named 'script.py'
    
    return jsonify({'status': 'Python file executed successfully!'}), 200



@app.route('/mobilemessage/<id>', methods=['GET'])
def mobilemessage(id):
    print("mobile message")
    trigger_notifications_manually(id)
    return jsonify({"message":"Notification send successfully"}),200

@app.route('/login', methods=['POST'])
def login():
    email = request.form['email']
    password = request.form['password']

    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE email=? AND password=?", (email, password))
    user = c.fetchone()
    conn.close()

    return jsonify(user)


@app.route('/image', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        # Save the uploaded file to a temporary location
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            file_path = temp_file.name
            file.save(file_path)
        
        try:
            # Run inference on the uploaded image
            inference_result = CLIENT.infer(
                file_path,
                model_id="indian-market/22"
            )

            # Extract class names and count their occurrences
            class_counts = {}
            for prediction in inference_result['predictions']:
                class_name = prediction.get('class')
                if class_name:
                    if class_name in class_counts:
                        class_counts[class_name] += 1
                    else:
                        class_counts[class_name] = 1

            # Convert the result to JSON format
            class_counts_json = json.dumps(class_counts, indent=4)

            # Return the result as JSON
            return jsonify(class_counts_json), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

        finally:
            # Clean up the temporary file
            if os.path.exists(file_path):
                os.remove(file_path)

@app.route('/user/<user_id>', methods=['GET'])
def get_user(user_id):
    user = users_collection.find_one({'_id': ObjectId(user_id)}, {'password': 0})  # Exclude password from the response
    if user:
        user['_id'] = str(user['_id'])
        response = make_response(jsonify(user))
        response.set_cookie('user_id', user_id)
        return response
        
    return jsonify({'message': 'User not found'}), 404

@app.route('/getmastertable', methods=['GET'])
def getmastertable():
    collection = db['MasterTable']
    inventory_data = list(collection.find())

    # Convert ObjectId to string in each document
    for item in inventory_data:
        item['_id'] = str(item['_id'])

    return jsonify(inventory_data)


@app.route('/add-product', methods=['POST'])
def add_product():
    inventory_collection = db['inventory']
    products_collection = db['products']
    data = request.get_json()
    product_name = data.get('productName')
    quantity = data.get('quantity')
    price = data.get('price')
    user_id = data.get('ID')
    print("jahkan")
    # Check if the product ID already exists
    if inventory_collection.find_one({'product_name': product_name}):
        return jsonify({"message": "Product ID already exists"}), 400

    product_data = {
        'productName': product_name,
        'quantity': quantity,
        'price': price,
        'ID': user_id
    }

    # Insert the product data into MongoDB
    products_collection.insert_one(product_data)

    return jsonify({"message": "Product added successfully"}), 201


@app.route('/upload-csv', methods=['POST'])
def upload_csv():
    csv_file = request.files['file']
    user_id = request.form.get('ID')
    inventory_collection = db['inventory']
    products_collection = db['products']
    print(csv_file)
    if not csv_file:
        return jsonify({'error': 'No file provided'}), 400
    
    try:
        # Read the CSV file using Pandas
        df = pd.read_csv(csv_file)
        
        # Ensure the CSV has the required columns
        required_columns = {'productName', 'quantity', 'price'}
        if not required_columns.issubset(df.columns):
            return jsonify({'error': f'Missing required columns: {required_columns.difference(df.columns)}'}), 400

        for index, row in df.iterrows():
            product_name = row['productName']
            if inventory_collection.find_one({'product_name': product_name}):
                # Product with the same name already exists, skip adding it
                continue

            product_data = {
                'productName': product_name,
                'quantity': int(row['quantity']),
                'price': float(row['price']),
                'ID': user_id
            }
            products_collection.insert_one(product_data)

        return jsonify({'message': 'CSV data added successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/start_barcode_scanner', methods=['GET'])
def start_barcode_scanner():
    try:
        # Start the barcode.py script using subprocess
        subprocess.Popen(['python', 'flask-app\\barcode.py'])
        return jsonify({'message': 'Barcode scanner started successfully!'}), 200
    except Exception as e:
        return jsonify({'message': 'Failed to start barcode scanner', 'error': str(e)}), 500


@app.route('/barcode_data', methods=['POST'])
def receive_barcode_data():
    global barcode_data
    data = request.json
    barcode_data = {
        'data': data['data'],
        'type': data['type']
    }
    return jsonify({'message': 'Barcode data received'}), 200

barcode_data = {}

@app.route('/get_barcode_data', methods=['GET'])
def get_barcode_data():
    global barcode_data
    return jsonify(barcode_data)


#addition in app.py



@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')
    address = data.get('address')
    city = data.get('city')
    state = data.get('state')
    postalCode = data.get('postalCode')
    shopName = data.get('shopName')

    # Check if the email already exists
    if users_collection.find_one({'email': email}):
        return jsonify({"message": "Email already exists"}), 400

    # Optionally, hash the password before storing it for security
    # hashed_password = hash_password(password)

    user_data = {
        'name': name,
        'email': email,
        'phone': phone,
        'password': password,  # Use 'hashed_password' if hashing the password
        'address': address,
        'city': city,
        'state': state,
        'postalCode': postalCode,
        'shopName': shopName
    }

    # Insert the user data into MongoDB
    users_collection.insert_one(user_data)

    return jsonify({"message": "User created successfully"}), 201

@app.route('/signin', methods=['POST'])
def signin():
    
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')
    # hashed_password = hashlib.sha256(password.encode()).hexdigest()

    # Hash the provided password

    # Find the user in the database
    user = users_collection.find_one({'email': email, 'password': password})

    if user and user['password'] == password:
        token = jwt.encode({
            'user_id': str(user['_id']),
            'exp': datetime.now(timezone.utc) + timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm='HS256')
    
        return jsonify({'token': token}), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401



# @app.route('/start_streamlit', methods=['GET'])
# def start_streamlit():
#     # Start the Streamlit app using a subprocess
#    streamlit_process = Popen(['C:\\Users\\ASUS\\OneDrive\\Desktop\\bhashini\\steamlit.py', 'run', 'streamlit.py'])
#    return redirect('/')




@app.route('/product_inventory/<user>')
def product_inventory(user):
    collection = db['inventory']
    global user_id
    user_id = user
    inventory_data = list(collection.find({'user_id': user}, {'_id': 0}))  
    # Render the HTML template with inventory data
    return jsonify( inventory=inventory_data)

@app.route('/manufacturers/<id>')
def manufacturers(id):
    collection = db['inventory']
    inventory_data = list(collection.find({'user_id': id, 'quantity': {'$lt': 10}}, {'_id': 0}))
    print(user_id,inventory_data,"dwijskcnkcxknxn")
    
    # Render the HTML template with inventory data
    return jsonify( inventory=inventory_data)


if __name__ == '__main__':
    app.run(debug=True)
    
    







