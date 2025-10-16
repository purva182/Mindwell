import sqlite3
import pandas as pd

db_file = 'manamitra.db'
conn = sqlite3.connect(db_file)
try:
    df = pd.read_sql_query("SELECT * FROM conversations", conn)
    if not df.empty:
        print("Conversations stored in the database:")
        print(df.to_string())
    else:
        print("No conversations found in the database.")
except pd.io.sql.DatabaseError as e:
    print(f"An error occurred: {e}")
    print("Listing all tables in the database to verify...")
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("Tables:", tables)
finally:
    conn.close()
