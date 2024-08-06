import commandSubmitMatchOutcome from "@/app/client-api/mash/match";
import BattleGlyph from "@/app/components/glyphs/battle";
import LockGlyph from "@/app/components/glyphs/lock";
import PadlockGlyph from "@/app/components/glyphs/padlock";
import CardModal, { CardModalSkeletonLoader } from "@/app/components/media-modals/card-modal/card-modal";
import { enqueueApiErrorSnackbar } from "@/app/components/providers/global-props/global-modals";
import { useMash } from "@/app/components/providers/mash-provider";
import { ShowerMusicPlayableMediaDict } from "@/app/shared-api/other/common";
import { MashObject, MashOutcome, MatchOutcomeMashApiParams } from "@/app/shared-api/other/media-mash";
import { ShowerMusicObjectType } from "@/app/showermusic-object-types";
import { Button, Grid } from "@mui/material";
import assert from "assert";
import { useSnackbar } from "notistack";
import { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";

function LockCard(
    {
        itemLocked,
        setItemLocked,
        prompt,
    }: {
        itemLocked: boolean,
        setItemLocked: Dispatch<SetStateAction<boolean>>,
        prompt?: string | undefined;
    }
)
{
    const classNames = 'w-6 h-6';
    return (
        <div>
            {
                itemLocked &&
                <LockGlyph className={ classNames } onClick={ () => setItemLocked(false) } glyphTitle={ `Unock ${prompt ?? 'Item'}` } /> ||
                <PadlockGlyph className={ classNames } onClick={ () => setItemLocked(true) } glyphTitle={ `Lock ${prompt ?? 'Item'}` } />
            }
        </div>
    );
}

function CardMasher<T extends MashObject & ShowerMusicPlayableMediaDict>()
{
    const { enqueueSnackbar } = useSnackbar();
    const {
        mashLoading,
        mashingType,
        mashingItemA,
        mashingItemB,
        reloadMashingItemA,
        reloadMashingItemB,
        reloadAllMashingItems
    } = useMash<T>();

    useMemo(async () =>
    {
        let reloadFunc = null;
        if (mashingItemA === undefined && mashingItemB === undefined)
        {
            reloadFunc = reloadAllMashingItems();
        }
        else if (mashingItemA === undefined)
        {
            assert(mashingItemB);
            reloadFunc = reloadMashingItemA();
        }
        else if (mashingItemB === undefined)
        {
            assert(mashingItemA);
            reloadFunc = reloadMashingItemB();
        }
        if (!reloadFunc) { return; }
        reloadFunc.catch((error) =>
        {
            enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to load mashing items!`, error);
        });
    }, [ mashingItemA, mashingItemB, reloadMashingItemA, reloadMashingItemB, reloadAllMashingItems, enqueueSnackbar ]);

    const [ lockWinner, setLockWinner ] = useState<boolean>(true);
    const [ itemALocked, setItemALocked ] = useState<boolean>(false);
    const [ itemBLocked, setItemBLocked ] = useState<boolean>(false);

    const submitMatchOutcome = useCallback((outcomePerspectiveA: MashOutcome) =>
    {
        if (mashLoading) { return; }
        if (!mashingItemA?.id || !mashingItemB?.id) { return; }
        if (itemALocked && itemBLocked)
        {
            enqueueSnackbar(`Both items are locked. Please unlock one to continue.`, { variant: 'warning' });
            return;
        }
        const params: MatchOutcomeMashApiParams = {
            mashingItemAId: mashingItemA.id,
            mashingItemBId: mashingItemB.id,
            outcomePerspectiveA,
            mashingType,
        };
        commandSubmitMatchOutcome(params)
            .then(() =>
            {
                if (!itemALocked && !itemBLocked && !lockWinner)
                {
                    reloadAllMashingItems();
                }
                else
                {
                    const aLocked = itemALocked || (lockWinner && outcomePerspectiveA === MashOutcome.Win);
                    const bLocked = itemBLocked || (lockWinner && outcomePerspectiveA === MashOutcome.Loss);

                    if (aLocked && !bLocked)
                    {
                        reloadMashingItemB();
                    }
                    else if (!aLocked && bLocked)
                    {
                        reloadMashingItemA();
                    }
                    else
                    {
                        reloadAllMashingItems();
                    }
                }
            })
            .catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to submit mash match score!`, error);
            });
    }, [ lockWinner, itemALocked, itemBLocked, mashLoading, mashingItemA, mashingItemB, mashingType, reloadMashingItemB, reloadMashingItemA, reloadAllMashingItems, enqueueSnackbar ]);

    const mashingItemAChosen = useCallback(() =>
    {
        submitMatchOutcome(MashOutcome.Win);
    }, [ submitMatchOutcome ]);

    const mashingItemBChosen = useCallback(() =>
    {
        submitMatchOutcome(MashOutcome.Loss);
    }, [ submitMatchOutcome ]);

    const mashingDrawChosen = useCallback(() =>
    {
        submitMatchOutcome(MashOutcome.Draw);
    }, [ submitMatchOutcome ]);

    const mashingSkip = useCallback(() =>
    {
        setItemALocked(false);
        setItemBLocked(false);
        reloadAllMashingItems();
    }, [ reloadAllMashingItems, setItemBLocked, setItemALocked ]);

    useMemo(() =>
    {
        if (lockWinner)
        {
            setItemALocked(false);
            setItemBLocked(false);
        }
    }, [ lockWinner, setItemALocked, setItemBLocked ]);

    useMemo(() =>
    {
        if (itemALocked)
        {
            setLockWinner(false);
            setItemBLocked(false);
        }
    }, [ itemALocked, setLockWinner, setItemBLocked ]);

    useMemo(() =>
    {
        if (itemBLocked)
        {
            setLockWinner(false);
            setItemALocked(false);
        }
    }, [ itemBLocked, setLockWinner, setItemALocked ]);

    return (
        <Grid container
            spacing={ 4 }
            direction={ 'row' }
            justifyItems={ 'center' }
            alignItems={ 'center' }
            className="flex flex-row items-center justify-center"
        >
            <Grid item={ true } direction={ 'column' } className="flex flex-col items-center">
                {
                    (!mashLoading && mashingItemA !== undefined) &&
                    <CardModal
                        containsFullData={ true }
                        item={ mashingItemA }
                        cardModalHtmlAttributes={ { 'data-static-card': true } }
                        onClick={ mashingItemAChosen }
                    /> ||
                    <CardModalSkeletonLoader cardModalHtmlAttributes={ { 'data-static-card': true } } />
                }
                <div className="flex flex-row items-center justify-start">
                    <LockCard itemLocked={ itemALocked } setItemLocked={ setItemALocked } />
                    <Button color={ 'primary' } variant='text' className="text-center" onClick={ mashingItemAChosen }>Vote</Button>
                </div>
            </Grid>
            <Grid item={ true }>
                <Grid container spacing={ 2 } direction={ 'column' } justifyItems={ 'center' } alignItems={ 'center' }>
                    <Grid item={ true } className="p-0 m-0">
                        <BattleGlyph glyphTitle="" data-static className="w-20 h-20" />
                    </Grid>
                    <Grid item={ true } className="p-0 m-0">
                        <Button color={ 'primary' } variant='text' className="text-center" onClick={ mashingDrawChosen }>Draw</Button>
                    </Grid>
                    <Grid item={ true } className="p-0 m-0">
                        <Button color={ 'secondary' } variant='text' className="text-center" onClick={ mashingSkip }>Skip</Button>
                    </Grid>
                    <Grid item={ true } className="p-0 m-0">
                        <LockCard itemLocked={ lockWinner } setItemLocked={ setLockWinner } prompt="Winner" />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item={ true } direction={ 'column' } className="flex flex-col items-center">
                {
                    (!mashLoading && mashingItemB !== undefined) &&
                    <CardModal
                        containsFullData={ true }
                        item={ mashingItemB }
                        cardModalHtmlAttributes={ { 'data-static-card': true } }
                        onClick={ mashingItemBChosen }
                    /> ||
                    <CardModalSkeletonLoader cardModalHtmlAttributes={ { 'data-static-card': true } } />
                }
                <div className="flex flex-row items-center justify-start">
                    <LockCard itemLocked={ itemBLocked } setItemLocked={ setItemBLocked } />
                    <Button color={ 'primary' } variant='text' className="text-center" onClick={ mashingItemBChosen }>Vote</Button>
                </div>
            </Grid>
        </Grid>
    );
}

export default function Masher()
{
    const { mashingType, mashingItemA, mashingItemB } = useMash();

    switch (mashingType)
    {
        case ShowerMusicObjectType.Track:
        case ShowerMusicObjectType.Album:
        case ShowerMusicObjectType.Artist:
        case ShowerMusicObjectType.Station:
        case ShowerMusicObjectType.Playlist:
            return (<CardMasher />);
        case ShowerMusicObjectType.StationsCategory:
            return (<></>);
        default:
            assert(false, `Unrecognized mashing type ${mashingType}`);
    }
}