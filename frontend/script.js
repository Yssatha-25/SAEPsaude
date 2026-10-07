const API_URL = "http://localhost:3000";
const LIMITE_POR_PAGINA = 4;

let paginaAtual = 1;
let tipoAtual = null;
let usuarioLogado = null;


async function buscarEmpresa() {
    try {
        const url = usuarioLogado ?
            `${API_URL}/empresa?usuario_id=${usuarioLogado.id_usuario}` :
            `${API_URL}/empresa`;
        const resposta = await fetch(url);
        if (!resposta.ok) throw new Error("Erro ao buscar empresa");
        return await resposta.json();
    } catch (erro) {
        console.error(erro);
        return null;
    }
}

async function buscarAtividades(pagina = 1, tipo = null) {
    try {
        const params = new URLSearchParams({
            page: pagina
        });
        if (tipo) params.append("tipo", tipo);
        if (usuarioLogado) params.append("usuario_id", usuarioLogado.id_usuario);
        const resposta = await fetch(`${API_URL}/atividades?${params}`);
        if (!resposta.ok) throw new Error("Erro ao buscar atividades");
        return await resposta.json();
    } catch (erro) {
        console.error(erro);
        return {
            atividades: [],
            total: 0,
            pagina: 1
        };
    }
}


function escapeHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
}

function exigirLogin() {
    if (usuarioLogado) return true;
    document.getElementById("modal-login").hidden = false;
    return false;
}


function criarCardHtml(a) {
    const km = Number(a.distancia_km).toFixed(2);
    const horas = (Number(a.duracao_min) / 60).toFixed(2);
    return `
        <div class="card-post" data-id="${a.id_atividade}">
            <div class="foto-perfil-post">
                <img src="${escapeHtml(a.foto_usuario)}" alt="foto de ${escapeHtml(a.nome_usuario)}">
            </div>
            <div class="conteudo-post">
                <p><strong>${escapeHtml(a.tipo_atividade)}</strong></p>
                <p>${escapeHtml(a.nome_usuario)}</p>
                <ul>
                    <li>${km} km</li>
                    <li>${horas} h</li>
                    <li>${a.calorias} kcal</li>
                    <li>${a.data_atividade}</li>
                </ul>
            </div>
            <div class="coments-likes-post">
                <button class="btn-curtir"><span class="icone-curtida ${a.curtiu ? "curtido" : ""}"></span>
                    <span class="qtd-curtidas">${Number(a.total_curtidas)}</span></button>
                <button class="btn-comentar"><span class="icone-comentario"></span>
                    <span class="qtd-comentarios">${Number(a.total_comentarios)}</span></button>
            </div>
            <div class="area-comentario" hidden>
                <input type="text" placeholder="Escrever um comentário...">
                <button class="btn-enviar"><img src="img/send.svg" alt="enviar" width="20"></button>
                <span class="erro"></span>
            </div>
        </div>`;
}

function renderizarAtividades(atividades) {
    const container = document.getElementById("lista-atividades");
    container.innerHTML = "";

    if (atividades.length === 0) {
        container.innerHTML = `<p style= "color:#FFFFFF">Nenhuma atividade encontrada.</p>`;
        return;
    }

    atividades.forEach((atividade) => {
        container.insertAdjacentHTML("beforeend", criarCardHtml(atividade));
    });
}


function renderizarPaginacao(total, paginaAtiva) {
    const container = document.getElementById("paginacao");
    container.innerHTML = "";
    const totalPaginas = Math.max(1, Math.ceil(total / LIMITE_POR_PAGINA));

    function botao(texto, pagina, desabilitado = false, ativo = false) {
        const b = document.createElement("button");
        b.textContent = texto;
        b.disabled = desabilitado;
        if (ativo) b.classList.add("ativo");
        b.addEventListener("click", () => {
            if (!exigirLogin()) return;
            paginaAtual = pagina;
            atualizarLista();
        });
        container.appendChild(b);
    }

    botao("Primeira", 1, paginaAtiva === 1);
    botao("Anterior", paginaAtiva - 1, paginaAtiva === 1);
    for (let i = 1; i <= totalPaginas; i++) botao(i, i, false, i === paginaAtiva);
    botao("Próxima", paginaAtiva + 1, paginaAtiva === totalPaginas);
    botao("Última", totalPaginas, paginaAtiva === totalPaginas);
}

