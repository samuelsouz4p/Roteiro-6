document.addEventListener("DOMContentLoaded", () => {
    const formularioLocal = document.getElementById("locationForm");
    const listaLocais = document.getElementById("savedLocations");
    const botaoAdicionarLocal = document.getElementById("botaoAdicionarLocal");
    const searchInput = document.getElementById("searchInput"); // Barra de pesquisa

    const URL_API = "http://localhost:3000/locais";

    let idLocalEmEdicao = null; // Variável para armazenar o ID do local que está sendo editado

    formularioLocal.style.display = "none";

    botaoAdicionarLocal.addEventListener("click", () => {
        formularioLocal.style.display = formularioLocal.style.display === "none" ? "block" : "none";
    });

    // Função para carregar locais
    function carregarLocais(query = '') {
        fetch(URL_API)
            .then(resposta => resposta.json())
            .then(dados => {
                listaLocais.innerHTML = "";
                
                // Filtra os locais conforme a pesquisa
                const locaisFiltrados = dados.filter(local => 
                    local.title.toLowerCase().includes(query.toLowerCase())
                );

                locaisFiltrados.forEach(local => adicionarLocalNaDOM(local));
            })
            .catch(erro => console.error("Erro ao carregar locais:", erro));
    }

    // Função para adicionar um local à interface
    function adicionarLocalNaDOM(local) {
        const itemLista = document.createElement("li");
        itemLista.classList.add("list-group-item");
        itemLista.innerHTML = `
            <div class="location-item">
                <img src="${local.imageUrl}" alt="${local.title}" class="location-image">
                <div class="location-details">
                    <div class="location-text">
                        <h5>${local.title}</h5>
                        <p>${local.description}</p>
                    </div>
                    <div class="location-buttons">
                        <button class="btn btn-warning btn-sm edit-btn" data-id="${local.id}">Editar</button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${local.id}">Excluir</button>
                    </div>
                </div>
            </div>
        `;

        itemLista.querySelector(".delete-btn").addEventListener("click", (evento) => {
            const idLocal = evento.target.getAttribute("data-id");
            deletarLocal(idLocal, itemLista);
        });

        itemLista.querySelector(".edit-btn").addEventListener("click", (evento) => {
            const idLocal = evento.target.getAttribute("data-id");
            editarLocal(idLocal);
        });

        listaLocais.appendChild(itemLista);
    }

    // Função para adicionar um novo local
    function adicionarNovoLocal(local) {
        fetch(URL_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(local)
        })
        .then(resposta => resposta.json())
        .then(dado => {
            adicionarLocalNaDOM(dado);
            formularioLocal.reset();
            formularioLocal.style.display = "none";
        })
        .catch(erro => console.error("Erro ao adicionar local:", erro));
    }

    // Função para atualizar um local
    function atualizarLocal(id, local) {
        fetch(`${URL_API}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(local)
        })
        .then(resposta => resposta.json())
        .then(() => {
            carregarLocais();
            formularioLocal.reset();
            formularioLocal.style.display = "none";
            idLocalEmEdicao = null; // Resetar a variável após a atualização
        })
        .catch(erro => console.error("Erro ao atualizar local:", erro));
    }

    // Função para deletar um local
    function deletarLocal(id, itemLista) {
        fetch(`${URL_API}/${id}`, { method: "DELETE" })
            .then(() => {
                itemLista.remove();
            })
            .catch(erro => console.error("Erro ao excluir local:", erro));
    }

    // Função para editar um local
    function editarLocal(id) {
        fetch(`${URL_API}/${id}`)
            .then(resposta => resposta.json())
            .then(local => {
                document.getElementById("title").value = local.title;
                document.getElementById("description").value = local.description;
                document.getElementById("imageUrl").value = local.imageUrl;

                formularioLocal.style.display = "block";

                // Armazenar o ID do local que está sendo editado
                idLocalEmEdicao = id;

                const botaoSubmit = formularioLocal.querySelector("button[type='submit']");
                botaoSubmit.textContent = "Atualizar";

                formularioLocal.onsubmit = (evento) => {
                    evento.preventDefault();
                    const localEditado = {
                        title: document.getElementById("title").value,
                        description: document.getElementById("description").value,
                        imageUrl: document.getElementById("imageUrl").value
                    };

                    atualizarLocal(idLocalEmEdicao, localEditado);
                };
            })
            .catch(erro => console.error("Erro ao buscar local para editar:", erro));
    }

    // Evento de submit do formulário
    formularioLocal.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const novoLocal = {
            title: document.getElementById("title").value,
            description: document.getElementById("description").value,
            imageUrl: document.getElementById("imageUrl").value
        };

        if (idLocalEmEdicao) {
            // Se há um ID de local em edição, atualizamos esse local
            atualizarLocal(idLocalEmEdicao, novoLocal);
        } else {
            // Caso contrário, adicionamos um novo local
            adicionarNovoLocal(novoLocal);
        }
    });

    // Evento de input na barra de pesquisa
    searchInput.addEventListener("input", (evento) => {
        const query = evento.target.value;
        carregarLocais(query); // Filtra os locais conforme o que foi digitado
    });

    carregarLocais(); // Carregar locais inicialmente
});
