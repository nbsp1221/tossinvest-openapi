from __future__ import annotations

from collections.abc import Mapping
from typing import NamedTuple, NotRequired, TypedDict, TypeVar

TData = TypeVar("TData")
TRaw = TypeVar("TRaw")


class OAuth2Token(TypedDict):
    access_token: str
    token_type: str
    expires_in: int


class TossInvestResponseMeta(NamedTuple):
    status_code: int
    headers: Mapping[str, str]
    request_id: str | None = None


class TossInvestWithResponse[TData, TRaw](NamedTuple):
    data: TData
    raw: TRaw
    response: TossInvestResponseMeta


class BrokerageAccount(TypedDict):
    accountNo: str
    accountSeq: int
    accountType: str


class APIEnvelope[TData](TypedDict):
    result: NotRequired[TData]
