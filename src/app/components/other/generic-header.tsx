import { CONTACT_LINK, CONTACT_DISPLAY_TEXT } from '@/app/settings';
import './generic-header.css';
import { Box, Link, Tooltip, Typography } from "@mui/material";
import ShowermusicLogoGlyph from '@/app/components/glyphs/showermusic-logo';

function ShowerMusicGenericHeaderTextLegacyStyle()
{
    return (
        <div className='flex flex-row items-baseline'>
            <Typography
                className="landing-page-title"
                variant="h1"
                fontWeight={ 900 }
                style={ { textShadow: '-2px 2px 1px rgba(30,30,30,0.3)' } }>
                Sh</Typography>
            <Box sx={ { width: '0.15rem' } } />
            <ShowermusicLogoGlyph glyphTitle="" className="w-16 h-16" data-static style={ { filter: 'drop-shadow(-2px 2px 1px rgba(30,30,30,0.3))' } } />
            <Typography className="landing-page-title"
                variant="h1"
                fontWeight={ 900 }
                style={ { textShadow: '-2px 2px 1px rgba(30,30,30,0.3)' } }>werMusic
            </Typography>
        </div>
    );
}

function ShowerMusicGenericHeaderText()
{
    return (
        <Typography
            className="landing-page-title"
            variant="h1"
            fontWeight={ 900 }
            style={ { textShadow: '-2px 2px 1px rgba(30,30,30,0.3)' } }>
            ShowerMusic
        </Typography>
    );
}

export function ShowerMusicGenericHeader({ noAnimation }: { noAnimation: boolean; })
{
    return (
        <div className="relative flex flex-col max-w-fit items-center justify-center" data-no-animation={ noAnimation }>
            <ShowerMusicGenericHeaderText />
            <Tooltip title={
                <Link
                    underline='hover'
                    href={ CONTACT_LINK }
                    target="_blank"
                    rel="noopener"
                >
                    <Typography>
                        { CONTACT_DISPLAY_TEXT }
                    </Typography>
                </Link>
            } placement='right'>
                <Typography
                    className='absolute landing-page-credit w-full text-right'
                    fontWeight={ 600 }>
                    By Michael K. Steinberg
                </Typography>
            </Tooltip>
            <Box
                className="landing-page-divider"
                sx={ { backgroundColor: 'rgba(240,240,240,0.3)', height: '3px', borderRadius: '3px' } }
            />
            <Typography
                className="landing-page-subtitle"
                variant="h3"
                fontWeight={ 700 }
                style={ { textShadow: '-2px 2px 1px rgba(30,30,30,0.3)' } }>
                פשוט לשטוף ת&apos;ראש
            </Typography>
        </div>
    );
}
