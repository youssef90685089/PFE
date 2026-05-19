#!/usr/bin/env python3
import subprocess
import sys

# The correct BCrypt hash for "Admin@123"
correct_hash = "$2a$10$SlAUU8UlvNAqVZHMsb2OBuOq5gAJlrMAMnXQkqrXQxJKJH0gMz2OW"

users = [
    "admin@sipms.com",
    "manager@sipms.com",
    "receptionist@sipms.com",
    "test@candidate.com"
]

for email in users:
    sql = f"UPDATE users SET password_hash = '{correct_hash}' WHERE email = '{email}';"
    cmd = ["mysql", "-u", "root", "-p12345", "sipms_db", "-e", sql]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✓ Updated {email}")
        else:
            print(f"✗ Failed to update {email}")
            print(f"  Error: {result.stderr}")
    except Exception as e:
        print(f"✗ Exception updating {email}: {e}")

# Verify
print("\nVerification:")
cmd = ["mysql", "-u", "root", "-p12345", "sipms_db", "-e",
       "SELECT id, email, LENGTH(password_hash) as len, SUBSTRING(password_hash, 1, 30) as prefix FROM users;"]
result = subprocess.run(cmd, capture_output=True, text=True)
print(result.stdout)
