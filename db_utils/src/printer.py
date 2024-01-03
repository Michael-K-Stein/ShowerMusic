import subprocess
from colorama import Fore, Style
import tqdm

def printInfo(s, *args, **kwargs):
    tqdm.tqdm.write('[~] ' + s, *args, **kwargs)


def printLog(s, *args, **kwargs):
    tqdm.tqdm.write(Style.DIM + '[=] ' + s + Style.RESET_ALL, *args, **kwargs)


def printSuccess(s, *args, **kwargs):
    tqdm.tqdm.write(Fore.CYAN + '[+] ' + s + Style.RESET_ALL, *args, **kwargs)


def printError(s, *args, **kwargs):
    tqdm.tqdm.write(Fore.RED + '[!] ' + s + Style.RESET_ALL, *args, **kwargs)
