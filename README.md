# Navplan2

VFR flight planning web application with an Angular frontend, PHP backend, and MariaDB persistence.

## Local Docker Setup

This repository is set up to run locally with Docker Desktop.

The local checkout includes ignored development files for Docker Compose:

- `secrets/db_root_pw.txt`
- `secrets/db_navplan_pw.txt`
- `navplan_backend/php-app/config/navplan_local.ini`

For a fresh clone, create them from the committed examples:

```powershell
Copy-Item secrets/db_root_pw.txt.example secrets/db_root_pw.txt
Copy-Item secrets/db_navplan_pw.txt.example secrets/db_navplan_pw.txt
Copy-Item navplan_backend/php-app/config/navplan_local.ini.example navplan_backend/php-app/config/navplan_local.ini
```

Then start the stack:

```powershell
docker compose up --build
```

Open:

- Frontend: http://localhost:4200
- Backend: http://localhost:8080
- phpMyAdmin: http://localhost:8081

The local backend config is selected through the `NAVPLAN_CONFIG_FILE` environment variable in `docker-compose.yml`.

## Frontend Development

```powershell
cd navplan_frontend/angular-app
npm install
npm start
```

The Angular dev server runs at http://localhost:4200 and uses the local backend at http://localhost:8080.

## Backend Tests

```powershell
cd navplan_backend/php-app
composer install
vendor/bin/phpunit tests/unit
```

## Notes

The app is not for operational use. Always use official aviation sources for flight planning.
