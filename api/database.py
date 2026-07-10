import os
from sqlalchemy import create_engine

DB_URL = os.getenv('DATABASE_URL', 'postgresql+psycopg2://postgres:postgres@localhost:5432/postgres')

engine = create_engine(DB_URL)

def test_connection():
    with engine.connect() as connection:
        print("Successfully connected to Dockerized Postgres!")


if __name__ == '__main__':
    test_connection()

# test