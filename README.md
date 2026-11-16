# AnaLu Crochês — Loja de encomendas

Projeto acadêmico de uma vitrine virtual para venda de peças artesanais em crochê.

## Funcionalidades atuais

- Página inicial responsiva, com produtos em destaque, "Como funciona" e perguntas frequentes
- Catálogo de produtos
- Detalhe de cada peça numa janela, com link próprio para compartilhar (ex.: `produtos.html#tapete-rosa`)
- Filtro por categoria (aparece quando houver mais de uma categoria)
- Busca de produtos (ignora acentos e maiúsculas)
- Carrinho usando `localStorage`
- Alteração de quantidade
- Exclusão de itens
- Total estimado do pedido
- Campo de cores e detalhes em cada peça do carrinho
- Campo para nome e observações gerais
- Finalização da encomenda pelo WhatsApp
- Tema claro e escuro (segue o sistema quando não há escolha salva)
- Layout responsivo para celular

## Estrutura

```text
AnaLu-Croches/
├── index.html
├── produtos.html
├── carrinho.html
├── css/
│   └── style.css
├── js/
│   ├── config.js        ← nome da loja, WhatsApp e Instagram
│   ├── produtos.js      ← catálogo de produtos
│   ├── carrinho.js
│   └── main.js
├── tests/
│   └── carrinho.test.js ← testes automáticos do carrinho e do catálogo
└── img/
    ├── tapetes-croche-hero.webp   ← foto da página inicial
    ├── logo-analu-transparente.webp
    ├── favicon-32.png
    ├── apple-touch-icon.png
    ├── og-image.jpg     ← prévia do link no WhatsApp/Instagram (1200×630)
    ├── produtos/        ← fotos dos produtos (.webp)
    └── originais/       ← imagens originais em alta, não usadas pelo site
```

## Como abrir

Você pode simplesmente abrir o arquivo `index.html` no navegador.

Para trabalhar no VS Code, recomendo a extensão **Live Server** e abrir o projeto por ela.

## Configurar contatos

O WhatsApp e o Instagram ficam em um único lugar:

```text
js/config.js
```

```js
const CONFIG = {
  nomeLoja: "AnaLu Crochês",
  whatsapp: "5511977066682", // 55 + DDD + número, só dígitos
  instagram: "https://www.instagram.com/analu.croches_/"
};
```

Trocar esses valores altera ao mesmo tempo o botão "Finalizar pelo WhatsApp" do carrinho e os links do rodapé das 3 páginas.

## Cadastrar produtos

Os produtos estão em:

```text
js/produtos.js
```

Exemplo:

```js
{
  id: 10,
  nome: "Tapete Girassol",
  categoria: "Tapetes",
  preco: 85,
  imagem: "img/produtos/tapete-girassol.webp",
  descricao: "Tapete redondo artesanal em crochê.",
  destaque: true, // opcional: aparece em "Destaques" na página inicial
  medidas: "80 cm de diâmetro" // opcional: aparece no detalhe da peça
}
```

- `id` precisa ser único.
- Coloque a foto em `img/produtos/`. De preferência em WebP, com até ~800px de largura e menos de 100 KB.
- Sem `imagem`, o card mostra "Foto em breve".
- Se nenhum produto tiver `destaque: true`, a página inicial mostra os 3 primeiros.
- O link de cada peça é gerado a partir do `nome` ("Tapete Rosa" vira `#tapete-rosa`). Se mudar o nome, links antigos já compartilhados deixam de abrir a peça.

## Perguntas frequentes

As perguntas e respostas ficam direto no `index.html`, na seção `id="duvidas"`. Cada pergunta é um bloco `<details class="faq-item">`: para incluir uma nova, copie um bloco e troque o texto.

## Testes

Os testes usam só o Node.js (versão 18 ou mais nova), sem instalar nada. Na pasta do projeto:

```bash
node --test tests/
```

Eles conferem o carrinho (adicionar, alterar, remover, detalhes de cada peça, carrinhos salvos em formatos antigos), a mensagem enviada pelo WhatsApp, a busca, os links das peças e se os dados de `js/produtos.js` estão completos (incluindo se as fotos existem). Rode antes de cada commit.

## Publicar no GitHub Pages

O repositório está em `github.com/gabrielsdl-dev/AnaLu-Croches`.

1. No GitHub, abra o repositório e vá em **Settings → Pages**.
2. Em **Build and deployment**, escolha **Deploy from a branch**.
3. Selecione a branch `main` e a pasta `/ (root)` e clique em **Save**.
4. Depois de alguns minutos o site fica disponível em `https://gabrielsdl-dev.github.io/AnaLu-Croches/`.

Se o site for publicado em outro endereço, troque esse endereço nas tags `og:url` e `og:image` do `<head>` das 3 páginas (é o que gera a prévia do link no WhatsApp e no Instagram).
