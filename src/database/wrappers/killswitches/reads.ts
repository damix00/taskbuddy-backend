import { executeQuery } from "../../connection";
import { KillswitchFields } from "../../models/killswitch";

/**
 * @param type The type of killswitch to check for
 * @returns Whether or not a killswitch exists for the given type
 * @description Checks if a killswitch exists for the given type
 */
export async function doesKillswitchExist(type: string): Promise<boolean> {
    try {
        const query = `SELECT * FROM killswitches WHERE type = $1`;
        const params = [type];
        const killswitches = await executeQuery<KillswitchFields>(
            query,
            params
        );

        return killswitches.length > 0;
    } catch (e) {
        console.error(
            `Error in function \`doesKillswitchExist\` for type \`${type}\``
        );
        console.error(e);
        return false;
    }
}

/**
 * @param type The type of killswitch to get
 * @returns The killswitch for the given type
 * @description Gets the killswitch for the given type
 * @throws Throws an error if the killswitch does not exist
 */
export async function getKillswitch(
    type: string
): Promise<KillswitchFields | null> {
    try {
        const query = `SELECT * FROM killswitches WHERE type = $1`;
        const params = [type];
        const killswitches = await executeQuery<KillswitchFields>(
            query,
            params
        );

        return killswitches.length > 0 ? killswitches[0] : null;
    } catch (e) {
        console.error(
            `Error in function \`getKillswitch\` for type \`${type}\``
        );
        console.error(e);
        return null;
    }
}

/**
 * @returns All killswitches
 * @description Gets all killswitches
 */
export async function getKillswitches(): Promise<KillswitchFields[]> {
    try {
        const query = `SELECT * FROM killswitches`;
        const killswitches = await executeQuery<KillswitchFields>(query);

        return killswitches;
    } catch (e) {
        console.error(`Error in function \`getKillswitches\``);
        console.error(e);
        return [];
    }
}
