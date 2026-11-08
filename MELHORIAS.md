# Melhorias — Site AnaLu Croches

Lista de melhorias identificadas na revisão do código. Stack: HTML + CSS + JavaScript puro, sem build, sem backend. Carrinho e tema usam `localStorage`.

## Regras gerais para a implementação

- **Não alterar os dados dos produtos** em `js/produtos.js` (nomes, preços, descrições, categorias e fotos já estão corretos). Exceções pontuais estão indicadas nos itens 2.1 (extensão da imagem) e 5.2 (campo `destaque`).
- Manter a stack atual: sem frameworks, sem bundler, sem dependências novas. O site precisa continuar funcionando abrindo o `index.html` direto no navegador.
- Manter o padrão do código existente: funções e variáveis em português, CSS com as variáveis de `:root`.
- Fazer as tarefas na ordem das prioridades e testar no tema claro e no escuro, no desktop e no celular (≤ 680px).
- Um commit por tarefa (ou por grupo pequeno de tarefas relacionadas).

---

## Prioridade 1 — Bugs

### 1.1 Corrigir a estrutura HTML da `index.html`
- Falta o fechamento `</main>` antes do `<footer>`.
- A `<section class="section">` dos benefícios (`.benefits`) está aninhada **dentro** da `<section class="section section-soft" id="sobre">`. Ela deve ser uma seção irmã, logo depois de `#sobre`.
- **Critério de aceite:** HTML válido no validador do W3C, sem mudança visual perceptível (exceto o espaçamento, se corrigido de propósito).

### 1.2 Toast ilegível no tema escuro
- Em `css/style.css`, `.toast` usa `background: var(--text)` com `color: white`. No `body.dark-mode`, `--text` vira `#f6eee9`, então fica texto branco em fundo quase branco.
- Trocar `color: white` por `color: var(--bg)` (ou equivalente que funcione nos dois temas).
- **Critério de aceite:** toast legível nos dois temas.

### 1.3 Contraste baixo no tema escuro
- No `body.dark-mode`, `--primary` é `#d99176`, e há texto branco sobre ele em `.btn-primary` e `.cart-count` (contraste ~2,3:1).
- Ajustar para contraste mínimo de 4,5:1 (WCAG AA). Opções: texto escuro (`#181514`) sobre o `--primary` no tema escuro, ou escurecer o fundo do botão no tema escuro.
- Conferir também `.remove-item` (`#9f4b4b`) sobre `--surface` escuro.
- **Critério de aceite:** todos os pares texto/fundo desses elementos com contraste ≥ 4,5:1 nos dois temas.

### 1.4 Piscada de tema claro ao carregar no tema escuro
- Hoje o tema é aplicado em `iniciarTema()` no `DOMContentLoaded`, então a página aparece clara e depois escurece.
- Adicionar um pequeno script inline no `<head>` de **todas as páginas** que lê `localStorage.getItem("tema")` e aplica a classe antes da renderização. Como o script do `<head>` roda antes do `<body>` existir, aplicar a classe no `<html>` (`document.documentElement`) e ajustar os seletores do CSS de `body.dark-mode` para `.dark-mode` / `html.dark-mode` — ou outra solução equivalente.
- Manter `iniciarTema()` funcionando (estado do switch, rótulo "Tema claro/escuro", aria-label).
- Se não houver preferência salva, usar `prefers-color-scheme` do sistema como padrão.
- **Critério de aceite:** com tema escuro salvo, recarregar qualquer página não mostra flash claro.

### 1.5 Unificar contatos (WhatsApp e Instagram)
- Hoje há números diferentes: `5511999999999` em `js/carrinho.js` e `5500000000000` nos rodapés das 3 páginas; o Instagram é fictício (`ana.croche.exemplo`).
- Criar `js/config.js` com um objeto único, por exemplo:
  ```js
  const CONFIG = {
    nomeLoja: "AnaLu Crochês",
    whatsapp: "5511999999999", // 55 + DDD + número
    instagram: "https://www.instagram.com/USUARIO/"
  };
  ```
- `finalizarNoWhatsApp()` deve usar `CONFIG.whatsapp`.
- Os links do rodapé devem ser preenchidos via JS a partir do `CONFIG` (manter um `href` de fallback no HTML).
- Incluir `config.js` antes dos outros scripts nas 3 páginas.
- Atualizar o README explicando que os contatos ficam em `js/config.js`.
- **Critério de aceite:** trocar o número em um único lugar altera o checkout e o rodapé de todas as páginas.

### 1.6 Link do carrinho acessível em todas as páginas
- Hoje o botão flutuante "Minha encomenda" só existe em `produtos.html`.
- Adicionar um link "Minha encomenda" com o contador (`.cart-count`) no menu de navegação das 3 páginas (marcado como `.active` em `carrinho.html`).
- `atualizarContadoresCarrinho()` já atualiza todos os `.cart-count`, então basta reaproveitar a classe.
- Decidir se o botão flutuante continua na página de produtos (recomendado manter, é útil no celular).
- **Critério de aceite:** de qualquer página é possível chegar ao carrinho em 1 clique, e o contador está correto em todas.

