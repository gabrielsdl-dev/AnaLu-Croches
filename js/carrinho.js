const CART_KEY = "anaCrocheCarrinho";
const LIMITE_DETALHES = 200; // caracteres por peça
const LIMITE_OBSERVACOES = 500; // caracteres nas observações gerais

// Lê o carrinho salvo, que guarda só { id, quantidade, detalhes }.
// Os demais dados (nome, preço, foto...) vêm sempre do catálogo atual.
// Também aceita carrinhos salvos em formatos antigos (lê só o que reconhece).
function lerCarrinhoSalvo() {
  try {
    const itens = JSON.parse(localStorage.getItem(CART_KEY));
    if (!Array.isArray(itens)) return [];

    const carrinho = [];

    itens.forEach((item) => {
      const id = Number(item?.id);
      const quantidade = Number(item?.quantidade);
      const detalhes = typeof item?.detalhes === "string"
        ? item.detalhes.slice(0, LIMITE_DETALHES)
        : "";

      if (!Number.isInteger(quantidade) || quantidade < 1) return;
      if (!PRODUTOS.some((produto) => produto.id === id)) return;

      const existente = carrinho.find((salvo) => salvo.id === id);
      if (existente) {
        existente.quantidade += quantidade;
        if (!existente.detalhes && detalhes) existente.detalhes = detalhes;
      } else {
        carrinho.push({ id, quantidade, detalhes });
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
    return { ...produto, quantidade: item.quantidade, detalhes: item.detalhes };
  });
}

function salvarCarrinho(carrinho) {
  const itens = carrinho
    .filter((item) => Number.isInteger(item.quantidade) && item.quantidade > 0)
    .map((item) => {
      const salvo = { id: item.id, quantidade: item.quantidade };
      if (item.detalhes) salvo.detalhes = String(item.detalhes).slice(0, LIMITE_DETALHES);
      return salvo;
    });

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
    carrinho.push({ id: produto.id, quantidade: 1, detalhes: "" });
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

// Salva as cores/detalhes de uma peça sem redesenhar o carrinho
// (assim o campo não perde o foco enquanto a pessoa digita).
function atualizarDetalhes(produtoId, texto) {
  const carrinho = lerCarrinhoSalvo();
  const item = carrinho.find((produto) => produto.id === produtoId);
  if (!item) return;

  item.detalhes = String(texto).slice(0, LIMITE_DETALHES);
  salvarCarrinho(carrinho);
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

      <div class="cart-item-info">
        <h3 id="item-nome-${id}">${nome}</h3>
        <p>${escaparHTML(item.categoria)} • Produzido sob encomenda</p>

        <div class="quantity-controls">
          <button type="button" data-acao="diminuir" data-id="${id}" aria-label="Diminuir quantidade de ${nome}">−</button>
          <strong>${item.quantidade}</strong>
          <button type="button" data-acao="aumentar" data-id="${id}" aria-label="Aumentar quantidade de ${nome}">+</button>
        </div>

        <label class="item-details">
          <span id="item-detalhes-${id}">Cores e detalhes desta peça <small>(opcional)</small></span>
          <textarea rows="2" aria-labelledby="item-detalhes-${id} item-nome-${id}" maxlength="${LIMITE_DETALHES}" data-detalhes-id="${id}" placeholder="Ex.: borda azul-marinho, centro bege">${escaparHTML(item.detalhes || "")}</textarea>
        </label>

        <button class="remove-item" type="button" data-acao="remover" data-id="${id}" aria-label="Remover ${nome} da encomenda">
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

// Cliques nos botões do carrinho (um único listener para todos os itens).
// Depois de redesenhar, o foco volta para o botão equivalente, para quem
// navega pelo teclado ou leitor de tela não ser jogado para o topo da página.
function iniciarAcoesCarrinho() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  container.addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-acao]");
    if (!botao) return;

    const id = Number(botao.dataset.id);
    const acao = botao.dataset.acao;

    if (acao === "aumentar") alterarQuantidade(id, 1);
    if (acao === "diminuir") alterarQuantidade(id, -1);
    if (acao === "remover") removerDoCarrinho(id);

    const mesmoBotao = container.querySelector(`[data-acao="${acao}"][data-id="${id}"]`);
    const alternativa = container.querySelector("[data-acao]")
      || document.querySelector("#cart-empty .btn");
    (mesmoBotao || alternativa)?.focus();
  });

  container.addEventListener("input", (evento) => {
    const campo = evento.target.closest("[data-detalhes-id]");
    if (campo) atualizarDetalhes(Number(campo.dataset.detalhesId), campo.value);
  });
}

function montarMensagemWhatsApp(carrinho, nome, observacoes) {
  const total = carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0);

  const linhasProdutos = carrinho.map((item) => {
    const subtotal = formatarMoeda(item.preco * item.quantidade);
    const cada = item.quantidade > 1 ? ` (${formatarMoeda(item.preco)} cada)` : "";
    const detalhes = (item.detalhes || "").trim().replace(/\s+/g, " ");
    const linha = `- ${item.quantidade}x ${item.nome}: ${subtotal}${cada}`;
    return detalhes ? `${linha}\n   Detalhes: ${detalhes}` : linha;
  });

  // Sem emojis: o WhatsApp Desktop/Web às vezes troca emojis vindos do link por "�".
  // Cada bloco é separado por uma linha em branco.
  const blocos = [
    `Olá! Vim pelo site da ${CONFIG.nomeLoja} e gostaria de fazer uma encomenda.`,
    nome ? `*Nome:* ${nome}` : null,
    ["*Peças escolhidas:*", ...linhasProdutos].join("\n"),
    `*Total estimado:* ${formatarMoeda(total)}`,
    observacoes ? `*Observações:* ${observacoes}` : null,
    "Gostaria de confirmar o prazo de produção, as personalizações, a entrega e o pagamento."
  ];

  return blocos.filter(Boolean).join("\n\n");
}

function finalizarNoWhatsApp() {
  const carrinho = obterCarrinho();

  if (carrinho.length === 0) {
    mostrarToast("Adicione pelo menos um produto antes de finalizar.");
    return;
  }

  const nome = document.getElementById("customer-name")?.value.trim();
  const observacoes = document.getElementById("customer-notes")?.value.trim().slice(0, LIMITE_OBSERVACOES);

  const mensagem = montarMensagemWhatsApp(carrinho, nome, observacoes);

  // O número fica em js/config.js (CONFIG.whatsapp).
  const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

document.addEventListener("DOMContentLoaded", () => {
  obterToast();
  atualizarContadoresCarrinho();
  renderizarCarrinho();
  iniciarAcoesCarrinho();

  document
    .getElementById("checkout-whatsapp")
    ?.addEventListener("click", finalizarNoWhatsApp);
});
