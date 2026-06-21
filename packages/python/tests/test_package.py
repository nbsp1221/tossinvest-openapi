from tossinvest_openapi import __version__, get_package_info


def test_package_info_exports_name_and_version() -> None:
    assert __version__ == "0.0.0"
    assert get_package_info() == {
        "name": "tossinvest-openapi",
        "version": "0.0.0",
    }
