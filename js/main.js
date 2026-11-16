// Remove acentos e ignora maiúsculas/minúsculas ("Crochê" -> "croche").
function normalizar(texto) {
  return String(texto).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Identificador do produto usado no link direto: "Tapete Rosa" -> "tapete-rosa".
function slugProduto(produto) {
  return normalizar(produto.nome).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function buscarProdutoPorSlug(slug) {
  return PRODUTOS.find((produto) => slugProduto(produto) === slug) || null;
}

// Link que abre o detalhe da peça, para compartilhar (ex.: produtos.html#tapete-rosa).
function linkProduto(produto) {
  return new URL(`produtos.html#${slugProduto(produto)}`, window.location.href).href;
}

function criarCardProduto(produto) {
  const id = Number(produto.id);
  const nome = escaparHTML(produto.nome);

  return `
    <article class="product-card">
      <div class="product-visual">
        <span class="product-badge">Sob encomenda</span>
        ${criarImagemProduto(produto)}
      </div>

      <div class="product-content">
        <span class="product-category">${escaparHTML(produto.categoria)}</span>
        <h3>
          <a class="product-link" href="produtos.html#${slugProduto(produto)}" data-abrir-produto="${id}">${nome}</a>
        </h3>
        <p class="product-description">${escaparHTML(produto.descricao)}</p>

        <div class="product-footer">
          <div class="product-price">
            <small>A partir de</small>
            <strong>${formatarMoeda(produto.preco)}</strong>
          </div>

          <button
            class="add-cart"
            type="button"
            data-adicionar="${id}"
            aria-label="Adicionar ${nome} à encomenda"
          >
            + Encomenda
          </button>
        </div>
      </div>
    </article>
  `;
}

function iniciarCatalogo() {
  const grid = document.getElementById("products-grid");
  const filtros = document.getElementById("category-filters");
  const busca = document.getElementById("product-search");
  const vazio = document.getElementById("empty-state");

  if (!grid || !filtros || !busca) return;

  const categoriasUnicas = [...new Set(PRODUTOS.map((produto) => produto.categoria))];
  const categorias = ["Todos", ...categoriasUnicas];
  let categoriaAtual = "Todos";

  // Com uma única categoria, "Todos" e a categoria mostram o mesmo resultado:
  // o filtro só aparece quando houver pelo menos duas categorias.
  if (categoriasUnicas.length > 1) {
    filtros.innerHTML = categorias.map((categoria, index) => `
      <button
        class="filter-btn ${index === 0 ? "active" : ""}"
        type="button"
        data-category="${escaparHTML(categoria)}"
        aria-pressed="${index === 0}"
      >
        ${escaparHTML(categoria)}
      </button>
    `).join("");
    filtros.classList.remove("hidden");
  } else {
    filtros.innerHTML = "";
    filtros.classList.add("hidden");
  }

  function atualizarProdutos() {
    const termo = normalizar(busca.value.trim());

    const filtrados = PRODUTOS.filter((produto) => {
      const bateCategoria =
        categoriaAtual === "Todos" || produto.categoria === categoriaAtual;

      const conteudo = normalizar(`${produto.nome} ${produto.categoria} ${produto.descricao}`);
      const bateBusca = conteudo.includes(termo);

      return bateCategoria && bateBusca;
    });

    grid.innerHTML = filtrados.map(criarCardProduto).join("");
    vazio?.classList.toggle("hidden", filtrados.length > 0);
  }

  filtros.addEventListener("click", (evento) => {
    const botao = evento.target.closest(".filter-btn");
    if (!botao) return;

    categoriaAtual = botao.dataset.category;

    filtros.querySelectorAll(".filter-btn").forEach((item) => {
      item.classList.toggle("active", item === botao);
      item.setAttribute("aria-pressed", String(item === botao));
    });

    atualizarProdutos();
  });

  busca.addEventListener("input", atualizarProdutos);
  atualizarProdutos();
}

// Produtos em destaque na página inicial.
// Usa os produtos com "destaque: true"; se nenhum tiver, mostra os 3 primeiros.
function iniciarDestaques() {
  const grid = document.getElementById("featured-grid");
  if (!grid) return;

  const marcados = PRODUTOS.filter((produto) => produto.destaque);
  const destaques = marcados.length > 0 ? marcados : PRODUTOS.slice(0, 3);

  grid.innerHTML = destaques.map(criarCardProduto).join("");
}

/* ---------- Detalhe do produto (janela/modal) ---------- */

let modalProduto = null;
let produtoNoModal = null;
let modalAbertoPorClique = false;
let elementoAntesDoModal = null;

function criarModalProduto() {
  const dialogo = document.createElement("dialog");
  dialogo.className = "product-modal";
  dialogo.setAttribute("aria-labelledby", "product-modal-title");
  dialogo.innerHTML = `
    <div class="product-modal-inner">
      <button class="product-modal-close" type="button" aria-label="Fechar detalhes do produto">✕</button>
      <div class="product-modal-visual"></div>
      <div class="product-modal-content">
        <span class="product-category" data-campo="categoria"></span>
        <h2 id="product-modal-title" data-campo="nome"></h2>
        <p class="product-modal-description" data-campo="descricao"></p>
        <p class="product-modal-measures hidden" data-campo="medidas"></p>
        <div class="product-price product-modal-price">
          <small>A partir de</small>
          <strong data-campo="preco"></strong>
        </div>
        <p class="product-modal-note">
          Peça feita à mão, sob encomenda. Cores e detalhes podem ser combinados:
          anote o que você quer no carrinho.
        </p>
        <div class="product-modal-actions">
          <button class="btn btn-primary" type="button" data-modal-adicionar>+ Adicionar à encomenda</button>
          <button class="btn btn-outline" type="button" data-modal-compartilhar>Compartilhar</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(dialogo);

  dialogo.querySelector(".product-modal-close").addEventListener("click", () => fecharModalProduto());

  // Clicar no fundo escuro (fora do conteúdo) fecha a janela.
  dialogo.addEventListener("click", (evento) => {
    if (evento.target === dialogo) fecharModalProduto();
  });

  // Esc: o <dialog> já fecha sozinho; aqui só arrumamos o endereço da página.
  dialogo.addEventListener("cancel", (evento) => {
    evento.preventDefault();
    fecharModalProduto();
  });

  dialogo.querySelector("[data-modal-adicionar]").addEventListener("click", () => {
    if (produtoNoModal) adicionarAoCarrinho(produtoNoModal.id);
  });

  dialogo.querySelector("[data-modal-compartilhar]").addEventListener("click", () => {
    if (produtoNoModal) compartilharProduto(produtoNoModal);
  });

  return dialogo;
}

function preencherModalProduto(produto) {
  const campo = (nome) => modalProduto.querySelector(`[data-campo="${nome}"]`);

  modalProduto.querySelector(".product-modal-visual").innerHTML = criarImagemProduto(produto);
  campo("categoria").textContent = produto.categoria;
  campo("nome").textContent = produto.nome;
  campo("descricao").textContent = produto.descricao;
  campo("preco").textContent = formatarMoeda(produto.preco);

  // Campo opcional em js/produtos.js (ex.: medidas: "60 x 40 cm").
  campo("medidas").textContent = produto.medidas ? `Medidas: ${produto.medidas}` : "";
  campo("medidas").classList.toggle("hidden", !produto.medidas);

  modalProduto.querySelector("[data-modal-adicionar]")
    .setAttribute("aria-label", `Adicionar ${produto.nome} à encomenda`);
}

function abrirModalProduto(produto, { porClique = false } = {}) {
  if (!produto) return;
  if (!modalProduto) modalProduto = criarModalProduto();

  if (!modalProduto.open) elementoAntesDoModal = document.activeElement;

  produtoNoModal = produto;
  preencherModalProduto(produto);

  // Põe a peça no endereço (#tapete-rosa): o link pode ser compartilhado
  // e o botão "voltar" do celular fecha a janela.
  const hash = `#${slugProduto(produto)}`;
  if (porClique && window.location.hash !== hash) {
    modalAbertoPorClique = true;
    history.pushState(null, "", hash);
  }

  if (!modalProduto.open) modalProduto.showModal();
  modalProduto.querySelector(".product-modal-close").focus();
}

function fecharModalProduto({ porVoltar = false } = {}) {
  if (!modalProduto?.open) return;

  modalProduto.close();
  produtoNoModal = null;

  if (!porVoltar) {
    if (modalAbertoPorClique) {
      history.back();
    } else if (buscarProdutoPorSlug(window.location.hash.slice(1))) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }
  modalAbertoPorClique = false;

  elementoAntesDoModal?.focus?.();
  elementoAntesDoModal = null;
}

async function compartilharProduto(produto) {
  const url = linkProduto(produto);
  const dados = { title: `${produto.nome} | ${CONFIG.nomeLoja}`, text: produto.descricao, url };

  try {
    if (navigator.share) {
      await navigator.share(dados);
      return;
    }
    await navigator.clipboard.writeText(url);
    mostrarToast("Link da peça copiado.");
  } catch (erro) {
    if (erro?.name === "AbortError") return; // a pessoa cancelou o compartilhamento
    window.prompt("Copie o link da peça:", url);
  }
}

function iniciarDetalheProduto() {
  // Cliques nos cards (catálogo e destaques): um único listener para a página toda.
  document.addEventListener("click", (evento) => {
    const adicionar = evento.target.closest("[data-adicionar]");
    if (adicionar) {
      adicionarAoCarrinho(Number(adicionar.dataset.adicionar));
      return;
    }

    const abrir = evento.target.closest("[data-abrir-produto]");
    if (!abrir) return;

    // Ctrl/Cmd+clique continua abrindo o link numa nova aba.
    if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.button !== 0) return;

    const produto = PRODUTOS.find((item) => item.id === Number(abrir.dataset.abrirProduto));
    if (!produto) return;

    evento.preventDefault();
    abrirModalProduto(produto, { porClique: true });
  });

  // Endereço com a peça (link compartilhado, voltar/avançar do navegador).
  function sincronizarComEndereco() {
    const produto = buscarProdutoPorSlug(decodeURIComponent(window.location.hash.slice(1)));
    if (produto) {
      abrirModalProduto(produto);
    } else {
      fecharModalProduto({ porVoltar: true });
    }
  }

  window.addEventListener("popstate", () => {
    modalAbertoPorClique = false;
    sincronizarComEndereco();
  });

  if (document.getElementById("products-grid")) sincronizarComEndereco();
}

/* ---------- Menu, contatos e tema ---------- */

function iniciarMenuMobile() {
  const botao = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".nav-links");

  if (!botao || !menu) return;

  function definirMenu(aberto) {
    menu.classList.toggle("open", aberto);
    botao.setAttribute("aria-expanded", String(aberto));
    botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    botao.textContent = aberto ? "✕" : "☰";
  }

  botao.addEventListener("click", () => {
    definirMenu(!menu.classList.contains("open"));
  });

  // Fecha ao clicar em qualquer link do menu (ex.: "Sobre", que é âncora na mesma página).
  menu.addEventListener("click", (evento) => {
    if (evento.target.closest("a")) definirMenu(false);
  });

  // Fecha com Esc e devolve o foco ao botão.
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && menu.classList.contains("open")) {
      definirMenu(false);
      botao.focus();
    }
  });

  // Fecha ao clicar fora do menu.
  document.addEventListener("click", (evento) => {
    if (!menu.classList.contains("open")) return;
    if (menu.contains(evento.target) || botao.contains(evento.target)) return;
    definirMenu(false);
  });
}

