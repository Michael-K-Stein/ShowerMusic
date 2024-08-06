import { getDbCollectionByItemType } from "@/app/server-db-services/mongo-db-controller";
import { GetItemMashApiParams, MashObject } from "@/app/shared-api/other/media-mash";
import assert from "assert";

export default async function getMashingItem(
    { mashingType,
        opponentRating,
        deviationFactor,
        opponentId
    }: GetItemMashApiParams
): Promise<Array<MashObject>>
{
    const itemCollection = await getDbCollectionByItemType<MashObject>(mashingType);

    const chooseTwoItems = opponentRating === undefined && deviationFactor === undefined;
    if (chooseTwoItems)
    {
        const items = itemCollection.aggregate([
            { $sample: { size: 2 } }
        ]);
        return (await items.toArray()) as unknown as Array<MashObject>;
    }
    else
    {
        assert(opponentRating !== undefined);
        assert(deviationFactor !== undefined);
        const minRating = opponentRating - (opponentRating * deviationFactor);
        const maxRating = opponentRating + (opponentRating * deviationFactor);

        const items = itemCollection.aggregate([
            {
                $match: {
                    'mashData.eloRating': {
                        $gte: minRating,
                        $lte: maxRating,
                    },
                    'id': { $ne: opponentId }
                }
            },
            {
                $sort: {
                    'mashData.matchesTotal': 1,
                    'popularity': -1,
                }
            },
            {
                $limit: 300,
            },
            { $sample: { size: 1 } },
        ]);

        const results = await items.toArray();

        if (results.length === 0)
        {
            // No items where found matching the range criteria, choose a random item.
            const items = itemCollection.aggregate([
                { $sample: { size: 1 } }
            ]);
            return (await items.toArray()) as unknown as Array<MashObject>;
        }

        assert(results.length === 1, `Too many items returned by aggregation pipeline!`);

        return results as unknown as Array<MashObject>;
    }
}
