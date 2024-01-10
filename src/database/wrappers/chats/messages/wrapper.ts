import Message from ".";
import {
    CreateMessageFields,
    MessageFields,
    MessageWithRelations,
    RequestMessageFields,
} from "../../../models/chats/messages";
import { User } from "../../accounts/users";
import reads from "./queries/reads";
import writes from "./queries/writes";

function toMessage(message: MessageWithRelations | null): Message | null {
    if (!message) return null;

    message.id = parseInt(message.id as any);
    message.channel_id = parseInt(message.channel_id as any);
    message.sender_id = parseInt(message.sender_id as any);
    message.created_at = new Date(message.created_at as any);
    message.updated_at = new Date(message.updated_at as any);

    message.sender.id = parseInt(message.sender.id as any);
    message.sender = new User(message.sender);

    return new Message(message);
}

export class MessageReads {
    public static async getMessageById(id: number): Promise<Message | null> {
        return toMessage(await reads.getMessageById(id));
    }

    public static async getMessageByUUID(
        uuid: string
    ): Promise<Message | null> {
        return toMessage(await reads.getMessageByUUID(uuid));
    }

    public static async getMessagesFromChannel(
        channel_id: number,
        offset: number = 0
    ): Promise<Message[]> {
        const messages = await reads.getMessagesFromChannel(channel_id, offset);

        return messages.map((message) => toMessage(message) as Message);
    }
}

export class MessageWrites {
    public static async createMessage(
        data: CreateMessageFields,
        sender: User,
        profile_picture: string = ""
    ): Promise<Message | null> {
        return toMessage(
            await writes.createMessage(data, sender, profile_picture)
        );
    }

    public static async updateMessage(data: MessageFields): Promise<boolean> {
        return await writes.updateMessage(data);
    }

    public static async updateRequestMessage(
        data: RequestMessageFields
    ): Promise<boolean> {
        return await writes.updateRequestMessage(data);
    }

    public static async deleteMessage(id: number): Promise<boolean> {
        return await writes.deleteMessage(id);
    }

    public static async markAsSeen(
        channel_id: number,
        user_id: number
    ): Promise<boolean> {
        return await writes.markAsSeen(channel_id, user_id);
    }
}
