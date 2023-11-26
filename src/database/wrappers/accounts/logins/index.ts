import { DataModel } from "../../../data_model";
import { LoginFields, LoginModel } from "../../../models/users/login";
import { reads } from "./queries/reads";
import { writes } from "./queries/writes";

export class Login extends DataModel implements LoginModel {
    id: number;
    user_id: number;
    created_at: Date;
    ip_address: string;
    user_agent: string;
    is_online: boolean;
    last_updated_online: Date;

    constructor(login: LoginFields, refetchOnUpdate: boolean = true) {
        super(refetchOnUpdate);

        // Set the login's data
        Object.assign(this, login);
        this.refetchOnUpdate = refetchOnUpdate;
    }

    public override async refetch(): Promise<void> {
        const result = await reads.getLoginById(this.id);

        if (!result) throw new Error("Login not found");

        super.setData(result);
    }

    // Returns a login instance by its ID
    public static async createInstance(id: number): Promise<Login | null> {
        const result = await reads.getLoginById(id);

        if (!result) return null;

        return new Login(result);
    }

    // Updates the login's data
    public async update(data: Partial<LoginModel>): Promise<boolean> {
        const newLogin = { ...this, ...data };
        const r = await writes.updateLogin(newLogin);

        await this._refetch();

        return r;
    }

    // Updates the login's online status
    public async keepAlive(): Promise<boolean> {
        const r = await this.update({
            ...this,
            is_online: true,
            last_updated_online: new Date(),
        });

        this._refetch();

        return r;
    }

    // Returns whether the login is online
    public isOnline(): boolean {
        return this.last_updated_online.getTime() > Date.now() - 1000 * 60 * 3; // Check if the login was updated in the last 3 minutes
    }
}
