import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Image from 'next/image';

const inter = Inter({ subsets: [ 'latin' ] });

export const metadata: Metadata = {
  title: 'ShowerMusic',
  description: 'Music to my ears',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
})
{
  return (
    <html lang="en">
      <body className={ `${inter.className} max-h-screen max-w-screen min-w-screen min-h-screen w-full h-full` } style={ { overflow: 'hidden' } }>
        <div className='absolute min-w-full min-h-screen top-0 left-0 flex content-center justify-center align-center'>
          <Image src={ '/stream-bg.png' } width={ 1920 } height={ 1080 } alt={ '' } className='min-w-full min-h-full' quality={ 100 } />
        </div>
        <div className='max-h-screen min-h-screen h-screen min-w-screen max-w-screen w-screen relative overflow-hidden flex' style={ { backgroundColor: 'var(--global-background-color)', backdropFilter: 'blur(0px)' } }>
          { children }
        </div>
      </body>
    </html>
  );
}
