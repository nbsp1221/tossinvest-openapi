from __future__ import annotations

from types import TracebackType
from typing import Literal, cast, overload

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
        self._session = session or requests.Session()
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

        request = HttpRequest(
            method=method,
            url=build_url(self._base_url, path, query),
            headers=headers,
            json=body,
            timeout=timeout or self._timeout,
        )
        result = request_json(self._session, request)
        raw = cast(dict[str, object], result.data)
        data = raw.get("result")

        if with_response:
            return TossInvestWithResponse(data=data, raw=raw, response=result.response)

        return data
