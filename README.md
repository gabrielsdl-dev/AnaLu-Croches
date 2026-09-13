# Ana Crochê — Loja de encomendas

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

## Configurar o WhatsApp

Abra:

```text
js/carrinho.js
```

Procure por:

```js
const telefoneWhatsApp = "5511999999999";
```

Troque pelo número real, sempre usando:

```text
55 + DDD + número
```

Exemplo:

```text
5511988887777
```

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
  emoji: "👜",
  descricao: "Bolsa artesanal em crochê.",
  destaque: true
}
```

Por enquanto usamos emojis como imagem temporária. Depois podemos trocar por fotos reais dos crochês.

## Próximos passos sugeridos

1. Adicionar fotos reais dos produtos
2. Criar página individual para cada produto
3. Permitir escolha de cor/tamanho
4. Melhorar personalização da mensagem do WhatsApp
5. Criar painel administrativo
6. Integrar Node.js + banco de dados, se fizer sentido para o projeto
# AnaLu-Croches
# AnaLu-Croches
# AnaLu-Croches
