# Firebase Firestore

## 1. Criar o projeto

1. Abra o Firebase Console e crie um projeto.
2. Ative o Firestore Database em modo de producao.
3. Escolha a regiao mais proxima do seu bot no Render.
4. Em Project settings > Service accounts, clique em Generate new private key.
5. Nao envie o arquivo JSON para o GitHub.

## 2. Colecao usada pelo bot

O bot usa uma unica colecao chamada `rpg`. O Firestore cria essa colecao
automaticamente quando o primeiro documento for gravado. Nao crie uma colecao
por pais.

Voce tambem nao precisa criar documentos manualmente. Na inicializacao, o
`PaisEngine` verifica os pais RPG definidos em `systems/real-countries-data.js`:

1. Se `rpg/pais_<nome>` nao existir, cria o documento com os dados-base do pais.
2. Se existir, preserva os dados atuais e preenche somente atributos ausentes.
3. Se o pais estiver sob jogador, nao substitui o documento nem o governador.
4. Atualiza `rpg/lista_paises` automaticamente.

Assim, por exemplo, `rpg/pais_brasil` e `rpg/pais_argentina` surgem sozinhos no
primeiro deploy. O mesmo vale para os demais paises configurados no RPG.

Cada chave antiga do quick.db vira um documento:

- Colecao: `rpg`
- Documento: o valor antes do primeiro ponto da chave
- Campo: `value`

Exemplos:

- `pais_brasil` -> documento `pais_brasil`, campo `value` com todo o objeto do pais
- `123456789012345678` -> documento com esse ID, campo `value` com os dados do jogador
- `guerras_ativas` -> documento `guerras_ativas`, campo `value` com o array de guerras
- `ferinha_prefixo_123` -> documento `ferinha_prefixo_123`, campo `value` com o prefixo

Dentro de `value`, os caminhos continuam iguais. Por exemplo, `pais_brasil.tesouro`
continua sendo o campo `value.tesouro` do documento `pais_brasil`.

## 3. Variaveis no Render

Defina estas variaveis no servico Web:

- `TOKEN`: token do bot Discord
- `FIREBASE_SERVICE_ACCOUNT`: conteudo completo, em uma unica linha, do JSON da chave privada
- `FIRESTORE_COLLECTION`: opcional; use `rpg` ou deixe ausente
- `FIRESTORE_DAILY_WRITE_LIMIT`: opcional; por padrao `18000`, nunca aceita mais que `19900`

O adaptador consolida alteracoes por documento e controla uma fila de writes.
Por padrao, ele permite no maximo 18.000 writes por janela de 24 horas do
processo, deixando margem abaixo do limite diario de 20.000. Ao atingir o
limite, as alteracoes ficam pendentes em memoria e nao sao descartadas.
Monitore tambem a pagina de quotas do Google Cloud: se o Render reiniciar o
processo, o contador local reinicia, portanto a quota do projeto continua sendo
a autoridade final para confirmar o consumo diario global.

Para transformar o JSON em uma linha localmente:

```bash
node -e "process.stdout.write(JSON.stringify(require('./firebase-service-account.json')))"
```

Cole a saida inteira no valor de `FIREBASE_SERVICE_ACCOUNT` no Render.

## 4. Migrar o json.sqlite existente (opcional)

Se voce quer iniciar um banco novo, pule esta etapa. Os paises e a estrutura
base serao criados automaticamente pelo engine.

Se precisa preservar jogadores, saldos, guerras e paises do SQLite existente,
execute a migracao uma unica vez em um ambiente que tenha o comando `sqlite3`:

```bash
npm run migrate:sqlite -- ./json.sqlite
```

O comando le a tabela legada `json(ID, json)` e grava cada registro em `rpg/<ID>`.
Ele nao apaga nem altera o SQLite. Rode novamente apenas se quiser sobrescrever os
mesmos documentos com uma copia mais recente.

## 5. Regras do Firestore

O bot usa credencial de servidor e nao deve ser acessado diretamente pelo cliente.
Use regras fechadas:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

O Firebase Admin SDK ignora essas regras e autentica com a service account.

## 6. Deploy

1. Para banco novo, configure as variaveis no Render e faca o deploy.
2. Para preservar o banco antigo, faca a migracao antes do primeiro deploy.
3. Verifique nos logs `[Firestore] N documento(s) carregado(s)`.
4. Verifique tambem os logs `[PaisEngine]` de inicializacao dos paises ausentes.
5. Teste comandos de saldo, pais, economia, guerra, anexacao e libertacao.
6. So depois remova o SQLite antigo do ambiente de hospedagem.

O bot espera o carregamento inicial do Firestore antes de fazer login no Discord.
Se as credenciais estiverem ausentes ou invalidas, o processo falha de proposito para
nao iniciar com um cache vazio e sobrescrever dados.
