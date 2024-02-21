import { remoteConfig } from "firebase-admin";

class RemoteConfigData {
    static minPrice: number = 1; // Used for the minimum price of a job
    static maxPrice: number = 10000; // Used for the maximum price of a job

    static minRadius: number = 5; // Used for the minimum radius in a post
    static maxRadius: number = 100; // Used for the maximum radius in a post

    static minMedia: number = 1; // Used for the minimum number of media in a message
    static maxMedia: number = 25; // Used for the maximum number of media in a message

    static recentMessagesCount: number = 10; // Used for the number of recent messages to fetch

    static maxAttachments: number = 10; // Used for the maximum number of attachments in a message

    static searchThreshold: number = 0; // Used for vector search threshold value for similarity search

    static async fetch() {
        const template = await remoteConfig().getTemplate();
        const params = template.parameters;

        // Set the default values

        // @ts-ignore
        this.minPrice = parseInt(params["min_price"].defaultValue.value || 1);
        this.maxPrice = parseInt(
            // @ts-ignore
            params["max_price"].defaultValue.value || 10000
        );

        // @ts-ignore
        this.minRadius = parseInt(params["min_radius"].defaultValue.value || 5);
        this.maxRadius = parseInt(
            // @ts-ignore
            params["max_radius"].defaultValue.value || 100
        );

        // @ts-ignore
        this.minMedia = parseInt(params["min_media"].defaultValue.value || 1);
        // @ts-ignore
        this.maxMedia = parseInt(params["max_media"].defaultValue.value || 25);

        this.recentMessagesCount = parseInt(
            // @ts-ignore
            params["recent_messages_cnt"].defaultValue.value || 10
        );

        this.maxAttachments = parseInt(
            // @ts-ignore
            params["max_attachments"].defaultValue.value || 10
        );

        this.searchThreshold = parseFloat(
            // @ts-ignore
            params["search_threshold"].defaultValue.value || 0
        );
    }
}

export default RemoteConfigData;
