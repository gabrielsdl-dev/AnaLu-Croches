const CART_KEY = "anaCrocheCarrinho";

function obterCarrinho() {
  try {
    const itens = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    return itens.map((item) => {
      const produto = PRODUTOS.find((produto) => produto.id === item.id);
      return produto ? { ...produto, quantidade: item.quantidade } : item;
    });
  } catch {
    return [];
  }
}

function salvarCarrinho(carrinho) {
  localStorage.setItem(CART_KEY, JSON.stringify(carrinho));
  atualizarContadoresCarrinho();
}

function adicionarAoCarrinho(produtoId) {
  const produto = PRODUTOS.find((item) => item.id === produtoId);
  if (!produto) return;

  const carrinho = obterCarrinho();
  const itemExistente = carrinho.find((item) => item.id === produtoId);

  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    carrinho.push({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagem: produto.imagem,
      categoria: produto.categoria,
      quantidade: 1
    });
  }

  salvarCarrinho(carrinho);
  mostrarToast(`${produto.nome} adicionado à encomenda.`);
}

function alterarQuantidade(produtoId, delta) {
  const carrinho = obterCarrinho();
  const item = carrinho.find((produto) => produto.id === produtoId);
  if (!item) return;

  item.quantidade += delta;

  const novoCarrinho = carrinho.filter((produto) => produto.quantidade > 0);
  salvarCarrinho(novoCarrinho);
  renderizarCarrinho();
}

function removerDoCarrinho(produtoId) {
  const carrinho = obterCarrinho().filter((produto) => produto.id !== produtoId);
  salvarCarrinho(carrinho);
  renderizarCarrinho();
}

function quantidadeTotalCarrinho() {
  return obterCarrinho().reduce((total, item) => total + item.quantidade, 0);
}

function atualizarContadoresCarrinho() {
  const quantidade = quantidadeTotalCarrinho();
  document.querySelectorAll(".cart-count").forEach((el) => {
    el.textContent = quantidade;
  });
  document.querySelectorAll(".product-cart-link").forEach((el) => {
    el.setAttribute("aria-label", `Ver carrinho, ${quantidade} ${quantidade === 1 ? "item" : "itens"}`);
  });
}

function mostrarToast(mensagem) {
  let toast = document.querySelector(".toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }

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

  container.innerHTML = carrinho.map((item) => `
    <article class="cart-item">
      <div class="cart-item-visual">${criarImagemProduto(item)}</div>

      <div>
        <h3>${item.nome}</h3>
        <p>${item.categoria} • Produzido sob encomenda</p>

        <div class="quantity-controls">
          <button type="button" aria-label="Diminuir quantidade" onclick="alterarQuantidade(${item.id}, -1)">−</button>
          <strong>${item.quantidade}</strong>
          <button type="button" aria-label="Aumentar quantidade" onclick="alterarQuantidade(${item.id}, 1)">+</button>
        </div>

        <button class="remove-item" type="button" onclick="removerDoCarrinho(${item.id})">
          Remover
        </button>
      </div>

      <div class="cart-item-price">
        <small>${formatarMoeda(item.preco)} cada</small>
        <strong>${formatarMoeda(item.preco * item.quantidade)}</strong>
      </div>
    </article>
  `).join("");

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
    "Olá! 😊",
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

  // IMPORTANTE:
  // Troque o número abaixo pelo WhatsApp real da artesã, com DDI + DDD + número.
  // Exemplo fictício: 5511999999999
  const telefoneWhatsApp = "5511999999999";

  const url = `https://wa.me/${telefoneWhatsApp}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

document.addEventListener("DOMContentLoaded", () => {
  atualizarContadoresCarrinho();
  renderizarCarrinho();

  document
    .getElementById("checkout-whatsapp")
    ?.addEventListener("click", finalizarNoWhatsApp);
});
