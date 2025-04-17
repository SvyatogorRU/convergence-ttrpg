const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, { 
    query: req.query,
    body: req.body,
    headers: req.headers
  });
  next();
});


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // 100 запросов с одного IP
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Маршруты
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/characters', require('./routes/characters.routes'));
app.use('/api/formulas', require('./routes/formulas.routes'));
app.use('/api/campaigns', require('./routes/campaigns.routes'));


// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Что-то пошло не так!');
});

// Запуск сервера
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Соединение с базой данных установлено');
    
    await sequelize.sync({ alter: true }); // Используем alter для обновления схемы
    console.log('Модели синхронизированы с базой данных');
    
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  } catch (error) {
    console.error('Не удалось запустить сервер:', error);
  }
}

startServer();