export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomString(length: number) {
    let result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * characters.length)
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
    const r = radius / 111300; // = 100 meters

    const y0 = lat;
    const x0 = lon;
    const u = crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;
    const v = crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;
    const w = r * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y1 = w * Math.sin(t);
    const x1 = x / Math.cos(y0);

    return {
        lat: y0 + y1,
        lon: x0 + x1,
    };
}
