import { DataModel } from "../../../data_model";
import {
    MessageAttachmentFields,
    MessageFields,
    MessageModel,
    MessageWithRelations,
    RequestMessageFields,
} from "../../../models/chats/messages";
import { User } from "../../accounts/users";

class Message extends DataModel implements MessageModel {
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

    // Relations
    sender: User;
    profile_picture: string;
    attachments: MessageAttachmentFields[];
    request: RequestMessageFields | null;

    constructor(
        message: MessageWithRelations,
        refetchOnUpdate: boolean = true
    ) {
        super(refetchOnUpdate);

        // Set data
        Object.assign(this, message);
        this.refetchOnUpdate = refetchOnUpdate;
    }

    update: (fields: Partial<MessageFields>) => Promise<boolean>;
    setSeen: (seen: boolean) => Promise<boolean>;
    setSeenAt: (date: Date) => Promise<boolean>;
    deleteMessage: () => Promise<boolean>;
    restoreMessage: () => Promise<boolean>;
    acceptRequest: () => Promise<boolean>;
    rejectRequest: () => Promise<boolean>;
}

export default Message;
