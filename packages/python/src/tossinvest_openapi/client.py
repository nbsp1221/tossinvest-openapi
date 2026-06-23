from __future__ import annotations

from types import TracebackType
from typing import Literal, cast, overload
from urllib.parse import quote

import requests

from .auth import TokenManager
from .http import HttpRequest, SessionLike, build_url, request_json
from .types import OAuth2Token, TossInvestWithResponse
from .version import DEFAULT_USER_AGENT

DEFAULT_BASE_URL = "https://openapi.tossinvest.com"
DEFAULT_TIMEOUT = 30.0


class TossInvestClient:
    def __init__(
        self,
        *,
        client_id: str,
        client_secret: str,
        base_url: str = DEFAULT_BASE_URL,
        session: SessionLike | None = None,
        timeout: float = DEFAULT_TIMEOUT,
        user_agent: str = DEFAULT_USER_AGENT,
    ) -> None:
        self._base_url = base_url
        self._session = session if session is not None else requests.Session()
        self._owns_session = session is None
        self._timeout = timeout
        self._user_agent = user_agent
        self._closed = False
        self._token_manager = TokenManager(
            client_id=client_id,
            client_secret=client_secret,
            base_url=base_url,
            session=self._session,
            timeout=timeout,
            user_agent=user_agent,
        )

    @property
    def is_closed(self) -> bool:
        return self._closed

    def close(self) -> None:
        if self._owns_session and not self._closed:
            self._session.close()
        self._closed = True

    def __enter__(self) -> TossInvestClient:
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        self.close()

    def issue_oauth2_token(self) -> OAuth2Token:
        return self._token_manager.issue_token()

    def get_orderbook(
        self,
        *,
        symbol: str,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/orderbook",
            method="GET",
            query={"symbol": symbol},
            account_seq=None,
            timeout=timeout,
            with_response=with_response,
        )

    def get_prices(
        self,
        *,
        symbols: str,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/prices",
            method="GET",
            query={"symbols": symbols},
            account_seq=None,
            timeout=timeout,
            with_response=with_response,
        )

    def get_trades(
        self,
        *,
        symbol: str,
        count: int | None = None,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/trades",
            method="GET",
            query={"symbol": symbol, "count": count},
            account_seq=None,
            timeout=timeout,
            with_response=with_response,
        )

    def get_price_limit(
        self,
        *,
        symbol: str,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/price-limits",
            method="GET",
            query={"symbol": symbol},
            account_seq=None,
            timeout=timeout,
            with_response=with_response,
        )

    def get_candles(
        self,
        *,
        symbol: str,
        interval: str,
        count: int | None = None,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/candles",
            method="GET",
            query={"symbol": symbol, "interval": interval, "count": count},
            account_seq=None,
            timeout=timeout,
            with_response=with_response,
        )

    def get_stocks(
        self,
        *,
        symbols: str,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/stocks",
            method="GET",
            query={"symbols": symbols},
            account_seq=None,
            timeout=timeout,
            with_response=with_response,
        )

    def get_stock_warnings(
        self,
        *,
        symbol: str,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path=f"/api/v1/stocks/{quote(symbol, safe='')}/warnings",
            method="GET",
            query=None,
            account_seq=None,
            timeout=timeout,
            with_response=with_response,
        )

    def get_exchange_rate(
        self,
        *,
        date_time: str,
        base_currency: str,
        quote_currency: str,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/exchange-rate",
            method="GET",
            query={
                "dateTime": date_time,
                "baseCurrency": base_currency,
                "quoteCurrency": quote_currency,
            },
            account_seq=None,
            timeout=timeout,
            with_response=with_response,
        )

    def get_kr_market_calendar(
        self,
        *,
        date: str | None = None,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/market-calendar/KR",
            method="GET",
            query={"date": date},
            account_seq=None,
            timeout=timeout,
            with_response=with_response,
        )

    def get_us_market_calendar(
        self,
        *,
        date: str | None = None,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/market-calendar/US",
            method="GET",
            query={"date": date},
            account_seq=None,
            timeout=timeout,
            with_response=with_response,
        )

    @overload
    def get_accounts(self, *, timeout: float | None = None) -> object: ...

    @overload
    def get_accounts(
        self,
        *,
        timeout: float | None = None,
        with_response: Literal[True],
    ) -> TossInvestWithResponse[object, object]: ...

    def get_accounts(
        self,
        *,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/accounts",
            method="GET",
            query=None,
            account_seq=None,
            timeout=timeout,
            with_response=with_response,
        )

    def get_holdings(
        self,
        *,
        account_seq: int,
        symbol: str | None = None,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/holdings",
            method="GET",
            query={"symbol": symbol},
            account_seq=account_seq,
            timeout=timeout,
            with_response=with_response,
        )

    def get_orders(
        self,
        *,
        account_seq: int,
        status: str | None = None,
        symbol: str | None = None,
        from_date: str | None = None,
        to_date: str | None = None,
        cursor: str | None = None,
        limit: int | None = None,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/orders",
            method="GET",
            query={
                "status": status,
                "symbol": symbol,
                "from": from_date,
                "to": to_date,
                "cursor": cursor,
                "limit": limit,
            },
            account_seq=account_seq,
            timeout=timeout,
            with_response=with_response,
        )

    def create_order(
        self,
        *,
        account_seq: int,
        symbol: str,
        side: str,
        order_type: str,
        quantity: str,
        price: str | None = None,
        client_order_id: str | None = None,
        time_in_force: str | None = None,
        confirm_high_value_order: bool | None = None,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/orders",
            method="POST",
            query=None,
            account_seq=account_seq,
            timeout=timeout,
            with_response=with_response,
            body={
                "symbol": symbol,
                "side": side,
                "orderType": order_type,
                "quantity": quantity,
                "price": price,
                "clientOrderId": client_order_id,
                "timeInForce": time_in_force,
                "confirmHighValueOrder": confirm_high_value_order,
            },
        )

    def get_order(
        self,
        *,
        account_seq: int,
        order_id: str,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path=f"/api/v1/orders/{quote(order_id, safe='')}",
            method="GET",
            query=None,
            account_seq=account_seq,
            timeout=timeout,
            with_response=with_response,
        )

    def modify_order(
        self,
        *,
        account_seq: int,
        order_id: str,
        order_type: str,
        quantity: str,
        price: str | None = None,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path=f"/api/v1/orders/{quote(order_id, safe='')}/modify",
            method="POST",
            query=None,
            account_seq=account_seq,
            timeout=timeout,
            with_response=with_response,
            body={"orderType": order_type, "quantity": quantity, "price": price},
        )

    def cancel_order(
        self,
        *,
        account_seq: int,
        order_id: str,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path=f"/api/v1/orders/{quote(order_id, safe='')}/cancel",
            method="POST",
            query=None,
            account_seq=account_seq,
            timeout=timeout,
            with_response=with_response,
            body={},
        )

    def get_buying_power(
        self,
        *,
        account_seq: int,
        currency: str | None = None,
        symbol: str | None = None,
        side: str | None = None,
        order_type: str | None = None,
        price: str | None = None,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/buying-power",
            method="GET",
            query={
                "currency": currency,
                "symbol": symbol,
                "side": side,
                "orderType": order_type,
                "price": price,
            },
            account_seq=account_seq,
            timeout=timeout,
            with_response=with_response,
        )

    def get_sellable_quantity(
        self,
        *,
        account_seq: int,
        symbol: str,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/sellable-quantity",
            method="GET",
            query={"symbol": symbol},
            account_seq=account_seq,
            timeout=timeout,
            with_response=with_response,
        )

    def get_commissions(
        self,
        *,
        account_seq: int,
        symbol: str | None = None,
        side: str | None = None,
        order_type: str | None = None,
        quantity: str | None = None,
        price: str | None = None,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/commissions",
            method="GET",
            query={
                "symbol": symbol,
                "side": side,
                "orderType": order_type,
                "quantity": quantity,
                "price": price,
            },
            account_seq=account_seq,
            timeout=timeout,
            with_response=with_response,
        )

    def _request_envelope(
        self,
        *,
        path: str,
        method: str,
        query: dict[str, object | None] | None,
        account_seq: int | None,
        timeout: float | None,
        with_response: bool,
        body: object | None = None,
    ) -> object | TossInvestWithResponse[object, object]:
        headers = {
            "authorization": f"Bearer {self._token_manager.get_access_token()}",
            "user-agent": self._user_agent,
        }
        if account_seq is not None:
            headers["x-tossinvest-account"] = str(account_seq)

        request_body = None
        if isinstance(body, dict):
            request_body = {key: value for key, value in body.items() if value is not None}
        elif body is not None:
            request_body = body

        request = HttpRequest(
            method=method,
            url=build_url(self._base_url, path, query),
            headers=headers,
            json=request_body,
            timeout=timeout or self._timeout,
        )
        result = request_json(self._session, request)
        raw = cast(dict[str, object], result.data)
        data = raw.get("result")

        if with_response:
            return TossInvestWithResponse(data=data, raw=raw, response=result.response)

        return data
