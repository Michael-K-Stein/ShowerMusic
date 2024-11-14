import { SHOWERMUSIC_WEB_TITLE } from '@/app/settings';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: SHOWERMUSIC_WEB_TITLE,
    description: 'פשוט לשתוף ת\'ראש',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
})
{
    return (
        <html lang="en">
            <head>
                <link rel="manifest" href="/manifest.webmanifest" />
                <meta name="theme-color" content="#F46197" />

                <link rel="icon" sizes="512x512" href="/showermusic_logo.svg" />

                <link rel="apple-touch-icon" href="/showermusic_logo.svg" />
                <link rel="apple-touch-startup-image" href="/showermusic_logo.svg" />

                <meta name="msapplication-square70x70logo" content="/showermusic_logo.svg" />
                <meta name="msapplication-square150x150logo" content="/showermusic_logo.svg" />
                <meta name="msapplication-wide310x150logo" content="/showermusic_logo.svg" />

                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            </head>
            <body
                className={ `max-h-screen max-w-screen min-w-screen min-h-screen w-screen h-screen p-0 m-0` }
                style={ { overflow: 'hidden' } }>
                <div className='svg-background' />
                {/* <div className='absolute min-w-full min-h-screen top-0 left-0 flex content-center justify-center align-center p-0 m-0'>
                     <Image src={ '/landing-page-background-16x9.svg' } width={ 1920 } height={ 1080 } alt={ '' } className='min-w-full min-h-full' quality={ 100 } /> 
                </div> */}
                <div className='max-h-screen min-h-screen h-screen min-w-screen max-w-screen w-screen relative overflow-hidden flex p-0 m-0' style={ { backgroundColor: 'var(--global-background-color)', backdropFilter: 'blur(0px)' } }>
                    { children }
                </div>
            </body>
        </html>
    );
}
