import { User } from "../../wrappers/accounts/users";

export type CreateMessageFields = {
    channel_id: number;
    sender_id?: number;
    system_message: boolean;
    message: string;
    attachments?: {
        attachment_type: AttachmentType;
        attachment_url: string;
    }[];
    request?: {
        request_type: RequestMessageType;
        request_data?: string;
    };
};

export enum AttachmentType {
    IMAGE = 0,
    VIDEO = 1,
    AUDIO = 2,
    DOCUMENT = 3,
}

export enum RequestMessageStatus {
    PENDING = 0,
    ACCEPTED = 1,
    REJECTED = 2,
}

export enum RequestMessageType {
    LOCATION = 0,
    PRICE = 1,
    DATE = 2,
    PHONE_NUMBER = 3,
    DEAL = 4,
}

export interface MessageFields {
    id: number;
    uuid: string;
    channel_id: number;
    sender_id: number;
    system_message: boolean;
    message: string;
    seen: boolean;
    seen_at: Date;
    edited: boolean;
    edited_at: Date;
    created_at: Date;
    updated_at: Date;
    deleted: boolean;
}

export interface MessageAttachmentFields {
    id: number;
    message_id: number;
    attachment_type: AttachmentType;
    attachment_url: string;
    created_at: Date;
    updated_at: Date;
}

export interface RequestMessageFields {
    id: number;
    message_id: number;
    status: RequestMessageStatus;
    data?: string;
    request_type: RequestMessageType;
    created_at: Date;
    updated_at: Date;
}

export interface MessageWithRelations extends MessageFields {
    sender: User | null;
    profile_picture: string;
    attachments: MessageAttachmentFields[];
    request: RequestMessageFields | null;
}

export interface MessageModel extends MessageWithRelations {
    update: (fields: Partial<MessageFields>) => Promise<boolean>;
    deleteMessage: () => Promise<boolean>;
    acceptRequest: () => Promise<boolean>;
    rejectRequest: () => Promise<boolean>;
}
