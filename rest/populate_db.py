import argparse
from sqlalchemy import create_engine


if __name__ == "__main__":
    # Parse command-line arguments
    parser = argparse.ArgumentParser()
    parser.add_argument("--user", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--host", required=True)
    args = parser.parse_args()

    # Create database engine
    engine = create_engine(f"postgresql://{args.user}:{args.password}@{args.host}/mydb")

    # Write initial data to the database using SQLAlchemy
    with engine.connect() as conn:
        conn.execute("INSERT INTO users (username, password) VALUES ('user1', 'password1')")
        conn.execute("INSERT INTO users (username, password) VALUES ('user2', 'password2')")
        conn.execute("INSERT INTO users (username, password) VALUES ('user3', 'password3')")
