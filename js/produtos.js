const PRODUTOS = [
  {
    id: 1,
<<<<<<< HEAD
    destaque: true,
    nome: "Tapete Azul Redondo",
    categoria: "Crochê",
    preco: 25,
    imagem: "img/produtos/tapete-azul-redondo.webp",
=======
    nome: "Tapete Azul Redondo",
    categoria: "Crochê",
    preco: 25,
    imagem: "img/produtos/tapete-azul-redondo.jpeg",
>>>>>>> e2f0425b759838459a264fca92d59e15fc9e3b38
    descricao: "Tapete artesanal em crochê na cor azul, com formato redondo."
  },

  {
    id: 2,
    nome: "Tapete Marrom Retangular",
    categoria: "Crochê",
    preco: 50,
<<<<<<< HEAD
    imagem: "img/produtos/tapete-marrom-retangular.webp",
=======
    imagem: "img/produtos/tapete-marrom-retangular.jpeg",
>>>>>>> e2f0425b759838459a264fca92d59e15fc9e3b38
    descricao: "Tapete retangular artesanal em tons de marrom, branco e bege."
  },

  {
    id: 3,
    nome: "Tapete Rosa",
    categoria: "Crochê",
    preco: 40,
<<<<<<< HEAD
    imagem: "img/produtos/tapete-rosa.webp",
=======
    imagem: "img/produtos/tapete-rosa.jpeg",
>>>>>>> e2f0425b759838459a264fca92d59e15fc9e3b38
    descricao: "Tapete artesanal em tons de rosa com acabamento delicado."
  },

  {
    id: 4,
    nome: "Tapete Verde Retangular",
    categoria: "Crochê",
    preco: 50,
<<<<<<< HEAD
    imagem: "img/produtos/tapete-verde-retangular.webp",
=======
    imagem: "img/produtos/tapete-verde-retangular.jpeg",
>>>>>>> e2f0425b759838459a264fca92d59e15fc9e3b38
    descricao: "Tapete retangular em crochê com detalhes em verde e branco."
  },

  {
    id: 5,
    nome: "Tapete Oval Azul e Rosa",
    categoria: "Crochê",
    preco: 35,
<<<<<<< HEAD
    imagem: "img/produtos/tapete-oval-azul-rosa.webp",
=======
    imagem: "img/produtos/tapete-oval-azul-rosa.jpeg",
>>>>>>> e2f0425b759838459a264fca92d59e15fc9e3b38
    descricao: "Tapete oval artesanal com detalhes em azul, rosa e branco."
  },

  {
    id: 6,
    nome: "Tapete Colorido",
    categoria: "Crochê",
    preco: 35,
<<<<<<< HEAD
    imagem: "img/produtos/tapete-colorido.webp",
=======
    imagem: "img/produtos/tapete-colorido.jpeg",
>>>>>>> e2f0425b759838459a264fca92d59e15fc9e3b38
    descricao: "Tapete retangular em crochê com combinação de várias cores."
  },

  {
    id: 7,
<<<<<<< HEAD
    destaque: true,
    nome: "Centro de Mesa Bordô",
    categoria: "Crochê",
    preco: 20,
    imagem: "img/produtos/centro-de-mesa-bordo.webp",
=======
    nome: "Centro de Mesa Bordô",
    categoria: "Crochê",
    preco: 20,
    imagem: "img/produtos/centro-de-mesa-bordo.jpeg",
>>>>>>> e2f0425b759838459a264fca92d59e15fc9e3b38
    descricao: "Centro de mesa artesanal em crochê na cor bordô com detalhe branco."
  },

  {
    id: 8,
    nome: "Tapete Oval Marrom e Branco",
    categoria: "Crochê",
    preco: 40,
<<<<<<< HEAD
    imagem: "img/produtos/tapete-oval-marrom-branco.webp",
=======
    imagem: "img/produtos/tapete-oval-marrom-branco.jpeg",
>>>>>>> e2f0425b759838459a264fca92d59e15fc9e3b38
    descricao: "Tapete oval artesanal em tons de marrom e branco."
  },

  {
    id: 9,
<<<<<<< HEAD
    destaque: true,
    nome: "Conjunto de Tapetes",
    categoria: "Crochê",
    preco: 65,
    imagem: "img/produtos/conjunto-de-tapetes.webp",
=======
    nome: "Conjunto de Tapetes",
    categoria: "Crochê",
    preco: 65,
    imagem: "img/produtos/conjunto-de-tapetes.jpeg",
>>>>>>> e2f0425b759838459a264fca92d59e15fc9e3b38
    descricao: "Conjunto de tapetes oval."
  }
];


<<<<<<< HEAD
// Escapa textos antes de inseri-los com innerHTML.
function escaparHTML(valor) {
  return String(valor).replace(/[&<>"']/g, (char) => ({
=======
// Compartilhado pelo catálogo e pelo carrinho.
// Mostra a foto cadastrada para cada produto.
function criarImagemProduto(produto) {
  const escapar = (valor) => String(valor).replace(/[&<>"']/g, (char) => ({
>>>>>>> e2f0425b759838459a264fca92d59e15fc9e3b38
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
<<<<<<< HEAD
}

// Compartilhado pelo catálogo e pelo carrinho.
// Mostra a foto cadastrada para cada produto.
function criarImagemProduto(produto) {
=======

>>>>>>> e2f0425b759838459a264fca92d59e15fc9e3b38
  return produto.imagem
    ? `<img class="product-photo" src="${escaparHTML(produto.imagem)}" alt="${escaparHTML(produto.nome)}" loading="lazy" decoding="async">`
    : '<span class="product-photo-placeholder">Foto em breve</span>';
}


function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}