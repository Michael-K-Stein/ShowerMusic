import os
import re
from tqdm import tqdm
from colorama import Fore, Style


INPUT_DIR = r'C:\Users\mkupe\Code\showermusic\raw_svgs'
OUTPUT_DIR = r'C:\Users\mkupe\Code\showermusic\src\app\components\glyphs'


def printInfo(s, *args, **kwargs):
    tqdm.write('[~] ' + s, *args, **kwargs)


def printLog(s, *args, **kwargs):
	tqdm.write(Fore.YELLOW + '[=] ' + s + Style.RESET_ALL, *args, **kwargs)


def printSuccess(s, *args, **kwargs):
    tqdm.write(Fore.CYAN + '[+] ' + s + Style.RESET_ALL, *args, **kwargs)


def printError(s, *args, **kwargs):
    tqdm.write(Fore.RED + '[!] ' + s + Style.RESET_ALL, *args, **kwargs)



def main():
	for file_name in tqdm(os.listdir(INPUT_DIR)):
		file_path = os.path.join(INPUT_DIR, file_name)
		if not re.match(r'.*\.svg$', file_name):
			continue
		with open(file_path, 'r') as f:
			# Contains redundant headers
			svg_dirty_data = f.read()
		reg = re.search(r'(?P<svg_data>(\<svg\s+.*?\>.*?\<\/svg\>))', svg_dirty_data, re.DOTALL | re.MULTILINE | re.IGNORECASE)
		if not reg:
			printError(f'Failed to extract svg from {file_name}')
			continue
		svg_data = reg.group('svg_data')
		svg_data = re.sub(r' width="\d+" height="\d+"', r' className="min-h-full min-w-full max-h-full max-w-full w-full h-full"', svg_data)
		svg_data = re.sub(r'(\<svg\s+.*?\>)', r'\1<rect fill="transparent" width="100%" height="100%" />', svg_data)
		tsx_name = os.path.splitext(os.path.basename(file_name))[0].replace('_', '-')
		tsx_file_name = os.path.join(OUTPUT_DIR, tsx_name + '.tsx')
		svg_glyph_name = ''.join((x[0].upper() + x[1:]) for x in tsx_name.split('-')) + 'Glyph'
		with open(tsx_file_name, 'w') as tsx_file:
			tsx_file.write(f'import "./glyphs.css"\nimport Glypher from "./glypher"\nexport default function {svg_glyph_name}({{glyphTitle}} : {{glyphTitle: string}}){{return(<Glypher glyphTitle={{glyphTitle}}><div className="svg-glyph">{svg_data}</div></Glypher>);}};')
		printSuccess(f'Extracted svg {svg_glyph_name} to {tsx_file_name}')

if __name__ == '__main__':
	main()
