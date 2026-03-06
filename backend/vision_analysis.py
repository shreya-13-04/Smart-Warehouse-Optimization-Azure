import requests
import pandas as pd
import pyodbc

# -----------------------------
# Azure SQL Connection
# -----------------------------
conn = pyodbc.connect(
    "Driver={ODBC Driver 17 for SQL Server};"
    "Server=warehouse-ai-server.database.windows.net;"
    "Database=warehouse-ai-db;"
    "Uid=azureadmin;"
    "Pwd=warehouse@1234;"
    "Encrypt=yes;"
)

cursor = conn.cursor()

# -----------------------------
# Azure Vision API

import os

subscription_key = os.getenv("AZURE_VISION_KEY")
endpoint = os.getenv("AZURE_VISION_ENDPOINT")
# -----------------------------
# Dataset
# -----------------------------
csv_file = "dataset/warehouse_image_dataset.csv"
df = pd.read_csv(csv_file)

# -----------------------------
# Process Images
# -----------------------------
for index, row in df.iterrows():

    image_url = row["image_url"]

    api_url = f"{VISION_ENDPOINT}/computervision/imageanalysis:analyze?api-version=2024-02-01&features=caption,tags"

    headers = {
        "Ocp-Apim-Subscription-Key": VISION_KEY,
        "Content-Type": "application/json"
    }

    body = {
        "url": image_url
    }

    response = requests.post(api_url, headers=headers, json=body)
    result = response.json()

    print("\nImage:", row["image_name"])

    caption = ""
    tags = ""

    if "captionResult" in result:
        caption = result["captionResult"]["text"]
        print("Caption:", caption)

    if "tagsResult" in result:
        tag_list = [tag["name"] for tag in result["tagsResult"]["values"]]
        tags = ",".join(tag_list)
        print("Tags:", tag_list)

    # -----------------------------
    # Insert into Azure SQL
    # -----------------------------
    cursor.execute(
        """
        INSERT INTO vision_results (image_name, image_url, caption, tags)
        VALUES (?, ?, ?, ?)
        """,
        row["image_name"],
        image_url,
        caption,
        tags
    )

    conn.commit()

print("\n✅ All images processed and stored in Azure SQL")