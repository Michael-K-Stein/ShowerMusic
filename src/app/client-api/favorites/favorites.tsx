import { UserFavoritesAddItemCommandData } from "@/app/api/users/[slug]/favorites/route";
import { safeApiFetcher } from "@/app/client-api/common-utils";
import { enqueueApiErrorSnackbar } from "@/app/components/providers/global-props/global-modals";
import { ShowerMusicPlayableMediaDict } from "@/app/shared-api/other/common";
import { ShowerMusicPlayableMediaId, UserFavoritesData } from "@/app/shared-api/user-objects/users";
import { ShowerMusicPlayableMediaType } from "@/app/showermusic-object-types";
import { EnqueueSnackbar } from "notistack";
import { MouseEventHandler } from "react";

export async function commandGetFavorites()
{
    const r = await safeApiFetcher(`/api/users/me/favorites`);
    return r as UserFavoritesData;
}

export async function commandAddToFavorites(
    mediaId: ShowerMusicPlayableMediaId,
    mediaType: ShowerMusicPlayableMediaType,
    mediaName: string,
)
{
    const newFavoritesItem: UserFavoritesAddItemCommandData = {
        mediaType,
        mediaId,
        mediaName
    };
    await safeApiFetcher(`/api/users/me/favorites`,
        {
            method: 'POST',
            body: JSON.stringify(newFavoritesItem)
        });
}

export async function commandRemoveFromFavorites(
    mediaId: ShowerMusicPlayableMediaId,
    mediaType: ShowerMusicPlayableMediaType,
    mediaName: string,
)
{
    const newFavoritesItem: UserFavoritesAddItemCommandData = {
        mediaType,
        mediaId,
        mediaName
    };
    await safeApiFetcher(`/api/users/me/favorites/remove`,
        {
            method: 'POST',
            body: JSON.stringify(newFavoritesItem)
        });
}

export function addToFavoritesClickHandlerFactory(
    mediaData: ShowerMusicPlayableMediaDict,
    mediaType: ShowerMusicPlayableMediaType,
    enqueueSnackbar?: EnqueueSnackbar,
): MouseEventHandler<HTMLElement>
{
    return (_event: React.MouseEvent<HTMLElement>) =>
    {
        commandAddToFavorites(mediaData.id, mediaType, mediaData.name)
            .then(() =>
            {
                if (enqueueSnackbar)
                {
                    enqueueSnackbar(`${mediaData.name} has been added to your favorites!`, { variant: 'success' });
                }
            })
            .catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to add ${mediaData.name} to your favorites!`, error);
            });
    };
}

export function removeFromFavoritesClickHandlerFactory(
    mediaData: ShowerMusicPlayableMediaDict,
    mediaType: ShowerMusicPlayableMediaType,
    enqueueSnackbar?: EnqueueSnackbar,
): MouseEventHandler<HTMLElement>
{
    return (_event: React.MouseEvent<HTMLElement>) =>
    {
        commandRemoveFromFavorites(mediaData.id, mediaType, mediaData.name)
            .then(() =>
            {
                if (enqueueSnackbar)
                {
                    enqueueSnackbar(`${mediaData.name} has been removed from your favorites!`, { variant: 'success' });
                }
            })
            .catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to remove ${mediaData.name} from your favorites!`, error);
            });
    };
}
