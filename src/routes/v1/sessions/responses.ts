import { ScrollSessionFields } from "../../../database/models/algorithm/scroll_sessions";

export function getSessionResponse(session: ScrollSessionFields) {
    return {
        id: session.id,
        user_id: session.user_id,
        ip_address: session.ip_address,
        lat: session.lat,
        lon: session.lon,
        filters: JSON.parse(session.filters),
        created_at: session.created_at,
    };
}
