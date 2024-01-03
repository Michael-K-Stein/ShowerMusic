import "./glyphs.css"
import Glypher from "./glypher"
export default function AddGlyph({glyphTitle} : {glyphTitle: string}){return(<Glypher glyphTitle={glyphTitle}><div className="svg-glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="min-h-full min-w-full max-h-full max-w-full w-full h-full"><rect fill="transparent" width="100%" height="100%" />
  <path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M32,26h-6v6c0,0.553-0.447,1-1,1s-1-0.447-1-1v-6h-6c-0.553,0-1-0.447-1-1s0.447-1,1-1h6v-6c0-0.553,0.447-1,1-1s1,0.447,1,1v6h6c0.553,0,1,0.447,1,1S32.553,26,32,26z" fill="#FFFFFF" />
</svg></div></Glypher>);};