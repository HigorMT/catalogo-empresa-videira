const API_URL = "https://script.google.com/macros/s/AKfycby4uj7txE2mCzngQPCOJB7AE87jDvooiOFIXE8BUOowndZ8apZb4mOGHzGooG-iYhZg/exec";

class DadosPlanilha {
    header;
    value;
}

class BasicData {
    endereco_da_empresa;
    nome_da_empresa;
    area_de_atuacao_;
    telefone;
    e_mail;
    nome;
}

class CompleteData extends BasicData {
    tempo_de_atuacao_e_de_experiencia;
    descricao_dos_servicos_prestados;
    natureza_do_trabalho_;
}

let dadosPlanilha = [];
let viewMode = 'grid';

async function carregarDados() {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.style.display = "flex";
    }

    try {
        const response = await fetch(API_URL);
        dadosPlanilha = await response.json();

        renderizarDados(dadosPlanilha);
    } catch (error) {
        console.error("Erro ao buscar dados da planilha:", error);
    } finally {
        if (loader) {
            loader.style.display = "none";
        }
    }
}

function renderizarDados(lista) {
    const container = document.getElementById("companies-grid");
    if (!container) return;
    
    container.innerHTML = "";

    const dadosBasicos = lista;
    
    const resultsCount = document.querySelector('.results-count span');
    if (resultsCount) {
        resultsCount.textContent = `${dadosBasicos.length} empresas encontradas`;
    }

    dadosBasicos.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "company-card";
        
        const categoria = normalizarCategoria(item?.area_de_atuacao_?.value || 'outros');
        card.dataset.category = categoria;

        const telefoneFormatado = formatarTelefone(`${item?.telefone?.value || ''}`);

        card.innerHTML = `
            <div class="card-header">
                <h2 class="company-name">${item?.nome_da_empresa?.value || 'Sem nome'}</h2>
                <span class="category-tag">${capitalizarPrimeiraLetra(categoria)}</span>
            </div>
            <div class="card-content">
                <div class="contact-item">
                    <i class="fas fa-phone"></i>
                    <span>${telefoneFormatado}</span>
                </div>
                <div class="contact-item">
                    <i class="fas fa-envelope"></i>
                    <span>${item?.e_mail?.value || 'Sem e-mail'}</span>
                </div>
            </div>
            <div class="card-actions">
                <button class="action-button whatsapp-button" title="Enviar WhatsApp" data-phone="${item?.telefone?.value || ''}"><i class="fab fa-whatsapp"></i></button>
                <button class="action-button email-button" title="Enviar e-mail"><i class="fas fa-envelope"></i></button>
                <button class="action-button details-button" title="Ver detalhes"><i class="fas fa-info-circle"></i></button>
            </div>
        `;

        card.querySelector('.details-button').addEventListener("click", () => abrirModal(item));
        
        card.querySelector('.whatsapp-button').addEventListener("click", (e) => {
            e.stopPropagation();
            const phone = e.currentTarget.getAttribute('data-phone');
            if (phone) {
                const whatsappNumber = phone.replace(/\D/g, "");
                window.open(`https://wa.me/${whatsappNumber}`, '_blank');
            }
        });

        container.appendChild(card);
    });
    
    adicionarEventosBotoes();
    
    const companyCards = document.querySelectorAll('.company-card');
    companyCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (viewMode === 'grid') {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (viewMode === 'grid') {
                this.style.transform = '';
                this.style.boxShadow = '';
            }
        });
    });
    
    aplicarModoVisualizacao();
}

