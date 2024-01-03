export default function LoginPage()
{
    return (
        <div>
            <form action={'/api/users/login'} method="POST">
                <input name="username" />
                <input name="password" />
                <input type="submit" />
            </form>
        </div>
    )
};