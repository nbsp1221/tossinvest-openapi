from __future__ import annotations

from collections.abc import Callable
from typing import NamedTuple

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


class ExpectedRequest(NamedTuple):
    method: str
    url: str
    headers: dict[str, str]
    json: object | None = None


class ClientRequestCase(NamedTuple):
    name: str
    invoke: Callable[[TossInvestClient], object]
    expected: ExpectedRequest


ACCOUNT_HEADERS = {
    "authorization": "Bearer token",
    "x-tossinvest-account": "1",
}


REQUEST_MAPPING_CASES = [
    ClientRequestCase(
        "get_orderbook",
        lambda client: client.get_orderbook(symbol="005930"),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/orderbook?symbol=005930",
            {"authorization": "Bearer token"},
        ),
    ),
    ClientRequestCase(
        "get_prices",
        lambda client: client.get_prices(symbols="005930,AAPL"),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/prices?symbols=005930%2CAAPL",
            {"authorization": "Bearer token"},
        ),
    ),
    ClientRequestCase(
        "get_trades",
        lambda client: client.get_trades(symbol="AAPL", count=2),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/trades?symbol=AAPL&count=2",
            {"authorization": "Bearer token"},
        ),
    ),
    ClientRequestCase(
        "get_price_limit",
        lambda client: client.get_price_limit(symbol="005930"),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/price-limits?symbol=005930",
            {"authorization": "Bearer token"},
        ),
    ),
    ClientRequestCase(
        "get_candles",
        lambda client: client.get_candles(symbol="005930", interval="1d", count=10),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/candles?symbol=005930&interval=1d&count=10",
            {"authorization": "Bearer token"},
        ),
    ),
    ClientRequestCase(
        "get_stocks",
        lambda client: client.get_stocks(symbols="005930,AAPL"),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/stocks?symbols=005930%2CAAPL",
            {"authorization": "Bearer token"},
        ),
    ),
    ClientRequestCase(
        "get_stock_warnings",
        lambda client: client.get_stock_warnings(symbol="BRK.B"),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/stocks/BRK.B/warnings",
            {"authorization": "Bearer token"},
        ),
    ),
    ClientRequestCase(
        "get_exchange_rate",
        lambda client: client.get_exchange_rate(
            date_time="2026-03-25T09:30:00+09:00",
            base_currency="USD",
            quote_currency="KRW",
        ),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/exchange-rate?dateTime=2026-03-25T09%3A30%3A00%2B09%3A00&baseCurrency=USD&quoteCurrency=KRW",
            {"authorization": "Bearer token"},
        ),
    ),
    ClientRequestCase(
        "get_kr_market_calendar",
        lambda client: client.get_kr_market_calendar(date="2026-03-25"),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/market-calendar/KR?date=2026-03-25",
            {"authorization": "Bearer token"},
        ),
    ),
    ClientRequestCase(
        "get_us_market_calendar",
        lambda client: client.get_us_market_calendar(date="2026-03-25"),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/market-calendar/US?date=2026-03-25",
            {"authorization": "Bearer token"},
        ),
    ),
    ClientRequestCase(
        "get_accounts",
        lambda client: client.get_accounts(),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/accounts",
            {"authorization": "Bearer token"},
        ),
    ),
    ClientRequestCase(
        "get_holdings",
        lambda client: client.get_holdings(account_seq=1, symbol="005930"),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/holdings?symbol=005930",
            ACCOUNT_HEADERS,
        ),
    ),
    ClientRequestCase(
        "get_orders",
        lambda client: client.get_orders(
            account_seq=1,
            status="CLOSED",
            symbol="005930",
            from_date="2026-03-01",
            to_date="2026-03-31",
            cursor="next",
            limit=20,
        ),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/orders?status=CLOSED&symbol=005930&from=2026-03-01&to=2026-03-31&cursor=next&limit=20",
            ACCOUNT_HEADERS,
        ),
    ),
    ClientRequestCase(
        "create_order",
        lambda client: client.create_order(
            account_seq=1,
            symbol="005930",
            side="BUY",
            order_type="LIMIT",
            quantity="10",
            price="70000",
        ),
        ExpectedRequest(
            "POST",
            "https://openapi.tossinvest.com/api/v1/orders",
            ACCOUNT_HEADERS,
            {
                "symbol": "005930",
                "side": "BUY",
                "orderType": "LIMIT",
                "quantity": "10",
                "price": "70000",
            },
        ),
    ),
    ClientRequestCase(
        "get_order",
        lambda client: client.get_order(account_seq=1, order_id="order/1"),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/orders/order%2F1",
            ACCOUNT_HEADERS,
        ),
    ),
    ClientRequestCase(
        "modify_order",
        lambda client: client.modify_order(
            account_seq=1,
            order_id="order/1",
            order_type="LIMIT",
            quantity="15",
            price="71000",
        ),
        ExpectedRequest(
            "POST",
            "https://openapi.tossinvest.com/api/v1/orders/order%2F1/modify",
            ACCOUNT_HEADERS,
            {
                "orderType": "LIMIT",
                "quantity": "15",
                "price": "71000",
            },
        ),
    ),
    ClientRequestCase(
        "cancel_order",
        lambda client: client.cancel_order(account_seq=1, order_id="order/1"),
        ExpectedRequest(
            "POST",
            "https://openapi.tossinvest.com/api/v1/orders/order%2F1/cancel",
            ACCOUNT_HEADERS,
            {},
        ),
    ),
    ClientRequestCase(
        "get_buying_power",
        lambda client: client.get_buying_power(account_seq=1, currency="KRW"),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/buying-power?currency=KRW",
            ACCOUNT_HEADERS,
        ),
    ),
    ClientRequestCase(
        "get_sellable_quantity",
        lambda client: client.get_sellable_quantity(account_seq=1, symbol="005930"),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/sellable-quantity?symbol=005930",
            ACCOUNT_HEADERS,
        ),
    ),
    ClientRequestCase(
        "get_commissions",
        lambda client: client.get_commissions(account_seq=1),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/commissions",
            ACCOUNT_HEADERS,
        ),
    ),
]


def test_all_business_operations_map_to_expected_requests() -> None:
    for case in REQUEST_MAPPING_CASES:
        session = FakeSession([oauth_response(), FakeResponse({"result": []})])
        client = TossInvestClient(
            client_id="client",
            client_secret="secret",
            session=session,
        )

        case.invoke(client)

        request = session.calls[1]
        assert request["method"] == case.expected.method, case.name
        assert request["url"] == case.expected.url, case.name
        for header_name, header_value in case.expected.headers.items():
            assert request["headers"][header_name] == header_value, case.name
        if case.expected.json is not None:
            assert request["json"] == case.expected.json, case.name