---

## Prioridade 2 — Desempenho (RNF03)

### 2.1 Otimizar imagens
- `img/croche-artesanal-hero.png` tem ~2,85 MB; `img/logo-analu-transparente.png` tem ~487 KB e é exibida com no máximo 220px de largura.
- Gerar versões WebP: hero com no máximo ~1200px de largura (meta < 250 KB) e logo com ~480px de largura (2x do tamanho exibido, meta < 50 KB, mantendo transparência).
- Usar `<picture>` com fallback PNG, ou apenas WebP (suportado por todos os navegadores modernos — RNF04).
- Atualizar `width`/`height` dos `<img>` para refletir a proporção real.
- Não apagar os originais; mover para uma pasta `img/originais/` (fora do caminho usado pelo site) ou deixar ignorados.
- Fotos dos produtos (`img/produtos/*.jpeg`, 9 arquivos de ~175–285 KB, ~765–900px de largura, retrato 3:4): gerar versões WebP com no máximo ~800px de largura (meta < 100 KB cada). Atualizar os caminhos em `js/produtos.js` **alterando apenas o campo `imagem`** (extensão), sem mexer em nenhum outro dado.
- **Critério de aceite:** peso total da página inicial reduzido em pelo menos 80% e o da página de produtos em pelo menos 50%, sem perda visível de qualidade.

### 2.3 Enquadramento das fotos dos produtos
- As fotos reais são **retrato (3:4)**, mas `.product-visual` usa `aspect-ratio: 4 / 3` (paisagem) com `object-fit: cover`. Isso corta quase metade da altura de cada foto, e os tapetes podem aparecer incompletos.
- Mudar `.product-visual` para `aspect-ratio: 3 / 4` ou `1 / 1` (testar qual fica melhor no grid) e conferir a miniatura do carrinho (`.cart-item-visual`, quadrada).
- **Critério de aceite:** nos cards, todas as 9 peças aparecem inteiras ou quase inteiras, sem cortes importantes.

### 2.2 Fontes
- Adicionar só os pesos realmente usados na URL do Google Fonts (conferir no CSS se 500 e 600 da DM Sans são usados).

---

## Prioridade 3 — Usabilidade e acessibilidade

### 3.1 Busca ignorando acentos e maiúsculas
- Em `iniciarCatalogo()` (`js/main.js`), normalizar o termo e o conteúdo antes de comparar:
  ```js
  const normalizar = (texto) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  ```
- **Critério de aceite:** buscar "croche" encontra "Crochê"; buscar "BOLSA" encontra "bolsa".

### 3.2 Menu do celular
- Em `iniciarMenuMobile()`:
  - Fechar o menu ao clicar em qualquer link dentro dele (importante para o "Sobre", que é âncora na mesma página).
  - Fechar com a tecla `Esc` e ao clicar fora do menu.
  - Atualizar `aria-expanded` e o `aria-label` do botão ("Abrir menu" / "Fechar menu"); opcionalmente trocar o ícone ☰ por ✕ quando aberto.
- **Critério de aceite:** em ≤ 680px, clicar em "Sobre" leva à seção e o menu fecha.

### 3.3 Altura do cabeçalho e sobreposições
- A logo tem proporção 240×168 e é exibida com até 180px de largura (~126px de altura), deixando o header bem mais alto que o `min-height: 78px`.
- Verificar visualmente e ajustar:
  - Tamanho da logo no header (provavelmente limitar pela altura, ex.: `height: 56–64px; width: auto`).
  - `.nav-links` no mobile usa `top: 70px` — deve abrir logo abaixo do header real (usar `top: 100%` com o `.nav` como `position: relative`).
  - `.cart-summary` usa `top: 102px` no sticky — deve ficar abaixo do header.
- **Critério de aceite:** nenhum elemento fica escondido atrás do header sticky, em desktop e mobile.

### 3.4 Acessibilidade do carrinho
- Em `renderizarCarrinho()` (`js/carrinho.js`), incluir o nome do produto nos rótulos:
  - `aria-label="Diminuir quantidade de ${item.nome}"`, `aria-label="Aumentar quantidade de ${item.nome}"`, `aria-label="Remover ${item.nome} da encomenda"`.
- No `mostrarToast()`, criar o toast com `role="status"` e `aria-live="polite"`.
- **Critério de aceite:** leitor de tela anuncia o produto nos botões e lê o toast.

### 3.5 Esconder o filtro quando só existe uma categoria
- Hoje todos os produtos estão na categoria "Crochê", então o filtro mostra só "Todos" e "Crochê", que trazem o mesmo resultado.
- Em `iniciarCatalogo()`, se houver apenas uma categoria, não renderizar os botões de filtro (esconder `#category-filters`). Quando novas categorias forem cadastradas, o filtro volta a aparecer sozinho.
- Não alterar as categorias em `js/produtos.js`.

### 3.6 Aviso de preço estimado no catálogo (RNF07)
- Em `produtos.html`, abaixo do subtítulo do `.page-hero`, adicionar uma linha curta: preços são estimados e prazo, personalizações e entrega são confirmados pelo WhatsApp.

