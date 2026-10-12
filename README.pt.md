# SafraFlux · Solami diagnostics

[Português](README.pt.md) · [English](README.md) · [Español](README.es.md)

Ferramenta de diagnóstico Mainnet do SafraFlux. Consulte finalização, execução, slot e taxa de uma transação pública. O modo ao vivo mede duração do diagnóstico e avanço do slot em amostras limitadas. Não verifica uma cobrança agrícola, movimenta dinheiro ou credita recebimentos.

## Executar

Use Node.js 24+ e npm ci. Configure SOLAMI_RPC_URL com seu próprio endpoint HTTPS Solami na sessão do terminal. Alternativamente use RPC_FAST_RPC_URL e rpcfast como provedor. Não grave ou mostre a chave no repositório, vídeo ou argumentos.

No PowerShell, a entrada pode ser ocultada:

```powershell
$env:SOLAMI_RPC_URL = Read-Host -MaskInput "Endpoint HTTPS Solami"
```

```sh
npm test
npm run rpc:inspect -- solami ASSINATURA_PUBLICA
npm run rpc:watch -- solami ASSINATURA_PUBLICA 24
```

O acompanhamento usa intervalo de cinco segundos e aceita 1–24 amostras; cada amostra completa consulta quatro métodos, sem envio de transação. Com 24 amostras, dura aproximadamente dois minutos mais o tempo de rede. Cotas/retencão do fornecedor podem impedir a consulta.

Saída 0: execução finalizada bem-sucedida; 2: execução finalizada com falha; 1: configuração, disponibilidade ou consistência inválida. Um slot sem avanço entre amostras é observado, não uma falha inventada. Um slot que retrocede ou resultado finalizado que muda rejeita o diagnóstico. As métricas são desta execução, não benchmark independente ou garantia do provedor.

Este pacote contém somente a ferramenta nova. Não contém banco, credenciais, conta agrícola, domínio financeiro ou autenticação do SafraFlux. O servidor principal permanece no RPC Fast. bs58 conserva sua licença MIT. OpenAI Codex auxiliou implementação/testes/documentação; Beatriz lidera o projeto. Licença original no arquivo LICENSE.


## Instalação do repositório público

```sh
git clone https://github.com/SouBeatrizKaroline/CryptoWorldsFair2026_SafraFlux_Solami.git
cd CryptoWorldsFair2026_SafraFlux_Solami
npm ci
```

Para uma leitura reproduzível, esta assinatura pública foi consultada em 12/10/2026: 4eHCTmNeAVxgSjnJvsA8JZgNQfednQi8BSw9LgZGAjYjb8pTQam6R3uzrnhJG3wq7U18M1VnmvUPFgTfKzGnvUoR. Disponibilidade histórica depende do provedor. Não é pagamento de cliente.

A ferramenta faz parte do [SafraFlux no Colosseum](https://colosseum.com/arena/projects/shebuilds). [Demo pública do produto](https://safraflux.soubeatrizkaroline.workers.dev/demo.html?lang=pt). A candidatura Solami ainda precisa de vídeo de 2–3 minutos mostrando esta ferramenta ao vivo; o patrocinador avalia uso significativo e utilidade.
