import test from "node:test";
import assert from "node:assert/strict";
import bs58 from "bs58";
import { inspectMainnetTransaction, watchMainnetTransaction } from "../src/rpc-diagnostics.js";

const signature = bs58.encode(new Uint8Array(64).fill(3));
const endpoint = "https://rpc.example.com/?key=private-fixture";
const responses = () => ({
  getGenesisHash: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d",
  getSlot: 120,
  getSignatureStatuses: { value: [{ slot: 100, err: null, confirmationStatus: "finalized" }] },
  getTransaction: {
    slot: 100,
    meta: { err: null, fee: 5000 },
    transaction: { signatures: [signature] },
  },
});

test("live watch measures reads and slot progression without credits or endpoints", async () => {
  const data = responses();
  let clock = 0,
    waits = 0,
    observed = 0;
  const report = await watchMainnetTransaction(endpoint, signature, {
    samples: 3,
    call: async (_, method) => (method === "getSlot" ? data.getSlot++ : data[method]),
    now: () => (clock += 10),
    wait: async () => {
      waits++;
    },
    onSample: () => {
      observed++;
    },
  });
  assert.equal(report.requestCount, 12);
  assert.equal(report.averageDiagnosticMs, 10);
  assert.equal(report.unchangedSlotSamples, 0);
  assert.equal(report.receiptCredited, false);
  assert.equal(waits, 2);
  assert.equal(observed, 3);
  assert.ok(!JSON.stringify(report).includes("private-fixture"));
});

test("live watch refuses unbounded options and finalized data regressions", async () => {
  for (const options of [{ samples: 25 }, { samples: 0 }, { intervalMs: 0 }, { samples: NaN }])
    await assert.rejects(watchMainnetTransaction(endpoint, signature, options), /1–24/);
  const data = responses();
  await assert.rejects(
    watchMainnetTransaction(endpoint, signature, {
      samples: 2,
      wait: async () => {},
      call: async (_, method) => (method === "getSlot" ? data.getSlot-- : data[method]),
    }),
    /backwards/,
  );
});

test("unchanged slots are reported as observations, not invented provider failure", async () => {
  const data = responses();
  const report = await watchMainnetTransaction(endpoint, signature, {
    samples: 2,
    wait: async () => {},
    call: async (_, method) => data[method],
  });
  assert.equal(report.unchangedSlotSamples, 1);
  assert.equal(report.observations[1].slotAdvanced, false);
});
const inspect = (data) =>
  inspectMainnetTransaction(endpoint, signature, async (_, method) => data[method]);

test("diagnostic reads mainnet finalization and never returns endpoint or credits an invoice", async () => {
  const report = await inspect(responses());
  assert.equal(report.executionSucceeded, true);
  assert.equal(report.receiptCredited, false);
  assert.equal(report.feeLamports, 5000);
  assert.ok(!JSON.stringify(report).includes("private-fixture"));
});
test("diagnostic rejects wrong network before querying transactions", async () => {
  let calls = 0;
  await assert.rejects(
    inspectMainnetTransaction(endpoint, signature, async () => {
      calls++;
      return "devnet";
    }),
    /Mainnet/,
  );
  assert.equal(calls, 1);
});
test("pending and missing transactions are never represented as finalized", async () => {
  for (const status of [null, { confirmationStatus: "confirmed" }]) {
    const data = responses();
    data.getSignatureStatuses.value = [status];
    await assert.rejects(inspect(data), /not finalized/);
  }
});
test("diagnostic rejects inconsistent slots, signatures, fees and execution status", async () => {
  for (const change of [
    (d) => (d.getTransaction.slot = 121),
    (d) => (d.getTransaction.transaction.signatures = ["wrong"]),
    (d) => (d.getTransaction.meta.fee = Number.MAX_SAFE_INTEGER + 1),
    (d) => (d.getTransaction.meta.err = { InstructionError: [0, "error"] }),
    (d) => (d.getSlot = -1),
  ]) {
    const data = responses();
    change(data);
    await assert.rejects(inspect(data), /Invalid|Inconsistent/);
  }
});
test("failed finalized execution stays failed and provider errors cannot expose credentials", async () => {
  const data = responses();
  data.getTransaction.meta.err = data.getSignatureStatuses.value[0].err = {
    InstructionError: [0, "error"],
  };
  assert.equal((await inspect(data)).executionSucceeded, false);
  await assert.rejects(
    inspectMainnetTransaction(endpoint, signature, async () => {
      throw new Error(endpoint);
    }),
    (error) => !error.message.includes("private-fixture"),
  );
});
test("invalid endpoint and signature are refused before any network call", async () => {
  for (const [url, sig] of [
    ["http://rpc.example.com", signature],
    [endpoint, "bad"],
    ["https://user:pass@rpc.example.com", signature],
  ])
    await assert.rejects(
      inspectMainnetTransaction(url, sig, () => assert.fail("Network call")),
      /Invalid/,
    );
});
