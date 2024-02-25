// This is the cache for the killswitches
// Also used to reduce the amount of database queries and improve performance

import { Killswitch } from "../database/wrappers/killswitches";
import { getKillswitches } from "../database/wrappers/killswitches/reads";

export let killswitches: Killswitch[] = [];

async function fetchKillswitches() {
    killswitches = (await getKillswitches()).map(
        (killswitch) => new Killswitch(killswitch)
    );
}

export async function init() {
    await fetchKillswitches();
    setInterval(fetchKillswitches, 30 * 1000);
}

export function isKillswitchEnabled(type: string) {
    return killswitches.some(
        (killswitch) => killswitch.type === type && killswitch.enabled
    );
}