// Preenche os links de contato a partir de js/config.js.
// O href escrito no HTML fica como reserva caso o script não carregue.
function preencherContatos() {
  if (typeof CONFIG === "undefined") return;

  document.querySelectorAll('[data-contato="whatsapp"]').forEach((link) => {
    link.href = `https://wa.me/${CONFIG.whatsapp}`;
  });

  document.querySelectorAll('[data-contato="instagram"]').forEach((link) => {
    link.href = CONFIG.instagram;
  });
}

function iniciarTema() {
  const raiz = document.documentElement;
  const botaoTema = document.getElementById("theme-toggle");

  // A classe "dark-mode" já foi aplicada no <html> pelo script do <head>
  // (tema salvo ou, sem preferência salva, o tema do sistema).
  if (!botaoTema) return;

  function atualizarRotuloTema() {
    const escuro = raiz.classList.contains("dark-mode");
    const rotulo = document.getElementById("theme-label");
    botaoTema.checked = escuro;
    if (rotulo) rotulo.textContent = escuro ? "Tema escuro" : "Tema claro";
    botaoTema.setAttribute("aria-label", escuro ? "Ativar tema claro" : "Ativar tema escuro");
  }

  atualizarRotuloTema();

  botaoTema.addEventListener("change", () => {
    raiz.classList.toggle("dark-mode", botaoTema.checked);

    try {
      localStorage.setItem("tema", botaoTema.checked ? "escuro" : "claro");
    } catch {
      // Sem localStorage: o tema vale só para esta página.
    }

    atualizarRotuloTema();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarCatalogo();
  iniciarDestaques();
  iniciarDetalheProduto();
  iniciarMenuMobile();
  preencherContatos();
  iniciarTema();
});
