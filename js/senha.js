// senha.js — comportamento da página alterar_senha.html

(function () {
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
  if (!nova) return;

  nova.addEventListener("input", function () {
    document.querySelectorAll("#requisitos li").forEach(function (item) {
      var cumprida = regras[item.dataset.regra](nova.value);
      item.classList.toggle("ok", cumprida);
      item.querySelector("img").src = cumprida
        ? "imagens/check_icon.svg"
        : "imagens/no-check_icon.svg";
    });
  });

  // 3) Envio: por enquanto só impede a página de recarregar.
  //    A troca real de senha (Firebase) deve ser ligada aqui.
  document.getElementById("form-senha").addEventListener("submit", function (e) {
    e.preventDefault();
  });
})();
