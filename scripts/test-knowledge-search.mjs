// scripts/test-knowledge-search.js
// Тестирование функции семантического поиска знаний

import { searchPsychologyKnowledge, getKnowledgeByCategory } from '../src/lib/knowledge-search.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Загрузить .env.local файл
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Ошибка: не установлены переменные окружения NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSearch() {
  console.log('🔍 Тестирование функции поиска психологических знаний...\n');
  
  // Тестовые запросы
  const testQueries = [
    'мне тревожно',
    'не могу спать',
    'грустно мне',
    'медитация',
    'стрессовая ситуация',
    'дыхание техника',
    'депрессия',
    'эмоции',
    'паника',
    'релаксация'
  ];
  
  for (const query of testQueries) {
    console.log(`\n📝 Запрос: "${query}"`);
    console.log('---');
    
    try {
      const result = await searchPsychologyKnowledge(query, 2);
      
      if (result && result.trim()) {
        console.log('✅ Результат найден:');
        console.log(result.substring(0, 300) + '...\n');
      } else {
        console.log('⚠️  Результат не найден (возможно, таблица ещё не заполнена)');
      }
    } catch (error) {
      console.error('❌ Ошибка при поиске:', error.message);
    }
  }
  
  // Проверка таблицы
  console.log('\n\n📊 Информация о таблице psychology_knowledge:');
  console.log('---');
  
  try {
    const { data, error } = await supabase
      .from('psychology_knowledge')
      .select('count()', { count: 'exact' });
    
    if (error) {
      console.error('❌ Ошибка:', error.message);
      console.log('\nВозможно, таблица ещё не создана.');
      console.log('Запустите SQL миграцию: sql/psychology_embeddings.sql');
    } else {
      console.log(`✅ Таблица создана`);
      console.log(`   Записей в таблице: ${data?.[0]?.count || 0}`);
    }
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
  }
  
  // Проверка категорий
  console.log('\n\n📂 Проверка категорий:');
  console.log('---');
  
  try {
    const { data, error } = await supabase
      .from('psychology_knowledge')
      .select('category')
      .distinct();
    
    if (!error && data) {
      const categories = [...new Set(data.map(d => d.category))].filter(Boolean);
      if (categories.length > 0) {
        console.log('✅ Найдены категории:', categories.join(', '));
      } else {
        console.log('⚠️  Категории не найдены (таблица может быть пустой)');
      }
    }
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

testSearch().catch(console.error);
