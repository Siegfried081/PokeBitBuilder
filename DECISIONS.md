# DECISIONS.md — PokeBitBuilder

Registro das decisões tomadas durante o desenvolvimento, o porquê de
cada uma, e o que aprendemos no caminho. Ordem cronológica.

---

## 1. Grade fixa em 8x8 (64 LEDs), não o tamanho real dos sprites do jogo

Os sprites oficiais de "PC box" do Pokémon variam de 32x32 (gerações
antigas) a 68x56 (geração 8+), o que daria entre ~1.000 e ~3.800 LEDs
— inviável fisicamente para um chaveiro alimentado por bateria.

**Decisão:** usar 8x8, a resolução clássica de pixel art retrô/ícones
estilo Game Boy. Também evita reproduzir o sprite oficial pixel a
pixel (temos uma reinterpretação própria, não uma cópia), o que é
mais seguro para vender numa barraca.

## 2. Paleta de cores limitada, não um color picker livre

LEDs comuns (WS2812/SK6812) não reproduzem qualquer cor com
fidelidade perfeita, e uma paleta livre não combina com a estética de
pixel art retrô que o projeto busca.

**Decisão:** paleta fixa e configurável (adicionar/remover cores hex),
não um seletor de cor RGB livre.

## 3. Dois formatos de exportação, com uma única fonte de verdade

**Decisão:** o app exporta tanto um array Hex de 64 posições
(`#RRGGBB` ou `null`, para debug/salvar) quanto um array de 192 bytes
RGB (para consumo direto por `FastLED`/`NeoPixel`). A conversão
hex → RGB é uma função pura e testada isoladamente
(`hexToRgb`), não misturada com lógica de UI.

## 4. Suporte a fiação serpentina (zig-zag)

Descobrimos que muitos painéis WS2812 8x8 prontos são fiados em
**serpentina**: linhas pares correm numa direção, linhas ímpares na
direção oposta — não é uma varredura linha-por-linha simples como o
array lógico assume.

**Decisão:** adicionar um toggle "Meu painel é serpentina?" no modal
de exportação, controlando se o remapeamento é aplicado. Desligado por
padrão (mantém o comportamento linear). Só vamos saber com certeza se
o painel comprado é serpentina ou progressivo depois de testar
fisicamente com um pixel de cada vez.

## 5. Bug: remapeamento serpentino só funcionava no RGB Bytes, não no Hex Array

Causa: `remapForSerpentine` foi implementado operando direto sobre o
array de 192 bytes RGB, e o `gridToHexArray` nunca passava por nenhum
remapeamento — a mesma regra de negócio (ordem física dos LEDs) estava
implementada em só um dos dois formatos.

**Decisão/correção:** extrair uma única fonte de verdade,
`getSerpentinePixelOrder()`, que retorna a ordem física dos 64 índices
de pixel independente do formato de saída. Tanto o remap de RGB quanto
o de Hex passaram a usar essa mesma função. Isso evita divergência
futura entre os dois formatos.

## 6. Sem backend, sem persistência, sem animação (v1)

**Decisão:** v1 é deliberadamente um sprite estático, sem login, sem
banco de dados, sem múltiplos frames. Escopo pequeno o suficiente para
terminar em poucas sessões — decisões desse tipo ficam para uma v2, se
fizer sentido.