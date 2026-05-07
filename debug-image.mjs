// Проверяем sez.im статью на наличие og:image
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

// Тестовая статья sez.im
const urls = [
  'https://sez.im/blog_article?art_id=1734358671178x430047394947645400',
  'https://r.jina.ai/https://sez.im/blog',
];

for (const url of urls) {
  console.log('\n--- Тест:', url.slice(0, 60));
  const res = await fetch(url, { headers: HEADERS });
  console.log('Статус:', res.status);
  const html = await res.text();
  console.log('Размер:', html.length);
  
  const og = html.match(/og:image[^>]*content=["']([^"']+)["']/i)
           || html.match(/content=["']([^"']+)["'][^>]*og:image/i);
  console.log('og:image:', og ? og[1] : 'НЕТ');
  
  // Ищем любые картинки
  const imgs = [...html.matchAll(/["'](https?:\/\/[^"']+\.(jpg|jpeg|png|webp)(\?[^"']*)?)['"]/gi)].map(m => m[1]).slice(0, 5);
  console.log('Картинки:', imgs);
}
