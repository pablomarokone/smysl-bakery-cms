process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// Универсальный скрипт для выгрузки продуктов, медиа и привязки картинок в облачный Strapi
// Перед использованием: npm install axios form-data

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const STRAPI_URL = 'https://smysl-bakery-cms.onrender.com';
const API_TOKEN = '7b458f48caaac78308e082d521c5bd46b48bff249e8dba1103de1ecc4ae0a4a0a0b98a6bd261ac74f9c5187c5cef93d87594d33dd2781e28b988c111cc5f397440f315cecd7efaf7e7fb8f4e17e144ddfaf9e08f1290f246dfdcc6e6114aadae232c8a9bdc3d735d04bac9edb6d727cbbbb532026522bcdd258d4b265be3b7eb';
const DATA_FILE = './entities/entities_00001.jsonl';
const UPLOADS_DIR = './assets/uploads';

// Сопоставление title -> имя файла картинки
const titleToFile = {
  'Пшеничный': '1.png',
  'Бородинский': '4.png',
  'Фокачча': '7.png',
  'Хала ': '8.png',
  'Цельнозерновой ': '9.png',
  'Ржаной': '6.png',
  'Кукурузный': '5.png',
  'Чиабатта ': '2.png',
  'Багет': '10.png'
};

(async () => {
  // 1. Импорт продуктов
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const lines = raw.split('\n').filter(Boolean);
  const productsData = lines
    .map(line => JSON.parse(line))
    .filter(entry => entry.type === 'api::product.product')
    .map(entry => {
      const { title, description, weight } = entry.data;
      return { title, description, weight };
    });
  for (const entry of productsData) {
    try {
      await axios.post(
        `${STRAPI_URL}/api/products`,
        { data: entry },
        { headers: { Authorization: `Bearer ${API_TOKEN}` } }
      );
      console.log('Импортирован продукт:', entry.title);
    } catch (err) {
      console.error('Ошибка импорта продукта:', entry.title, err.response?.data || err.message);
    }
  }

  // 2. Импорт медиафайлов
  const filesData = lines
    .map(line => JSON.parse(line))
    .filter(entry => entry.type === 'plugin::upload.file')
    .map(entry => entry.data)
    .filter(data => data.url && data.name);
  for (const file of filesData) {
    const filePath = path.join(UPLOADS_DIR, file.name);
    if (!fs.existsSync(filePath)) {
      console.error('Файл не найден:', filePath);
      continue;
    }
    const form = new FormData();
    form.append('files', fs.createReadStream(filePath), file.name);
    try {
      await axios.post(
        `${STRAPI_URL}/api/upload`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );
      console.log('Загружено изображение:', file.name);
    } catch (err) {
      console.error('Ошибка загрузки:', file.name, err.response?.data || err.message);
    }
  }

  // 3. Привязка картинок к продуктам
  // Получаем все продукты
  const productsRes = await axios.get(`${STRAPI_URL}/api/products?pagination[pageSize]=100`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` }
  });
  const products = productsRes.data.data;
  // Получаем все файлы
  const filesRes = await axios.get(`${STRAPI_URL}/api/upload/files?pagination[pageSize]=100`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` }
  });
  const files = filesRes.data;
  for (const product of products) {
    if (!product.attributes || !product.attributes.title) {
      console.log('Пропущен продукт без title:', product);
      continue;
    }
    const fileName = titleToFile[product.attributes.title];
    if (!fileName) {
      console.log('Нет соответствия для', product.attributes.title);
      continue;
    }
    const file = files.find(f => f.name === fileName);
    if (!file) {
      console.log('Файл не найден для', product.attributes.title, fileName);
      continue;
    }
    try {
      await axios.put(
        `${STRAPI_URL}/api/products/${product.id}`,
        { data: { product_photo: file.id } },
        { headers: { Authorization: `Bearer ${API_TOKEN}` } }
      );
      console.log('Привязано:', product.attributes.title, '->', fileName);
    } catch (err) {
      console.error('Ошибка привязки:', product.attributes.title, err.response?.data || err.message);
    }
  }
})();
