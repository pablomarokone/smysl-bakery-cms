// Скрипт для массового импорта данных в Strapi через REST API
// Перед использованием: npm install axios

const axios = require('axios');
const fs = require('fs');

// === НАСТРОЙКИ ===
const STRAPI_URL = 'http://localhost:1337'; // URL вашего Strapi
const API_TOKEN = '0432de976cdbe3fd728c3d9957c6734b1c9350b6890b04d2910b1691dab994e572d0bc4995d8a801b302d7d0a5c5e3e86fe4d0768d961a2142ddc167f7e576972d73dc7d4092b67d2f5e7e6cc0bb68d1f4f0161962fb393e2b73e0dc0fd3aea9e69cba2c08646408ea48f7f566fa5b18e94685e84740e6c9545653c01e5ce939'; // Админ-токен (создайте в админке Strapi)
const COLLECTION = 'product'; // Имя коллекции (например, product, deserty и т.д.)
const DATA_FILE = './entities/entities_00001.jsonl'; // Путь к вашему .jsonl или .json

// === ЧТЕНИЕ ДАННЫХ ===
const raw = fs.readFileSync(DATA_FILE, 'utf-8');
const lines = raw.split('\n').filter(Boolean);
const data = lines
  .map(line => JSON.parse(line))
  .filter(entry => entry.type === 'api::product.product')
  .map(entry => {
    const { title, description, weight } = entry.data;
    return { title, description, weight };
  });

// === ИМПОРТ ===
(async () => {
  for (const entry of data) {
    try {
      const res = await axios.post(
        `${STRAPI_URL}/api/${COLLECTION}s`,
        { data: entry },
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );
      console.log('Импортировано:', res.data);
    } catch (err) {
      console.error('Ошибка импорта:', err);
    }
  }
})();
