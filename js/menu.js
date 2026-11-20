// menu.js — controla o botão ☰ nas telas pequenas.
// Serve para o menu do site (home/informações) e para a sidebar do painel admin.
// Ele só liga/desliga a classe "menu-aberto" no <body>; o visual vem do styles.css.

(function () {
  var botao = document.querySelector(".btn-menu");
  if (!botao) return; // página sem menu (ex.: login): não faz nada

  function definir(aberto) {
    document.body.classList.toggle("menu-aberto", aberto);
    botao.setAttribute("aria-expanded", aberto ? "true" : "false");
  }

  // Clicar no ☰ abre/fecha
  botao.addEventListener("click", function () {
    definir(!document.body.classList.contains("menu-aberto"));
  });

  // Clicar no fundo escuro fecha (o fundo é o ::after do body, então o alvo do clique é o body)
  document.addEventListener("click", function (e) {
    if (e.target === document.body) definir(false);
  });

  // Tecla Esc fecha
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") definir(false);
  });

  // Se a tela crescer (ex.: girar o celular), fecha para não ficar "preso" aberto
  window.addEventListener("resize", function () {
    if (window.innerWidth > 1100) definir(false);
  });
})();
