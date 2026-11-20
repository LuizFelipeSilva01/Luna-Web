//pagina para verificar a autenticação do usuário
import { auth, UID_ADMIN } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
  // Verifica se o usuário está logado e se o e-mail é exatamente o do administrador
  if (user && user.uid === UID_ADMIN) {
    document.documentElement.style.display = ""; // Libera a visualização da página

  } else if (user) {
    // logado, mas não é o administrador
    await signOut(auth);
    window.location.href = "painel_dev.html?motivo=nao-adm";
  } else {
    // ninguém logado
    window.location.href = "painel_dev.html";
  }
});

// botão Sair
const btnSair = document.getElementById("btn-sair");
if (btnSair) {
  btnSair.addEventListener("click", async (e) => {
    e.preventDefault();
    await signOut(auth);
    window.location.href = "painel_dev.html";
  });
}