function configurarFiltros() {
    document.querySelectorAll("#filtros button").forEach((botao) => {
        botao.addEventListener("click", () => {
            if (!exigirLogin()) return;
            const jaAtivo = botao.classList.contains("ativo");
            document.querySelectorAll("#filtros button").forEach((b) => b.classList.remove("ativo"));
            if (jaAtivo) {
                tipoAtual = null; // clicar de novo limpa o filtro
            } else {
                botao.classList.add("ativo");
                tipoAtual = botao.dataset.tipo;
            }
            paginaAtual = 1;
            atualizarLista();
        });
    });
}


async function atualizarLista() {
    const dados = await buscarAtividades(paginaAtual, tipoAtual);
    renderizarAtividades(dados.atividades);
    renderizarPaginacao(dados.total, dados.pagina);
}

function configurarInteracoes() {
    document.getElementById("lista-atividades").addEventListener("click", async (e) => {
        const card = e.target.closest(".card-post");
        if (!card) return;
        if (!exigirLogin()) return;
        const id = card.dataset.id;

        // CURTIR
        if (e.target.closest(".btn-curtir")) {
            const r = await fetch(`${API_URL}/atividades/${id}/curtir`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    usuario_id: usuarioLogado.id_usuario
                })
            });
            const dados = await r.json();
            card.querySelector(".icone-curtida").classList.toggle("curtido", dados.curtiu);
            card.querySelector(".qtd-curtidas").textContent = dados.total;
        }

        // ABRIR CAMPO DE COMENTÁRIO
        if (e.target.closest(".btn-comentar")) {
            const area = card.querySelector(".area-comentario");
            area.hidden = !area.hidden;
        }

        // ENVIAR COMENTÁRIO
        if (e.target.closest(".btn-enviar")) {
            const input = card.querySelector(".area-comentario input");
            const erro = card.querySelector(".area-comentario .erro");
            const texto = input.value.trim();

            if (texto.length === 0) {
                erro.textContent = "não é possível enviar um comentário vazio";
                return;
            }
            if (texto.length <= 2) {
                erro.textContent = "O comentário precisa ter mais de 2 caracteres";
                return;
            }

            const r = await fetch(`${API_URL}/atividades/${id}/comentarios`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    usuario_id: usuarioLogado.id_usuario,
                    texto
                })
            });
            const dados = await r.json();
            if (!r.ok) {
                erro.textContent = dados.mensagem;
                return;
            }
            erro.textContent = "";
            input.value = "";
            card.querySelector(".qtd-comentarios").textContent = dados.total;
        }
    });
}

async function atualizarPerfil() {
    const empresa = await buscarEmpresa();
    if (!empresa) return;
    document.getElementById("empresa-logo").src = empresa.logo;
    document.getElementById("empresa-nome").textContent = empresa.nome;
    document.getElementById("total-atividades").textContent = empresa.total_atividades;
    document.getElementById("total-calorias").textContent = empresa.total_calorias;
}

async function atualizarInterface() {
    const btn = document.getElementById("botao-login-logout");
    const info = document.getElementById("perfil-info");
    const btnAtv = document.getElementById("perfil-btn-criar-atvd");

    btn.textContent = usuarioLogado ? "Logout" : "Login";
    btn.classList.toggle("logado", !!usuarioLogado);
    info.hidden = !usuarioLogado;
    btnAtv.disabled = !usuarioLogado;
    btnAtv.classList.remove("ativo");

    if (usuarioLogado) {
        document.getElementById("perfil-nome").textContent = usuarioLogado.nome;
        document.getElementById("perfil-foto").src = usuarioLogado.foto;
    }
    mostrarLista();
    await atualizarPerfil();
    await atualizarLista();
}

