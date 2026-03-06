import pyodbc

conn = pyodbc.connect(
    "Driver={ODBC Driver 17 for SQL Server};"
    "Server=warehouse-ai-server.database.windows.net;"
    "Database=warehouse-ai-db;"
    "Uid=warehouseadmin;"
    "Pwd=warehouse@1234;"
    "Encrypt=yes;"
)

print("Connected successfully!")