# OneBot — Discord Bot

## Stack
- **Runtime:** Node.js v20
- **Discord:** discord.js v12.5.3
- **Database:** quick.db v7.1.3 (backed by better-sqlite3 v12.9.0 — prebuilt binary at `node_modules/better-sqlite3/build/Release/better_sqlite3.node`)
- **Prefix:** `B!` (via `config.json`)
- **Command loading:** `index.js` dynamically requires `./commands/${command}.js`, calls `commandFile.run(client, message, args)`

## Architecture

### Systems
- `systems/pais-engine.js` — Autonomous country simulation engine (runs every 60s via setInterval)
  - Collects taxes from registered citizens
  - Updates inflation based on economy, agriculture, infrastructure
  - Updates currency exchange rates
  - Processes bilateral trade routes
  - Pays ministry payroll
  - NPC AI decisions (5 autonomous countries)
  - Generates global news events (every 3 ticks)
  - Processes elections/mandate expiry (every 10 ticks)
- `systems/news-templates.js` — News event templates for economics, social, military, agriculture, disasters

### NPC Countries (auto-initialized)
1. **nação-celestial** — commercial personality (Yuan Celestial, $1.40)
2. **império-do-norte** — military personality (Rublo Imperial, $0.90)
3. **república-sul** — agricultural personality (Sol Austral, $0.60)
4. **sultanato-do-leste** — wealth personality (Dinar Dourado, $3.20)
5. **federação-ocidental** — balanced personality (Marco Federal, $2.10)

### Database Keys
- `pais_${nome}` — Country data (tesouro, populacao, infraestrutura, moeda, valorMoeda, agricultura, ministerios, funcionarios, funcionariosIA, rotasComerciais, embargos, sancoes, leisAprovadas, cidadaos, inflacao, etc.)
- `lista_paises` — Array of all country names
- `noticias_globais` — Global news array (max 50)
- `noticias_${pais}` — National news per country (max 30)
- `parlamento_${pais}` — Parliament: leisPendentes, leisAprovadas, leisVetadas
- `onu_votacoes` — UN votes for military operations
- `canal_noticias_globais` — Channel ID for global news
- `canal_noticias_${pais}` — Channel ID for national news
- `${userId}.pais` — User's country
- `${userId}.saldo` — User's balance

## Country Commands

### Base
- `criarpais`, `nomeargovernador`, `registrar-cidadao`, `pagarimposto`, `investir`, `coletar-recursos`, `melhorarinfraestrutura`, `relatorio-investimentos`, `ranking-paises`

### Government & Ministries
- `nomear-funcionario`, `demitir-funcionario`, `ver-funcionarios`
- `abrir-ministerio`, `deletar-ministerio`, `contratar-ministerio`, `ver-ministerios`
- `orcamento`

### Parliament & Laws
- `enviar-lei`, `ver-leis`, `aprovar-lei`, `vetar-lei`

### Trade & Sanctions
- `abrir-rota`, `fechar-rota`, `embargo`, `sancao-economica`, `sancao-militar`

### Military
- `operacao-militar` (ameacar, debate, votar, atacar, status)

### Economy & Population
- `investir-populacao`, `investir-agricultura`, `cambio`

### News
- `noticias-internacionais`, `noticias-nacionais`

### Config
- `setar-canal-noticias`

### Stock Market
- `iniciar-bolsa`, `ver-bolsa`, `comprar-acao`, `vender-acoes`, `acoes`, `resetar-bolsa`
