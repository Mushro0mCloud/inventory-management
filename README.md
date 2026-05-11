# Introduction: Thanks for pulling.
Welcome to the Inventory management system. After pulling from the repository and running "docker-compose up", you can launch this application by opening two terminals.

Assuming, of course, that no issues arise with mongoDB and PostgreSQL. This shouldn't be an issue on a new file: the containers created are called "mongodb" and "JJpostgres".

# Terminal 1
Run "cd api" to access the python virtual environment. Then run "flask run". This will launch the flask backend on port 5000 in dev mode (due to the way it has been configured).

# Terminal 2
Run "yarn start" on the CLI. This will initiate yarn, which should automatically open the application on the default browser. The application's frontend will be on port 3000.

The application then communicates to PostgreSQL on port 5432 (default). It then tracks logs to mongoDB on port 27017 (default).