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

Fresh Docker volumes are initialized with a small local parity seed dataset from `navplan_persistence/db_init_scripts/03_seed_local_parity_data.sql`. It adds a few representative aerodromes, navaids, airspace/reporting items, a webcam, and an SMA station so the map and API endpoints can be smoke-tested without running the full external import pipeline.

If you already have an existing `navplan_data` Docker volume, recreate it to re-run all init scripts:

```powershell
docker compose down -v
docker compose up --build
```

## Loading Real Map Overlay Data

The seed data is intentionally tiny. For map detail similar to the legacy Navplan instance, load real overlay data into the Docker database.

### Airports, Navaids and Airspaces

The current backend has an OpenAIP importer for Switzerland. Add your local OpenAIP API key to the ignored config file:

```ini
openaip_api_key = your_local_key_here
```

Then start the stack and run:

```powershell
.\navplan_backend\tools\import-openaip-ch.ps1
```

This imports OpenAIP airports, navaids and airspaces, then applies the checked-in OpenAIP correction SQL scripts. It does not import webcams or reporting points.

### Webcams, Reporting Points and Full Legacy Parity

Webcams and reporting points are local database tables in this repo, not OpenAIP imports. To mirror a legacy Navplan database, export the relevant map tables from the source database into an ignored local file such as:

```text
navplan_persistence\local_import\navplan_v1_map_data.sql
```

Recommended table set for map parity:

```text
openaip_airports
openaip_airports2
openaip_runways
openaip_runways2
openaip_radios
openaip_radios2
openaip_navaids
openaip_navaids2
openaip_airspace
openaip_airspace2
openaip_airspace_detaillevels
reporting_points
webcams
```

After placing the SQL dump locally, import it into Docker:

```powershell
.\navplan_persistence\tools\import-legacy-map-data.ps1
```

You can also pass a custom dump path:

```powershell
.\navplan_persistence\tools\import-legacy-map-data.ps1 -SqlPath D:\path\to\navplan_v1_map_data.sql
```

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
