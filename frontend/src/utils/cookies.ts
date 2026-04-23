/**
 * Cookie utility for JWT and user data storage.
 * All cookies are set with a 7-day expiry, SameSite=Lax, and Secure flag.
 */

const COOKIE_EXPIRY_DAYS = 7;

function setCookie(name: string, value: string): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax;Secure`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp("(^| )" + name + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[2]) : null;
}

function removeCookie(name: string): void {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax;Secure`;
}

export { setCookie, getCookie, removeCookie };