function aplicarModoVisualizacao() {
    const companiesGrid = document.getElementById("companies-grid");
    const cards = document.querySelectorAll('.company-card');

    if (!cards) return;

    if (viewMode === 'list') {
        companiesGrid.classList.add('list-view');
    } else {
        companiesGrid.classList.remove('list-view');
    }

    cards.forEach(card => {
        card.style.display = (viewMode === 'grid' ? 'block' : 'flex');
    });

    const gridButton = document.querySelector('.view-button:nth-child(1)');
    const listButton = document.querySelector('.view-button:nth-child(2)');
    
    if (gridButton && listButton) {
        if (viewMode === 'grid') {
            gridButton.classList.add('active');
            listButton.classList.remove('active');
        } else {
            gridButton.classList.remove('active');
            listButton.classList.add('active');
        }
    }
}

function abrirModal(item) {
    const modalOverlay = document.getElementById("modal-overlay");
    const modalContent = document.getElementById("modal-content");
    
    if (!modalOverlay || !modalContent) {
        console.error("Elementos do modal não encontrados");
        return;
    }

    const whatsappNumber = `${item?.telefone?.value || ''}`?.replace(/\D/g, "");
    const link = `https://wa.me/${whatsappNumber}`;

    const telefoneFormatado = formatarTelefone(`${item?.telefone?.value || ''}`);
    
    const categoria = normalizarCategoria(item?.area_de_atuacao_?.value || 'outros');
    const corCategoria = obterCorCategoria(categoria);

    modalContent.innerHTML = `
        <div class="modal-header" style="background-color: ${corCategoria}; color: white; padding: 1.5rem; border-radius: 10px 10px 0 0; margin: -2rem -2rem 1.5rem -2rem;">
            <h2 class="nome_empresa">${item?.nome_da_empresa?.value || 'Sem nome'}</h2>
            <span class="category-tag" style="position: absolute; top: 1rem; right: 3rem;">${capitalizarPrimeiraLetra(categoria)}</span>
        </div>
        
        <div class="modal-info-grid">
            <div class="modal-section">
                <h3>Informações de Contato</h3>
                <p id="representante">
                    <strong><i class="fas fa-user"></i> Representante:</strong>
                    <span>${item?.nome?.value || 'Não informado'}</span> 
                </p>
                <p id="telefone_da_empresa" class="copy">
                    <strong><i class="fas fa-phone"></i> Telefone:</strong>
                    <span>${telefoneFormatado}</span>
                    <button id="btn_telefone_da_empresa" class="copy-btn material-symbols-outlined" data-copy="${telefoneFormatado}" title="Copiar telefone">
                        content_copy
                    </button>
                </p>
                <p id="e_mail_da_empresa" class="copy">
                    <strong><i class="fas fa-envelope"></i> E-mail:</strong>
                    <span>${item?.e_mail?.value || 'Não informado'}</span>
                    <button id="btn_e_mail_da_empresa" class="copy-btn material-symbols-outlined" data-copy="${item?.e_mail?.value || ''}" title="Copiar e-mail">
                        content_copy
                    </button>
                </p>
                <p id="endereco_da_empresa">
                    <strong><i class="fas fa-map-marker-alt"></i> Endereço:</strong> 
                    <span>${item?.endereco_da_empresa?.value || 'Não informado'}</span> 
                </p>
            </div>
            
            <div class="modal-section">
                <h3>Detalhes da Empresa</h3>
                <p id="area_de_atuacao_">
                    <strong><i class="fas fa-briefcase"></i> Área de Atuação:&nbsp;</strong>
                    <span>${item?.area_de_atuacao_?.value || 'Não informada'}</span>
                </p>
                <p id="natureza_do_trabalho">
                    <strong><i class="fas fa-building"></i> Natureza:&nbsp;</strong>
                    <span>${item?.natureza_do_trabalho_?.value || 'Não informada'}</span>
                </p>
                <p id="tempo_de_atuacao_e_de_experiencia">
                    <strong><i class="fas fa-clock"></i> Tempo de Atuação: &nbsp;</strong>
                    <span>${item?.tempo_de_atuacao_e_de_experiencia?.value || 'Não informado'}</span> 
                </p>
            </div>
        </div>
        
        <div class="modal-section">
            <h3>Descrição dos Serviços</h3>
            <p id="descricao_dos_servicos_prestados">
                <span>${item?.descricao_dos_servicos_prestados?.value || 'Não informada'}</span> 
            </p>
        </div>

        <div class="modal-actions">
            <a href="${link}" target="_blank" class="modal-action-button whatsapp">
                <i class="fab fa-whatsapp"></i> WhatsApp
            </a>
            <a href="mailto:${item?.e_mail?.value || ''}" class="modal-action-button email">
                <i class="fas fa-envelope"></i> E-mail
            </a>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .modal-info-grid {
            display: grid;
            // grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            margin-bottom: 1.5rem;
        }
        
        .modal-section {
            margin-bottom: 1.5rem;
        }
        
        .modal-section h3 {
            color: ${corCategoria};
            margin-bottom: 1rem;
            font-size: 1.2rem;
            font-weight: 600;
            border-bottom: 1px solid #eee;
            padding-bottom: 0.5rem;
        }
        
        .modal-section p {
            margin-bottom: 0.8rem;
            display: flex;
            align-items: center;
        }
        
        .modal-section p strong {
            min-width: 150px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .modal-section p i {
            color: ${corCategoria};
        }
        
        .modal-actions {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-top: 2rem;
        }
        
        .modal-action-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.8rem 1.5rem;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            min-width: 120px;
        }
        
        .modal-action-button.call {
            background-color: #4CAF50;
            color: white;
        }
        
        .modal-action-button.email {
            background-color: #2196F3;
            color: white;
        }
        
        .modal-action-button.whatsapp {
            background-color: #25D366;
            color: white;
        }
        
        .modal-action-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        @media (max-width: 768px) {
            .modal-info-grid {
                grid-template-columns: 1fr;
            }
            
            .modal-actions {
                flex-direction: column;
            }
            
            .modal-action-button {
                width: 100%;
            }
        }
    `;
    
    modalContent.appendChild(style);
    modalOverlay.classList.remove("hidden");
}

