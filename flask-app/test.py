
import sqlite3
import requests
import base64
import google.generativeai as genai
from flask import jsonify
import pymongo
import certifi
import re
# ASR WORKING

# Read the recorded audio file and encode it

client = pymongo.MongoClient('mongodb+srv://aakashguptace2020:nl3RxwkkyelI5l0P@cluster0.q0iiic2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', tlsCAFile=certifi.where())

db = client['Bhashini_user']  # Replace 'mydatabase' with your database name
inventory_collection = db['inventory']



def add_inventory(id):
    with open("recorded_audio.wav", "rb") as audio_file:
        audio_data = audio_file.read()
        base64_encoded_audio_data = base64.b64encode(audio_data).decode("utf-8")
    print("test file started")
# Define your actual values
    source_language = "en"
    asr_service_id = "ai4bharat/whisper-medium-en--gpu--t4"
    base64_audio_content = base64_encoded_audio_data
    # API endpoint for ASR
    asr_url = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"

    # Request payload for ASR
    asr_payload = {
        "pipelineTasks": [
            {
                "taskType": "asr",
                "config": {
                    "language": {
                        "sourceLanguage": source_language
                    },
                    "serviceId": asr_service_id,
                    "audioFormat": "wav",  # Corrected audio format
                    "samplingRate": 16000
                }
            }
        ],
        "inputData": {
            "audio": [
                {
                    "audioContent": base64_audio_content
                }
            ]
        }
    }

    # Headers for the request
    headers = {
        "Content-Type": "application/json",
        "ULCA_API_KEY": "37c6c46ede-42d0-4323-986b-bcfc7d4d7a8d",
        "USER_ID": "8ef603f5ad0d4a61860a68baf15a4178",
        "Authorization": "vYOsFgEoUt7WA7CenVqcN0S6iVjUhsU_LnkXZm98Z0TwwdoOdT_Q2c7L5xEFIpzy"
    }

    # Send POST request to ASR API with headers
    response = requests.post(asr_url, json=asr_payload, headers=headers)

    # Print the response
    if response.ok:
        # Parse the JSON response
        response_data = response.json()
        data = response_data['pipelineResponse'][0]['output'][0]['source']
    else:
        print("Error:", response.status_code, response.reason)

    genai.configure(api_key='AIzaSyAusIrjsAZ2CKqxHGLYDCKxkFd3xhBIZTI')

    model = genai.GenerativeModel('gemini-pro')
    question = ' This system will streamline categorization and retrieval processes by accurately extracting essential terms such as product company , product name, quantity, and price(only these are to be extracted). Follow this format for example : Parle biscuit: 5 packets, 10rs each.  Ensure high-level accuracy in recognizing crucial details to optimize inventory management workflows and facilitate seamless integration with inventory systems.'
    response = model.generate_content(f'{question } {data}')

    print(response.text)


    
    product_name_list = []
    quantity_list = []
    price_list = []

    # Extract information from the response
    items = response.text.strip().split('\n')
    for item in items:
        data = item.split(":")
        product_name = data[0].lstrip('-').strip()
        product_name_list.append(product_name)

        # Extract numbers from the second element
        numbers = re.findall(r'\d+', data[1])
        quantity = int(numbers[0])
        price = int(numbers[1])
        quantity_list.append(quantity)
        price_list.append(price)

        document = {
            'user_id':id,
            'product_name': product_name,
            'quantity': quantity,
            'price': price
        }

        # Check if the product with the same name and price already exists
        existing_product = inventory_collection.find_one({'product_name': product_name, 'price': price})

        if existing_product:
            # If the product exists, update the quantity
            new_quantity = existing_product['quantity'] + quantity
            inventory_collection.update_one(
                {'product_name': product_name, 'price': price},
                {'$set': {'quantity': new_quantity}}
            )
        else:
            # If the product does not exist, insert a new document
            inventory_collection.insert_one(document)

    return jsonify({"message": "good"})
  