export default async function fetcher<T = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);
  const contentType = res.headers.get("content-type") || "";
  let data: any = null;

  if (contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }
  } else {
    try {
      data = await res.text();
    } catch (e) {
      data = null;
    }
  }

  if (!res.ok) {
    const message =
      data?.error ||
      data?.message ||
      (typeof data === "string" ? data : null) ||
      res.statusText ||
      "Request failed";
    throw new Error(message);
  }

  return data as T;
}
