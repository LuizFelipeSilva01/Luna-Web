// senha.js — comportamento da página alterar_senha.html
// ATENÇÃO: este arquivo agora é um MÓDULO (precisa de type="module" no HTML),
// porque ele usa "import" para conversar com o Firebase.

import { auth } from "../firebase/firebase.js";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

// 1) Botão do "olho": alterna o campo entre senha (••••) e texto visível
document.querySelectorAll(".ver-senha").forEach(function (botao) {
  botao.addEventListener("click", function () {
    var campo = botao.parentElement.querySelector("input");
    var mostrar = campo.type === "password";
    campo.type = mostrar ? "text" : "password";
    botao.setAttribute("aria-pressed", mostrar ? "true" : "false");
    botao.setAttribute("aria-label", mostrar ? "Ocultar senha" : "Mostrar senha");
    botao.querySelector("img").src = mostrar
      ? "imagens/olho_fechado_icon.svg"
      : "imagens/olho_icon.svg";
  });
});

// 2) Requisitos da senha: cada regra vira verde quando é cumprida
//    (\p{Lu} = maiúscula, \p{Ll} = minúscula, aceitam acentos; flag "u" = unicode)
var regras = {
  tamanho: function (s) { return s.length >= 8; },
  maiuscula: function (s) { return /\p{Lu}/u.test(s); },
  minuscula: function (s) { return /\p{Ll}/u.test(s); },
  numero: function (s) { return /\d/.test(s); },
  especial: function (s) { return /[^\p{L}\d\s]/u.test(s); }
};

var nova = document.getElementById("nova-senha");

function atualizarRequisitos() {
  document.querySelectorAll("#requisitos li").forEach(function (item) {
    var cumprida = regras[item.dataset.regra](nova.value);
    item.classList.toggle("ok", cumprida);
    item.querySelector("img").src = cumprida
      ? "imagens/check_icon.svg"
      : "imagens/no-check_icon.svg";
  });
}

nova.addEventListener("input", atualizarRequisitos);

// 3) Troca de senha de verdade (Firebase Authentication)
var form = document.getElementById("form-senha");
var mensagem = document.getElementById("mensagem-senha");
var botaoEnviar = form.querySelector('button[type="submit"]');

// Mostra uma mensagem acima do botão. tipo = "erro" ou "sucesso"
function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = "mensagem-senha " + tipo;
}

// Traduz o código de erro do Firebase para uma frase em português
function traduzirErro(codigo) {
  switch (codigo) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "A senha atual está incorreta.";
    case "auth/too-many-requests":
      return "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.";
    case "auth/weak-password":
      return "A nova senha é muito fraca. Escolha outra.";
    case "auth/requires-recent-login":
      return "Por segurança, saia da conta, entre novamente e tente de novo.";
    case "auth/network-request-failed":
      return "Sem conexão com a internet. Verifique e tente novamente.";
    default:
      return "Não foi possível alterar a senha. Tente novamente.";
  }
}

form.addEventListener("submit", async function (e) {
  e.preventDefault(); // impede a página de recarregar
  mensagem.textContent = "";
  mensagem.className = "mensagem-senha";

  var senhaAtual = document.getElementById("senha-atual").value;
  var novaSenha = nova.value;
  var confirmacao = document.getElementById("confirma-senha").value;

  // --- Validações feitas na própria página (antes de falar com o Firebase) ---
  if (!senhaAtual || !novaSenha || !confirmacao) {
    mostrarMensagem("Preencha todos os campos.", "erro");
    return;
  }

  var cumpreTodas = Object.keys(regras).every(function (nome) {
    return regras[nome](novaSenha);
  });
  if (!cumpreTodas) {
    mostrarMensagem("A nova senha não cumpre todos os requisitos.", "erro");
    return;
  }

  if (novaSenha !== confirmacao) {
    mostrarMensagem("A confirmação não é igual à nova senha.", "erro");
    return;
  }

  if (novaSenha === senhaAtual) {
    mostrarMensagem("A nova senha deve ser diferente da senha atual.", "erro");
    return;
  }

  // --- Troca no Firebase ---
  botaoEnviar.disabled = true; // evita clicar duas vezes

  try {
    // Espera o Firebase terminar de "lembrar" quem está logado
    await auth.authStateReady();
    var user = auth.currentUser;

    if (!user) {
      window.location.href = "painel_dev.html";
      return;
    }

    // 1º: confirma que quem está digitando conhece a senha atual
    var credencial = EmailAuthProvider.credential(user.email, senhaAtual);
    await reauthenticateWithCredential(user, credencial);

    // 2º: agora sim, grava a nova senha
    await updatePassword(user, novaSenha);

    form.reset();
    atualizarRequisitos(); // volta os requisitos para "não cumpridos"
    mostrarMensagem("Senha alterada com sucesso!", "sucesso");
  } catch (err) {
    console.error(err.code, err.message);
    mostrarMensagem(traduzirErro(err.code), "erro");
  } finally {
    botaoEnviar.disabled = false;
  }
});