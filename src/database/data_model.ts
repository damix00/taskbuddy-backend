export class DataModel {
    protected refetchOnUpdate: boolean = true;

    protected setData(data: any) {
        Object.assign(this, data);
    }

    // Called on every update function
    // If refetchOnUpdate is true, refetches the user from the database
    // Used to keep the user instance up to date
    protected async _refetch(): Promise<void> {
        if (this.refetchOnUpdate) {
            this.refetch();
        }
    }

    // Refetches the user from the database
    // Used to keep the user instance up to date
    public async refetch(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    constructor(refetchOnUpdate: boolean = true) {
        this.refetchOnUpdate = refetchOnUpdate;
    }
}
