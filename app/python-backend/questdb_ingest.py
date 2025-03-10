# python-backend/questdb_ingest.py
from questdb.ingress import Sender, IngressError, TimestampNanos
import sys
import datetime
import time

def example():
    try:
        # Connect to QuestDB using Tailscale IP of Windows machine (neurosphere)
        # Use port 9009 for ILP over TCP.
        with Sender('100.99.242.6', 9009, buffer_size=1024) as sender:  # Corrected Sender usage
            print("Sender connected successfully.") # CONFIRM CONNECTION
            while True:
                try:  # Using a try-except block inside the loop
                    sender.row(
                        'trades',  # Table name
                        symbols={
                            'symbol': 'ETH-USD',
                            'side': 'sell'
                        },
                        columns={
                            'price': 2615.54 + (time.time() % 10),  # Varying price
                            'amount': 0.00044
                        },
                        at=TimestampNanos.now()  # Current timestamp
                    )
                    print(f"Sent ETH-USD row: {TimestampNanos.now()}") # LOG EACH ROW

                    sender.row(
                        'trades',
                        symbols={
                            'symbol': 'BTC-USD',
                            'side': 'sell'
                        },
                        columns={
                            'price': 39269.98 + (time.time() % 20),  # Varying price
                            'amount': 0.001
                        },
                        at=TimestampNanos.now()
                    )
                    print(f"Sent BTC-USD row: {TimestampNanos.now()}")  # LOG EACH ROW

                    sender.flush()  # Explicitly flush to send the data immediately
                    print("Flushed data to QuestDB.")  # CONFIRM FLUSH
                    time.sleep(1)
                except IngressError as e:
                    print(f"Inner IngressError: {e}", file=sys.stderr)

    except IngressError as e:
        print(f"Outer IngressError: {e}", file=sys.stderr)
    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)  # Catch unexpected errors

if __name__ == '__main__':
    example()