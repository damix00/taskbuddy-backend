import { executeQuery } from "../../connection";
import { KillswitchFields } from "../../models/killswitch";
import { doesKillswitchExist } from "./reads";

export async function setKillswitch({
    type,
    enabled,
    description,
    added_by,
}: Partial<KillswitchFields>): Promise<KillswitchFields | null> {
    // Check if the killswitch exists
    if (await doesKillswitchExist(type!)) {
        // If it does, update it
        const query = `UPDATE killswitches SET enabled = $1, description = $2, added_by = $3, updated_at = NOW() WHERE type = $4 RETURNING *`;
        const params = [enabled, description, added_by, type];

        const killswitches = await executeQuery<KillswitchFields>(
            query,
            params
        );

        return killswitches.length > 0 ? killswitches[0] : null;
    }

    // If it doesn't, create it
    const query = `INSERT INTO killswitches (
            type,
            enabled,
            description,
            added_by,
            updated_at
        ) VALUES (
            $1,
            $2,
            $3,
            $4,
            NOW()
        ) RETURNING *`;
    const params = [type, enabled, description, added_by];

    const killswitches = await executeQuery<KillswitchFields>(query, params);

    return killswitches.length > 0 ? killswitches[0] : null;
}
