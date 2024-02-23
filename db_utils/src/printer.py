import subprocess
from colorama import Fore, Style
import tqdm


def printInfo(s, *args, **kwargs):
    tqdm.tqdm.write(
        "[~] " + str(s + " \t" + " \t".join(str(x) for x in args)), *args, **kwargs
    )


def printLog(s, *args, **kwargs):
    tqdm.tqdm.write(
        Style.DIM
        + "[=] "
        + str(s + " \t" + " \t".join(str(x) for x in args))
        + Style.RESET_ALL,
        **kwargs
    )


def printSuccess(s, *args, **kwargs):
    tqdm.tqdm.write(
        Fore.CYAN
        + "[+] "
        + str(s + " \t" + " \t".join(str(x) for x in args))
        + Style.RESET_ALL,
        *args,
        **kwargs
    )


def printError(s, *args, **kwargs):
    tqdm.tqdm.write(
        Fore.RED
        + "[!] "
        + str(s + " \t" + " \t".join(str(x) for x in args))
        + Style.RESET_ALL,
        *args,
        **kwargs
    )
