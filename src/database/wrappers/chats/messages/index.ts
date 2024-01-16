import { DataModel } from "../../../data_model";
import {
    MessageAttachmentFields,
    MessageFields,
    MessageModel,
    MessageWithRelations,
    RequestMessageFields,
    RequestMessageStatus,
} from "../../../models/chats/messages";
import { User } from "../../accounts/users";
import reads from "./queries/reads";
import writes from "./queries/writes";

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

    public async update(fields: Partial<MessageFields>): Promise<boolean> {
        const obj = { ...this, ...fields };

        const updated = await writes.updateMessage(obj);

        if (updated) {
            this._refetch();
        }

        return updated;
    }

    public override async refetch(): Promise<void> {
        const message = await reads.getMessageById(this.id);

        if (message) {
            Object.assign(this, message);
        }
    }

    public async deleteMessage(): Promise<boolean> {
        const deleted = await writes.deleteMessage(this.id);

        if (deleted) {
            this._refetch();
        }

        return deleted;
    }

    public async acceptRequest(): Promise<boolean> {
        if (!this.request) {
            return false;
        }

        if (this.request?.status != RequestMessageStatus.PENDING) {
            return false;
        }

        const accepted = await writes.updateRequestMessage({
            status: RequestMessageStatus.ACCEPTED,
            message_id: this.id,
            request_type: this.request!.request_type,
            data: this.request!.data,
        });

        if (accepted) {
            this.request.status = RequestMessageStatus.ACCEPTED;
            this._refetch();
        } else {
            console.error("Failed to accept request");
        }

        return accepted;
    }

    public async rejectRequest(): Promise<boolean> {
        if (!this.request) {
            return false;
        }

        if (this.request?.status != RequestMessageStatus.PENDING) {
            return false;
        }

        const rejected = await writes.updateRequestMessage({
            status: RequestMessageStatus.REJECTED,
            message_id: this.id,
            request_type: this.request!.request_type,
            data: this.request!.data,
        });

        if (rejected) {
            this.request.status = RequestMessageStatus.REJECTED;
            this._refetch();
        }

        return rejected;
    }
}

export default Message;
