# SafraFlux · Solami diagnostics

[Português](README.pt.md) · [English](README.md) · [Español](README.es.md)

Diagnóstico Mainnet del SafraFlux: finalización, ejecución, slot y tasa de firma pública. El modo vivo mide duración y avance de slots en muestras limitadas. No verifica facturas agrícolas, mueve fondos ni acredita cobros.

## Ejecutar

Use Node.js 24+ y npm ci. Configure SOLAMI_RPC_URL con endpoint HTTPS Solami propio privadamente en su terminal. Alternativamente RPC_FAST_RPC_URL y proveedor rpcfast. No incluya claves en repositorio, vídeos ni argumentos.

Entrada oculta PowerShell:

```powershell
$env:SOLAMI_RPC_URL = Read-Host -MaskInput "Endpoint HTTPS Solami"
```

```sh
npm test
npm run rpc:inspect -- solami FIRMA_PUBLICA
npm run rpc:watch -- solami FIRMA_PUBLICA 24
```

Intervalo cinco segundos, 1–24 muestras; cada muestra completa hace cuatro lecturas sin transacciones. Veinticuatro duran aproximadamente dos minutos más red. Cuotas/retención pueden impedir consultas.

Salida 0: ejecución finalizada exitosa; 2: finalizada fallida; 1: configuración/disponibilidad/coherencia inválidas. Slot sin avance es observación, no fallo inventado; retroceso o cambio de resultado finalizado rechaza diagnóstico. Métricas de esta ejecución, no benchmark independiente/garantía.

Solo herramienta nueva; sin base de datos, credenciales, cuenta agrícola, dominio financiero ni autenticación. Servidor principal sigue RPC Fast. bs58 mantiene MIT. OpenAI Codex asistió implementación/pruebas/docs; Beatriz lidera. Licencia original en LICENSE.


## Instalar repositorio público

```sh
git clone https://github.com/SouBeatrizKaroline/CryptoWorldsFair2026_SafraFlux_Solami.git
cd CryptoWorldsFair2026_SafraFlux_Solami
npm ci
```

Firma pública consultada el 12/10/2026 para reproducción: 4eHCTmNeAVxgSjnJvsA8JZgNQfednQi8BSw9LgZGAjYjb8pTQam6R3uzrnhJG3wq7U18M1VnmvUPFgTfKzGnvUoR. La retención depende del proveedor; no es pago de cliente.

Parte del [SafraFlux en Colosseum](https://colosseum.com/arena/projects/shebuilds). [Demo pública del producto](https://safraflux.soubeatrizkaroline.workers.dev/demo.html?lang=es). La candidatura Solami necesita vídeo 2–3 minutos con la herramienta viva; el patrocinador evalúa utilidad/uso significativo.
