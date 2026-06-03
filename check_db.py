#!/usr/bin/env python3
import mysql.connector
from mysql.connector import Error

try:
    connection = mysql.connector.connect(
        host='localhost',
        user='root',
        password='12345',
        database='sipms_db'
    )
    
    if connection.is_connected():
        cursor = connection.cursor()
        
        # Get manager's data
        cursor.execute("SELECT id, email, password_hash, active FROM users WHERE email='manager@sipms.com'")
        result = cursor.fetchone()
        
        if result:
            print(f"Manager Account Found:")
            print(f"  ID: {result[0]}")
            print(f"  Email: {result[1]}")
            print(f"  Hash: {result[2]}")
            print(f"  Active: {result[3]}")
        else:
            print("Manager account not found!")
            
        # Get all users
        print(f"\nAll Users:")
        cursor.execute("SELECT id, email, first_name, password_hash FROM users LIMIT 10")
        for row in cursor.fetchall():
            print(f"  {row[0]}: {row[1]} ({row[2]}) - Hash: {row[3][:20]}...")
            
        cursor.close()
        
except Error as e:
    print(f"Error: {e}")
finally:
    if connection.is_connected():
        connection.close()
