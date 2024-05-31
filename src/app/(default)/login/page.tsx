'use client';
import { ShowerMusicGenericHeader } from '@/app/components/other/generic-header';
import './login.css';
import { Box, Button, FormControl, Hidden, TextField } from '@mui/material';
import { useSearchParams } from 'next/navigation';

export default function LoginPage()
{
    const searchParams = useSearchParams();
    const fromReferer = searchParams.get('from') ?? '';

    return (
        <div className='flex flex-col -translate-y-[60%]'>
            <ShowerMusicGenericHeader noAnimation={ true } />
            <div>
                <Box
                    component='form'
                    action={ '/api/users/login' }
                    method='POST'
                    className='flex flex-col text-2xl login-form'
                >
                    <TextField
                        placeholder='Username'
                        name='username'
                        variant='outlined'
                        required
                        margin='normal'
                        autoComplete='username'
                        autoFocus={ true }
                        className=''
                    />
                    <TextField
                        placeholder='Password'
                        name='password'
                        type='password'
                        variant='outlined'
                        required
                        margin='normal'
                        autoComplete='password'
                    />
                    <Button
                        type='submit'
                        variant='outlined'
                    >
                        Login
                    </Button>
                    <Hidden>
                        <TextField
                            name='from'
                            type='hidden'
                            value={ fromReferer }
                            hidden={ true }
                            aria-hidden={ true }
                            hiddenLabel={ true }
                        />
                    </Hidden>
                </Box>
            </div>
        </div>
    );
};
