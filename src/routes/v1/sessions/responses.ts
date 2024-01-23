import { ScrollSessionFields } from "../../../database/models/algorithm/scroll_sessions";

export function getSessionResponse(session: ScrollSessionFields) {
    return {
        id: parseInt(session.id as any),
        lat: parseFloat(session.lat as any),
        lon: parseFloat(session.lon as any),
        filters: JSON.parse(session.filters),
        created_at: session.created_at,
    };
}
