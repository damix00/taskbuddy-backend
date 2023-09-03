import { DataModel } from "../data_model";
import { KillswitchFields, KillswitchModel } from "../models/killswitch";

export class Killswitch extends DataModel implements KillswitchModel {
    id: number;
    type: string;
    description: string;
    enabled: boolean;
    created_at: Date;
    updated_at: Date;

    constructor(data: KillswitchFields, refetchOnUpdate: boolean = true) {
        super(refetchOnUpdate);

        this.id = data.id;
        this.type = data.type;
        this.description = data.description;
        this.enabled = data.enabled;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    public async enable(): Promise<boolean> {
        return true;
    }
    public async disable(): Promise<boolean> {
        return true;
    }
    public async setEnabled(enabled: boolean): Promise<boolean> {
        return true;
    }
    public async setDescription(description: string): Promise<boolean> {
        return true;
    }
    public async delete(): Promise<boolean> {
        return true;
    }
    public async update(data: Partial<KillswitchModel>): Promise<boolean> {
        return true;
    }
}
