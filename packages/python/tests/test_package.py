from __future__ import annotations

from tossinvest_openapi import (
    DEFAULT_USER_AGENT,
    PACKAGE_NAME,
    VERSION,
    PackageInfo,
    get_package_info,
)


def test_package_info_exports_name_and_version() -> None:
    assert PACKAGE_NAME == "tossinvest-openapi"
    assert VERSION == "0.1.0"
    assert DEFAULT_USER_AGENT == "tossinvest-openapi-python/0.1.0"
    assert get_package_info() == {
        "name": "tossinvest-openapi",
        "version": "0.1.0",
    }


def test_package_info_type_is_exported() -> None:
    package_info: PackageInfo = get_package_info()

    assert package_info["name"] == "tossinvest-openapi"
    assert package_info["version"] == "0.1.0"
