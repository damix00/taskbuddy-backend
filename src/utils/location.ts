// Utility functions for getting location data

export async function getIPLocation(ip: string) {
    const result = await fetch(`https://get.geojs.io/v1/ip/geo/${ip}.json`);
    const data = await result.json();

    return data;
}

export async function getGeoData(lat: number, lon: number) {
    const result = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    const data = await result.json();
    return data;
}
