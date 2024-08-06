import "./glyphs.css"
import { Tooltip, TooltipProps } from "@mui/material";
import Glypher from "./glypher"
export default function GoldMedalGlyph({glyphTitle, placement, ...props} : {glyphTitle: string, placement?: TooltipProps[ "placement" ]} & React.HTMLAttributes<HTMLDivElement>){return(<Glypher glyphTitle={glyphTitle} placement={placement} { ...props }><div className="svg-glyph gold-medal-glyph"><svg xmlns="http://www.w3.org/2000/svg" className="min-h-full min-w-full max-h-full max-w-full w-full h-full" viewBox="0 0 50 50"><rect fill="transparent" stroke="none" width="100%" height="100%" />
  <path d="M25,18c-8.822,0-16,7.178-16,16s7.178,16,16,16s16-7.178,16-16S33.822,18,25,18z M25,46c-6.617,0-12-5.383-12-12s5.383-12,12-12c6.617,0,12,5.383,12,12S31.617,46,25,46z" fill="currentColor" />
  <path d="M25,24c-5.514,0-10,4.486-10,10s4.486,10,10,10c5.514,0,10-4.486,10-10S30.514,24,25,24z M28,31h-2v7h2v2h-6v-2h2v-7h-2v-2h6V31z" fill="currentColor" />
  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M31 15.7L31 20.2" />
  <path d="M19,21.2c-0.552,0-1-0.448-1-1V17l2.634-4H21.2c0.552,0,1,0.448,1,1s-0.448,1-1,1H20v5.2C20,20.752,19.552,21.2,19,21.2z" fill="currentColor" />
  <path d="M30,17H20c-0.36,0-0.693-0.194-0.87-0.507c-0.178-0.313-0.173-0.698,0.013-1.007l9-15C28.323,0.184,28.648,0,29,0h10c0.36,0,0.692,0.194,0.87,0.507s0.173,0.698-0.013,1.007l-9,15C30.677,16.816,30.352,17,30,17z" fill="currentColor" />
  <g>
    <path d="M20.856 16.516l5-8.3c.19-.316.191-.712.002-1.029l-.866-1.451-5.85 9.749c-.186.309-.19.694-.013 1.007.027.048.064.088.099.131.023.029.042.061.068.086.037.036.08.063.121.094.029.021.054.045.084.063.049.028.104.046.158.066.027.01.052.025.08.033C19.824 16.988 19.911 17 20 17 20.351 17 20.676 16.816 20.856 16.516zM23.829 3.788l-1.971-3.301C21.678.185 21.352 0 21 0H11c-.36 0-.693.194-.87.507-.178.313-.173.698.013 1.007l7.525 12.542L23.829 3.788z" fill="currentColor" />
  </g>
</svg></div></Glypher>);};