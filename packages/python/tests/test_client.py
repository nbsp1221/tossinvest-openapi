from __future__ import annotations

from helpers import FakeResponse, FakeSession, oauth_response
from tossinvest_openapi import TossInvestClient


def test_client_unwraps_result_and_lazily_authenticates() -> None:
    session = FakeSession(
        [
            oauth_response(),
            FakeResponse(
                {"result": [{"accountSeq": 1}]},
                headers={"x-request-id": "req_accounts"},
            ),
        ]
    )
    client = TossInvestClient(
        client_id="client",
        client_secret="secret",
        session=session,
    )

    assert client.get_accounts() == [{"accountSeq": 1}]
    assert session.calls[1]["method"] == "GET"
    assert session.calls[1]["url"] == "https://openapi.tossinvest.com/api/v1/accounts"
    assert session.calls[1]["headers"]["authorization"] == "Bearer token"


def test_client_returns_with_response_wrapper() -> None:
    session = FakeSession(
        [
            oauth_response(),
            FakeResponse({"result": []}, headers={"x-request-id": "req_accounts"}),
        ]
    )
    client = TossInvestClient(
        client_id="client",
        client_secret="secret",
        session=session,
    )

    result = client.get_accounts(with_response=True)

    assert result.data == []
    assert result.raw == {"result": []}
    assert result.response.status_code == 200
    assert result.response.request_id == "req_accounts"


def test_client_close_does_not_close_caller_owned_session() -> None:
    session = FakeSession([])
    client = TossInvestClient(
        client_id="client",
        client_secret="secret",
        session=session,
    )

    client.close()

    assert session.closed is False


def test_client_context_manager_closes_owned_session() -> None:
    client = TossInvestClient(client_id="client", client_secret="secret")

    with client as entered:
        assert entered is client

    assert client.is_closed is True


def test_issue_oauth2_token_exposes_auth_operation() -> None:
    session = FakeSession([oauth_response("manual-token")])
    client = TossInvestClient(
        client_id="client",
        client_secret="secret",
        session=session,
    )

    assert client.issue_oauth2_token()["access_token"] == "manual-token"
