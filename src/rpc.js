export async function rpc(endpoint, method, params = []) {
  const response = await fetch(endpoint, {
    method: "POST",
    redirect: "error",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(18000),
  });
  if (!response.ok) throw new Error("RPC request unavailable.");
  const data = await response.json();
  if (!data || typeof data !== "object" || Array.isArray(data) || data.error || !("result" in data))
    throw new Error("Invalid RPC response.");
  return data.result;
}
