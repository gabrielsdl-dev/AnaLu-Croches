const PRODUTOS = [
  {
    id: 1,
    nome: "Produto 1",
    categoria: "Crochê",
    preco: 85,
    imagem: "", // Ex.: "img/produtos/produto-1.jpg"
    descricao: "Descrição do produto 1"
  },
  {
    id: 2,
    nome: "Produto 2",
    categoria: "Crochê",
    preco: 65,
    imagem: "", // Ex.: "img/produtos/produto-2.jpg"
    descricao: "Descrição do produto 2"
  },
  {
    id: 3,
    nome: "Produto 3",
    categoria: "Crochê",
    preco: 32,
    imagem: "", // Ex.: "img/produtos/produto-3.jpg"
    descricao: "Descrição do produto 3"
  },
  {
    id: 4,
    nome: "Produto 4",
    categoria: "Crochê",
    preco: 48,
    imagem: "", // Ex.: "img/produtos/produto-4.jpg"
    descricao: "Descrição do produto 4"
  },
  {
    id: 5,
    nome: "Produto 5",
    categoria: "Crochê",
    preco: 72,
    imagem: "", // Ex.: "img/produtos/produto-5.jpg"
    descricao: "Descrição do produto 5"
  },
  {
    id: 6,
    nome: "Produto 6",
    categoria: "Crochê",
    preco: 58,
    imagem: "", // Ex.: "img/produtos/produto-6.jpg"
    descricao: "Descrição do produto 6"
  }
];

// Compartilhado pelo catálogo e pelo carrinho. Deixe imagem vazia até ter a foto.
function criarImagemProduto(produto) {
  const escapar = (valor) => String(valor).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
  return produto.imagem
    ? `<img class="product-photo" src="${escapar(produto.imagem)}" alt="${escapar(produto.nome)}" loading="lazy">`
    : '<span class="product-photo-placeholder">Foto em breve</span>';
}

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}
