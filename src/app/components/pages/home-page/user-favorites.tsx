import { getClientSideObjectId } from "@/app/client-api/common-utils";
import CardModal from "@/app/components/media-modals/card-modal/card-modal";
import useUserSession from "@/app/components/providers/user-provider/user-session";
import { FavoritesItem } from "@/app/shared-api/user-objects/users";
import { Typography } from "@mui/material";
import './home-page-favorites.css';

function UserFavoritesItem({ item }: { item: FavoritesItem; })
{
    item.includesName = true;

    return (
        <CardModal item={ item } containsFullData={ false } withTypeName={ true } />
    );
}

function UserFavoritesInternal()
{
    const { userFavorites } = useUserSession();

    if (userFavorites === undefined || userFavorites.items.length === 0)
    {
        return (
            <div>

            </div>
        );
    }

    const items = userFavorites.items.map(
        (item) =>
            <UserFavoritesItem key={ getClientSideObjectId(item) } item={ item } />
    );

    return (
        <div>
            <Typography variant='h4' fontWeight={ 700 }>Your favorites</Typography>
            <div className='flex flex-row items-center flex-wrap'>
                { items }
            </div>
        </div>
    );
}

export default function UserFavorites()
{
    return (
        <div className="user-favorites-container-wrapper">
            <UserFavoritesInternal />
        </div>
    );
}