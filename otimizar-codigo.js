// otimizar-codigo.js
const fs = require('fs');
const path = require('path');

// Mapeamento exato de cores antigas do Discord.js para Hexadecimal nativo
const MAPA_CORES = {
    'BLUE': '#3498db',
    'GREEN': '#2ecc71',
    'RED': '#e74c3c',
    'YELLOW': '#f1c40f',
    'ORANGE': '#e67e22',
    'PURPLE': '#9b59b6',
    'GOLD': '#f1c40f',
    'DARK_RED': '#992d22',
    'DARK_ORANGE': '#a84300',
    'AQUA': '#1abc9c',
    'RANDOM': 'Random' // 'Random' com PascalCase funciona nativamente no Discord.js
};

/**
 * Varre pastas recursivamente buscando arquivos .js
  */
function obterArquivosJs(diretorio, listaArquivos = []) {
    const arquivos = fs.readdirSync(diretorio);

    for (const arquivo of arquivos) {
        const caminhoCompleto = path.join(diretorio, arquivo);

        // Ignora a pasta node_modules para não corromper dependências externas
        if (caminhoCompleto.includes('node_modules') || caminhoCompleto.includes('.git')) {
            continue;
        }

        if (fs.statSync(caminhoCompleto).isDirectory()) {
            obterArquivosJs(caminhoCompleto, listaArquivos);
        } else if (arquivo.endsWith('.js')) {
            listaArquivos.push(caminhoCompleto);
        }
    }
    return listaArquivos;
}

function processarEQuiparCodigo() {
    console.log('🤖 Iniciando varredura inteligente do OneBot...');
    const todosArquivos = obterArquivosJs(__dirname);
    let alteracoesCores = 0;
    let correcoesProposta = 0;

    for (const caminho of todosArquivos) {
        let conteudoOriginal = fs.readFileSync(caminho, 'utf8');
        let conteudoModificado = conteudoOriginal;

        // 1. CORREÇÃO DA ENGINE DE PROPOSTAS
        // Converte o caminho para minúsculo para evitar problemas no Linux/Codespaces
        // 1. CORREÇÃO DA ENGINE DE PROPOSTAS (Usando Regex agnóstica de aspas/espaços)
        if (caminho.toLowerCase().includes('pais-engine') || caminho.toLowerCase().includes('pais_engine')) {
            const regexProposta = /if\s*\(\s*proposta\.tipo\s*===\s*['"`]acordo_financeiro['"`]\s*\)/g;

            if (regexProposta.test(conteudoModificado)) {
                conteudoModificado = conteudoModificado.replace(
                    regexProposta,
                    "if (tipoProposta === 'acordo_financeiro')"
                );
                correcoesProposta++;
            }
        }



        // 2. CONVERSÃO INTELIGENTE DE .setColor() PARA HEXADECIMAL
        // Regex captura formatos .setColor('COR'), .setColor("COR") ou .setColor(`COR`)
        const regexColor = /\.setColor\(['"`]([A-Z_]+)['"`]\)/g;

        conteudoModificado = conteudoModificado.replace(regexColor, (match, corCapturada) => {
            if (MAPA_CORES[corCapturada]) {
                alteracoesCores++;
                const valorSubstituto = MAPA_CORES[corCapturada];
                // Se for Random, não põe aspas de string Hex, pois é um método nativo aceito
                if (valorSubstituto === 'Random') {
                    return `.setColor('${valorSubstituto}')`;
                }
                return `.setColor('${valorSubstituto}')`;
            }
            return match; // Se for uma cor não mapeada, ignora com segurança
        });

        // Só grava no disco se o arquivo de fato precisou ser corrigido
        if (conteudoOriginal !== conteudoModificado) {
            fs.writeFileSync(caminho, conteudoModificado, 'utf8');
        }
    }

    console.log('\n✨ --- RELATÓRIO DE INFRAESTRUTURA COMPLETO ---');
    console.log(`✅ Erro de variável 'proposta.tipo' corrigido em: ${correcoesProposta} arquivo(s).`);
    console.log(`🎨 Métodos '.setColor()' atualizados para Hex/Moderno em: ${alteracoesCores} locais.`);
    console.log('------------------------------------------------\n');
}

processarEQuiparCodigo();
