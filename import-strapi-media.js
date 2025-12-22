// Скрипт для импорта картинок в медиабиблиотеку Strapi через REST API
// Перед использованием: npm install axios form-data

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// === НАСТРОЙКИ ===
const STRAPI_URL = 'http://localhost:1337';
const API_TOKEN = '0432de976cdbe3fd728c3d9957c6734b1c9350b6890b04d2910b1691dab994e572d0bc4995d8a801b302d7d0a5c5e3e86fe4d0768d961a2142ddc167f7e576972d73dc7d4092b67d2f5e7e6cc0bb68d1f4f0161962fb393e2b73e0dc0fd3aea9e69cba2c08646408ea48f7f566fa5b18e94685e84740e6c9545653c01e5ce939';
const DATA_FILE = './entities/entities_00001.jsonl';
const UPLOADS_DIR = './assets/uploads';

// === ЧТЕНИЕ ДАННЫХ ===
const raw = fs.readFileSync(DATA_FILE, 'utf-8');
const lines = raw.split('\n').filter(Boolean);
const files = lines
  .map(line => JSON.parse(line))
  .filter(entry => entry.type === 'plugin::upload.file')
  .map(entry => entry.data)
  .filter(data => data.url && data.name);

// === ИМПОРТ ===
(async () => {
  for (const file of files) {
    const filePath = path.join(UPLOADS_DIR, file.name);
    if (!fs.existsSync(filePath)) {
      console.error('Файл не найден:', filePath);
      continue;
    }
    const form = new FormData();
    form.append('files', fs.createReadStream(filePath), file.name);
    try {
      const res = await axios.post(
        `${STRAPI_URL}/api/upload`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );
      console.log('Загружено:', file.name, res.data);
    } catch (err) {
      console.error('Ошибка загрузки:', file.name, err.response?.data || err.message);
    }
  }
})();
