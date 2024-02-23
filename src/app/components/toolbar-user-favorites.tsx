import { getClientSideObjectId } from "@/app/client-api/common-utils";
import { ArbitraryPlayableMediaImage, gotoArbitraryPlayableMediaPageCallbackFactory, resolveArbitraryPlayableMedia } from "@/app/components/pages/home-page/user-recently-played";
import { useSessionState } from "@/app/components/providers/session/session";
import useUserSession from "@/app/components/providers/user-provider/user-session";
import { ShowerMusicPlayableMediaDict } from "@/app/shared-api/other/common";
import { FavoritesItem } from "@/app/shared-api/user-objects/users";
import { Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useCallback, useMemo, useState } from "react";

function ToolbarUserFavoriteItem({ item }: { item: FavoritesItem; })
{
    const { enqueueSnackbar } = useSnackbar();
    const { setView } = useSessionState();
    const [ itemData, setItemData ] = useState<ShowerMusicPlayableMediaDict>();
    useMemo(() =>
    {
        resolveArbitraryPlayableMedia(item.mediaType, item.mediaId, setItemData, enqueueSnackbar);
    }, [ item, enqueueSnackbar ]);

    const onClickCallback = useCallback(() =>
    {
        return gotoArbitraryPlayableMediaPageCallbackFactory(item, itemData, setView);
    }, [ item, itemData, setView ]);

    return (
        <div className="toolbar-user-favorites-item clickable" onClick={ onClickCallback() }>
            <div className="">
                <ArbitraryPlayableMediaImage data={ itemData } />
            </div>
            <div className="">
                <Typography>{ item.mediaName }</Typography>
            </div>
        </div>
    );
}

export default function ToolbarUserFavorites()
{
    const { userFavorites } = useUserSession();
    const favoritesItemsData = userFavorites ? userFavorites.items : [];
    const favoritesItemsNodes = favoritesItemsData.map((item) =>
    {
        return (
            <ToolbarUserFavoriteItem key={ getClientSideObjectId(item) } item={ item } />
        );
    });
    return (
        <div className="toolbar-user-favorites">
            { favoritesItemsNodes }
        </div>
    );
}