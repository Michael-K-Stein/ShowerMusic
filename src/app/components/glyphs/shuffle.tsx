import "./glyphs.css"
import Glypher from "./glypher"
export default function ShuffleGlyph({glyphTitle} : {glyphTitle: string}){return(<Glypher glyphTitle={glyphTitle}><div className="svg-glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="min-h-full min-w-full max-h-full max-w-full w-full h-full"><rect fill="transparent" width="100%" height="100%" />
  <path fill="none" stroke="#FFFFFF" strokeWidth="4" d="M36 34L41 39 36 44M36 16L41 11 36 6" />
  <path d="M20.968 27.857l-3.707 7.984C16.935 36.545 16.222 37 15.447 37H8v4h7.447c2.326 0 4.462-1.363 5.442-3.475l2.284-4.919L20.968 27.857zM33.553 9c-2.325 0-4.462 1.363-5.442 3.473l-3.284 7.073 2.205 4.749 4.706-10.137C32.065 13.455 32.777 13 33.553 13H40V9H33.553z" fill="currentColor" />
  <path fill="none" stroke="#FFFFFF" strokeWidth="4" d="M40,39h-7.447c-1.557,0-2.972-0.903-3.628-2.316l-10.85-23.369C17.419,11.903,16.004,11,14.447,11H8" />
</svg></div></Glypher>);};