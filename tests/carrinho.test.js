// Testes da lógica do carrinho e do catálogo.
// Usam só o que já vem no Node (node:test), sem instalar nada.
// Para rodar, na pasta do projeto:  node --test tests/

const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const RAIZ = path.join(__dirname, "..");
const SCRIPTS = ["js/config.js", "js/produtos.js", "js/carrinho.js", "js/main.js"];

// Carrega os scripts do site num "navegador de mentira": só o mínimo de
// document, window e localStorage que as funções testadas usam.
function criarSite({ carrinhoSalvo } = {}) {
  const armazenamento = {};
  if (carrinhoSalvo !== undefined) {
    armazenamento.anaCrocheCarrinho = typeof carrinhoSalvo === "string"
      ? carrinhoSalvo
      : JSON.stringify(carrinhoSalvo);
  }

  const campos = { "customer-name": { value: "" }, "customer-notes": { value: "" } };
  const abertos = [];

  const elementoFalso = () => ({
    classList: { add() {}, remove() {}, toggle() {} },
    setAttribute() {},
    textContent: ""
  });

  const contexto = {
    localStorage: {
      getItem: (chave) => (chave in armazenamento ? armazenamento[chave] : null),
      setItem: (chave, valor) => { armazenamento[chave] = String(valor); }
    },
    document: {
      addEventListener() {},
      querySelector: (seletor) => (seletor === ".toast" ? elementoFalso() : null),
      querySelectorAll: () => [],
      getElementById: (id) => campos[id] || null,
      createElement: elementoFalso,
      body: { appendChild() {} }
    },
    window: {
      location: { href: "https://exemplo.github.io/AnaLu-Croches/index.html" },
      open: (url) => abertos.push(url)
    },
    setTimeout: () => 0,
    clearTimeout: () => {},
    URL
  };
  vm.createContext(contexto);

  for (const arquivo of SCRIPTS) {
    vm.runInContext(fs.readFileSync(path.join(RAIZ, arquivo), "utf8"), contexto, { filename: arquivo });
  }

  // Funções e constantes do site (const/function do topo dos scripts).
  const site = vm.runInContext(`({
    CONFIG, PRODUTOS, LIMITE_DETALHES,
    lerCarrinhoSalvo, obterCarrinho, adicionarAoCarrinho, alterarQuantidade,
    removerDoCarrinho, atualizarDetalhes, quantidadeTotalCarrinho,
    montarMensagemWhatsApp, finalizarNoWhatsApp,
    normalizar, slugProduto, buscarProdutoPorSlug, linkProduto, escaparHTML, formatarMoeda, nomeComCores
  })`, contexto);

  return {
    ...site,
    campos,
    abertos,
    salvo: () => JSON.parse(armazenamento.anaCrocheCarrinho || "[]")
  };
}

// Objetos criados dentro do "navegador de mentira" têm outro protótipo;
// passar por JSON permite compará-los com deepEqual.
const simples = (valor) => JSON.parse(JSON.stringify(valor));

let site;
beforeEach(() => {
  site = criarSite();
});

/* ---------- Ler o carrinho salvo ---------- */

test("carrinho vazio quando não há nada salvo ou o valor é inválido", () => {
  assert.deepEqual(simples(criarSite().lerCarrinhoSalvo()), []);
  assert.deepEqual(simples(criarSite({ carrinhoSalvo: "isso não é json" }).lerCarrinhoSalvo()), []);
  assert.deepEqual(simples(criarSite({ carrinhoSalvo: { id: 1 } }).lerCarrinhoSalvo()), []);
});

test("descarta produtos que saíram do catálogo e quantidades inválidas", () => {
  const s = criarSite({
    carrinhoSalvo: [
      { id: 1, quantidade: 2 },
      { id: 999, quantidade: 1 }, // não existe mais
      { id: 2, quantidade: 0 },
      { id: 3, quantidade: -1 },
      { id: 4, quantidade: 1.5 },
      { id: 5, quantidade: "abc" }
    ]
  });
  assert.deepEqual(simples(s.lerCarrinhoSalvo()), [{ id: 1, quantidade: 2, detalhes: "" }]);
});

test("lê carrinhos no formato antigo, com nome e preço salvos, usando o preço atual", () => {
  const s = criarSite({ carrinhoSalvo: [{ id: 2, nome: "Nome antigo", preco: 999, quantidade: 1 }] });
  const [item] = s.obterCarrinho();
  const atual = s.PRODUTOS.find((p) => p.id === 2);
  assert.equal(item.nome, atual.nome);
  assert.equal(item.preco, atual.preco);
});

