# Editor de Pixel Art 8x8 para Chaveiro de LED

## Objetivo

Uma aplicação web onde é possível desenhar um sprite numa grade fixa de
8x8 pixels, usando uma paleta de cores limitada, e exportar esse
desenho em formatos que alimentem um firmware de LED endereçável
(WS2812/SK6812).

O app é o **fim em si mesmo para fins de aprendizado** (praticar uso de
agentes de IA — Cursor, Antigravity), mas o resultado real (arquivo
exportado) também vai virar insumo do projeto físico dos chaveiros de
LED.

## Fora do escopo (v1)

Não implementar nada disso agora, mesmo que pareça fácil de adicionar:

- Login, contas de usuário, ou qualquer backend com banco de dados
- Múltiplos frames / animação (v1 é sprite estático)
- Grades de outro tamanho além de 8x8 (16x16 fica para uma v2)
- Geração de firmware/código Arduino dentro do próprio app
- Deploy automatizado — isso é feito manualmente quando o app estiver pronto
- Undo/redo com histórico complexo (um botão simples de "limpar tudo"
  é suficiente)

Se o agente sugerir qualquer coisa dessa lista, o plano deve ser
rejeitado e reescrito sem isso.

## Stack

- TypeScript (strict mode obrigatório, sem `any` não justificado)
- React + Vite
- Tailwind CSS para estilo (nenhuma outra lib de UI, ex: sem
  Material UI, sem Chakra)
- Estado local em memória (`useState`/`useReducer`) — sem Redux,
  Zustand ou qualquer lib de state management externa
- Sem `localStorage`/`sessionStorage` na v1 (o desenho não precisa
  persistir entre sessões ainda)

## Contrato de dados

Esta é a parte que não pode mudar sem atualizar este arquivo:

- A grade é sempre **8x8 = 64 células**, indexadas de 0 a 63, linha por
  linha (esquerda para direita, cima para baixo)
- Cada célula guarda uma cor em hex (`#RRGGBB`) ou `null` para "vazio/
  apagado" (representa o LED desligado)
- A paleta é uma lista fixa de cores hex escolhida no início do
  desenho, não uma paleta infinita tipo color picker livre (isso é
  proposital: LEDs comuns não reproduzem qualquer cor com fidelidade,
  então já habituar a pensar em paleta limitada)

### Exportação

Dois formatos de saída, gerados a partir do mesmo estado interno:

1. **Hex array** — `string[]` de 64 posições, ex:
   `["#EF9F27", null, "#2C2C2A", ...]`. Usado para debug visual e
   para salvar/recarregar o desenho dentro do próprio app.
2. **RGB bytes** — `number[]` de 192 posições (64 LEDs × 3 canais
   R,G,B em sequência), ex: `[239,159,39, 0,0,0, 44,44,42, ...]`.
   Esse é o formato que o firmware (FastLED/NeoPixel) consome direto.
   `null` vira `[0,0,0]`.

A conversão hex → RGB deve ser uma função pura, testável isoladamente,
separada da lógica de UI.

## Regras para o agente

- Sempre mostrar o plano de arquivos e o contrato de dados antes de
  escrever código
- Uma feature por vez — não implementar editor + exportação +
  paleta customizável no mesmo passo
- Toda função de conversão de formato (hex → RGB) precisa vir com pelo
  menos um teste unitário
- Não inventar dependências além das listadas em Stack sem perguntar
  antes

## Definição de "pronto" (v1)

- Grade 8x8 clicável, clique pinta com a cor selecionada da paleta
- Paleta configurável (adicionar/remover cor antes de desenhar)
- Botão "limpar tudo"
- Botão "exportar" que mostra os dois formatos (hex array e RGB bytes)
  prontos para copiar
