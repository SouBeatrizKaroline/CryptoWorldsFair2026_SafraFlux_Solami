import { inspectMainnetTransaction } from "../src/rpc-diagnostics.js";

const [provider, signature] = process.argv.slice(2);
const variable = { solami: "SOLAMI_RPC_URL", rpcfast: "RPC_FAST_RPC_URL" }[provider];
if (!variable || !signature) {
  console.error("Usage: npm run rpc:inspect -- solami|rpcfast PUBLIC_SIGNATURE");
  process.exitCode = 1;
} else {
  try {
    const report = await inspectMainnetTransaction(process.env[variable], signature);
    console.log(
      JSON.stringify({ provider, checkedAt: new Date().toISOString(), ...report }, null, 2),
    );
    if (!report.executionSucceeded) process.exitCode = 2;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
