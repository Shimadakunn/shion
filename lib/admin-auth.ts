"use server";

import { cookies } from "next/headers";
import { createHmac } from "crypto";

const COOKIE_NAME = "shion-admin";
const SECRET = process.env.ADMIN_PASSWORD ?? "fallback-secret";

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}

function createToken(): string {
  const payload = "admin-authenticated";
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function verifyToken(token: string): boolean {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  return sign(payload) === signature;
}

export async function login(password: string): Promise<boolean> {
  if (password !== process.env.ADMIN_PASSWORD) return false;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  return true;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyToken(token);
}
