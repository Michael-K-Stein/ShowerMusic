import { ApiSuccess, catchHandler } from "@/app/api/common";
import { DbObjects } from "@/app/server-db-services/db-objects";
import { getUserId } from "@/app/server-db-services/user-utils";
import { NewPlaylistInitOptions } from "@/app/shared-api/other/playlist";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest)
{
    try
    {
        const userId = await getUserId();
        const playlistInitOptions: NewPlaylistInitOptions | undefined = await request.json();

        const playlist = await DbObjects.Playlists.create(userId, playlistInitOptions);

        return ApiSuccess(playlist);
    }
    catch (e)
    {
        return catchHandler(request, e);
    }
}
