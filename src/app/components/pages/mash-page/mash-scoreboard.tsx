import commandGetMashScoreboard from "@/app/client-api/mash/scoreboard";
import { gotoArbitraryPlayableMediaPageCallbackFactory, MediaNameTooltip } from "@/app/components/media-modals/card-modal/card-modal";
import { ArbitraryPlayableMediaImage, HorizontalCardControlBar, UserRecentlyPlayedItemControlBar } from "@/app/components/pages/home-page/user-recently-played";
import { ArtistList } from "@/app/components/providers/global-props/global-modals";
import { useMash } from "@/app/components/providers/mash-provider";
import { useSessionState } from "@/app/components/providers/session/session";
import SharedSyncObjectProvider, { useSharedSyncObject } from "@/app/components/providers/shared-sync-object-provider";
import { MessageTypes, PseudoSyncIds, ShowerMusicObjectType } from "@/app/settings";
import { MediaId } from "@/app/shared-api/media-objects/media-id";
import { ShowerMusicPlayableMediaDict } from "@/app/shared-api/other/common";
import { ExtendedMashObject, GetScoreboardMashApiParams, MashObject } from "@/app/shared-api/other/media-mash";
import { ShowerMusicNamedResolveableItem } from "@/app/shared-api/user-objects/users";
import { Box, List, Tooltip, Typography } from "@mui/material";
import assert from "assert";

async function getMashScoreboardWrapper(scoreboardPseudoId: MediaId)
{
    const params: GetScoreboardMashApiParams = { mashingType: ShowerMusicObjectType.Track, };
    if (scoreboardPseudoId === PseudoSyncIds.MashTrackScoreboard)
    {
        params.mashingType = ShowerMusicObjectType.Track;
    }
    else
    {
        assert(false, `Invalid mash scoreboard pseudo-id ${scoreboardPseudoId} !`);
    }
    return await commandGetMashScoreboard(params);
}

function MashScoreboardEntry({ item }: { item: ExtendedMashObject; })
{
    const { setView } = useSessionState();

    return (
        <li className="played-item m-1 backdrop-blur-sm rounded-md overflow-hidden min-h-[6.2rem] max-h-[6.2rem] h-[6.2rem] box-content cursor-pointer shadow-sm hover:shadow-md transition-all"
            onClick={ gotoArbitraryPlayableMediaPageCallbackFactory(item, item, setView) }>
            <div className="flex flex-row items-center justify-start content-start h-full">

                <HorizontalCardControlBar
                    keyboardNavigationEnabled={ false }
                    item={ item }
                    itemType={ item.type }
                    className='absolute box-border p-4 z-[2] '
                />

                <ArbitraryPlayableMediaImage
                    data={ item as unknown as ShowerMusicPlayableMediaDict }
                    className="p-0 m-0 left-0 h-full max-h-[6.2rem] w-[6.2rem]"
                />
                <Box sx={ { width: '0.3rem' } } />
                <div className="flex flex-col items-start p-1 h-full box-border">
                    <Tooltip title={
                        <MediaNameTooltip item={ item } itemData={ item } />
                    }>
                        <Typography variant="h4" fontWeight={ 500 }>{ item.name }</Typography>
                    </Tooltip>
                    {
                        ('artists' in item) &&
                        <>
                            <ArtistList setView={ setView } artists={ item.artists } />
                            <Box sx={ { width: '0.2rem' } } />
                        </>
                    }
                    <div className="flex fex-row items-center">
                        <Typography>Rating: </Typography>
                        <Box sx={ { width: '0.2rem' } } />
                        <Typography fontWeight={ 500 }>{ item.mashData.eloRating.toFixed(0) }</Typography>
                    </div>
                </div>
            </div>
        </li>
    );
}

function MashScoreboardInsideSync({ scoreboardId }: { scoreboardId: MediaId; })
{
    const { mashingType } = useMash();
    const scoreboardData = useSharedSyncObject(scoreboardId, getMashScoreboardWrapper, MessageTypes.MASH_TRACK_SCOREBOARD_UPDATE);

    const entries = scoreboardData?.items.map(
        (item) =>
            <MashScoreboardEntry key={ `mash-t-sb-${item.id}` } item={ item } />
    );

    return (
        <div className="relative lg:absolute flex flex-col h-full w-full lg:w-[30%] p-4 m-4 box-border items-center">
            <Box sx={ { height: '5rem' } } />
            <Typography
                variant="h3"
                fontWeight={ 700 }
                textTransform={ 'uppercase' }>
                Hottest { mashingType }s
            </Typography>
            <div className="flex flex-col h-full max-h-full overflow-y-scroll">
                <List component={ 'ol' } className="flex flex-col pb-80 box-content">
                    { entries }
                </List>
            </div>
        </div>
    );
}

export default function MashScoreboard()
{

    return (
        <SharedSyncObjectProvider id={ PseudoSyncIds.MashTrackScoreboard }>
            <MashScoreboardInsideSync scoreboardId={ PseudoSyncIds.MashTrackScoreboard } />
        </SharedSyncObjectProvider>
    );
}