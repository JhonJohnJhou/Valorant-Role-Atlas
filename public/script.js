const TEMPOS = {
  REVEAL_RESULTADO_MS: 50,
  FECHAR_RESULTADO_MS: 250,
  ROTACAO_CARD_MS: 360,
  TROCA_DESTAQUE_SAIDA_MS: 220,
  ENTRADA_CARDS_MS: 1250,
  ENTRADA_INFO_MS: 480,
};

const CLASSES = {
  ATIVO: 'ativo',
  MODO_INICIAL: 'modo-inicial',
  ROTACIONAR: 'rotacionar',
  RETORNANDO: 'retornando',
  ANIMAR_ENTRADA: 'animar-entrada',
  TROCANDO_SAIDA: 'trocando-saida',
  TROCANDO_ENTRADA: 'trocando-entrada',
  ANIMANDO: 'animando',
};

const DICAS_POR_FUNCAO = {
  iniciador:
    'Iniciadores no Valorant funcionam como os olhos e o suporte tatico da equipe, responsaveis por obter informacoes, limpar cantos e atordoar adversarios para facilitar a entrada dos duelistas. Eles preparam o terreno com ferramentas de reconhecimento (drones, flechas, flashes) e ditam o ritmo, convertendo caos em estrategia.',
  iniciadores:
    'Os iniciadores no Valorant funcionam como os olhos e o suporte tatico da equipe, responsaveis por obter informacoes, limpar cantos e atordoar adversarios para facilitar a entrada dos duelistas. Eles preparam o terreno com ferramentas de reconhecimento (drones, flechas, flashes) e ditam o ritmo, convertendo caos em estrategia.',
  duelista:
    'Duelistas no Valorant sao agentes agressivos focados em criar espaco, conquistar terreno e buscar abates (frags) iniciais para a equipe. Com habilidades auto-suficientes, eles lideram a entrada no bomb, forcando duelos e utilizando recursos para sobreviver ou avancar.',
  duelistas:
    'Duelistas no Valorant sao agentes agressivos focados em criar espaco, conquistar terreno e buscar abates (frags) iniciais para a equipe. Com habilidades auto-suficientes, eles lideram a entrada no bomb, forcando duelos e utilizando recursos para sobreviver ou avancar.',
  controlador:
    'Controladores no Valorant sao especialistas em moldar o campo de batalha, focando no uso estrategico de fumacas (smokes) para bloquear a visao inimiga, limitar angulos perigosos e ditar o ritmo da partida. Eles garantem entrada segura nos sites no ataque e atrasam rushes na defesa.',
  controladores:
    'Controladores no Valorant sao especialistas em moldar o campo de batalha, focando no uso estrategico de fumacas (smokes) para bloquear a visao inimiga, limitar angulos perigosos e ditar o ritmo da partida. Eles garantem entrada segura nos sites no ataque e atrasam rushes na defesa.',
  sentinela:
    'Sentinelas no Valorant sao especialistas em defesa, focados em bloquear areas, vigiar flancos (costas) e coletar informacoes cruciais para o time. Eles "ancoram" locais de bomba, atrasando avancos inimigos com utilitarios e garantindo controle de mapa tanto no ataque quanto na defesa.',
  sentinelas:
    'Sentinelas no Valorant sao especialistas em defesa, focados em bloquear areas, vigiar flancos (costas) e coletar informacoes cruciais para o time. Eles "ancoram" locais de bomba, atrasando avancos inimigos com utilitarios e garantindo controle de mapa tanto no ataque quanto na defesa.',
};

let cardSelecionado = null;
let trocaDestaqueEmAndamento = false;

function $(id) {
  return document.getElementById(id);
}

