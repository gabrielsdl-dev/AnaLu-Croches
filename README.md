# AnaLu Crochês — Loja de encomendas

Projeto acadêmico de uma vitrine virtual para venda de peças artesanais em crochê.

## Funcionalidades atuais

- Página inicial responsiva
- Catálogo de produtos
- Filtro por categoria
- Busca de produtos
- Carrinho usando `localStorage`
- Alteração de quantidade
- Exclusão de itens
- Total estimado do pedido
- Campo para nome e observações
- Finalização da encomenda pelo WhatsApp
- Layout responsivo para celular

## Estrutura

```text
loja-croche/
├── index.html
├── produtos.html
├── carrinho.html
├── css/
│   └── style.css
├── js/
│   ├── produtos.js
│   ├── carrinho.js
│   └── main.js
└── img/
    └── produtos/
```

## Como abrir

Você pode simplesmente abrir o arquivo `index.html` no navegador.

Para trabalhar no VS Code, recomendo a extensão **Live Server** e abrir o projeto por ela.


## Cadastrar produtos

Os produtos estão em:

```text
js/produtos.js
```

Exemplo:

```js
{
  id: 1,
  nome: "Bolsa Aurora",
  categoria: "Bolsas",
  preco: 85,
  descricao: "Bolsa artesanal em crochê.",
}
```
