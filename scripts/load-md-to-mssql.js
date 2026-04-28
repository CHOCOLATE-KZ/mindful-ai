// Скрипт для загрузки markdown-файлов из папки psychology_knowledge в MSSQL (MindfulAI)
// Не влияет на основной проект

const fs = require('fs');
const path = require('path');
const sql = require('mssql');

const dbConfig = {
  server: 'localhost', // или 'LILSUS\\SQLEXPRESS'
  database: 'MindfulAI',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const knowledgeDir = path.join(__dirname, '../psychology_knowledge');

async function insertKnowledge(title, section, content_chunk, keywords) {
  try {
    let pool = await sql.connect(dbConfig);
    await pool.request()
      .input('title', sql.NVarChar(255), title)
      .input('section', sql.NVarChar(255), section)
      .input('content_chunk', sql.NVarChar(sql.MAX), content_chunk)
      .input('keywords', sql.NVarChar(255), keywords)
      .query('INSERT INTO psychology_knowledge (title, section, content_chunk, keywords) VALUES (@title, @section, @content_chunk, @keywords)');
    await sql.close();
  } catch (err) {
    await sql.close();
    console.error('Ошибка вставки:', err);
  }
}

function extractSection(content) {
  // Берём первый заголовок как section
  const match = content.match(/^#\s*(.+)/m);
  return match ? match[1].trim() : 'Общее';
}

function extractKeywords(content) {
  // Простейший вариант: взять 3-5 самых частых слов длиннее 4 букв
  const words = (content.toLowerCase().match(/\b\w{5,}\b/g) || []);
  const freq = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w)
    .join(', ');
}

async function main() {
  const files = fs.readdirSync(knowledgeDir).filter(f => f.endsWith('.md'));
  for (const file of files) {
    const filePath = path.join(knowledgeDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const title = path.basename(file, '.md');
    const section = extractSection(content);
    const keywords = extractKeywords(content);
    // Можно разбивать на чанки, если нужно
    await insertKnowledge(title, section, content, keywords);
    console.log(`Загружено: ${title}`);
  }
  console.log('Готово!');
}

main();
