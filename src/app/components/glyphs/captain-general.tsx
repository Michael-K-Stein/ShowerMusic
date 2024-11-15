import "./glyphs.css"
import { Tooltip, TooltipProps } from "@mui/material";
import Glypher from "./glypher"
export default function CaptainGeneralGlyph({glyphTitle, placement, ...props} : {glyphTitle: string, placement?: TooltipProps[ "placement" ]} & React.HTMLAttributes<HTMLDivElement>){return(<Glypher glyphTitle={glyphTitle} placement={placement} { ...props }><div className="svg-glyph captain-general-glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="min-h-full min-w-full max-h-full max-w-full w-full h-full"><rect fill="transparent" stroke="none" width="100%" height="100%" />
  <path fill="#ffeb3b" d="M34.32,32.973l-8.928-8.951L41.707,7.707c0.391-0.391,0.391-1.023,0-1.414s-1.023-0.391-1.414,0L23.979,22.606L7.708,6.294C7.317,5.902,6.685,5.902,6.294,6.292c-0.392,0.39-0.392,1.023-0.002,1.414L22.565,24.02L6.293,40.293c-0.391,0.391-0.391,1.023,0,1.414C6.488,41.902,6.744,42,7,42s0.512-0.098,0.707-0.293l3.333-3.333c0.326,0.861,0.698,1.648,1.365,1.648c0.026,0,0.052-0.001,0.079-0.003c0.714-0.064,1.299-0.911,2.008-4.931c0.01-0.055,0.004-0.109-0.004-0.161l9.49-9.49l9.002,9.024c-0.215,0.596-0.855,2.756,0.396,4.654c1.189,1.802,3.698,2.757,7.43,2.864C40.843,41.983,40.878,42,40.915,42c0.027,0,0.053-0.013,0.08-0.016C41.166,41.988,41.324,42,41.5,42c0.276,0,0.5-0.224,0.5-0.5v-1.187l-6.974-8.047L34.32,32.973z M12.411,38.947c-0.193-0.265-0.439-0.933-0.567-1.279c-0.01-0.027-0.017-0.046-0.027-0.071l1.454-1.454C12.871,38.071,12.562,38.733,12.411,38.947z M34.216,38.571c-0.787-1.187-0.616-2.551-0.43-3.302l5.608,5.622C36.816,40.628,35.068,39.857,34.216,38.571z" />
  <polygon fill="#ffd600" points="8,16 10.828,21.172 16,24 10.828,26.828 8,32 5.172,26.828 0,24 5.172,21.172" />
  <polygon fill="#ffc107" points="8.006,16.009 8,24.5 10.817,21.164" />
  <polygon fill="#ffc107" points="8,24.5 16,24 10.828,26.828" />
  <polygon fill="#ffc107" points="8,32 8,24.5 5.172,26.828" />
  <polygon fill="#ffc107" points="0,24 8,24.5 5.172,21.172" />
  <g>
    <polygon fill="#ffd600" points="40,16 42.828,21.172 48,24 42.828,26.828 40,32 37.172,26.828 32,24 37.172,21.172" />
    <polygon fill="#ffc107" points="40.006,16.009 40,24.5 42.817,21.164" />
    <polygon fill="#ffc107" points="40,24.5 48,24 42.828,26.828" />
    <polygon fill="#ffc107" points="40,32 40,24.5 37.172,26.828" />
    <polygon fill="#ffc107" points="32,24 40,24.5 37.172,21.172" />
  </g>
  <g>
    <polygon fill="#ffd600" points="24,0 26.828,5.172 32,8 26.828,10.828 24,16 21.172,10.828 16,8 21.172,5.172" />
    <polygon fill="#ffc107" points="24.006,0.009 24,8.5 26.817,5.164" />
    <polygon fill="#ffc107" points="24,8.5 32,8 26.828,10.828" />
    <polygon fill="#ffc107" points="24,16 24,8.5 21.172,10.828" />
    <polygon fill="#ffc107" points="16,8 24,8.5 21.172,5.172" />
  </g>
  <g>
    <polygon fill="#ffd600" points="24,32 26.828,37.172 32,40 26.828,42.828 24,48 21.172,42.828 16,40 21.172,37.172" />
    <polygon fill="#ffc107" points="24.006,32.009 24,40.5 26.817,37.164" />
    <polygon fill="#ffc107" points="24,40.5 32,40 26.828,42.828" />
    <polygon fill="#ffc107" points="24,48 24,40.5 21.172,42.828" />
    <polygon fill="#ffc107" points="16,40 24,40.5 21.172,37.172" />
  </g>
</svg></div></Glypher>);};