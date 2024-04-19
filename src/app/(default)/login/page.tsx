import { ShowerMusicGenericHeader } from '@/app/(default)/(pre-auth)/(landing-page)/page';
import './login.css';

export default function LoginPage()
{
    return (
        <div className='flex flex-col -translate-y-[60%]'>
            <ShowerMusicGenericHeader noAnimation={ true } />
            <div>
                <form action={ '/api/users/login' } method="POST" className="login-form">
                    <input name="username" placeholder='username' />
                    <input name="password" placeholder='password' type='password' />
                    <input type="submit" value={ 'Login' } />
                </form>
            </div>
        </div>
    );
};
