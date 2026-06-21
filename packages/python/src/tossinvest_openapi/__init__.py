from __future__ import annotations

__version__ = "0.0.0"


def get_package_info() -> dict[str, str]:
    return {
        "name": "tossinvest-openapi",
        "version": __version__,
    }


__all__ = ["__version__", "get_package_info"]
