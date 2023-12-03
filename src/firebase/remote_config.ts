import { remoteConfig } from "firebase-admin";

class RemoteConfigData {
    static minPrice: number = 1;
    static maxPrice: number = 10000;

    static minRadius: number = 5;
    static maxRadius: number = 100;

    static minMedia: number = 1;
    static maxMedia: number = 25;

    static async fetch() {
        const template = await remoteConfig().getTemplate();
        const params = template.parameters;

        this.minPrice = Number(params["min_price"].defaultValue || 1);
        this.maxPrice = Number(params["max_price"].defaultValue || 10000);

        this.minRadius = Number(params["min_radius"].defaultValue || 5);
        this.maxRadius = Number(params["max_radius"].defaultValue || 100);

        this.minMedia = Number(params["min_media"].defaultValue || 1);
        this.maxMedia = Number(params["max_media"].defaultValue || 25);
    }
}

export default RemoteConfigData;
