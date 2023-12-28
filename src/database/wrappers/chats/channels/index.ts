import { DataModel } from "../../../data_model";
import {
    ChannelFields,
    ChannelModel,
    ChannelStatus,
} from "../../../models/chats/channels";
import { Profile } from "../../accounts/profiles";
import { User } from "../../accounts/users";
import Post from "../../posts/post";
import Message from "../messages";

class Channel extends DataModel implements ChannelModel {
    // Database fields
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

    // Relations
    post: Post;
    created_by: User;
    creator_profile: Profile;
    recipient: User;
    recipient_profile: Profile;
    last_messages: Message[];
    creator_following: boolean;
    recipient_following: boolean;

    constructor(channel: ChannelFields, refetchOnUpdate: boolean = false) {
        super(refetchOnUpdate);

        // Set data
        Object.assign(this, channel);
        this.refetchOnUpdate = refetchOnUpdate;
    }

    public override async refetch(): Promise<void> {
        // const result = await reads.getTokenById(this.id);
        // if (!result) throw new Error("Notification not found");
        // super.setData(result);
    }

    public async update(data: Partial<ChannelFields>): Promise<boolean> {
        try {
            await this._refetch();

            const newData = { ...this, ...data };

            const r = true;

            if (r) {
                this.setData(newData);
                return true;
            }

            return false;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
    setStatus: (status: ChannelStatus) => Promise<boolean>;
    complete: () => Promise<boolean>;
    cancel: () => Promise<boolean>;
    rejectAsPostOwner: () => Promise<boolean>;
    rejectAsEmployee: () => Promise<boolean>;
    setNegotiatedPrice: (price: number) => Promise<boolean>;
    setNegotiatedDate: (date: Date) => Promise<boolean>;
    setSharingLocation: (sharing: boolean) => Promise<boolean>;
    setLastMessageTime: (date: Date) => Promise<boolean>;
}

export default Channel;
