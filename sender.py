import csv
import json
import time
import requests
from datetime import datetime

SPEEDUP = 10 

# Loading data
with open('ip_addresses.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    data = sorted(list(reader), key=lambda x: int(x['timestamp']))

start_time = int(data[0]['timestamp'])
prev_time = start_time

for row in data:
    try:
        current_time = int(row['timestamp'])
        delay = (current_time - prev_time) / SPEEDUP
        if delay > 0:
            time.sleep(delay)
        prev_time = current_time

        payload = {
            "ip": row["ip"],
            "latitude": float(row["latitude"]),
            "longitude": float(row["longitude"]),
            "timestamp": current_time,
            "suspicious": int(row["suspicious"])
        }

        res = requests.post("http://localhost:5000/receive", json=payload)
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Sent: {payload} | Status: {res.status_code}")

    except (ValueError, KeyError) as e:
        print(f"Skipping invalid row: {row} | Error: {e}")
