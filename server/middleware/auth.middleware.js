const jwt = require('jsonwebtoken');
const { User, WhiteList } = require('../models');

// Проверка аутентификации
const auth = async (req, res, next) => {
  // Получение токена из заголовка
  const token = req.header('x-auth-token');
  
  // Проверка наличия токена
  if (!token) {
    return res.status(401).json({ message: 'Нет токена, доступ запрещен' });
  }
  
  try {
    // Верификация токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Поиск пользователя
    const user = await User.findByPk(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Неверный токен или неактивный пользователь' });
    }
    
    // Проверка, не истек ли срок действия в белом списке
    const whiteListEntry = await WhiteList.findOne({ 
      where: { 
        discordId: user.discordId, 
        isActive: true 
      } 
    });
    
    if (!whiteListEntry || (whiteListEntry.expirationDate && new Date(whiteListEntry.expirationDate) < new Date())) {
      return res.status(403).json({ message: 'Ваш доступ к приложению истек' });
    }
    
    // Добавление данных пользователя в объект запроса
    req.user = {
      id: user.id,
      role: user.role,
      discordId: user.discordId
    };
    
    next();
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    res.status(401).json({ message: 'Токен недействителен' });
  }
};

// Проверка роли
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Нет аутентификации' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Нет необходимых прав' });
    }
    
    next();
  };
};

module.exports = { auth, checkRole };