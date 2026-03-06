# Smart Warehouse Optimization – Azure

A cloud-based smart warehouse optimization system built using Microsoft Azure.  
The platform analyzes warehouse slot utilization, detects operational bottlenecks using AI, and visualizes insights through interactive dashboards.

---

## Project Overview

This project demonstrates a scalable cloud architecture that:

- Analyzes warehouse slot utilization
- Computes occupancy and congestion metrics
- Performs AI-based sentiment analysis on operation logs
- Stores processed data in Azure Cosmos DB
- Visualizes insights using Power BI
- Secures access using Azure Active Directory

---

## Architecture

<div align="center">


User Dataset  
     ⬇  
Azure Blob Storage  
     ⬇  
Azure App Service (Flask Backend)  
     ⬇  
Azure AI Language (Text Analytics)  
     ⬇  
Azure Cosmos DB  
     ⬇  
Power BI Dashboard  

</div>

---

## Technologies Used

- Python (Flask)
- Microsoft Azure
  - Azure Blob Storage
  - Azure App Service
  - Azure Cosmos DB
  - Azure AI Language
  - Azure Active Directory
- Power BI
- Pandas
- Azure SDK

---

## Dataset

The project uses:

- `warehouse_slots.csv` – Slot utilization dataset  
- `operations_logs.csv` – Operational logs dataset  

Datasets are synthetically generated for analytics and AI demonstration purposes.

---

## How to Run Locally
1. Clone the repository:
```bash
git remote add origin https://github.com/shreya-13-04/Smart-Warehouse-Optimization-Azure.git
```
2.Install dependencies:
```bash
pip install -r requirements.txt
```
3.Run the Flask app:
```bash
python app.py
```
---
## Key Features
- Real-time utilization calculation
- Zone-based congestion analysis
- Sentiment analysis of warehouse logs
- Cloud-native deployment
- Scalable and modular architecture

## Authors
- Shreya B
- Banda Vyshnavi
  
## License
- This project is developed for academic purposes.
