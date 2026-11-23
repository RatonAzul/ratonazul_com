import {driversApi} from "$lib/api/motorsport/drivers";
import {json} from "@sveltejs/kit";

export async function GET({ params, url }) {
    const season = Number(params.season);
    const active = url.searchParams.get('active');
    if (active !== null && active !== 'true' && active !== 'false') {
        return json({ message: 'active must be true or false' }, { status: 400 });
    }
    return json(await driversApi.getBySeason(season, active === null ? undefined : active === 'true'));
}