function mostrarLista() {
    document.getElementById("form-atividade").hidden = true;
    document.getElementById("filtros").hidden = false;
    document.getElementById("lista-atividades").hidden = false;
    document.getElementById("paginacao").hidden = false;
}

function configurarLogin() {
    const modal = document.getElementById("modal-login");
    const email = document.getElementById("login-email");
    const senha = document.getElementById("login-senha");
    const msg = document.getElementById("login-erro");

    function fechar() {
        modal.hidden = true;
        email.value = "";
        senha.value = "";
        msg.textContent = "";
        email.classList.remove("invalido");
        senha.classList.remove("invalido");
    }

    document.getElementById("botao-login-logout").addEventListener("click", () => {
        if (usuarioLogado) { // LOGOUT
            usuarioLogado = null;
            paginaAtual = 1;
            tipoAtual = null;
            document.querySelectorAll("#filtros button").forEach((b) => b.classList.remove("ativo"));
            atualizarInterface();
        } else {
            modal.hidden = false;
        }
    });

    document.getElementById("cancelar-login").addEventListener("click", fechar);
    document.getElementById("fechar-login").addEventListener("click", fechar);

    document.getElementById("form-login").addEventListener("submit", async (e) => {
        e.preventDefault();
        const resp = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email.value,
                senha: senha.value
            })
        });
        const dados = await resp.json();

        if (!resp.ok) {
            msg.textContent = dados.mensagem;
            email.classList.add("invalido");
            senha.classList.add("invalido");
            return;
        }
        usuarioLogado = dados.usuario;
        fechar();
        atualizarInterface();
    });
}

function configurarFormAtividade() {
    const btnAtv = document.getElementById("perfil-btn-criar-atvd");
    const form = document.getElementById("form-criar");

    btnAtv.addEventListener("click", () => {
        if (!exigirLogin()) return;
        btnAtv.classList.add("ativo"); // no CSS: #perfil-btn-criar-atvd.ativo { background-color:#483DAD; }
        document.getElementById("filtros").hidden = true;
        document.getElementById("lista-atividades").hidden = true;
        document.getElementById("paginacao").hidden = true;
        document.getElementById("form-atividade").hidden = false;
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const tipo = document.getElementById("atv-tipo");
        const dist = document.getElementById("atv-distancia");
        const dur = document.getElementById("atv-duracao");
        let valido = true;

        [tipo, dist, dur].forEach((input) => {
            const span = input.nextElementSibling;
            const vazio = input.value.trim() === "";
            input.classList.toggle("invalido", vazio);
            span.textContent = vazio ? "Campo obrigatório" : "";
            if (vazio) valido = false;
        });

        if (valido && !["corrida", "caminhada", "trilha"].includes(tipo.value.trim().toLowerCase())) {
            tipo.classList.add("invalido");
            tipo.nextElementSibling.textContent = "Use apenas corrida, caminhada ou trilha";
            valido = false;
        }
        if (!valido) return;

        const resp = await fetch(`${API_URL}/atividades`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usuario_id: usuarioLogado.id_usuario,
                tipo: tipo.value.trim(),
                distancia: Number(dist.value),
                duracao: Number(dur.value)
            })
        });
        if (!resp.ok) return;

        form.reset();
        paginaAtual = 1;
        tipoAtual = null;
        document.getElementById("perfil-btn-criar-atvd").classList.remove("ativo");
        mostrarLista();
        await atualizarPerfil();
        await atualizarLista(); // a nova atividade aparece primeiro
    });
}

async function iniciar() {
    configurarFiltros();
    configurarInteracoes();
    configurarLogin();
    configurarFormAtividade();
    await atualizarPerfil();
    await atualizarLista();
}

document.addEventListener("DOMContentLoaded", iniciar);