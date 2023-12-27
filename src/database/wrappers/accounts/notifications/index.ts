import { DataModel } from "../../../data_model";
import {
    NotificationTokenFields,
    NotificationTokenModel,
} from "../../../models/users/notification_tokens";
import reads from "./queries/reads";
import writes from "./queries/writes";

class NotificationToken extends DataModel implements NotificationTokenModel {
    id: number;
    user_id: number;
    login_id: number;
    token: string;
    created_at: Date;
    updated_at: Date;

    constructor(
        notification: NotificationTokenFields,
        refetchOnUpdate: boolean = false
    ) {
        super(refetchOnUpdate);

        // Set data
        Object.assign(this, notification);
        this.refetchOnUpdate = refetchOnUpdate;
    }

    public override async refetch(): Promise<void> {
        const result = await reads.getTokenById(this.id);

        if (!result) throw new Error("Notification not found");

        super.setData(result);
    }

    public async update(
        data: Partial<NotificationTokenFields>
    ): Promise<boolean> {
        try {
            await this._refetch();

            const newData = { ...this, ...data };

            const r = await writes.setLoginToken(
                newData.user_id,
                newData.login_id,
                newData.token
            );

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

    public async deleteToken(): Promise<boolean> {
        return await writes.deleteToken(this.token);
    }

    public async updateToken(token: string): Promise<boolean> {
        return await this.update({ token });
    }
}

export default NotificationToken;
