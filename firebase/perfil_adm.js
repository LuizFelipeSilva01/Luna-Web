
import { auth, db } from "./firebase.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

// Função ajudante: escreve um texto dentro do elemento que tem aquele id
function escrever(id, texto) {
  const el = document.getElementById(id);
  if (el) el.textContent = texto;
}

onAuthStateChanged(auth, async (user) => {
  if (!user) return; // o proteger.js já cuida de mandar para o login

  try {
    // Busca os dados salvos nas configurações
    const perfilRef = ref(db, "perfil_admin");
    const resultado = await get(perfilRef);
    const dados = resultado.exists() ? resultado.val() : {};

    // Nome e informações salvas no perfil
    const nome = dados.nome || user.displayName || "Admin";
    const email = dados.email || user.email;
    const telefone = dados.telefone || "Não informado";
    const cargo = dados.cargo || "Administrador Geral";
    const localizacao = dados.localizacao || "Não informado";

    // "Membro desde": data de criação da conta, em português
    const criada = new Date(user.metadata.creationTime);
    let membroDesde = criada.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    membroDesde = membroDesde.charAt(0).toUpperCase() + membroDesde.slice(1);

    // Escrevendo na página
    escrever("topo-nome", nome);
    escrever("perfil-nome", nome);
    escrever("topo-cargo", cargo);
    escrever("perfil-cargo", cargo);
    escrever("info-email", email);
    escrever("info-telefone", telefone);
    escrever("info-cargo", cargo);
    escrever("info-localizacao", localizacao);
    escrever("info-membro", membroDesde);

  } catch (erro) {
    console.log("Erro ao carregar perfil:", erro);
    alert("Não foi possível carregar as informações do perfil.");
  }
});
