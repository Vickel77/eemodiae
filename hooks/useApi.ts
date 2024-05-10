import React from "react";

const API_URL = process.env.API_URL_LOCAL;

export default function useApi(uri: string) {
  const apiRequest = async ({
    method,
    params,
    body,
  }: {
    method: string;
    params?: string;
    body?: any;
  }) =>
    await fetch(`${API_URL}/${uri}/${params ?? ""}`, {
      method: method,
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: body ?? "",
    });

  return { apiRequest };
}
