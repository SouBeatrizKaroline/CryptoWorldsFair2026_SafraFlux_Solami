# SafraFlux · Solami diagnostics

[Português](README.pt.md) · [English](README.md) · [Español](README.es.md)

SafraFlux Mainnet transaction diagnostics. Inspect finalization, execution, slot and fee for a public signature. Live mode measures diagnostic duration and slot progression through bounded samples. It does not verify agricultural invoices, transfer funds or credit receipts.

## Run

Use Node.js 24+ and npm ci. Set SOLAMI_RPC_URL to your own Solami HTTPS endpoint privately in your terminal session. Alternatively set RPC_FAST_RPC_URL and choose rpcfast. Never put keys in the repository, videos or arguments.

PowerShell supports masked entry:

```powershell
$env:SOLAMI_RPC_URL = Read-Host -MaskInput "Solami HTTPS endpoint"
```

```sh
npm test
npm run rpc:inspect -- solami PUBLIC_SIGNATURE
npm run rpc:watch -- solami PUBLIC_SIGNATURE 24
```

Watch uses five-second intervals and 1–24 samples; a complete sample makes four read calls without sending transactions. Twenty-four samples take about two minutes plus network time. Provider quotas/history retention may prevent a query.

Exit 0: successful finalized execution; 2: failed finalized execution; 1: invalid configuration, availability or consistency. An unchanged slot is an observation, not an invented failure. Regressing slots or changed finalized outcomes reject the diagnostic. Metrics describe this run, not an independent benchmark/provider guarantee.

This package includes only the new tool, with no database, credentials, agricultural account, financial domain or authentication code. The main server remains RPC Fast. bs58 retains its MIT license. OpenAI Codex assisted implementation/tests/docs; Beatriz leads the project. Original license is in LICENSE.


## Install the public repository

```sh
git clone https://github.com/SouBeatrizKaroline/CryptoWorldsFair2026_SafraFlux_Solami.git
cd CryptoWorldsFair2026_SafraFlux_Solami
npm ci
```

Public signature queried on October 12, 2026 for reproduction: 4eHCTmNeAVxgSjnJvsA8JZgNQfednQi8BSw9LgZGAjYjb8pTQam6R3uzrnhJG3wq7U18M1VnmvUPFgTfKzGnvUoR. Historical availability depends on the provider. This is not a customer payment.

This tool belongs to [SafraFlux on Colosseum](https://colosseum.com/arena/projects/shebuilds). [Public product demo](https://safraflux.soubeatrizkaroline.workers.dev/demo.html?lang=en). The Solami application still needs a 2–3 minute video showing this tool live; the sponsor evaluates meaningful use and usefulness.