test("junta itens repetidos do mesmo produto", () => {
  const s = criarSite({ carrinhoSalvo: [{ id: 1, quantidade: 1 }, { id: 1, quantidade: 2, detalhes: "azul" }] });
  assert.deepEqual(simples(s.lerCarrinhoSalvo()), [{ id: 1, quantidade: 3, detalhes: "azul" }]);
});

/* ---------- Adicionar, alterar e remover ---------- */

test("adicionar o mesmo produto duas vezes soma a quantidade", () => {
  site.adicionarAoCarrinho(1);
  site.adicionarAoCarrinho(1);
  site.adicionarAoCarrinho(3);
  assert.deepEqual(site.salvo(), [{ id: 1, quantidade: 2 }, { id: 3, quantidade: 1 }]);
  assert.equal(site.quantidadeTotalCarrinho(), 3);
});

test("ignora produto que não existe", () => {
  site.adicionarAoCarrinho(999);
  assert.deepEqual(site.salvo(), []);
});

test("diminuir até zero remove a peça", () => {
  site.adicionarAoCarrinho(1);
  site.alterarQuantidade(1, 1);
  assert.equal(site.salvo()[0].quantidade, 2);
  site.alterarQuantidade(1, -1);
  site.alterarQuantidade(1, -1);
  assert.deepEqual(site.salvo(), []);
});

test("remover tira só a peça escolhida", () => {
  site.adicionarAoCarrinho(1);
  site.adicionarAoCarrinho(2);
  site.removerDoCarrinho(1);
  assert.deepEqual(site.salvo(), [{ id: 2, quantidade: 1 }]);
});

/* ---------- Cores e detalhes de cada peça ---------- */

test("salva os detalhes de cada peça e mantém ao mudar a quantidade", () => {
  site.adicionarAoCarrinho(1);
  site.atualizarDetalhes(1, "borda azul-marinho");
  site.alterarQuantidade(1, 1);
  assert.deepEqual(site.salvo(), [{ id: 1, quantidade: 2, detalhes: "borda azul-marinho" }]);
});

test("limita o tamanho dos detalhes", () => {
  site.adicionarAoCarrinho(1);
  site.atualizarDetalhes(1, "x".repeat(site.LIMITE_DETALHES + 50));
  assert.equal(site.salvo()[0].detalhes.length, site.LIMITE_DETALHES);
});

test("detalhes vazios não são guardados", () => {
  site.adicionarAoCarrinho(1);
  site.atualizarDetalhes(1, "algo");
  site.atualizarDetalhes(1, "");
  assert.deepEqual(site.salvo(), [{ id: 1, quantidade: 1 }]);
});

/* ---------- Mensagem do WhatsApp ---------- */

test("monta a mensagem com nome, peças, detalhes, total e observações", () => {
  site.adicionarAoCarrinho(1); // Sousplat Redondo, R$ 25
  site.adicionarAoCarrinho(3); // Tapete Oval Grande (tons de rosa), R$ 40
  site.adicionarAoCarrinho(3);
  site.atualizarDetalhes(3, "  tons de\nlilás  ");

  const mensagem = site.montarMensagemWhatsApp(site.obterCarrinho(), "Gabriel", "Retiro no sábado");
  const brl = (valor) => site.formatarMoeda(valor);
  const [sousplat, ovalRosa] = [1, 3].map((id) => site.PRODUTOS.find((p) => p.id === id));

  assert.equal(mensagem, [
    `Olá! Vim pelo site da ${site.CONFIG.nomeLoja} e gostaria de fazer uma encomenda.`,
    "*Nome:* Gabriel",
    [
      "*Peças escolhidas:*",
      `- 1x ${sousplat.nome} (foto: ${sousplat.cores}): ${brl(25)}`,
      `- 2x ${ovalRosa.nome} (foto: ${ovalRosa.cores}): ${brl(80)} (${brl(40)} cada)`,
      "   Detalhes: tons de lilás"
    ].join("\n"),
    `*Total estimado:* ${brl(105)}`,
    "*Observações:* Retiro no sábado",
    "Gostaria de confirmar o prazo de produção, as personalizações, a entrega e o pagamento."
  ].join("\n\n"));
});

