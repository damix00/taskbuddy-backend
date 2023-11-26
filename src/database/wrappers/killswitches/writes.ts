import { executeQuery } from "../../connection";
import { KillswitchFields } from "../../models/killswitch";
import { doesKillswitchExist } from "./reads";

export async function setKillswitch({
    type,
    enabled,
    description,
}: Partial<KillswitchFields>): Promise<KillswitchFields | null> {
    // Check if the killswitch exists
    if (await doesKillswitchExist(type!)) {
        // If it does, update it
        const query = `UPDATE killswitches SET value = $1, description = $2 DESCRIPTION WHERE type = $3 RETURNING *`;
        const params = [enabled, description, type];

        const killswitches = await executeQuery<KillswitchFields>(
            query,
            params
        );

        return killswitches.length > 0 ? killswitches[0] : null;
    }

    // If it doesn't, create it
    const query = `INSERT INTO killswitches (type, enabled, description) VALUES ($1, $2, $3) RETURNING *`;
    const params = [type, enabled, description];

    const killswitches = await executeQuery<KillswitchFields>(query, params);

    return killswitches.length > 0 ? killswitches[0] : null;
}
