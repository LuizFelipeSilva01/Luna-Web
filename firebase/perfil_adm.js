import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

// Função ajudante: escreve um texto dentro do elemento que tem aquele id
function escrever(id, texto) {
  const el = document.getElementById(id);
  if (el) el.textContent = texto;
}

onAuthStateChanged(auth, (user) => {
  if (!user) return; // o proteger.js já cuida de mandar para o login

  // Nome: usa o nome da conta; se não tiver, usa a parte do e-mail antes do @
  const nome = user.displayName || user.email.split("@")[0];

  // "Membro desde": data de criação da conta, em português
  const criada = new Date(user.metadata.creationTime);
  let membroDesde = criada.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  membroDesde = membroDesde.charAt(0).toUpperCase() + membroDesde.slice(1);

  // Escrevendo na página
  escrever("topo-nome", nome);
  escrever("perfil-nome", nome);
  escrever("info-email", user.email);
  escrever("info-membro", membroDesde);

  // Foto: só troca se a conta tiver uma foto
  if (user.photoURL) {
    document.getElementById("topo-foto").src = user.photoURL;
    document.getElementById("perfil-foto").src = user.photoURL;
  }
});