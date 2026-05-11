#!/bin/sh
set -e

wait_for_port() {
  python - <<'PY'
import socket, time, sys
host, port = sys.argv[1], int(sys.argv[2])
for _ in range(60):
    try:
        with socket.create_connection((host, port), timeout=1):
            sys.exit(0)
    except OSError:
        time.sleep(1)
print(f"{host}:{port}" took too long, file=sys.stderr)
sys.exit(1)
PY
"$1" "$2"
}

echo "postgres loading"
wait_for_port db 5432

echo "mongodb loading"
wait_for_port mongodb 27017

echo "making schema"
python - <<'PY'
from app import create_tables, app
create_tables(app)
PY

echo "flask starting"
exec flask run --host=0.0.0.0 --port=5000
