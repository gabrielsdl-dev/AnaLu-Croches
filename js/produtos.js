const PRODUTOS = [
  {
    id: 1,
    nome: "Tapete Azul Redondo",
    categoria: "Crochê",
    preco: 25,
    imagem: "img/produtos/tapete-azul-redondo.jpeg",
    descricao: "Tapete artesanal em crochê na cor azul, com formato redondo."
  },

  {
    id: 2,
    nome: "Tapete Marrom Retangular",
    categoria: "Crochê",
    preco: 50,
    imagem: "img/produtos/tapete-marrom-retangular.jpeg",
    descricao: "Tapete retangular artesanal em tons de marrom, branco e bege."
  },

  {
    id: 3,
    nome: "Tapete Rosa",
    categoria: "Crochê",
    preco: 40,
    imagem: "img/produtos/tapete-rosa.jpeg",
    descricao: "Tapete artesanal em tons de rosa com acabamento delicado."
  },

  {
    id: 4,
    nome: "Tapete Verde Retangular",
    categoria: "Crochê",
    preco: 50,
    imagem: "img/produtos/tapete-verde-retangular.jpeg",
    descricao: "Tapete retangular em crochê com detalhes em verde e branco."
  },

  {
    id: 5,
    nome: "Tapete Oval Azul e Rosa",
    categoria: "Crochê",
    preco: 35,
    imagem: "img/produtos/tapete-oval-azul-rosa.jpeg",
    descricao: "Tapete oval artesanal com detalhes em azul, rosa e branco."
  },

  {
    id: 6,
    nome: "Tapete Colorido",
    categoria: "Crochê",
    preco: 35,
    imagem: "img/produtos/tapete-colorido.jpeg",
    descricao: "Tapete retangular em crochê com combinação de várias cores."
  },

  {
    id: 7,
    nome: "Centro de Mesa Bordô",
    categoria: "Crochê",
    preco: 20,
    imagem: "img/produtos/centro-de-mesa-bordo.jpeg",
    descricao: "Centro de mesa artesanal em crochê na cor bordô com detalhe branco."
  },

  {
    id: 8,
    nome: "Tapete Oval Marrom e Branco",
    categoria: "Crochê",
    preco: 40,
    imagem: "img/produtos/tapete-oval-marrom-branco.jpeg",
    descricao: "Tapete oval artesanal em tons de marrom e branco."
  },

  {
    id: 9,
    nome: "Conjunto de Tapetes",
    categoria: "Crochê",
    preco: 65,
    imagem: "img/produtos/conjunto-de-tapetes.jpeg",
    descricao: "Conjunto de tapetes oval."
  }
];


// Compartilhado pelo catálogo e pelo carrinho.
// Mostra a foto cadastrada para cada produto.
function criarImagemProduto(produto) {
  const escapar = (valor) => String(valor).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
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