function obterCorCategoria(categoria) {
    const cores = {
        'tecnologia': 'var(--cat-tecnologia)',
        'contabilidade': 'var(--cat-contabilidade)',
        'beleza': 'var(--cat-beleza)',
        'marketing': 'var(--cat-marketing)',
        'servicos': 'var(--cat-servicos)',
        'comercio': 'var(--cat-comercio)',
        'outros': 'var(--cat-outros)'
    };
    
    return cores[categoria] || cores['outros'];
}

function adicionarEventosBotoes() {
    const callButtons = document.querySelectorAll('.call-button');
    const emailButtons = document.querySelectorAll('.email-button');
    
    callButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.company-card');
            const phoneNumber = card.querySelector('.contact-item:nth-child(1) span').textContent.trim();
            window.location.href = `tel:${phoneNumber}`;
        });
    });
    
    emailButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.company-card');
            const emailAddress = card.querySelector('.contact-item:nth-child(2) span').textContent.trim();
            window.location.href = `mailto:${emailAddress}`;
        });
    });
}

function normalizarCategoria(categoria) {
    categoria = categoria.toLowerCase().trim();
    
    if (categoria.includes('tecnologia') || categoria.includes('tech') || categoria.includes('software') || categoria.includes('ti')) {
        return 'tecnologia';
    } else if (categoria.includes('contabil') || categoria.includes('contab') || categoria.includes('financ')) {
        return 'contabilidade';
    } else if (categoria.includes('beleza') || categoria.includes('estética') || categoria.includes('salão')) {
        return 'beleza';
    } else if (categoria.includes('market') || categoria.includes('publicidade') || categoria.includes('divulg')) {
        return 'marketing';
    } else if (categoria.includes('serviço') || categoria.includes('prestação')) {
        return 'servicos';
    } else if (categoria.includes('comércio') || categoria.includes('venda') || categoria.includes('loja')) {
        return 'comercio';
    } else {
        return 'outros';
    }
}

