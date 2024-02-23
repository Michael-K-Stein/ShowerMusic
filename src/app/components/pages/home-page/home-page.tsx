import './home-page.css';
import { UserDict } from '@/app/shared-api/user-objects/users';
import { Typography } from '@mui/material';
import UserPlaylists from '@/app/components/pages/home-page/user-playlists';
import UserRecentlyPlayed from '@/app/components/pages/home-page/user-recently-played';
import useUserSession from '@/app/components/providers/user-provider/user-session';
import UserFavorites from '@/app/components/pages/home-page/user-favorites';

function HomePageHeader({ userData }: { userData: UserDict | undefined; })
{
    return (
        <div className='mt-16 w-full h-full box-border'>
            <Typography variant='h3'>
                Welcome back, { userData?.username }
            </Typography>
        </div>
    );
}

export default function HomePageLoader()
{
    const { userData } = useUserSession();

    return (
        <div className='home-page-scroll-container'>
            <div className='home-page-container'>
                <HomePageHeader userData={ userData } />
                <UserRecentlyPlayed />
                <div className='box-border p-2 m-2'>
                    <UserPlaylists />
                    <UserFavorites />
                </div>
            </div>
        </div>
    );
}
