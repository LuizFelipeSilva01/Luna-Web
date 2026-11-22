import { auth, db } from "../firebase/firebase.js"; // ajuste o caminho/nome do seu arquivo
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const DIA = 24 * 60 * 60 * 1000;
const $ = (id) => document.getElementById(id);

/* ---------- utilitários ---------- */
const num = (n) => n.toLocaleString("pt-BR");
const pct = (n) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";

// variação percentual entre dois períodos (null se não há base de comparação)
function variacao(atual, anterior) {
  return anterior > 0 ? ((atual - anterior) / anterior) * 100 : null;
}

function mostrarVariacao(id, valor) {
  const el = $(id);
  if (valor === null) { el.hidden = true; return; }
  el.hidden = false;
  el.textContent = (valor > 0 ? "+" : "") + pct(valor);
  el.classList.toggle("tag-negativo", valor < 0);
}

/* ---------- 1. Cards ---------- */
function renderCards(lista, agora) {
  const total = lista.length;
  const totalHa30 = lista.filter((u) => u.criadoEm <= agora - 30 * DIA).length;

  const novos = lista.filter((u) => u.criadoEm > agora - 30 * DIA).length;
  const novosAnt = lista.filter(
    (u) => u.criadoEm > agora - 60 * DIA && u.criadoEm <= agora - 30 * DIA
  ).length;

  const ativos = lista.filter((u) => u.ultimoAcesso > agora - 30 * DIA).length;

  // Retenção: dos usuários cadastrados há 30+ dias, quantos acessaram nos últimos 30 dias
  const coorte = lista.filter((u) => u.criadoEm <= agora - 30 * DIA);
  const retidos = coorte.filter((u) => u.ultimoAcesso > agora - 30 * DIA).length;
  const retencao = coorte.length ? (retidos / coorte.length) * 100 : 0;

  $("kpi-total").textContent = num(total);
  $("kpi-ativos").textContent = num(ativos);
  $("kpi-novos").textContent = num(novos);
  $("kpi-retencao").textContent = pct(retencao);

  mostrarVariacao("kpi-total-pct", variacao(total, totalHa30));
  mostrarVariacao("kpi-novos-pct", variacao(novos, novosAnt));
}

/* ---------- 2. Gráfico de linha (usuários acumulados por dia) ---------- */
function tetoBonito(max) {
  if (max <= 4) return 4;
  const bruto = max / 4;
  const mag = 10 ** Math.floor(Math.log10(bruto));
  const passo = [1, 1.5, 2, 2.5, 3, 4, 5, 10].map((m) => m * mag).find((p) => p >= bruto);
  return passo * 4; // 4 intervalos = 5 rótulos no eixo
}

function renderCrescimento(lista) {
  const DIAS = 30;
  const fimHoje = new Date().setHours(23, 59, 59, 999);

  const pontos = [];
  for (let i = DIAS - 1; i >= 0; i--) {
    const fim = fimHoje - i * DIA;
    pontos.push({
      data: new Date(fim),
      valor: lista.filter((u) => u.criadoEm <= fim).length,
    });
  }

  const teto = tetoBonito(Math.max(...pontos.map((p) => p.valor)));
  const L = 500, A = 133; // mesmo viewBox do SVG

  const coords = pontos.map((p, i) => [(i / (DIAS - 1)) * L, A - (p.valor / teto) * A]);
  const linha = coords
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");

  $("linha-path").setAttribute("d", linha);
  $("area-path").setAttribute("d", `${linha} L${L} ${A} L0 ${A} Z`);

  // eixo Y: de cima para baixo (teto, 75%, 50%, 25%, 0)
  $("eixo-y").innerHTML = [1, 0.75, 0.5, 0.25, 0]
    .map((f) => `<span>${num(Math.round(teto * f))}</span>`)
    .join("");

  // eixo X: 5 datas igualmente espaçadas
  $("eixo-x").innerHTML = [0, 1, 2, 3, 4]
    .map((k) => {
      const d = pontos[Math.round((k * (DIAS - 1)) / 4)].data;
      return `<span>${d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span>`;
    })
    .join("");
}

/* ---------- 3. Rosca por plataforma ---------- */
function renderPlataformas(lista) {
  const cont = { android: 0, ios: 0, web: 0 };
  lista.forEach((u) => { if (u.plataforma in cont) cont[u.plataforma]++; });

  const total = cont.android + cont.ios + cont.web;
  const p = (n) => (total ? (n / total) * 100 : 0);
  const a = p(cont.android);
  const i = p(cont.ios);
  const w = p(cont.web);

  $("pct-android").textContent = Math.round(a) + "%";
  $("pct-ios").textContent = Math.round(i) + "%";
  $("pct-web").textContent = Math.round(w) + "%";

  const g1 = a * 3.6;        // 1% = 3,6 graus
  const g2 = (a + i) * 3.6;
  $("donut").style.background = total
    ? `conic-gradient(#7737e8 0deg ${g1}deg, #9d7ae4 ${g1}deg ${g2}deg, #d8d1ee ${g2}deg 360deg)`
    : "#d8d1ee";
}

/* ---------- Orquestração ---------- */
function render(dados) {
  const lista = Object.values(dados ?? {});
  const agora = Date.now();
  renderCards(lista, agora);
  renderCrescimento(lista);
  renderPlataformas(lista);
}

// Só lê o banco depois que o Firebase confirmar quem está logado
// (as regras exigem autenticação; sem isso dá "permission denied").
let pararDeOuvir = null;
onAuthStateChanged(auth, (user) => {
  pararDeOuvir?.();
  pararDeOuvir = user
    ? onValue(
        ref(db, "usuarios"),
        (snap) => render(snap.val()),
        (erro) => console.error("Erro ao ler usuários:", erro.code)
      )
    : null;
});