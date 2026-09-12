# PokeBitBuilder

**Demo ao vivo: [poke-bit-builder.vercel.app](https://poke-bit-builder.vercel.app/)**

Editor de pixel art 8x8 para chaveiros de LED endereçável
(WS2812/SK6812), feito para alimentar uma pequena linha de chaveiros
eletrônicos vendidos junto com artist alley.

Desenhe um sprite numa grade de 64 LEDs, escolha as cores numa paleta
limitada, e exporte o resultado pronto para o firmware do chaveiro —
em dois formatos, incluindo suporte a painéis com fiação serpentina
(zig-zag).

## Como rodar

```bash
npm install
npm run dev
```
Acesse `http://localhost:5173`.

Rodar os testes:
```bash
npm test
```

Build de produção:
```bash
npm run build
```

## O que o app faz

- Grade fixa de 8x8 (64 LEDs), a resolução clássica de ícones pixel
  art retrô
- Paleta de cores configurável (adicionar/remover cor por hex)
- Pintar clicando ou arrastando o mouse; ferramenta de apagar (OFF)
- Exportação em dois formatos, prontos para copiar:
  - **Hex Array** (64 posições, `#RRGGBB` ou `null`) — para debug e
    reuso dentro do app
  - **RGB Bytes** (192 números) — formato direto para
    `FastLED`/`Adafruit NeoPixel`
- Toggle de fiação **serpentina (zig-zag)** na exportação, já que
  muitos painéis WS2812 8x8 prontos não são fiados em ordem simples
  linha por linha
- Toggle de apagar (modo travado por gesto): clicar ou arrastar sobre
  um LED que já tem a cor selecionada apaga ele — e todo o gesto de
  arraste que começa assim permanece em modo apagar até soltar o mouse

## Stack

TypeScript (strict) + React + Vite + Tailwind CSS + Vitest. Sem
backend, sem persistência, sem dependências de state management —
decisão deliberada de escopo, ver `DECISIONS.md`.

## Sobre o processo de desenvolvimento

Este projeto foi construído com apoio de agentes de IA (Cursor e
Google Antigravity) como exercício deliberado de prática desse fluxo
de trabalho — não é o foco de aprendizado principal do autor, que é
back-end/Java, mas um projeto lateral para ganhar experiência real com
agentes de IA no dia a dia de desenvolvimento.

O processo incluiu: uma spec inicial (`PROJECT.md`) definindo escopo e
contrato de dados antes de qualquer código, revisão do plano de
arquitetura proposto pelo agente, revisão de testes unitários (não só
o placar de "passou"), e a identificação e correção de um bug real de
duplicação de lógica (o remapeamento de fiação serpentina não estava
sendo aplicado de forma consistente entre os dois formatos de
exportação).

Também incluiu debugar dois problemas de infraestrutura fora do código
da feature em si: uma falha de deploy causada por `node_modules`
commitado no Git (binário `tsc` perdendo a permissão de execução ao
sair do Windows para o ambiente Linux da Vercel), e um `.gitignore`
que parecia correto visualmente mas continha um caractere BOM
invisível no início do arquivo, impedindo que `node_modules` e `dist`
fossem de fato ignorados. Depois disso, uma feature nova (toggle de
apagar) foi desenvolvida numa branch separada e integrada via Pull
Request no GitHub.

Decisões de design e correções, com o porquê de cada uma, estão
documentadas em [`DECISIONS.md`](./DECISIONS.md).

## Formato de exportação (contrato de dados)

- A grade é sempre 8x8 = 64 células, indexadas 0–63, linha por linha
- Cada célula é uma cor hex (`#RRGGBB`) ou `null` (LED desligado)
- **RGB Bytes**: 192 números (64 LEDs × 3 canais R,G,B em sequência).
  `null` vira `[0,0,0]`
- Com o toggle de serpentina ativo, ambos os formatos são reordenados
  seguindo a mesma fonte de verdade (`getSerpentinePixelOrder`)