---

## Prioridade 4 — Código e manutenção

### 4.1 Carrinho guardando só o necessário
- No `localStorage`, salvar apenas `{ id, quantidade }`.
- `obterCarrinho()` deve montar os dados a partir de `PRODUTOS` e **descartar** itens cujo `id` não existe mais no catálogo (hoje ele mantém o item antigo com preço desatualizado).
- Validar `quantidade` (inteiro ≥ 1; descartar valores inválidos).
- Manter compatibilidade com carrinhos já salvos no formato antigo (ler só `id` e `quantidade` deles).

### 4.2 Escapar dados inseridos via `innerHTML`
- `criarImagemProduto()` já tem uma função `escapar`. Extraí-la para uma função global (ex.: `escaparHTML`) e usá-la em `criarCardProduto()`, nos botões de filtro (`data-category` e texto) e em `renderizarCarrinho()` para nome, categoria e descrição.

### 4.3 Remover CSS sem uso
- Remover regras que não são usadas por nenhum HTML/JS: `.yarn`, `.yarn-one`, `.yarn-two`, `.crochet-card` (e variações, incluindo a do dark mode), `.theme-toggle` e `.theme-toggle:hover`, `.btn-secondary`, `.section-heading`, `.section-cta`, `.benefit-card span`, `.footer-content strong`.
- Antes de remover, confirmar com uma busca nos arquivos `.html` e `.js`.
- Verificar se `--accent` e `--success` são usados; remover se não forem.

### 4.4 Padronizar o nome da marca
- Hoje aparece "Ana Crochê" (títulos das páginas e meta descriptions), "Crochês Analu" (alt e aria-label da logo), "AnaLu Crochês" (README) e "AnaLu Croches" (repositório e documentação).
- Usar **"AnaLu Crochês"** (mesmo nome do README) em `<title>`, `meta description`, `alt`/`aria-label` da logo e na mensagem do carrinho. (Confirmar com o grupo antes, se necessário.)
- A chave `anaCrocheCarrinho` do `localStorage` pode ficar como está para não perder carrinhos salvos.

### 4.5 Atualizar a documentação
- README: incluir o campo `imagem` no exemplo de produto (e remover a vírgula sobrando depois de `descricao`), atualizar a árvore de pastas (incluir `config.js`, `img/produtos/` com as fotos e as imagens da raiz de `img/`) e adicionar uma seção "Configurar contatos" explicando o `js/config.js` (a seção antiga sobre o WhatsApp foi removida).
- `img/produtos/LEIA-ME.txt`: atualizar ou remover — as fotos já estão na pasta e os cards já usam o campo `imagem`.

---

## Prioridade 5 — Novidades

### 5.1 Open Graph e favicon
- Adicionar em todas as páginas: `<link rel="icon">` (gerar um favicon a partir da logo, PNG 32×32 e 180×180 para `apple-touch-icon`), e as tags `og:title`, `og:description`, `og:image` (imagem 1200×630 gerada a partir do hero), `og:type`, `og:locale` (`pt_BR`) e `twitter:card`.
- Motivo: os links do site vão circular pelo WhatsApp e Instagram; sem essas tags não aparece prévia.
- Observação: `og:image` precisa de URL absoluta; deixar um comentário indicando onde trocar quando o site for publicado.

### 5.2 Produtos em destaque na página inicial
- A documentação (seção 10, passo 2, e seção 11) prevê produtos em destaque no Início.
- Adicionar uma seção na `index.html` (entre o hero e o "Sobre") que exibe os produtos marcados como destaque, reaproveitando `criarCardProduto()`, com um botão "Ver todos os produtos".
- **Atenção:** isso exige adicionar o campo opcional `destaque: true` em `js/produtos.js`. Adicionar **somente esse campo**, sem mexer nos outros dados. Se nenhum produto tiver destaque, exibir os 3 primeiros.

### 5.3 Publicação (opcional)
- O repositório já está em `github.com/gabrielsdl-dev/AnaLu-Croches`. Documentar no README como publicar pelo GitHub Pages (Settings → Pages → branch `main`, pasta raiz).

---

## Fora de escopo nesta rodada
- Alterar os dados dos produtos.
- Página individual de produto, painel administrativo, backend, pagamento online e controle de estoque (previstos como evolução futura na documentação).

## Checklist final de teste
- [ ] As 3 páginas abrem sem erros no console.
- [ ] Tema claro/escuro alterna, persiste entre páginas e não pisca ao carregar.
- [ ] Busca funciona com e sem acento; filtro por categoria funciona.
- [ ] Adicionar, aumentar, diminuir e remover itens funciona; contador atualiza em todas as páginas.
- [ ] Total estimado correto.
- [ ] "Finalizar pelo WhatsApp" abre com a mensagem certa e o número do `config.js`.
- [ ] Menu mobile abre, fecha ao clicar num link, com Esc e ao clicar fora.
- [ ] Layout ok em 375px, 768px e 1280px, nos dois temas.
- [ ] Contraste ok no tema escuro (botões, contador, toast).
