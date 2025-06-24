const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db; // Variável para armazenar a instância do banco de dados

/**
 * Inicializa o banco de dados e cria a tabela de produtos se não existir.
 * @param {string} appDataPath O caminho para a pasta de dados da aplicação.
 */
function initializeDatabase(appDataPath) {
  const dbPath = path.join(appDataPath, 'pdv.db');
  console.log(`[Product Service] Inicializando banco de dados em: ${dbPath}`);

  try {
    db = new Database(dbPath, { verbose: console.log }); // verbose para ver os comandos SQL no console do Electron
    console.log('[Product Service] Banco de dados conectado com sucesso!');

    // Habilitar WAL mode para melhor performance e concorrência
    db.pragma('journal_mode = WAL');

    // Cria a tabela de produtos se não existir
    db.exec(`
      CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        codigo_barras TEXT UNIQUE,
        referencia TEXT,
        categoria_id INTEGER,
        preco REAL NOT NULL,
        custo REAL,
        estoque_atual INTEGER NOT NULL DEFAULT 0,
        estoque_minimo INTEGER DEFAULT 0,
        ativo INTEGER DEFAULT 1, -- 1 para true, 0 para false
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[Product Service] Tabela "produtos" verificada/criada.');

    // Cria a tabela de categorias se não existir
    db.exec(`
      CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[Product Service] Tabela "categorias" verificada/criada.');

    // Opcional: Adicionar algumas categorias padrão se a tabela estiver vazia
    const categoriesCount = db.prepare('SELECT COUNT(*) FROM categorias').get()['COUNT(*)'];
    if (categoriesCount === 0) {
      console.log('[Product Service] Adicionando categorias padrão...');
      db.prepare('INSERT INTO categorias (nome) VALUES (?)').run('Eletrônicos');
      db.prepare('INSERT INTO categorias (nome) VALUES (?)').run('Alimentos');
      db.prepare('INSERT INTO categorias (nome) VALUES (?)').run('Bebidas');
      db.prepare('INSERT INTO categorias (nome) VALUES (?)').run('Limpeza');
      db.prepare('INSERT INTO categorias (nome) VALUES (?)').run('Papelaria');
      console.log('[Product Service] Categorias padrão adicionadas.');
    }


  } catch (error) {
    console.error('[Product Service] Erro ao inicializar o banco de dados:', error);
    // Em um sistema real, você pode querer fechar a aplicação ou notificar o usuário
  }
}

/**
 * Fecha a conexão com o banco de dados.
 */
function closeDatabase() {
  if (db) {
    db.close();
    console.log('[Product Service] Conexão com o banco de dados fechada.');
  }
}

// --- Funções CRUD para Produtos ---

/**
 * Busca todos os produtos com suas categorias.
 * @returns {Array} Lista de produtos.
 */
function getProdutos() {
  try {
    const stmt = db.prepare(`
      SELECT
        p.id,
        p.nome,
        p.codigo_barras,
        p.referencia,
        p.categoria_id,
        c.nome AS categoria_nome,
        p.preco,
        p.custo,
        p.estoque_atual,
        p.estoque_minimo,
        p.ativo
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.nome ASC
    `);
    return stmt.all();
  } catch (error) {
    console.error('[Product Service] Erro ao buscar produtos:', error);
    throw error;
  }
}

/**
 * Adiciona um novo produto.
 * @param {Object} produto - Dados do produto.
 * @returns {Object} Resultado da inserção.
 */
function createProduto(produto) {
  try {
    const stmt = db.prepare(`
      INSERT INTO produtos (nome, codigo_barras, referencia, categoria_id, preco, custo, estoque_atual, estoque_minimo, ativo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      produto.nome,
      produto.codigo_barras || null,
      produto.referencia || null,
      produto.categoria_id || null,
      parseFloat(produto.preco),
      parseFloat(produto.custo) || null,
      parseInt(produto.estoque_atual),
      parseInt(produto.estoque_minimo) || 0,
      produto.ativo ? 1 : 0
    );
    return { id: info.lastInsertRowid, ...produto };
  } catch (error) {
    console.error('[Product Service] Erro ao criar produto:', error);
    throw error;
  }
}

/**
 * Atualiza um produto existente.
 * @param {Object} produto - Dados do produto a ser atualizado (deve incluir o ID).
 * @returns {Object} Resultado da atualização.
 */
function updateProduto(produto) {
  try {
    const stmt = db.prepare(`
      UPDATE produtos
      SET
        nome = ?,
        codigo_barras = ?,
        referencia = ?,
        categoria_id = ?,
        preco = ?,
        custo = ?,
        estoque_atual = ?,
        estoque_minimo = ?,
        ativo = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const info = stmt.run(
      produto.nome,
      produto.codigo_barras || null,
      produto.referencia || null,
      produto.categoria_id || null,
      parseFloat(produto.preco),
      parseFloat(produto.custo) || null,
      parseInt(produto.estoque_atual),
      parseInt(produto.estoque_minimo) || 0,
      produto.ativo ? 1 : 0,
      produto.id
    );
    if (info.changes === 0) {
      throw new Error(`Produto com ID ${produto.id} não encontrado.`);
    }
    return { message: 'Produto atualizado com sucesso!', changes: info.changes };
  } catch (error) {
    console.error('[Product Service] Erro ao atualizar produto:', error);
    throw error;
  }
}

/**
 * Deleta um produto pelo ID.
 * @param {number} id - ID do produto a ser deletado.
 * @returns {Object} Resultado da exclusão.
 */
function deleteProduto(id) {
  try {
    const stmt = db.prepare('DELETE FROM produtos WHERE id = ?');
    const info = stmt.run(id);
    if (info.changes === 0) {
      throw new Error(`Produto com ID ${id} não encontrado.`);
    }
    return { message: 'Produto excluído com sucesso!', changes: info.changes };
  } catch (error) {
    console.error('[Product Service] Erro ao deletar produto:', error);
    throw error;
  }
}

// --- Funções CRUD para Categorias (para o Select do formulário) ---
/**
 * Busca todas as categorias.
 * @returns {Array} Lista de categorias.
 */
function getCategorias() {
  try {
    const stmt = db.prepare('SELECT id, nome FROM categorias ORDER BY nome ASC');
    return stmt.all();
  } catch (error) {
    console.error('[Product Service] Erro ao buscar categorias:', error);
    throw error;
  }
}


module.exports = {
  initializeDatabase,
  closeDatabase,
  getProdutos,
  createProduto,
  updateProduto,
  deleteProduto,
  getCategorias, // Exporta também a função para buscar categorias
};