import type { CookieOptions,Response } from "express";
import { Config } from "src/common/config";

// single source of truth for names
export const COOKIE_NAMES = Config.cookie.names;

// single source of truth for expiry
export const TOKEN_EXPIRY = Config.jwt

const refreshCookieOptions: CookieOptions = {
  ...Config.cookie.options,
  maxAge : TOKEN_EXPIRY.refreshToken.expiresInMs,
}

const accessCookieOptions: CookieOptions = {
  ...Config.cookie.options,
  maxAge : TOKEN_EXPIRY.accessToken.expiresInMs,
}

// Simple named functions — easy to mock in tests

export function setRefreshToken(res: Response, token: string): void {
  res.cookie(COOKIE_NAMES.refreshToken, token, refreshCookieOptions);
}

export function setAccessToken(res: Response, token: string): void {
  res.cookie(COOKIE_NAMES.accessToken,token,accessCookieOptions);
}

export function clearRefreshToken(res: Response): void {
  res.clearCookie(COOKIE_NAMES.refreshToken, refreshCookieOptions);
}
export function clearAccessToken(res: Response): void {
  res.clearCookie(COOKIE_NAMES.accessToken, accessCookieOptions);
}