function criarCardProduto(produto) {
  return `
    <article class="product-card">
      <div class="product-visual">
        <span class="product-badge">Sob encomenda</span>
        ${criarImagemProduto(produto)}
      </div>

      <div class="product-content">
        <span class="product-category">${escaparHTML(produto.categoria)}</span>
        <h3>${escaparHTML(produto.nome)}</h3>
        <p class="product-description">${escaparHTML(produto.descricao)}</p>

        <div class="product-footer">
          <div class="product-price">
            <small>A partir de</small>
            <strong>${formatarMoeda(produto.preco)}</strong>
          </div>

          <button
            class="add-cart"
            type="button"
            aria-label="Adicionar ${escaparHTML(produto.nome)} à encomenda"
            onclick="adicionarAoCarrinho(${Number(produto.id)})"
          >
            + Encomenda
          </button>
        </div>
      </div>
    </article>
  `;
}

// Remove acentos e ignora maiúsculas/minúsculas ("Crochê" -> "croche").
function normalizar(texto) {
  return String(texto).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
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

// Preenche os links de contato do rodapé a partir de js/config.js.
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
  iniciarMenuMobile();
  preencherContatos();
  iniciarTema();
});
