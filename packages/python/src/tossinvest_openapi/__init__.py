from __future__ import annotations

from .version import (
    DEFAULT_USER_AGENT,
    PACKAGE_NAME,
    VERSION,
    PackageInfo,
    get_package_info,
)

__version__ = VERSION


__all__ = [
    "DEFAULT_USER_AGENT",
    "PACKAGE_NAME",
    "VERSION",
    "PackageInfo",
    "__version__",
    "get_package_info",
]
