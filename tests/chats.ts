import * as connection from "../src/database/connection";
import Channel from "../src/database/wrappers/chats/channels/index";
import {
    ChannelReads,
    ChannelWrites,
} from "../src/database/wrappers/chats/channels/wrapper";
import { ChannelStatus } from "../src/database/models/chats/channels";
import Message from "../src/database/wrappers/chats/messages";

let channel: Channel;

describe("Channel database queries", () => {
    it("connects to the database", async () => {
        expect(await connection.connect()).toBeTruthy();
    });

    it("adds a channel to the database", async () => {
        channel = (await ChannelWrites.createChannel({
            created_by_id: 15,
            recipient_id: 45,
            post_id: 15,
            negotiated_price: 5,
            negotiated_date: new Date(),
        })) as Channel;

        expect(channel).toBeTruthy();
    });

    it("gets a channel by ID", async () => {
        const channelById = await ChannelReads.getChannelById(channel.id, 45);

        expect(channelById).toBeTruthy();

        expect(parseInt(channelById?.id as any)).toBe(
            parseInt(channel.id as any)
        );
    });

    it("gets a channel by UUID", async () => {
        const channelByUUID = await ChannelReads.getChannelByUUID(
            channel.uuid,
            15
        );

        expect(channelByUUID).toBeTruthy();

        expect(channelByUUID?.uuid).toBe(channel.uuid);
    });

    it("gets a channel by post ID", async () => {
        const channelByPostId = await ChannelReads.getChannelByPostId(
            channel.post_id,
            15
        );

        expect(channelByPostId).toBeTruthy();

        expect(channelByPostId?.post_id).toBe(channel.post_id);
    });

    it("updates the channel", async () => {
        const updated = await channel.update({
            negotiated_price: 10,
        });

        expect(updated).toBeTruthy();

        expect(channel.negotiated_price).toBe(10);
    });

    it("sets the channel status", async () => {
        const updated = await channel.setStatus(ChannelStatus.ACCEPTED);

        expect(updated).toBeTruthy();

        expect(channel.status).toBe(ChannelStatus.ACCEPTED);
    });

    describe("Message database queries", () => {
        let message: Message;

        it("adds a message to the database", async () => {
            message = (await channel.sendMessage(
                {
                    sender_id: 45,
                    channel_id: channel.id,
                    message: "This is a test message",
                    system_message: false,
                    attachments: [],
                },
                null,
                "https://picsum.photos/200"
            )) as Message;

            expect(message).toBeTruthy();
        });

        it("deletes the message", async () => {
            const deleted = await message.deleteMessage();

            expect(deleted).toBeTruthy();
        });

        it("deletes the channel", async () => {
            const deleted = await channel.deleteChannel();

            expect(deleted).toBeTruthy();
        });
    });

    it("disconnects from the database", async () => {
        connection.disconnect();
    });
});
