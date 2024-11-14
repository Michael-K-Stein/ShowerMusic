import { getDbCollectionByItemType } from "@/app/server-db-services/mongo-db-controller";
import { ExtendedMashObject, GetScoreboardMashApiParams, MashObject, MashScoreboard } from "@/app/shared-api/other/media-mash";
import { Collection } from "mongodb";

export default async function getMashingScoreboard({ mashingType, count }: GetScoreboardMashApiParams): Promise<MashScoreboard>
{
    const itemCollection: Collection<ExtendedMashObject> = await getDbCollectionByItemType<ExtendedMashObject>(mashingType);

    const topItems = await itemCollection.find(
        { type: mashingType },
        {
            sort: {
                'mashData.eloRating': -1,
            },
            limit: count ?? 15,
            projection: {
                name: 1,
                id: 1,
                artists: 1,
                mashData: 1,
                album: 1,
                images: 1,
                type: 1,
            }
        },
    ).toArray();

    const scoreboard: MashScoreboard = {
        mashingType,
        items: topItems,
    };

    return scoreboard;
}
