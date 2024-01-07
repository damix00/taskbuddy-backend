import { Profile } from "../../wrappers/accounts/profiles";
import { User } from "../../wrappers/accounts/users";
import Message from "../../wrappers/chats/messages";
import Post from "../../wrappers/posts/post";
import { CreateMessageFields } from "./messages";

export enum ChannelStatus {
    PENDING = 0,
    ACCEPTED = 1,
    REJECTED = 2,
    COMPLETED = 3,
    CANCELLED = 4,
}

export interface ChannelFields {
    id: number;
    uuid: string;
    created_by_id: number;
    recipient_id: number;
    post_id: number;
    status: ChannelStatus;
    negotiated_price: number;
    negotiated_date: Date;
    sharing_location: boolean;
    last_message_time: Date;
    created_at: Date;
    updated_at: Date;
}

export interface ChannelWithRelations extends ChannelFields {
    post: Post;
    created_by: User;
    creator_profile: Profile;
    recipient: User;
    recipient_profile: Profile;
    last_messages: Message[];
    recipient_following: boolean;
    creator_following: boolean;
}

export interface ChannelModel extends ChannelWithRelations {
    getPost: () => Promise<Post | null>;
    update: (fields: Partial<ChannelFields>) => Promise<boolean>;
    setStatus: (status: ChannelStatus) => Promise<boolean>;
    complete: () => Promise<boolean>;
    cancel: () => Promise<boolean>;
    setNegotiatedPrice: (price: number) => Promise<boolean>;
    setNegotiatedDate: (date: Date) => Promise<boolean>;
    setSharingLocation: (sharing: boolean) => Promise<boolean>;
    setLastMessageTime: (date: Date) => Promise<boolean>;
    sendMessage: (
        message: CreateMessageFields,
        sender: User,
        profile_picture: string
    ) => Promise<Message | null>;
}
