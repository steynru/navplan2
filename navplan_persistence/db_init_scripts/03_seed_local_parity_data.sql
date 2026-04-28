-- Minimal local parity data for Docker Desktop smoke testing.
-- This is intentionally small and deterministic; production data still comes
-- from the import pipelines.

START TRANSACTION;

INSERT IGNORE INTO `openaip_airports2`
    (`id`, `type`, `country`, `name`, `icao`, `latitude`, `longitude`, `elevation`, `zoommin`, `geohash`, `lonlat`)
VALUES
    (990001, 'AIRPORT', 'CH', 'Bern-Belp', 'LSZB', 46.9125, 7.4992, 1674, 7, 'u0m8', ST_GeomFromText('POINT(7.4992 46.9125)')),
    (990002, 'AIRPORT', 'CH', 'Lausanne-Blécherette', 'LSGL', 46.5453, 6.6167, 2041, 8, 'u0k8', ST_GeomFromText('POINT(6.6167 46.5453)'));

INSERT IGNORE INTO `openaip_airports`
    (`id`, `type`, `country`, `name`, `icao`, `latitude`, `longitude`, `elevation`, `lonlat`)
VALUES
    (990001, 'AIRPORT', 'CH', 'Bern-Belp', 'LSZB', 46.9125, 7.4992, 1674, ST_GeomFromText('POINT(7.4992 46.9125)')),
    (990002, 'AIRPORT', 'CH', 'Lausanne-Blécherette', 'LSGL', 46.5453, 6.6167, 2041, ST_GeomFromText('POINT(6.6167 46.5453)'));

INSERT IGNORE INTO `openaip_runways2`
    (`id`, `airport_id`, `operations`, `name`, `surface`, `length`, `width`, `direction`, `tora`, `lda`, `papi`)
VALUES
    (990001, 990001, 'ACTIVE', '14', 'ASPH', 1730, 30, 140, 1730, 1730, 1),
    (990002, 990001, 'ACTIVE', '32', 'ASPH', 1730, 30, 320, 1730, 1730, 1),
    (990003, 990002, 'ACTIVE', '18', 'GRAS', 875, 30, 180, 875, 875, 0),
    (990004, 990002, 'ACTIVE', '36', 'GRAS', 875, 30, 360, 875, 875, 0);

INSERT IGNORE INTO `openaip_radios2`
    (`id`, `airport_id`, `category`, `frequency`, `type`, `name`, `is_primary`)
VALUES
    (990001, 990001, 'COM', 121.025, 'TOWER', 'Bern Tower', 1),
    (990002, 990002, 'COM', 118.250, 'INFO', 'Lausanne Info', 1);

INSERT IGNORE INTO `openaip_navaids2`
    (`id`, `type`, `country`, `name`, `kuerzel`, `latitude`, `longitude`, `elevation`, `frequency`, `declination`, `truenorth`, `zoommin`, `geohash`, `lonlat`)
VALUES
    (990001, 'VOR_DME', 'CH', 'BERN', 'BER', 46.9139, 7.4972, 1674, '110.85', 2.0, 0, 7, 'u0m8', ST_GeomFromText('POINT(7.4972 46.9139)')),
    (990002, 'NDB', 'CH', 'FRIBOURG', 'FRI', 46.8033, 7.1517, 2100, '110.00', 2.0, 0, 8, 'u0m2', ST_GeomFromText('POINT(7.1517 46.8033)'));

INSERT IGNORE INTO `openaip_airspace2`
    (`id`, `category`, `class`, `type`, `country`, `name`, `alt_top_reference`, `alt_top_height`, `alt_top_unit`, `alt_bottom_reference`, `alt_bottom_height`, `alt_bottom_unit`, `diameter`, `polygon`, `extent`)
VALUES
    (
        990001,
        'CTR',
        'D',
        'CTR',
        'CH',
        'CTR BERN LOCAL TEST',
        'MSL',
        5000,
        'FT',
        'GND',
        0,
        'FT',
        0.20,
        '7.3500 46.8500, 7.6500 46.8500, 7.6500 47.0000, 7.3500 47.0000, 7.3500 46.8500',
        ST_GeomFromText('POLYGON((7.3500 46.8500, 7.6500 46.8500, 7.6500 47.0000, 7.3500 47.0000, 7.3500 46.8500))')
    );

INSERT IGNORE INTO `openaip_airspace_detaillevels`
    (`id`, `airspace_id`, `zoommin`, `zoommax`, `polygon`)
VALUES
    (990001, 990001, 6, 20, '7.3500 46.8500, 7.6500 46.8500, 7.6500 47.0000, 7.3500 47.0000, 7.3500 46.8500');

INSERT IGNORE INTO `reporting_points`
    (`id`, `type`, `airport_icao`, `name`, `heli`, `inbd_comp`, `outbd_comp`, `min_ft`, `max_ft`, `latitude`, `longitude`, `polygon`, `extent`)
VALUES
    (990001, 'POINT', 'LSZB', 'ECHO LOCAL TEST', 0, 1, 1, NULL, NULL, 46.9250, 7.6500, NULL, ST_GeomFromText('POINT(7.6500 46.9250)')),
    (990002, 'SECTOR', 'LSZB', 'NORTH LOCAL TEST', 0, 1, 1, 2500, 4500, NULL, NULL, '7.4500 46.9600, 7.6000 46.9600, 7.6000 47.0200, 7.4500 47.0200, 7.4500 46.9600', ST_GeomFromText('POLYGON((7.4500 46.9600, 7.6000 46.9600, 7.6000 47.0200, 7.4500 47.0200, 7.4500 46.9600))'));

INSERT IGNORE INTO `webcams`
    (`id`, `name`, `url`, `latitude`, `longitude`, `airport_icao`)
VALUES
    (990001, 'Bern-Belp Local Test Webcam', 'https://example.com/navplan-local-test-webcam.jpg', 46.9125, 7.4992, 'LSZB');

INSERT IGNORE INTO `meteo_sma_stations`
    (`id`, `station_id`, `name`, `latitude`, `longitude`, `altitude_m`)
VALUES
    (990001, 'BERN', 'Bern Local Test Station', 46.9125, 7.4992, 510);

COMMIT;
