from __future__ import annotations

import threading
import time
from collections.abc import Callable
from typing import cast

from .http import HttpRequest, SessionLike, build_url, request_json
from .types import OAuth2Token


class TokenManager:
    def __init__(
        self,
        *,
        client_id: str,
        client_secret: str,
        base_url: str,
        session: SessionLike,
        timeout: float,
        user_agent: str | None = None,
        expiry_skew: float = 30.0,
        now: Callable[[], float] | None = None,
    ) -> None:
        self._client_id = client_id
        self._client_secret = client_secret
        self._base_url = base_url
        self._session = session
        self._timeout = timeout
        self._user_agent = user_agent
        self._expiry_skew = expiry_skew
        self._now = now or time.time
        self._lock = threading.Lock()
        self._token: OAuth2Token | None = None
        self._expires_at: float = 0.0

    def get_access_token(self) -> str:
        if self._token is not None and self._expires_at > self._now():
            return self._token["access_token"]

        with self._lock:
            if self._token is not None and self._expires_at > self._now():
                return self._token["access_token"]

            token = self.issue_token()
            self._token = token
            self._expires_at = self._now() + float(token["expires_in"]) - self._expiry_skew
            return token["access_token"]

    def issue_token(self) -> OAuth2Token:
        headers = {
            "content-type": "application/x-www-form-urlencoded",
        }
        if self._user_agent:
            headers["user-agent"] = self._user_agent

        result = request_json(
            self._session,
            HttpRequest(
                method="POST",
                url=build_url(self._base_url, "/oauth2/token"),
                headers=headers,
                data={
                    "grant_type": "client_credentials",
                    "client_id": self._client_id,
                    "client_secret": self._client_secret,
                },
                timeout=self._timeout,
            ),
        )
        return cast(OAuth2Token, result.data)
