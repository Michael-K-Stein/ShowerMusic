'use client';
import { ShowerMusicGenericHeader } from '@/app/components/other/generic-header';
import './login.css';
import { Box, Button, Hidden, Input, Link, TextField, Typography } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { useGlobalProps } from '@/app/components/providers/global-props/global-props';
import { CONTACT_LINK, CONTACT_DISPLAY_TEXT } from '@/app/settings';

export default function LoginPage()
{
    const { setGenericModalData, setGenericModalOpen, setModalCloseCallback } = useGlobalProps();

    const searchParams = useSearchParams();
    const fromReferer = searchParams.get('from') ?? '';
    const failedLoginAttempts = searchParams.get('failedLoginAttempts') ?? '0';

    useMemo(() =>
    {
        if (3 <= parseInt(failedLoginAttempts))
        {
            setGenericModalData(
                <div className='flex flex-col items-center justify-center p-3 m-3 text-center'>
                    <Typography fontWeight={ 400 } color={ 'ivory' }>
                        You seem to be having trouble signing in
                    </Typography>
                    <Box sx={ { height: '0.3em' } } />
                    <div className='flex flex-row items-center justify-start flex-wrap'>
                        <Typography fontWeight={ 300 } color={ 'ivory' }>
                            If this persists, feel free to contact
                            <Box sx={ { width: '0.1em' } } />
                            <Link
                                underline='hover'
                                href={ CONTACT_LINK }
                                target="_blank"
                                rel="noopener"
                            >
                                { CONTACT_DISPLAY_TEXT }
                            </Link>
                            <Box sx={ { width: '0.1em' } } />
                            and I&apos;ll see what I can do
                        </Typography>
                    </div>
                </div>
            );
            setModalCloseCallback(() => { });
            setGenericModalOpen(true);
        }
    }, [ failedLoginAttempts, setGenericModalData, setGenericModalOpen, setModalCloseCallback ]);

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
                        <Input
                            name='from'
                            type='hidden'
                            value={ fromReferer }
                            hidden={ true }
                            aria-hidden={ true }
                        />
                    </Hidden>
                    <Hidden>
                        <Input
                            name='failedLoginAttempts'
                            type='hidden'
                            value={ failedLoginAttempts }
                            hidden={ true }
                            aria-hidden={ true }

                        />
                    </Hidden>
                    {
                        (0 < parseInt(failedLoginAttempts))
                        &&
                        <>
                            <Typography fontWeight={ 500 } color={ 'ivory' }>
                                Invalid credentials, please try again.
                            </Typography>
                        </>
                    }
                </Box>
            </div>
        </div>
    );
};
