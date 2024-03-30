import './login.css';

export default function LoginPage()
{
    return (
        <div className="-translate-y-1/2" >
            <form action={ '/api/users/login' } method="POST" className="login-form">
                <input name="username" placeholder='username' />
                <input name="password" placeholder='password' type='password' />
                <input type="submit" value={ 'Login' } />
            </form>
        </div>
    );
};
