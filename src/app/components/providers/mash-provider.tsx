import commandGetMashingItems from '@/app/client-api/mash/get-items';
import { ShowerMusicPlayableMediaDict } from '@/app/shared-api/other/common';
import { GetItemMashApiParams, MashingType, MashObject, MashObjectId, MashRating } from '@/app/shared-api/other/media-mash';
import { ShowerMusicObjectType } from '@/app/showermusic-object-types';
import assert from 'assert';
import React, { createContext, useState, useContext, Dispatch, SetStateAction, useCallback } from 'react';

const DEFAULT_MASHING_TYPE: MashingType = ShowerMusicObjectType.Track;
const DEFAULT_MASHING_OPPONENT_RATING_DEVIATION_FACTOR: number = 0.05;

export type ReloadMashingItem = () => Promise<void>;
type MashContextType<T extends MashObject> = {
    isDefault: boolean;

    mashLoading: boolean;
    mashingType: T[ 'type' ];
    setMashingType: Dispatch<SetStateAction<MashingType>>;

    mashingItemA: T | undefined;
    mashingItemB: T | undefined;

    reloadMashingItemA: ReloadMashingItem;
    reloadMashingItemB: ReloadMashingItem;
    reloadAllMashingItems: ReloadMashingItem;

    setMashingItemA: Dispatch<SetStateAction<T | undefined>>;
    setMashingItemB: Dispatch<SetStateAction<T | undefined>>;
};

export const MashContext = createContext<MashContextType<MashObject>>({
    isDefault: true,

    mashLoading: true,
    mashingType: DEFAULT_MASHING_TYPE,
    setMashingType: () => { },

    mashingItemA: undefined,
    mashingItemB: undefined,

    reloadMashingItemA: async () => { },
    reloadMashingItemB: async () => { },
    reloadAllMashingItems: async () => { },

    setMashingItemA: () => { },
    setMashingItemB: () => { },
});

export const MashProvider = (
    { children }:
        { children: React.JSX.Element[] | React.JSX.Element; }
) =>
{
    const [ mashLoading, setMashLoading ] = useState<boolean>(true);
    const [ mashingType, setMashingType ] = useState<MashingType>(DEFAULT_MASHING_TYPE);
    const [ opponentRatingDeviationFactor, setOpponentRatingDeviationFactor ] = useState<number>(DEFAULT_MASHING_OPPONENT_RATING_DEVIATION_FACTOR);

    const [ mashingItemA, setMashingItemA ] = useState<MashObject>();
    const [ mashingItemB, setMashingItemB ] = useState<MashObject>();

    const getMashingItem = useCallback(
        async (opponentRating: MashRating, deviationFactor: number, opponentId: MashObjectId):
            Promise<MashObject> =>
        {
            const mashingParams: GetItemMashApiParams = {
                mashingType,
                opponentRating,
                deviationFactor,
                opponentId,
            };
            const mashingItemsResults = await commandGetMashingItems(mashingParams);
            return mashingItemsResults[ 0 ];
        }, [ mashingType ]);

    const reloadMashingItemA = useCallback(async () =>
    {
        assert(mashingItemB, `Use \`reloadAllMashingItems\` in case both mashing items are not initialized!`);
        getMashingItem(mashingItemB.mashData.eloRating, opponentRatingDeviationFactor, mashingItemB.id).then(setMashingItemA);
    }, [ mashingItemB, opponentRatingDeviationFactor, getMashingItem, setMashingItemA ]);

    const reloadMashingItemB = useCallback(async () =>
    {
        assert(mashingItemA, `Use \`reloadAllMashingItems\` in case both mashing items are not initialized!`);
        getMashingItem(mashingItemA.mashData.eloRating, opponentRatingDeviationFactor, mashingItemA.id).then(setMashingItemB);
    }, [ mashingItemA, opponentRatingDeviationFactor, getMashingItem, setMashingItemB ]);

    const reloadAllMashingItems = useCallback(async () =>
    {
        setMashLoading(true);

        const mashingParams: GetItemMashApiParams = {
            mashingType,
            opponentRating: undefined,
            deviationFactor: undefined,
            opponentId: undefined,
        };
        const mashingItemsResults = await commandGetMashingItems(mashingParams);
        assert(mashingItemsResults.length === 2, `Invalid mashing items results length ${mashingItemsResults.length} !== 2`);
        setMashingItemA(mashingItemsResults[ 0 ]);
        setMashingItemB(mashingItemsResults[ 1 ]);

        setMashLoading(false);
    }, [ mashingType, setMashingItemA, setMashingItemB, setMashLoading ]);

    return (
        <MashContext.Provider value={ {
            isDefault: false,

            mashLoading,
            mashingType,
            setMashingType,

            mashingItemA, mashingItemB,
            reloadMashingItemA, reloadMashingItemB, reloadAllMashingItems,
            setMashingItemA, setMashingItemB,
        } }>
            { children }
        </MashContext.Provider>
    );
};

export const useMash = <T extends MashObject = MashObject>() =>
{
    const context = useContext(MashContext);

    if (context.isDefault)
    {
        throw new Error('useMash must be used within a MashProvider');
    }

    // if (context.mashingType !== T) {}

    return context as unknown as MashContextType<T>;
};
