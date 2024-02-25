import crypto from "crypto";

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getRandomInt(min: number, max: number) {
    return crypto.randomInt(min, max);
}

export function getRandomFloat(min: number, max: number) {
    let rand = crypto.randomBytes(4).readUInt32BE(0) / 0xffffffff;
    return min + rand * (max - min);
}

export function randomString(length: number) {
    let result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            // Math.floor(Math.random() * characters.length)
            getRandomInt(0, characters.length)
        );
    }

    return result;
}

/**
 * Returns a random nearby location from the given latitude and longitude and radius in meters
 * @param lat Latitude
 * @param lon Longitude
 * @param radius Radius in meters
 * @returns A random nearby location
 */
export function randomNearbyLocation(
    lat: number,
    lon: number,
    radius: number
): { lat: number; lon: number } {
    const radiusInDegrees = radius / 111300;

    const u = getRandomFloat(0, 1);
    const v = getRandomFloat(0, 1);
    const w = radiusInDegrees * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);

    const newLat = x + lat;
    const newLng = y / Math.cos((lat * Math.PI) / 180) + lon;

    return { lat: newLat, lon: newLng };
}

/**
 * Returns the distance between two coordinates in meters
 * @param lat1 Latitude of the first location
 * @param lng1 Longitude of the first location
 * @param lat2 Latitude of the second location
 * @param lng2 Longitude of the second location
 * @returns Distance in meters
 */
export function geoDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
) {
    const earthRadius = 6371000; // Radius of the Earth in meters

    const toRadians = (angle: number) => angle * (Math.PI / 180);

    // Convert latitude and longitude from degrees to radians
    const radLat1 = toRadians(lat1);
    const radLng1 = toRadians(lng1);
    const radLat2 = toRadians(lat2);
    const radLng2 = toRadians(lng2);

    // Calculate differences in coordinates
    const deltaLat = radLat2 - radLat1;
    const deltaLng = radLng2 - radLng1;

    // Haversine formula to calculate distance
    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(radLat1) *
            Math.cos(radLat2) *
            Math.sin(deltaLng / 2) *
            Math.sin(deltaLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Distance in meters
    const distance = earthRadius * c;

    return distance;
}