test("sem nome e sem observações, essas linhas não aparecem", () => {
  site.adicionarAoCarrinho(1);
  const mensagem = site.montarMensagemWhatsApp(site.obterCarrinho(), "", "");
  assert.doesNotMatch(mensagem, /Nome:|Observações:/);
});

test("a mensagem não tem emojis (o WhatsApp no computador pode trocá-los por �)", () => {
  site.adicionarAoCarrinho(1);
  const mensagem = site.montarMensagemWhatsApp(site.obterCarrinho(), "Ana", "Obs");
  assert.doesNotMatch(mensagem, /\p{Extended_Pictographic}/u);
});

test("finalizar abre o WhatsApp do config.js com a mensagem codificada", () => {
  site.adicionarAoCarrinho(1);
  site.campos["customer-name"].value = "  Maria  ";
  site.finalizarNoWhatsApp();

  assert.equal(site.abertos.length, 1);
  const url = new URL(site.abertos[0]);
  assert.equal(url.origin + url.pathname, `https://wa.me/${site.CONFIG.whatsapp}`);
  assert.match(url.searchParams.get("text"), /\*Nome:\* Maria\n/);
});

test("finalizar com o carrinho vazio não abre o WhatsApp", () => {
  site.finalizarNoWhatsApp();
  assert.equal(site.abertos.length, 0);
});

/* ---------- Catálogo ---------- */

test("a busca ignora acentos e maiúsculas", () => {
  assert.equal(site.normalizar("CROCHÊ Bordô"), "croche bordo");
});

test("cada produto tem um link único e o link encontra o produto de volta", () => {
  const slugs = site.PRODUTOS.map(site.slugProduto);
  assert.equal(new Set(slugs).size, slugs.length, "dois produtos com o mesmo link");
  for (const produto of site.PRODUTOS) {
    assert.match(site.slugProduto(produto), /^[a-z0-9]+(-[a-z0-9]+)*$/);
    assert.equal(site.buscarProdutoPorSlug(site.slugProduto(produto)).id, produto.id);
  }
  assert.equal(site.slugProduto({ id: 100, nome: "Centro de Mesa Bordô" }), "centro-de-mesa-bordo");
  assert.equal(
    site.linkProduto({ id: 100, nome: "Tapete Rosa" }),
    "https://exemplo.github.io/AnaLu-Croches/produtos.html#tapete-rosa"
  );
});

test("escaparHTML neutraliza tags e aspas", () => {
  assert.equal(site.escaparHTML(`<img src=x onerror="a">'`), "&lt;img src=x onerror=&quot;a&quot;&gt;&#39;");
});

test("os dados do catálogo estão completos", () => {
  const ids = site.PRODUTOS.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, "ids repetidos em js/produtos.js");
  for (const p of site.PRODUTOS) {
    assert.ok(Number.isInteger(p.id), `id inválido em ${p.nome}`);
    assert.ok(p.nome && p.categoria && p.descricao, `faltam dados em ${p.id}`);
    assert.ok(typeof p.preco === "number" && p.preco > 0, `preço inválido em ${p.nome}`);
    if (p.imagem) {
      assert.ok(fs.existsSync(path.join(RAIZ, p.imagem)), `foto não encontrada: ${p.imagem}`);
    }
  }
});

/* ---------- Peças do mesmo modelo (mesmo nome, cores diferentes) ---------- */

test("peças com o mesmo nome ganham o id no link, e as outras não", () => {
  const repetidos = site.PRODUTOS.filter((p) =>
    site.PRODUTOS.some((o) => o.id !== p.id && o.nome === p.nome));
  assert.ok(repetidos.length >= 2, "o catálogo deveria ter peças do mesmo modelo");
  for (const p of repetidos) assert.match(site.slugProduto(p), new RegExp(`-${p.id}$`));

  const unico = site.PRODUTOS.find((p) => !repetidos.includes(p));
  assert.doesNotMatch(site.slugProduto(unico), new RegExp(`-${unico.id}$`));
});

test("peças do mesmo modelo se diferenciam pelas cores da foto", () => {
  const nomes = site.PRODUTOS.map(site.nomeComCores);
  assert.equal(new Set(nomes).size, nomes.length, "duas peças com o mesmo nome e as mesmas cores");
});

test("os nomes não citam cores (as cores ficam no campo cores)", () => {
  const corNoNome = /(azul|rosa|verde|marrom|branco|bord[oô]|colorido|bege|cru)/i;
  for (const p of site.PRODUTOS) assert.doesNotMatch(p.nome, corNoNome, `cor no nome: ${p.nome}`);
});
