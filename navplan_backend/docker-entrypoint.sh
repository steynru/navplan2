#!/bin/sh
set -eu

if [ "${NAVPLAN_AUTO_IMPORT_OPENAIP:-false}" = "true" ]; then
    (
        sleep "${NAVPLAN_AUTO_IMPORT_START_DELAY_SECONDS:-15}"

        while true; do
            echo "[navplan] checking OpenAIP auto import status..."
            php /var/www/html/php/Navplan/OpenAip/ConsoleImportIfDue.php || true
            sleep "${NAVPLAN_AUTO_IMPORT_CHECK_INTERVAL_SECONDS:-3600}"
        done
    ) &
else
    echo "[navplan] OpenAIP auto import disabled"
fi

exec docker-php-entrypoint "$@"
