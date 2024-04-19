import "./glyphs.css";
import { Tooltip, TooltipProps } from "@mui/material";
import Glypher from "./glypher";
export default function CaptainGlyph({ glyphTitle, placement, ...props }: { glyphTitle: string, placement?: TooltipProps[ "placement" ]; } & React.HTMLAttributes<HTMLDivElement>)
{
  return (<Glypher glyphTitle={ glyphTitle } placement={ placement } { ...props }><div className="svg-glyph Captain-glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="min-h-full min-w-full max-h-full max-w-full w-full h-full"><rect fill="transparent" stroke="none" width="100%" height="100%" />
    <polygon fill="currentColor" filter="brightness(1.01)" points="12.5,22 14.954,27.386 21,26.75 17.407,31.5 21,36.25 14.954,35.614 12.5,41 10.046,35.614 4,36.25 7.593,31.5 4,26.75 10.046,27.386" />
    <polygon filter="hue-rotate(5deg) brightness(1.00)" fill="currentColor" points="12.512,31.345 12.512,22 14.954,27.386" />
    <polygon filter="hue-rotate(5deg) brightness(1.00)" fill="currentColor" points="21,26.75 12.512,31.345 17.407,31.497" />
    <polygon filter="hue-rotate(5deg) brightness(1.00)" fill="currentColor" points="21,36.25 12.512,31.345 14.954,35.614" />
    <polygon filter="hue-rotate(5deg) brightness(1.00)" fill="currentColor" points="12.5,41 12.512,31.345 10.046,35.614" />
    <polygon filter="hue-rotate(5deg) brightness(1.00)" fill="currentColor" points="4,36.25 12.512,31.345 7.593,31.5" />
    <polygon filter="hue-rotate(5deg) brightness(1.00)" fill="currentColor" points="10.046,27.386 12.512,31.345 4,26.75" />
    <polygon fill="currentColor" filter="brightness(1.01)" points="23.5,5 25.954,10.386 32,9.75 28.407,14.5 32,19.25 25.954,18.614 23.5,24 21.046,18.614 15,19.25 18.593,14.5 15,9.75 21.046,10.386" />
    <polygon filter="hue-rotate(5deg) brightness(1.00)" fill="currentColor" points="23.512,14.345 23.512,5 25.954,10.386" />
    <polygon filter="hue-rotate(5deg) brightness(1.00)" fill="currentColor" points="32,9.75 23.512,14.345 28.407,14.497" />
    <polygon filter="hue-rotate(5deg) brightness(1.00)" fill="currentColor" points="32,19.25 23.512,14.345 25.954,18.614" />
    <polygon filter="hue-rotate(5deg) brightness(1.00)" fill="currentColor" points="23.5,24 23.512,14.345 21.046,18.614" />
    <polygon filter="hue-rotate(5deg) brightness(1.00)" fill="currentColor" points="15,19.25 23.512,14.345 18.593,14.5" />
    <polygon filter="hue-rotate(5deg) brightness(1.00)" fill="currentColor" points="21.046,10.386 23.512,14.345 15,9.75" />
    <polygon fill="currentColor" filter="brightness(1.01)" points="34.5,22 36.954,27.386 43,26.75 39.407,31.5 43,36.25 36.954,35.614 34.5,41 32.046,35.614 26,36.25 29.593,31.5 26,26.75 32.046,27.386" />
    <polygon filter="hue-rotate(5deg) brightness(1.00)" fill="currentColor" points="34.512,31.345 34.512,22 36.954,27.386" />
    <polygon filter="hue-rotate(5deg) brightness(1.00)" fill="currentColor" points="43,26.75 34.512,31.345 39.407,31.497" />
    <polygon filter="hue-rotate(5deg) brightness(1.00)" fill="currentColor" points="43,36.25 34.512,31.345 36.954,35.614" />
    <polygon filter="hue-rotate(5deg) brightness(1.00)" fill="currentColor" points="34.5,41 34.512,31.345 32.046,35.614" />
    <polygon filter="hue-rotate(5deg) brightness(1.00)" fill="currentColor" points="26,36.25 34.512,31.345 29.593,31.5" />
    <polygon filter="hue-rotate(5deg) brightness(1.00)" fill="currentColor" points="32.046,27.386 34.512,31.345 26,26.75" />
  </svg></div></Glypher>);
};