function esc(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escJsString(texto) {
  return String(texto ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ');
}

async function obterJson(url) {
  try {
    const resposta = await fetch(url);
    let dados = null;

    try {
      dados = await resposta.json();
    } catch {
      dados = null;
    }

    return { ok: resposta.ok, status: resposta.status, dados };
  } catch {
    return { ok: false, status: 0, dados: null };
  }
}

function inicializarEventosBase() {
  const campoPesquisa = $('campoPesquisa');
  if (campoPesquisa) {
    campoPesquisa.addEventListener('keypress', function (evento) {
      if (evento.key === 'Enter') buscar();
    });
  }

  document.addEventListener('keydown', function (evento) {
    if (evento.key !== 'Escape') return;

    const destaque = $('agente-destaque');
    if (destaque?.classList.contains(CLASSES.ATIVO)) {
      fecharDestaque();
    }
  });

  const sobreMim = document.querySelector('.sobre-mim');
  if (sobreMim) {
    sobreMim.addEventListener('toggle', function () {
      if (sobreMim.open) {
        sobreMim.classList.remove(CLASSES.ANIMANDO);
        void sobreMim.offsetWidth;
        sobreMim.classList.add(CLASSES.ANIMANDO);
      } else {
        sobreMim.classList.remove(CLASSES.ANIMANDO);
      }
    });
  }
}

function iniciarPagina() {
  requestAnimationFrame(() => document.body.classList.add('loaded'));
  atualizarModoTelaInicial();
  inicializarEventosBase();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarPagina);
} else {
  iniciarPagina();
}

async function buscar() {
  const campoPesquisa = $('campoPesquisa');
  const divResultado = $('resultado');

  if (!campoPesquisa || !divResultado) return;

  const input = campoPesquisa.value.trim();
  if (!input) return;

  document.body.classList.remove(CLASSES.MODO_INICIAL);
  mostrarBotaoVoltar(false);
  divResultado.classList.remove(CLASSES.ATIVO);
  divResultado.style.display = 'block';

  const urlAgente = `/agente/${encodeURIComponent(input)}`;
  const respostaAgente = await obterJson(urlAgente);

  if (respostaAgente.ok && respostaAgente.dados?.sucesso) {
    const dadosAgente = respostaAgente.dados;
    const urlFuncao = `/funcao/${encodeURIComponent(dadosAgente.funcao)}`;
    const respostaFuncao = await obterJson(urlFuncao);

    if (respostaFuncao.ok && respostaFuncao.dados?.sucesso) {
      setTimeout(() => {
        exibirResultadoFuncao(respostaFuncao.dados);
        exibirAgenteDestaque(dadosAgente, respostaFuncao.dados.agentes);
      }, TEMPOS.REVEAL_RESULTADO_MS);
      return;
    }

    setTimeout(() => {
      divResultado.innerHTML = `
        <img src="${esc(dadosAgente.imagem)}" alt="${esc(dadosAgente.agente)}" class="imagem-agente">
        <p class="funcao-agente">${esc(dadosAgente.funcao)}</p>
        <h2 class="nome-agente">${esc(dadosAgente.agente)}</h2>
        <p class="fala-agente">${esc(dadosAgente.fala)}</p>
      `;
      divResultado.classList.add(CLASSES.ATIVO);
    }, TEMPOS.REVEAL_RESULTADO_MS);
    return;
  }

  const urlFuncao = `/funcao/${encodeURIComponent(input)}`;
  const respostaFuncao = await obterJson(urlFuncao);

  if (respostaFuncao.ok && respostaFuncao.dados?.sucesso) {
    setTimeout(() => exibirResultadoFuncao(respostaFuncao.dados), TEMPOS.REVEAL_RESULTADO_MS);
    return;
  }

  if (respostaAgente.status === 0 && respostaFuncao.status === 0) {
    setTimeout(() => {
      divResultado.innerHTML = "<p class='fala-agente'>Erro ao conectar com o servidor.</p>";
      divResultado.classList.add(CLASSES.ATIVO);
    }, TEMPOS.REVEAL_RESULTADO_MS);
    return;
  }

  setTimeout(() => {
    divResultado.innerHTML = `
      <h2 class="nome-agente" style="color: #ff4655;">Ops!</h2>
      <p class="fala-agente">"${esc(input)}" nao foi encontrado como Agente nem como Funcao.</p>
    `;
    divResultado.classList.add(CLASSES.ATIVO);
  }, TEMPOS.REVEAL_RESULTADO_MS);
}

async function destacarAgente(elementoCard, nomeAgente) {
  if (elementoCard) {
    const grid = elementoCard.closest('.grid-agentes');
    if (grid) grid.classList.remove(CLASSES.ANIMAR_ENTRADA);

    cardSelecionado = elementoCard;
    animarSaidaMiniCard(elementoCard);
  }

  const respostaAgente = await obterJson(`/agente/${encodeURIComponent(nomeAgente)}`);
  if (!(respostaAgente.ok && respostaAgente.dados?.sucesso)) {
    if (elementoCard) elementoCard.classList.remove(CLASSES.ROTACIONAR);
    if (cardSelecionado === elementoCard) cardSelecionado = null;
    return;
  }

  const dadosAgente = respostaAgente.dados;
  const respostaFuncao = await obterJson(`/funcao/${encodeURIComponent(dadosAgente.funcao)}`);
  if (!(respostaFuncao.ok && respostaFuncao.dados?.sucesso)) return;

  setTimeout(() => {
    exibirAgenteDestaque(dadosAgente, respostaFuncao.dados.agentes);
  }, TEMPOS.ROTACAO_CARD_MS);
}

function exibirAgenteDestaque(dadosAgente, listaDaMesmaClasse, opcoes = {}) {
  const seletor = $('seletor-agentes');
  const info = $('info-agente-destaque');
  const destaque = $('agente-destaque');
  if (!seletor || !info || !destaque) return;

  const animarTroca = !!opcoes.animarTroca;
  const agentesDaClasse = Array.isArray(listaDaMesmaClasse) ? listaDaMesmaClasse : [];

  let htmlSeletor = '';
  for (const agente of agentesDaClasse) {
    const classeAtivo = agente.nome === dadosAgente.agente ? CLASSES.ATIVO : '';
    htmlSeletor += `<img src="${esc(agente.imagem)}" class="icone-seletor ${classeAtivo}" onclick="trocarAgenteDestaque('${escJsString(agente.nome)}', '${escJsString(dadosAgente.funcao)}')" title="${esc(agente.nome)}">`;
  }
  seletor.innerHTML = htmlSeletor;

  info.innerHTML = `
    <div class="container-imagem-destaque">
      <img src="${esc(dadosAgente.imagem)}" alt="${esc(dadosAgente.agente)}" class="imagem-agente-grande">
    </div>
    <div class="container-texto-destaque">
      <p class="funcao-agente-grande">${esc(dadosAgente.funcao)}</p>
      <h2 class="nome-agente-grande">${esc(dadosAgente.agente)}</h2>
      <p class="fala-agente-grande">${esc(dadosAgente.fala)}</p>
    </div>
  `;

  info.classList.remove(CLASSES.TROCANDO_SAIDA);
  if (animarTroca) {
    info.classList.remove(CLASSES.TROCANDO_ENTRADA);
    void info.offsetWidth;
    info.classList.add(CLASSES.TROCANDO_ENTRADA);
    setTimeout(() => info.classList.remove(CLASSES.TROCANDO_ENTRADA), TEMPOS.ENTRADA_INFO_MS);
  }

  mostrarBotaoVoltar(false);
  destaque.classList.add(CLASSES.ATIVO);
}

async function trocarAgenteDestaque(nomeAgente, nomeFuncao) {
  if (trocaDestaqueEmAndamento) return;

  const info = $('info-agente-destaque');
  if (!info) return;

  const iconeAtivo = document.querySelector('#seletor-agentes .icone-seletor.ativo');
  if (iconeAtivo?.title === nomeAgente) return;

  try {
    trocaDestaqueEmAndamento = true;
    info.classList.remove(CLASSES.TROCANDO_ENTRADA);
    void info.offsetWidth;
    info.classList.add(CLASSES.TROCANDO_SAIDA);

    const [resAgente, resFuncao] = await Promise.all([
      obterJson(`/agente/${encodeURIComponent(nomeAgente)}`),
      obterJson(`/funcao/${encodeURIComponent(nomeFuncao)}`),
    ]);

    if (resAgente.ok && resAgente.dados?.sucesso && resFuncao.ok && resFuncao.dados?.sucesso) {
      await new Promise((resolve) => setTimeout(resolve, TEMPOS.TROCA_DESTAQUE_SAIDA_MS));
      sincronizarCardSelecionadoNoFundo(nomeAgente);
      exibirAgenteDestaque(resAgente.dados, resFuncao.dados.agentes, { animarTroca: true });
      return;
    }

    info.classList.remove(CLASSES.TROCANDO_SAIDA);
  } catch (erro) {
    info.classList.remove(CLASSES.TROCANDO_SAIDA);
    console.error(erro);
  } finally {
    trocaDestaqueEmAndamento = false;
  }
}

function fecharDestaque() {
  const destaque = $('agente-destaque');
  if (destaque) destaque.classList.remove(CLASSES.ATIVO);

  if (cardSelecionado) {
    animarRetornoMiniCard(cardSelecionado);
    cardSelecionado = null;
  }

  if (estaNaTelaDeFuncao()) {
    mostrarBotaoVoltar(true);
  }
}

function usarSugestao(valor) {
  const campo = $('campoPesquisa');
  if (!campo) return;
  campo.value = valor;
  buscar();
}

function exibirResultadoFuncao(dadosFuncao) {
  const divResultado = $('resultado');
  if (!divResultado || !dadosFuncao?.sucesso || !Array.isArray(dadosFuncao.agentes)) return;

  const dicaFuncao = obterDicaFuncao(dadosFuncao.funcao);
  let htmlDosCards = '<div class="grid-agentes animar-entrada">';

  for (const agente of dadosFuncao.agentes) {
    htmlDosCards += `
      <div class="card-agente-mini" data-agente="${esc(agente.nome)}" onclick="destacarAgente(this, '${escJsString(agente.nome)}')">
        <img src="${esc(agente.imagem)}" alt="${esc(agente.nome)}" class="imagem-mini">
        <p class="nome-mini">${esc(agente.nome)}</p>
      </div>
    `;
  }
  htmlDosCards += '</div>';

  divResultado.innerHTML = `
    <p class="funcao-agente">Classe</p>
    <h2 class="nome-agente">${esc(dadosFuncao.funcao)}</h2>
    ${dicaFuncao ? `<p class="dica-funcao">${esc(dicaFuncao)}</p>` : ''}
    ${htmlDosCards}
  `;

  divResultado.classList.add(CLASSES.ATIVO);
  mostrarBotaoVoltar(true);

  const gridAgentes = divResultado.querySelector('.grid-agentes.animar-entrada');
  if (gridAgentes) {
    setTimeout(() => gridAgentes.classList.remove(CLASSES.ANIMAR_ENTRADA), TEMPOS.ENTRADA_CARDS_MS);
  }
}

function voltarInicio() {
  const divResultado = $('resultado');
  if (!divResultado) return;

  divResultado.classList.remove(CLASSES.ATIVO);
  setTimeout(() => {
    divResultado.innerHTML = '';
    divResultado.style.display = 'none';
    mostrarBotaoVoltar(false);
    atualizarModoTelaInicial();
  }, TEMPOS.FECHAR_RESULTADO_MS);
}

function mostrarBotaoVoltar(visivel) {
  let botao = $('btn-voltar-inicio');

  if (!botao) {
    botao = document.createElement('button');
    botao.id = 'btn-voltar-inicio';
    botao.className = 'btn-voltar-inicio';
    botao.type = 'button';
    botao.setAttribute('aria-label', 'Voltar para a tela inicial');
    botao.textContent = '';
    botao.addEventListener('click', voltarInicio);
    document.body.appendChild(botao);
  }

  botao.style.display = visivel ? 'flex' : 'none';
}

function estaNaTelaDeFuncao() {
  const divResultado = $('resultado');
  return !!(divResultado?.classList.contains(CLASSES.ATIVO) && divResultado.querySelector('.grid-agentes'));
}

function obterDicaFuncao(funcao) {
  if (!funcao) return '';
  const chave = String(funcao).toLowerCase().trim();
  return DICAS_POR_FUNCAO[chave] || '';
}

function atualizarModoTelaInicial() {
  const resultado = $('resultado');
  const estaNaTelaInicial = !(resultado?.classList.contains(CLASSES.ATIVO));
  document.body.classList.toggle(CLASSES.MODO_INICIAL, estaNaTelaInicial);
}

function animarSaidaMiniCard(card) {
  if (!card) return;
  card.classList.remove(CLASSES.RETORNANDO);
  card.classList.remove(CLASSES.ROTACIONAR);
  void card.offsetWidth;
  card.classList.add(CLASSES.ROTACIONAR);
}

function animarRetornoMiniCard(card) {
  if (!card) return;

  card.classList.remove(CLASSES.ROTACIONAR);
  card.classList.remove(CLASSES.RETORNANDO);
  void card.offsetWidth;
  card.classList.add(CLASSES.RETORNANDO);

  const aoFinalizarRetorno = function (evento) {
    if (evento.animationName !== 'rotacionarVolta') return;
    card.classList.remove(CLASSES.RETORNANDO);
    card.removeEventListener('animationend', aoFinalizarRetorno);
  };

  card.addEventListener('animationend', aoFinalizarRetorno);
}

function encontrarMiniCardPorAgente(nomeAgente) {
  const miniCards = document.querySelectorAll('#resultado .card-agente-mini');
  for (const card of miniCards) {
    const nomeNoData = card.getAttribute('data-agente');
    if (nomeNoData === nomeAgente) return card;

    const nomeNoTexto = card.querySelector('.nome-mini')?.textContent?.trim();
    if (nomeNoTexto === nomeAgente) return card;
  }
  return null;
}

function sincronizarCardSelecionadoNoFundo(nomeNovoAgente) {
  const novoCardSelecionado = encontrarMiniCardPorAgente(nomeNovoAgente);
  if (!novoCardSelecionado || cardSelecionado === novoCardSelecionado) return;

  if (cardSelecionado) {
    animarRetornoMiniCard(cardSelecionado);
  }

  animarSaidaMiniCard(novoCardSelecionado);
  cardSelecionado = novoCardSelecionado;
}

window.buscar = buscar;
window.destacarAgente = destacarAgente;
window.trocarAgenteDestaque = trocarAgenteDestaque;
window.fecharDestaque = fecharDestaque;
window.usarSugestao = usarSugestao;
window.voltarInicio = voltarInicio;
