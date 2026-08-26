const { execFileSync } = require('child_process');
const path = require('path');
const db = require('../systems/firestore');

const sqliteFile = process.argv[2] || path.resolve(process.cwd(), 'json.sqlite');

async function main() {
    await db.ready;
    const rows = JSON.parse(execFileSync('sqlite3', ['-json', sqliteFile, 'select ID, json from json;'], { encoding: 'utf8' }));
    let migrated = 0;

    for (const row of rows) {
        if (!row.ID) continue;
        let value;
        try {
            value = JSON.parse(row.json);
        } catch {
            value = row.json;
        }
        db.set(row.ID, value);
        migrated++;
    }

    await db.flush();
    console.log(`[Migração] ${migrated} registro(s) enviados para o Firestore.`);
}

main().catch((error) => {
    console.error('[Migração] Falha:', error);
    process.exitCode = 1;
});
