import { watchMainnetTransaction } from "../src/rpc-diagnostics.js";

const [provider, signature, count = "3"] = process.argv.slice(2);
const variable = { solami: "SOLAMI_RPC_URL", rpcfast: "RPC_FAST_RPC_URL" }[provider];
if (!variable || !signature) {
  console.error("Usage: npm run rpc:watch -- solami|rpcfast PUBLIC_SIGNATURE [1-24 samples]");
  process.exitCode = 1;
} else {
  try {
    const report = await watchMainnetTransaction(process.env[variable], signature, {
      samples: Number(count),
      onSample: (sample) =>
        console.log(JSON.stringify({ provider, checkedAt: new Date().toISOString(), ...sample })),
    });
    console.log(JSON.stringify({ provider, type: "summary", ...report }, null, 2));
    if (!report.observations.at(-1).executionSucceeded) process.exitCode = 2;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
