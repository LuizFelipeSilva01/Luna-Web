
// Importando o Firebase
import { auth, db, UID_ADMIN } from "../firebase/firebase.js";

import {
    ref,
    get,
    update
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

// Pegando os campos da página
const nome = document.getElementById("nome");
const email = document.getElementById("email");
const telefone = document.getElementById("telefone");
const cargo = document.getElementById("cargo");
const localizacao = document.getElementById("localizacao");

const btnSalvar = document.getElementById("salvar-perfil");
const mensagem = document.getElementById("carregando-perfil");

// Caminho onde os dados ficam salvos
const perfil = ref(db, "perfil_admin");

// Formata o telefone com DDD
function formatarTelefone(valor) {

    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    if (numeros.length === 0) {
        return "";
    }

    if (numeros.length <= 2) {
        return "(" + numeros + (numeros.length === 2 ? ")" : "");
    }

    const ddd = numeros.slice(0, 2);
    const numero = numeros.slice(2);

    if (numero.length <= 4) {
        return `(${ddd}) ${numero}`;
    }

    if (numero.length <= 8) {
        return `(${ddd}) ${numero.slice(0, 4)}-${numero.slice(4)}`;
    }

    return `(${ddd}) ${numero.slice(0, 5)}-${numero.slice(5)}`;
}

// Formata o telefone enquanto o usuário digita
telefone.addEventListener("input", () => {
    telefone.value = formatarTelefone(telefone.value);
});

// Verifica se está no modo apresentação
const parametros = new URLSearchParams(window.location.search);
const modoApresentacao = parametros.has("apresentacao");

// Verifica quem está conectado
onAuthStateChanged(auth, async (usuario) => {

    // Confere se é o administrador
    if (!usuario || usuario.uid !== UID_ADMIN) {
        return;
    }

    // Deixa os campos vazios na apresentação
    if (modoApresentacao) {
        nome.value = "";
        email.value = "";
        telefone.value = "";
        cargo.value = "";
        localizacao.value = "";
        return;
    }

    try {
        // Mostra a mensagem de carregamento
        mensagem.hidden = false;

        // Busca os dados no Firebase
        const resultado = await get(perfil);

        if (resultado.exists()) {
            const dados = resultado.val();

            // Preenche os campos com os dados encontrados
            nome.value = dados.nome || "";
            email.value = dados.email || usuario.email || "";
            telefone.value = formatarTelefone(dados.telefone || "");
            cargo.value = dados.cargo || "";
            localizacao.value = dados.localizacao || "";

        } else {
            email.value = usuario.email || "";
        }

    } catch (erro) {
        alert("Não foi possível carregar os dados do perfil.");
        console.log(erro);

    } finally {
        // Esconde a mensagem de carregamento
        mensagem.hidden = true;
    }
});

// Quando clicar no botão de salvar
btnSalvar.addEventListener("click", async () => {

    const usuario = auth.currentUser;

    // Confere se é o administrador
    if (!usuario || usuario.uid !== UID_ADMIN) {
        alert("Acesso não autorizado.");
        return;
    }

    // Pega os valores digitados
    const dados = {
        nome: nome.value.trim(),
        email: email.value.trim(),
        telefone: telefone.value.trim(),
        cargo: cargo.value.trim(),
        localizacao: localizacao.value.trim()
    };

    // Verifica se todos os campos foram preenchidos
    if (
        !dados.nome ||
        !dados.email ||
        !dados.telefone ||
        !dados.cargo ||
        !dados.localizacao
    ) {
        alert("Preencha todos os campos.");
        return;
    }

    // Verifica se o e-mail está correto
    if (!email.validity.valid) {
        alert("Digite um e-mail válido.");
        return;
    }

    try {
        // Salva os dados no Firebase
        await update(perfil, dados);

        alert("Perfil atualizado com sucesso!");

        // Sai do modo apresentação após salvar
        if (modoApresentacao) {
            window.history.replaceState(
                null,
                "",
                window.location.pathname
            );
        }

    } catch (erro) {
        alert("Erro ao salvar os dados. Tente novamente.");
        console.log(erro);
    }
});
