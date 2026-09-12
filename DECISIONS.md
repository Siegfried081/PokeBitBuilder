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

## 7. Bug de deploy: `node_modules` commitado quebrando o build na Vercel

O primeiro deploy falhou com `Permission denied` ao tentar executar o
`tsc`. Causa raiz: o `node_modules` tinha sido commitado no Git a
partir do Windows. O Git, ao gravar arquivos criados no Windows,
costuma salvar o bit de execução como desligado — e o binário do
`tsc`, ao ser clonado literalmente num ambiente Linux (a Vercel),
manteve essa permissão errada.

**Correção:** remover `node_modules` (e `dist`, gerado pelo build,
pelo mesmo motivo) do controle de versão com `git rm -r --cached`,
garantindo que o `npm install` da Vercel gere os binários do zero,
direto no Linux, com a permissão correta.

## 8. Bug: `.gitignore` com BOM invisível não ignorava nada

Mesmo depois da correção acima, uma branch de feature criada antes
dela continuava mostrando `node_modules`/`dist` como não rastreados
em vez de ignorados. Causa: o `.gitignore` tinha sido escrito via
PowerShell (`echo ... >> .gitignore`), que grava UTF-8 com um marcador
BOM no início do arquivo — um caractere invisível que fazia o Git ler
a primeira linha como diferente de `node_modules`, então a regra nunca
batia.

**Correção:** reescrever o arquivo com `printf` no Git Bash, que não
insere BOM. Lição: um arquivo de configuração pode parecer visualmente
correto e ainda assim falhar por causa de bytes invisíveis — vale
checar o conteúdo bruto quando o comportamento não bate com o que está
escrito na tela.

## 9. Toggle de apagar: modo travado pelo pixel inicial do gesto

Adicionamos uma forma de apagar um LED clicando ou arrastando sobre
ele quando ele já tem a cor selecionada. Isso levanta uma ambiguidade
em arrastes que passam por LEDs de cores variadas: cada pixel decide
por si (modo misto), ou o primeiro pixel tocado decide o modo do
gesto inteiro?

**Decisão:** modo travado pelo primeiro pixel. Se o LED onde o gesto
começa (`mousedown`) já tem a cor selecionada, o arraste inteiro vira
modo apagar (só apaga LEDs daquela cor, ignora o resto); caso
contrário, o arraste inteiro pinta normalmente. O modo não muda até o
mouse ser solto, mesmo que o gesto passe por LEDs de outras cores.
Mais previsível do que decidir célula por célula durante o arraste.
Desenvolvido numa branch separada (`feature/toggle-clique-mesma-cor`)
e integrado via Pull Request, como prática deliberada do fluxo
branch → PR → merge.