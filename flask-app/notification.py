import sqlite3
from twilio.rest import Client
import pyttsx3
import time
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import pymongo
import os
import certifi
# Initialize Twilio client
account_sid = os.getenv('TWILIO_ACCOUNT_SID') # Your Twilio Account SID
auth_token = os.getenv('AUTH_TOKEN')  # Your Twilio Auth Token
client = Client(account_sid, auth_token)

# Function to fetch data from the database
def fetch_data(id):
    client = pymongo.MongoClient('mongodb+srv://aakashguptace2020:nl3RxwkkyelI5l0P@cluster0.q0iiic2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', tlsCAFile=certifi.where())

    db = client['Bhashini_user'] 
    user_collection = db['inventory']
    inventory_data = list(user_collection.find({'user_id': id, 'quantity': {'$lt': 10}}, {'_id': 0,'product_name': 1, 'quantity': 1, 'price': 1}))
    # print(user_id,inventory_data,"dwijskcnkcxknxn")
    print(inventory_data)
    return inventory_data

def send_combined_sms(receiver_number, items):
    twilio_phone_number = '++12563635910'  # Your Twilio phone number
    message_body = "\n".join([
        f"Product Name: {item[0]}, Quantity: {item[1]}, Price: ₹{item[2]:.2f}"
        for item in items
    ])
    message = client.messages.create(
        body=f"Items needing restocking:\n{message_body}\nRestock NOW !!!",
        from_=twilio_phone_number,
        to=receiver_number
    )
    print("Message SID:", message.sid)

# Function to send combined email notification
def send_combined_email(receiver_email, items):
    sender_email = "advaitchandorkar612@gmail.com"
    password = "fcme lbop jrqt drqq"

    message = MIMEMultipart()
    message['From'] = sender_email
    message['To'] = receiver_email
    message['Subject'] = "Inventory Notification"

    message_body = "\n".join([
        f"Product Name: {item[0]}, Quantity: {item[1]}, Price: ₹{item[2]:.2f}"
        for item in items
    ])
    print(message_body)
    body = f"Items needing restocking:\n{message_body}\nRestock NOW !!! "
    message.attach(MIMEText(body, 'plain'))

    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, message.as_string())

# Function to convert text to speech
def convert_to_speech(product_name, quantity):
    engine = pyttsx3.init()
    engine.say(f"Product Name: {product_name}, Quantity: {quantity}")
    engine.runAndWait()

# Main function to send notifications every 5 hours
def send_notifications():
    while True:
        # Fetch data from the database
        data = fetch_data()

        # Accumulate items needing restocking
        items_needing_restocking = []

        for product in data:
            product_name, quantity = product
            items_needing_restocking.append((product_name, quantity))

        # Check if any items need restocking
        if items_needing_restocking:
            # Send combined SMS notification using Twilio
            receiver_number = "+918369196926"  # Corrected phone number format
            send_combined_sms(receiver_number, items_needing_restocking)

            # Send combined email notification
            receiver_email = "advaitc612@gmail.com"
            send_combined_email(receiver_email, items_needing_restocking)

            # Convert text to speech for each item separately
            for item in items_needing_restocking:
                product_name, quantity = item
                convert_to_speech(product_name, quantity)

        # Sleep for 5 hours before sending the next notification
        time.sleep(5 * 60 * 60)

# Function to trigger notifications manually
def trigger_notifications_manually(id):

    data = fetch_data(id)

    # Accumulate items needing restocking
    items_needing_restocking = []

    for product in data:
        items_needing_restocking.append((product['product_name'], product['quantity'],product['price']))
        print(items_needing_restocking)

    # Check if any items need restocking
    if items_needing_restocking:
        # Send combined SMS notification using Twilio
        receiver_number = "+918369196926"  # Corrected phone number format
        send_combined_sms(receiver_number, items_needing_restocking)

        # Send combined email notification
        receiver_email = "advaitc612@gmail.com"
        send_combined_email(receiver_email, items_needing_restocking)

        # Convert text to speech for each item separately
        # for item in items_needing_restocking:
        #     product_name, quantity = item
        #     convert_to_speech(product_name, quantity)

# Example usage of manual trigger
# trigger_notifications_manually()