function capitalizarPrimeiraLetra(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatarTelefone(numero) {
    if (!numero) {
        return '';
    }

    const limpo = numero.replace(/\D/g, '');

    if (limpo.length === 11) {
        return limpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    if (limpo.length === 10) {
        return limpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    return numero;
}

document.addEventListener("DOMContentLoaded", function() {
    carregarDados();
    
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    
    function filtrarPorNome() {
        const termo = searchInput.value.toLowerCase();
        const cards = document.querySelectorAll('.company-card');
        
        let contadorVisivel = 0;
        
        cards.forEach(card => {
            const nomeEmpresa = card.querySelector('.company-name').textContent.toLowerCase();
            const conteudoCard = card.querySelector('.card-content').textContent.toLowerCase();
            
            if (nomeEmpresa.includes(termo) || conteudoCard.includes(termo)) {
                card.style.display = (viewMode === 'grid' ? 'block' : 'flex');
                contadorVisivel++;
            } else {
                card.style.display = 'none';
            }
        });
        
        const resultsCount = document.querySelector('.results-count span');
        if (resultsCount) {
            resultsCount.textContent = `${contadorVisivel} empresas encontradas`;
        }
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', filtrarPorNome);
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', filtrarPorNome);
    }
    
    const categoryButtons = document.querySelectorAll('.category-button');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            this.classList.add('active');
            
            const categoria = this.textContent.toLowerCase();
            const cards = document.querySelectorAll('.company-card');
            
            let contadorVisivel = 0;
            
            if (categoria === 'todas') {
                cards.forEach(card => {
                    card.style.display = (viewMode === 'grid' ? 'block' : 'flex');
                    contadorVisivel++;
                });
            } else {
                cards.forEach(card => {
                    if (card.dataset.category === categoria) {
                        card.style.display = (viewMode === 'grid' ? 'block' : 'flex');
                        contadorVisivel++;
                    } else {
                        card.style.display = 'none';
                    }
                });
            }
            
            const resultsCount = document.querySelector('.results-count span');
            if (resultsCount) {
                resultsCount.textContent = `${contadorVisivel} empresas encontradas`;
            }
        });
    });
    
    const viewButtons = document.querySelectorAll('.view-button');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            viewButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            if (this.querySelector('.fa-list')) {
                viewMode = 'list';
            } else {
                viewMode = 'grid';
            }
            
            aplicarModoVisualizacao();
        });
    });
    
    const closeModal = () => {
        const modalOverlay = document.getElementById("modal-overlay");
        if (modalOverlay) {
            modalOverlay.classList.add("hidden");
        }
    };

    document.getElementById("modal-close")?.addEventListener("click", closeModal);
    document.getElementById("modal-overlay")?.addEventListener("click", (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
    
    const navbar = document.getElementById('navbar');
    const searchIcon = document.getElementById('search-icon');
    const timesIcon = document.getElementById('times-icon');
    const searchContainer = document.getElementById('search-container');

    if (searchIcon && timesIcon && searchContainer && navbar) {
        searchIcon.addEventListener('click', () => {
            searchContainer.classList.toggle('hidden');
            timesIcon.classList.toggle('hidden');
            navbar.classList.toggle('expanded');
        });

        timesIcon.addEventListener('click', () => {
            searchContainer.classList.toggle('hidden');
            timesIcon.classList.toggle('hidden');
            navbar.classList.toggle('expanded');
        });
    }
});

document.addEventListener("click", function(e) {
    const target = e.target;

    if (target.matches(".copy-btn")) {
        const textToCopy = target.getAttribute("data-copy");
        if (!textToCopy) return;

        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                target.innerText = "check";
                setTimeout(() => { target.innerText = "content_copy"; }, 1500);
            })
            .catch((err) => {
                console.error("Erro ao copiar:", err);
            });
    }
});
