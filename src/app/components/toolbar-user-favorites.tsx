'use client';
import { getClientSideObjectId } from "@/app/client-api/common-utils";
import CardModal from "@/app/components/media-modals/card-modal/card-modal";
import useUserSession from "@/app/components/providers/user-provider/user-session";
import { FavoritesItem } from "@/app/shared-api/user-objects/users";
import { useCallback, useRef } from "react";

function ToolbarUserFavoriteItem({ item }: { item: FavoritesItem; })
{
    return (
        <div style={ { fontSize: '90%' } }>
            <CardModal
                item={ item }
                containsFullData={ false }
                cardModalHtmlAttributes={ { 'data-static-card': true } }
                withTypeName={ true }
            />
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
        <div
            className="toolbar-user-favorites">
            { favoritesItemsNodes }
        </div>
    );
}