import pymongo
import certifi
import random
client = pymongo.MongoClient('mongodb+srv://aakashguptace2020:nl3RxwkkyelI5l0P@cluster0.q0iiic2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', tlsCAFile=certifi.where())

db = client['Bhashini_user']  # Replace 'mydatabase' with your database name
users_collection = db['MasterTable']

# Function to add document to collection
def add_document(product_name):
    price = random.randint(1, 100)  # Random price between 1 and 1000
    document = {
        "product_name": product_name,
        "quantity": 0,
        "price": price
    }
    users_collection.insert_one(document)
    # print(f"Added document for {product_name} with price {price}")

# Example usage
if __name__ == "__main__":
    products = ["24Mantra", "3D Fryums Ajwah", "50 50 Gol Maal", "50 50 sweet and salty", "50 50 top", "72H AxeSignature", "8am soyachunks", "ALphonsoMangoPulp GoldenCrown", "Aakash", "Aarambh", "Aashirvaad", "Aashirvaad Besan", "Aashirvaad Salt", "Aashirvaad TurmericPowder", "Abzorb", "AcaciaHoney KhushNuma", "Act2", "Action Dishwash Liquid", "ActiveSaltNeem Toothpaste Colgate", "ActiveSalt Toothpaste Colgate", "Adrenaline 48H AxeSignature", "Agarbathi Bansuri", "Agarbathi Baratanatyam", "Agarbathi Cycle", "Agarbatti SalShakti", "Agastya", "Agrabathi Mangaldeep", "Agrawal", "AirFreshner", "AllOut"]  # Add more products if needed
    for product in products:
        add_document(product)
    print("done")
