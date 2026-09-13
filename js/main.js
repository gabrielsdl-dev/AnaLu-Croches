function criarCardProduto(produto) {
  return `
    <article class="product-card">
      <div class="product-visual">
        <span class="product-badge">Sob encomenda</span>
        ${criarImagemProduto(produto)}
      </div>

      <div class="product-content">
        <span class="product-category">${produto.categoria}</span>
        <h3>${produto.nome}</h3>
        <p class="product-description">${produto.descricao}</p>

        <div class="product-footer">
          <div class="product-price">
            <small>A partir de</small>
            <strong>${formatarMoeda(produto.preco)}</strong>
          </div>

          <button
            class="add-cart"
            type="button"
            onclick="adicionarAoCarrinho(${produto.id})"
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

  const categorias = ["Todos", ...new Set(PRODUTOS.map((produto) => produto.categoria))];
  let categoriaAtual = "Todos";

  filtros.innerHTML = categorias.map((categoria, index) => `
    <button
      class="filter-btn ${index === 0 ? "active" : ""}"
      type="button"
      data-category="${categoria}"
    >
      ${categoria}
    </button>
  `).join("");

  function atualizarProdutos() {
    const termo = busca.value.trim().toLowerCase();

    const filtrados = PRODUTOS.filter((produto) => {
      const bateCategoria =
        categoriaAtual === "Todos" || produto.categoria === categoriaAtual;

      const conteudo = `${produto.nome} ${produto.categoria} ${produto.descricao}`.toLowerCase();
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
    });

    atualizarProdutos();
  });

  busca.addEventListener("input", atualizarProdutos);
  atualizarProdutos();
}

function iniciarMenuMobile() {
  const botao = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".nav-links");

  if (!botao || !menu) return;

  botao.addEventListener("click", () => {
    const aberto = menu.classList.toggle("open");
    botao.setAttribute("aria-expanded", String(aberto));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarCatalogo();
  iniciarMenuMobile();
  iniciarTema();
});


function iniciarTema() {
  const botaoTema = document.getElementById("theme-toggle");
  const temaSalvo = localStorage.getItem("tema");

  if (temaSalvo === "escuro") {
    document.body.classList.add("dark-mode");

    if (botaoTema) {
      botaoTema.checked = true;
    }
  }

  if (!botaoTema) return;

  function atualizarRotuloTema() {
    const escuro = document.body.classList.contains("dark-mode");
    const rotulo = document.getElementById("theme-label");
    if (rotulo) rotulo.textContent = escuro ? "Tema escuro" : "Tema claro";
    botaoTema.setAttribute("aria-label", escuro ? "Ativar tema claro" : "Ativar tema escuro");
  }

  atualizarRotuloTema();

  botaoTema.addEventListener("change", () => {
    if (botaoTema.checked) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("tema", "escuro");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("tema", "claro");
    }
    atualizarRotuloTema();
  });
}
