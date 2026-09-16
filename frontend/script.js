

const API_URL = "http://localhost:3000";
const LIMITE_POR_PAGINA = 4;

let paginaAtual = 1;
let tipoAtual = null;


async function buscarEmpresa() {
    try {
        const resposta = await fetch(`${API_URL}/empresa`);
        if (!resposta.ok) throw new Error("Erro ao buscar empresa");
        return await resposta.json();
    } catch (erro) {
        console.error(erro);
        return null;
    }
}

async function buscarAtividades(pagina = 1, tipo = null) {
    try {
        const params = new URLSearchParams({ page: pagina });
        if (tipo) params.append("tipo", tipo);

        const resposta = await fetch(`${API_URL}/atividades?${params}`);
        if (!resposta.ok) throw new Error("Erro ao buscar atividades");
        return await resposta.json();
    } catch (erro) {
        console.error(erro);
        return { atividades: [], total: 0, pagina: 1 };
    }
}


function escapeHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
}


function criarCardHtml(atividade) {
    return `
        <div class="card-post" data-id="${atividade.id_atividade}">
            <div class="foto-perfil-post">
                <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
                    alt="imagem do post">
            </div>

            <div class="conteudo-post">
                <p><strong>${escapeHtml(atividade.tipo_atividade)}</strong></p>
                <p>@usuario_${atividade.usuario_id}</p>
                <p>${escapeHtml(atividade.descricao)}</p>
                <ul>
                    <li>${Number(atividade.distancia_km).toFixed(1)} km</li>
                    <li>${atividade.duracao_min} min</li>
                </ul>
            </div>

            <div class="coments-likes-post">
                <p><span class="icone-curtida">&#10084;</span> 0</p>
                <p><span class="icone-comentario">&#128172;</span> 0</p>
            </div>
        </div>
    `;
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

    for (let i = 1; i <= totalPaginas; i++) {
        const botao = document.createElement("button");
        botao.textContent = i;
        if (i === paginaAtiva) botao.classList.add("ativo");

        botao.addEventListener("click", () => {
            paginaAtual = i;
            atualizarLista();
        });

        container.appendChild(botao);
    }
}

function configurarFiltros() {
    document.querySelectorAll("#filtros button").forEach((botao) => {
        botao.addEventListener("click", () => {
            document.querySelectorAll("#filtros button")
                .forEach((b) => b.classList.remove("ativo"));
            botao.classList.add("ativo");

            tipoAtual = botao.dataset.tipo || null;
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

async function iniciar() {
    const empresa = await buscarEmpresa();
    if (empresa) {
        document.querySelector("#qntd-atividades strong").textContent =
            empresa.total_atividades;
    }

    configurarFiltros();
    await atualizarLista();
}

document.addEventListener("DOMContentLoaded", iniciar);