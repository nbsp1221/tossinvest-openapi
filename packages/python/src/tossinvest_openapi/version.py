from __future__ import annotations

from typing import Final, TypedDict

PACKAGE_NAME: Final[str] = "tossinvest-openapi"
VERSION: Final[str] = "0.1.0"
DEFAULT_USER_AGENT: Final[str] = f"{PACKAGE_NAME}-python/{VERSION}"


class PackageInfo(TypedDict):
    name: str
    version: str


def get_package_info() -> PackageInfo:
    return {
        "name": PACKAGE_NAME,
        "version": VERSION,
    }
