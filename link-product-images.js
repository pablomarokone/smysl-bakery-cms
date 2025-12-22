// Скрипт для привязки картинок к продуктам в Strapi по title и имени файла
// Перед использованием: npm install axios

const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';
const API_TOKEN = '0432de976cdbe3fd728c3d9957c6734b1c9350b6890b04d2910b1691dab994e572d0bc4995d8a801b302d7d0a5c5e3e86fe4d0768d961a2142ddc167f7e576972d73dc7d4092b67d2f5e7e6cc0bb68d1f4f0161962fb393e2b73e0dc0fd3aea9e69cba2c08646408ea48f7f566fa5b18e94685e84740e6c9545653c01e5ce939';

// Сопоставление title -> имя файла картинки (добавьте свои соответствия)
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

  // Для каждого продукта ищем файл по title
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
    // Обновляем продукт, привязываем картинку
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
