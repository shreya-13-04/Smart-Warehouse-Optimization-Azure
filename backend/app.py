from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import uuid
from datetime import datetime
from azure.storage.blob import BlobServiceClient
from azure.cosmos import CosmosClient
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential
import os

# ---------------------------------
# Flask App
# ---------------------------------
app = Flask(__name__, static_folder="static", template_folder=".")
CORS(app)

# ---------------------------------
# Azure Blob Storage Configuration
# ---------------------------------
connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
container_name = "datasets"

blob_service = BlobServiceClient.from_connection_string(connection_string)

try:
    container_client = blob_service.get_container_client(container_name)
    if not container_client.exists():
        blob_service.create_container(container_name)
except Exception as e:
    print("Blob container error:", e)

# ---------------------------------
# Azure Cosmos DB Configuration
# ---------------------------------
cosmos_client = CosmosClient(
    os.getenv("COSMOS_URI"),
    credential=os.getenv("COSMOS_KEY")
)

database = cosmos_client.get_database_client("warehouse-db")
container = database.get_container_client("results")

# ---------------------------------
# Azure AI Language Configuration
# ---------------------------------
language_endpoint = os.getenv("AZURE_LANGUAGE_ENDPOINT")
language_key = os.getenv("AZURE_LANGUAGE_KEY")

credential = AzureKeyCredential(language_key)

text_analytics_client = TextAnalyticsClient(
    endpoint=language_endpoint,
    credential=credential
)

# ---------------------------------
# Utility: Calculate Utilization
# ---------------------------------
def calculate_utilization(df):

    total = len(df)
    occupied = len(df[df['status'] == 'occupied'])
    empty = len(df[df['status'] == 'empty'])
    reserved = len(df[df['status'] == 'reserved'])
    blocked = len(df[df['status'] == 'blocked'])

    utilization_rate = round((occupied / total) * 100, 2) if total > 0 else 0

    return {
        "total_slots": total,
        "occupied": occupied,
        "empty": empty,
        "reserved": reserved,
        "blocked": blocked,
        "utilization_rate": utilization_rate
    }

# ---------------------------------
# Azure AI Sentiment Analysis
# ---------------------------------
def analyze_operations(df):

    texts = df['notes'].dropna().astype(str).tolist()

    if not texts:
        return {"message": "No notes available"}

    positive = 0
    negative = 0
    neutral = 0

    for i in range(0, len(texts), 10):

        batch = texts[i:i+10]
        response = text_analytics_client.analyze_sentiment(batch)

        for doc in response:

            if not doc.is_error:

                if doc.sentiment == "positive":
                    positive += 1
                elif doc.sentiment == "negative":
                    negative += 1
                else:
                    neutral += 1

    return {
        "positive": positive,
        "negative": negative,
        "neutral": neutral
    }

# ---------------------------------
# API Endpoint
# ---------------------------------
@app.route('/analyze', methods=['POST'])
def analyze():

    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']

    try:

        df = pd.read_csv(file)

        response = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat()
        }

        # ---------------------------------
        # Upload to Blob Storage
        # ---------------------------------
        file.seek(0)

        blob_name = f"{uuid.uuid4()}_{file.filename}"

        blob_client = blob_service.get_blob_client(
            container=container_name,
            blob=blob_name
        )

        blob_client.upload_blob(file, overwrite=True)

        response["blob_url"] = blob_client.url

        # ---------------------------------
        # Warehouse Metrics
        # ---------------------------------
        if 'status' in df.columns:

            response["metrics"] = calculate_utilization(df)

            if 'zone' in df.columns and 'row' in df.columns and 'column' in df.columns:

                response["slots_data"] = df[['slot_id','zone','row','column','status','item_category']] \
                    .fillna('').to_dict(orient='records')

        # ---------------------------------
        # AI Sentiment Analysis
        # ---------------------------------
        if 'notes' in df.columns:
            response["operations_analysis"] = analyze_operations(df)

        # ---------------------------------
        # Save to Cosmos DB
        # ---------------------------------
        try:
            container.create_item(body=response)
            response["cosmos_status"] = "Saved Successfully"

        except Exception as cosmos_error:

            print("Cosmos Error:", cosmos_error)
            response["cosmos_status"] = "Cosmos Failed But Backend Running"

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------------
# Serve React Frontend
# ---------------------------------
@app.route("/")
def serve():
    return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def static_proxy(path):
    return send_from_directory(".", path)

# ---------------------------------
# Run App
# ---------------------------------
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000)