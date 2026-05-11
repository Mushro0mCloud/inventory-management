#!/bin/sh
set -e

wait_for_port() {
  host=$1
  port=$2
  python -c "
import socket, time
for _ in range(60):
    try:
        with socket.create_connection(('$host', int($port)), timeout=1):
            exit(0)
    except OSError:
        time.sleep(1)
print(f'$host:$port took too long', file=__import__('sys').stderr)
exit(1)
"
}

echo "postgres loading"
wait_for_port db 5432

echo "mongodb loading"
wait_for_port mongodb 27017

echo "making schema"
python - <<'PY'
from schema import create_tables
from app import app
create_tables(app)
PY

echo "flask starting"
exec flask run --host=0.0.0.0 --port=5000
