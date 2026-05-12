# Introduction: Thanks for pulling.
Welcome to the Inventory Management System. After pulling from the repository, you must navigate to the repository root.

Run this command in the repository root. Ensure the Docker Engine is running.
```bash
docker-compose up
```
This should initialize four containers, that should be named automatically. Find their names by running:
```bash
docker ps
```
## Checking the databases
To check the **PostgreSQL** database, enter the postgres command line using:
```bash
docker exec -it inventory-management-db-1 psql -U postgres
```
```bash
\dt
SELECT * FROM inventory_items;
\q
```
Where `inventory-management-db-1` is the name of your container as shown when running `docker ps`.

To check the **MongoDB** database, enter the mongodb command line using:
```bash
docker exec -it inventory-management-mongodb-1 mongosh -u "root" -p "example"
```
```bash
use api_logs
db.api_logs.find().pretty()
exit
```
where `inventory-management-mongodb-1` is the name of your container as shown when running `docker ps`.
