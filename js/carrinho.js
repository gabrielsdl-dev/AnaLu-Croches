const CART_KEY = "anaCrocheCarrinho";

// Lê o carrinho salvo, que guarda só { id, quantidade }.
// Os demais dados (nome, preço, foto...) vêm sempre do catálogo atual.
// Também aceita carrinhos salvos no formato antigo (lê só id e quantidade).
function lerCarrinhoSalvo() {
  try {
    const itens = JSON.parse(localStorage.getItem(CART_KEY));
    if (!Array.isArray(itens)) return [];

    const carrinho = [];

    itens.forEach((item) => {
      const id = Number(item?.id);
      const quantidade = Number(item?.quantidade);

      if (!Number.isInteger(quantidade) || quantidade < 1) return;
      if (!PRODUTOS.some((produto) => produto.id === id)) return;

      const existente = carrinho.find((salvo) => salvo.id === id);
      if (existente) {
        existente.quantidade += quantidade;
      } else {
        carrinho.push({ id, quantidade });
      }
    });

    return carrinho;
  } catch {
    return [];
  }
}

function obterCarrinho() {
  return lerCarrinhoSalvo().map((item) => {
    const produto = PRODUTOS.find((produto) => produto.id === item.id);
    return { ...produto, quantidade: item.quantidade };
  });
}

function salvarCarrinho(carrinho) {
  const itens = carrinho
    .filter((item) => Number.isInteger(item.quantidade) && item.quantidade > 0)
    .map((item) => ({ id: item.id, quantidade: item.quantidade }));

  try {
    localStorage.setItem(CART_KEY, JSON.stringify(itens));
  } catch {
    // Sem localStorage (ex.: modo privado restrito): o carrinho não persiste.
  }
  atualizarContadoresCarrinho();
}

function adicionarAoCarrinho(produtoId) {
  const produto = PRODUTOS.find((item) => item.id === produtoId);
  if (!produto) return;

  const carrinho = lerCarrinhoSalvo();
  const itemExistente = carrinho.find((item) => item.id === produtoId);

  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    carrinho.push({ id: produto.id, quantidade: 1 });
  }

  salvarCarrinho(carrinho);
  mostrarToast(`${produto.nome} adicionado à encomenda.`);
}

function alterarQuantidade(produtoId, delta) {
  const carrinho = lerCarrinhoSalvo();
  const item = carrinho.find((produto) => produto.id === produtoId);
  if (!item) return;

  item.quantidade += delta;

  salvarCarrinho(carrinho);
  renderizarCarrinho();
}

function removerDoCarrinho(produtoId) {
  const carrinho = lerCarrinhoSalvo().filter((produto) => produto.id !== produtoId);
  salvarCarrinho(carrinho);
  renderizarCarrinho();
}

function quantidadeTotalCarrinho() {
  return lerCarrinhoSalvo().reduce((total, item) => total + item.quantidade, 0);
}

function atualizarContadoresCarrinho() {
  const quantidade = quantidadeTotalCarrinho();
  const textoItens = `${quantidade} ${quantidade === 1 ? "item" : "itens"}`;

  document.querySelectorAll(".cart-count").forEach((el) => {
    el.textContent = quantidade;
  });
  document.querySelectorAll(".product-cart-link, .nav-cart").forEach((el) => {
    el.setAttribute("aria-label", `Minha encomenda, ${textoItens}`);
  });
}

// O toast é criado vazio já no carregamento da página, para que o leitor
// de tela registre a região "status" antes de a mensagem aparecer.
function obterToast() {
  let toast = document.querySelector(".toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.setAttribute("aria-atomic", "true");
    document.body.appendChild(toast);
  }

  return toast;
}

function mostrarToast(mensagem) {
  const toast = obterToast();

  toast.textContent = mensagem;
  toast.classList.add("show");

  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function renderizarCarrinho() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  const carrinho = obterCarrinho();
  const vazio = document.getElementById("cart-empty");
  const resumo = document.getElementById("cart-summary");

  if (carrinho.length === 0) {
    container.innerHTML = "";
    vazio?.classList.remove("hidden");
    resumo?.classList.add("hidden");
    return;
  }

  vazio?.classList.add("hidden");
  resumo?.classList.remove("hidden");

  container.innerHTML = carrinho.map((item) => {
    const nome = escaparHTML(item.nome);
    const id = Number(item.id);

    return `
    <article class="cart-item">
      <div class="cart-item-visual">${criarImagemProduto(item)}</div>

      <div>
        <h3>${nome}</h3>
        <p>${escaparHTML(item.categoria)} • Produzido sob encomenda</p>

        <div class="quantity-controls">
          <button type="button" aria-label="Diminuir quantidade de ${nome}" onclick="alterarQuantidade(${id}, -1)">−</button>
          <strong>${item.quantidade}</strong>
          <button type="button" aria-label="Aumentar quantidade de ${nome}" onclick="alterarQuantidade(${id}, 1)">+</button>
        </div>

        <button class="remove-item" type="button" aria-label="Remover ${nome} da encomenda" onclick="removerDoCarrinho(${id})">
          Remover
        </button>
      </div>

      <div class="cart-item-price">
        <small>${formatarMoeda(item.preco)} cada</small>
        <strong>${formatarMoeda(item.preco * item.quantidade)}</strong>
      </div>
    </article>
  `;
  }).join("");

  const totalItens = carrinho.reduce((soma, item) => soma + item.quantidade, 0);
  const totalValor = carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0);

  document.getElementById("summary-items").textContent = totalItens;
  document.getElementById("summary-total").textContent = formatarMoeda(totalValor);
}

function finalizarNoWhatsApp() {
  const carrinho = obterCarrinho();

  if (carrinho.length === 0) {
    mostrarToast("Adicione pelo menos um produto antes de finalizar.");
    return;
  }

  const nome = document.getElementById("customer-name")?.value.trim();
  const observacoes = document.getElementById("customer-notes")?.value.trim();

  const total = carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0);

  const linhasProdutos = carrinho.map((item) => {
    return `• ${item.quantidade}x ${item.nome} — ${formatarMoeda(item.preco * item.quantidade)}`;
  });

  const mensagem = [
    `Olá, ${CONFIG.nomeLoja}! 😊`,
    nome ? `Meu nome é ${nome} e gostaria de fazer uma encomenda.` : "Gostaria de fazer uma encomenda.",
    "",
    "🧶 *Minha encomenda*",
    ...linhasProdutos,
    "",
    `*Total estimado:* ${formatarMoeda(total)}`,
    observacoes ? `\n*Observações:* ${observacoes}` : "",
    "",
    "Gostaria de confirmar o prazo de produção, personalizações, entrega e pagamento."
  ].filter(Boolean).join("\n");

  // O número fica em js/config.js (CONFIG.whatsapp).
  const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

document.addEventListener("DOMContentLoaded", () => {
  obterToast();
  atualizarContadoresCarrinho();
  renderizarCarrinho();

  document
    .getElementById("checkout-whatsapp")
    ?.addEventListener("click", finalizarNoWhatsApp);
});
