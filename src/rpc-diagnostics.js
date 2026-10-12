import bs58 from "bs58";
import { rpc } from "./rpc.js";

const MAINNET_GENESIS = "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d";

export async function inspectMainnetTransaction(endpoint, signature, call = rpc) {
  let url;
  try {
    url = new URL(endpoint);
    if (url.protocol !== "https:" || url.username || url.password || url.hash) throw new Error();
    if (
      typeof signature !== "string" ||
      signature.length > 100 ||
      bs58.decode(signature).length !== 64
    )
      throw new Error();
  } catch {
    throw new Error("Invalid HTTPS endpoint or Solana transaction signature.");
  }
  const request = async (method, params = []) => {
    try {
      return await call(url.toString(), method, params);
    } catch {
      throw new Error(`Mainnet diagnostic unavailable: ${method}.`);
    }
  };
  if ((await request("getGenesisHash")) !== MAINNET_GENESIS)
    throw new Error("Diagnostic requires Solana Mainnet.");
  const finalizedSlot = await request("getSlot", [{ commitment: "finalized" }]);
  if (!Number.isSafeInteger(finalizedSlot) || finalizedSlot <= 0)
    throw new Error("Invalid finalized slot.");
  const statuses = await request("getSignatureStatuses", [
    [signature],
    { searchTransactionHistory: true },
  ]);
  if (!Array.isArray(statuses?.value) || statuses.value.length !== 1)
    throw new Error("Invalid signature status response.");
  const status = statuses.value[0];
  if (!status || status.confirmationStatus !== "finalized")
    throw new Error("Transaction is not finalized or is unavailable.");
  const transaction = await request("getTransaction", [
    signature,
    { encoding: "json", commitment: "finalized", maxSupportedTransactionVersion: 0 },
  ]);
  if (
    !transaction?.meta ||
    !Object.hasOwn(transaction.meta, "err") ||
    !Object.hasOwn(status, "err") ||
    transaction.transaction?.signatures?.[0] !== signature ||
    !Number.isSafeInteger(transaction.slot) ||
    transaction.slot !== status.slot ||
    transaction.slot > finalizedSlot ||
    JSON.stringify(transaction.meta.err) !== JSON.stringify(status.err) ||
    !Number.isSafeInteger(transaction.meta.fee) ||
    transaction.meta.fee < 0
  )
    throw new Error("Inconsistent finalized transaction response.");
  return {
    network: "solana-mainnet",
    signature,
    finalizedSlot,
    transactionSlot: transaction.slot,
    confirmation: "finalized",
    executionSucceeded: transaction.meta.err === null,
    feeLamports: transaction.meta.fee,
    receiptCredited: false,
    purpose: "Read-only transaction diagnosis; not invoice verification or payment proof",
  };
}

export async function watchMainnetTransaction(endpoint, signature, options = {}) {
  const {
    samples = 3,
    intervalMs = 5000,
    call = rpc,
    now = () => performance.now(),
    wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    onSample = () => {},
  } = options;
  if (
    !Number.isInteger(samples) ||
    samples < 1 ||
    samples > 24 ||
    !Number.isInteger(intervalMs) ||
    intervalMs < 1000 ||
    intervalMs > 10000
  )
    throw new Error("Use 1–24 samples and a 1000–10000 ms interval.");
  const observations = [];
  let requestCount = 0;
  for (let index = 0; index < samples; index++) {
    const started = now();
    const report = await inspectMainnetTransaction(endpoint, signature, async (...args) => {
      requestCount++;
      return call(...args);
    });
    const durationMs = Math.round(now() - started);
    if (!Number.isFinite(durationMs) || durationMs < 0)
      throw new Error("Invalid diagnostic timing.");
    const previous = observations.at(-1);
    if (
      previous &&
      (report.finalizedSlot < previous.finalizedSlot ||
        report.transactionSlot !== previous.transactionSlot ||
        report.executionSucceeded !== previous.executionSucceeded)
    )
      throw new Error("Finalized data changed or provider slot moved backwards.");
    const observation = {
      ...report,
      sample: index + 1,
      durationMs,
      slotsSinceTransaction: report.finalizedSlot - report.transactionSlot,
      slotAdvanced: previous ? report.finalizedSlot > previous.finalizedSlot : null,
    };
    observations.push(observation);
    await onSample(observation);
    if (index + 1 < samples) await wait(intervalMs);
  }
  return {
    observations,
    requestCount,
    intervalMs,
    averageDiagnosticMs: Math.round(
      observations.reduce((sum, item) => sum + item.durationMs, 0) / samples,
    ),
    unchangedSlotSamples: observations.filter((item) => item.slotAdvanced === false).length,
    receiptCredited: false,
  };
}
