import './login.css';

export default function LoginPage()
{
    return (
        <div className="" style={ { transform: 'translateY(-50%)' } }>
            <form action={ '/api/users/login' } method="POST" className="login-form">
                <input name="username" placeholder='username' />
                <input name="password" placeholder='password' type='password' />
                <input type="submit" value={ 'Login' } />
            </form>
        </div>
    );
};