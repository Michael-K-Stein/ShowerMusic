import os
import re
from tqdm import tqdm
from colorama import Fore, Style


INPUT_DIR = r"C:\Users\mkupe\Code\showermusic\raw_svgs"
OUTPUT_DIR = r"C:\Users\mkupe\Code\showermusic\src\app\components\glyphs"


def printInfo(s, *args, **kwargs):
    tqdm.write("[~] " + s, *args, **kwargs)


def printLog(s, *args, **kwargs):
    tqdm.write(Fore.YELLOW + "[=] " + s + Style.RESET_ALL, *args, **kwargs)


def printSuccess(s, *args, **kwargs):
    tqdm.write(Fore.CYAN + "[+] " + s + Style.RESET_ALL, *args, **kwargs)


def printError(s, *args, **kwargs):
    tqdm.write(Fore.RED + "[!] " + s + Style.RESET_ALL, *args, **kwargs)


def main():
    for file_name in tqdm(os.listdir(INPUT_DIR)):
        file_path = os.path.join(INPUT_DIR, file_name)
        if not re.match(r".*\.svg$", file_name):
            continue
        with open(file_path, "r") as f:
            # Contains redundant headers
            svg_dirty_data = f.read()
        reg = re.search(
            r"(?P<svg_data>(\<svg\s+.*?\>.*?\<\/svg\>))",
            svg_dirty_data,
            re.DOTALL | re.MULTILINE | re.IGNORECASE,
        )
        if not reg:
            printError(f"Failed to extract svg from {file_name}")
            continue
        svg_data = reg.group("svg_data")
        svg_data = re.sub(
            r'\s+width="\d+"\s+height="\d+"',
            r' className="min-h-full min-w-full max-h-full max-w-full w-full h-full"',
            svg_data,
            re.MULTILINE,
        )
        svg_data = re.sub(
            r"(\<svg\s+.*?\>)",
            r'\1<rect fill="transparent" stroke="none" width="100%" height="100%" />',
            svg_data,
            re.MULTILINE,
        )

        svg_data = re.sub(
            r"(\w+)-(\w)(\w+)=",
            lambda m: f"{m.group(1)}{m.group(2).upper()}{m.group(3)}=",
            svg_data,
        )

        c = svg_dirty_data.count(" fill=")
        c -= svg_dirty_data.count(' fill="none"')
        c -= svg_dirty_data.count(" fill='none'")
        c -= svg_dirty_data.count(' fill="#FFFFFF"')
        if c > 1:
            printInfo(f"Multiple fills! {c}")
        else:
            svg_data = re.sub(r'\bfill="#\w+?"', r'fill="currentColor"', svg_data)
            svg_data = re.sub(r'\bstroke="#\w+?"', r'stroke="currentColor"', svg_data)

        tsx_name = os.path.splitext(os.path.basename(file_name))[0].replace("_", "-")
        glyph_custom_css_class = f"{tsx_name}-glyph"
        tsx_file_name = os.path.join(OUTPUT_DIR, tsx_name + ".tsx")
        svg_glyph_name = (
            "".join((x[0].upper() + x[1:]) for x in tsx_name.split("-")) + "Glyph"
        )
        with open(tsx_file_name, "w") as tsx_file:
            tsx_file.write(
                f'import "./glyphs.css"\nimport {{ Tooltip, TooltipProps }} from "@mui/material";\nimport Glypher from "./glypher"\nexport default function {svg_glyph_name}({{glyphTitle, placement, ...props}} : {{glyphTitle: string, placement?: TooltipProps[ "placement" ]}} & React.HTMLAttributes<HTMLDivElement>){{return(<Glypher glyphTitle={{glyphTitle}} placement={{placement}} {{ ...props }}><div className="svg-glyph {glyph_custom_css_class}">{svg_data}</div></Glypher>);}};'
            )
        printSuccess(f"Extracted svg {svg_glyph_name} to {tsx_file_name}")


if __name__ == "__main__":
    main()
