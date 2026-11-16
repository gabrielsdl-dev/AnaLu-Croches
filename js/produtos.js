// Catálogo da loja.
// O "nome" é o modelo da peça (sem cor), porque as cores são personalizáveis.
// "cores" descreve só as cores da peça que aparece na foto.
// Peças do mesmo modelo podem ter o mesmo nome; o que muda é a foto e as cores.
const PRODUTOS = [
  {
    id: 1,
    destaque: true,
    nome: "Sousplat Redondo",
    categoria: "Crochê",
    preco: 25,
    imagem: "img/produtos/tapete-azul-redondo.webp",
    cores: "azul com borda cru",
    descricao: "Sousplat redondo em crochê para compor a mesa posta."
  },

  {
    id: 2,
    nome: "Tapete Retangular Grande",
    categoria: "Crochê",
    preco: 50,
    imagem: "img/produtos/tapete-marrom-retangular.webp",
    cores: "marrom-escuro, cru e caramelo",
    descricao: "Tapete retangular artesanal em crochê, em tamanho grande."
  },

  {
    id: 3,
    nome: "Tapete Oval Grande",
    categoria: "Crochê",
    preco: 40,
    imagem: "img/produtos/tapete-rosa.webp",
    cores: "tons de rosa",
    descricao: "Tapete oval artesanal em crochê, com borda em babado, em tamanho grande."
  },

  {
    id: 4,
    nome: "Tapete Retangular Grande",
    categoria: "Crochê",
    preco: 50,
    imagem: "img/produtos/tapete-verde-retangular.webp",
    cores: "cru com detalhes em verde e cinza",
    descricao: "Tapete retangular artesanal em crochê, em tamanho grande."
  },

  {
    id: 5,
    nome: "Tapete Oval Pequeno",
    categoria: "Crochê",
    preco: 35,
    imagem: "img/produtos/tapete-oval-azul-rosa.webp",
    cores: "cru, azul-marinho e rosa",
    descricao: "Tapete oval artesanal em crochê, com borda em babado, em tamanho pequeno."
  },

  {
    id: 6,
    nome: "Tapete Retangular Pequeno",
    categoria: "Crochê",
    preco: 35,
    imagem: "img/produtos/tapete-colorido.webp",
    cores: "terracota, marrom, cru, preto e azul",
    descricao: "Tapete retangular artesanal em crochê, em tamanho pequeno."
  },

  {
    id: 7,
    destaque: true,
    nome: "Centro de Mesa",
    categoria: "Crochê",
    preco: 20,
    imagem: "img/produtos/centro-de-mesa-bordo.webp",
    cores: "bordô com centro cru e borda dourada",
    descricao: "Centro de mesa redondo artesanal em crochê, com borda em babado."
  },

  {
    id: 8,
    nome: "Tapete Oval Grande",
    categoria: "Crochê",
    preco: 40,
    imagem: "img/produtos/tapete-oval-marrom-branco.webp",
    cores: "marrom e branco",
    descricao: "Tapete oval artesanal em crochê, com borda em babado, em tamanho grande."
  },

  {
    id: 9,
    destaque: true,
    nome: "Conjunto de Tapetes",
    categoria: "Crochê",
    preco: 65,
    imagem: "img/produtos/conjunto-de-tapetes.webp",
    cores: "cru com terracota",
    descricao: "Conjunto com dois tapetes ovais artesanais em crochê, com borda em babado."
  }
];


// Escapa textos antes de inseri-los com innerHTML.
function escaparHTML(valor) {
  return String(valor).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

// Nome do modelo + cores da foto. Usado onde o nome sozinho não basta para
// saber de qual peça se trata (mensagem do WhatsApp, leitor de tela, foto).
// Ex.: "Tapete Oval Grande (tons de rosa)".
function nomeComCores(produto) {
  return produto.cores ? `${produto.nome} (${produto.cores})` : produto.nome;
}

// Compartilhado pelo catálogo e pelo carrinho.
// Mostra a foto cadastrada para cada produto.
function criarImagemProduto(produto) {
  return produto.imagem
    ? `<img class="product-photo" src="${escaparHTML(produto.imagem)}" alt="${escaparHTML(nomeComCores(produto))}" loading="lazy" decoding="async">`
    : '<span class="product-photo-placeholder">Foto em breve</span>';
}


function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}