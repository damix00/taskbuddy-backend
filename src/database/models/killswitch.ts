export interface KillswitchFields {
    id: number;
    value: string;
    type: string;
    description: string;
    enabled: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface KillswitchModel extends KillswitchFields {
    enable(): Promise<boolean>;
    disable(): Promise<boolean>;
    setEnabled(enabled: boolean): Promise<boolean>;
    delete(): Promise<boolean>;
    update(data: Partial<KillswitchModel>): Promise<boolean>;
}