const express = require('express');
const router = express.Router();
const { User, WhiteList, Sequelize } = require('../models');
const { auth, checkRole } = require('../middleware/auth.middleware');
const { Op } = Sequelize;

// Получение всех пользователей (только для админов)
router.get('/', auth, checkRole('admin'), async (req, res) => {
  try {
    const { search, role, status, limit = 50, offset = 0 } = req.query;
    
    // Конструируем условия поиска
    let whereCondition = {};
    
    if (search) {
      whereCondition = {
        [Op.or]: [
          { username: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { discordId: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }
    
    if (role) {
      whereCondition.role = role;
    }
    
    if (status !== undefined) {
      whereCondition.isActive = status === 'active';
    }
    
    // Получаем пользователей с пагинацией и учетом условий
    const users = await User.findAndCountAll({
      where: whereCondition,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['lastLogin', 'DESC']]
    });
    
    res.json({
      total: users.count,
      users: users.rows,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение данных о текущем пользователе
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// *** МАРШРУТЫ БЕЛОГО СПИСКА ***
// Управление белым списком (получение списка) - только для админов
router.get('/whitelist', auth, checkRole('admin'), async (req, res) => {
  try {
    const { search, accessLevel, status, limit = 50, offset = 0 } = req.query;
    
    // Формируем условия поиска
    let whereCondition = {};
    
    if (search) {
      whereCondition.discordId = { [Op.iLike]: `%${search}%` };
    }
    
    if (accessLevel) {
      whereCondition.accessLevel = accessLevel;
    }
    
    if (status !== undefined) {
      whereCondition.isActive = status === 'active';
    }
    
    const whitelist = await WhiteList.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'AddedByUser',
          attributes: ['id', 'username']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['updatedAt', 'DESC']]
    });
    
    res.json({
      total: whitelist.count,
      entries: whitelist.rows,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Ошибка при получении белого списка:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавление в белый список (только для админов)
router.post('/whitelist', auth, checkRole('admin'), async (req, res) => {
  try {
    const { discordId, accessLevel, notes, expirationDate } = req.body;
    
    // Проверка, нет ли уже такой записи
    const existingEntry = await WhiteList.findOne({ where: { discordId } });
    
    if (existingEntry) {
      return res.status(400).json({ message: 'Этот Discord ID уже в белом списке' });
    }
    
    // Проверка и обработка даты истечения
    let validExpirationDate = null;
    if (expirationDate && expirationDate !== 'Invalid date') {
      try {
        // Проверка на валидность даты
        const dateObj = new Date(expirationDate);
        if (!isNaN(dateObj.getTime())) {
          validExpirationDate = dateObj;
        }
      } catch (err) {
        console.log('Ошибка при обработке даты:', err);
      }
    }
    
    const whitelistEntry = await WhiteList.create({
      discordId,
      accessLevel,
      notes,
      expirationDate: validExpirationDate,
      addedBy: req.user.id,
      isActive: true
    });
    
    // Проверяем, есть ли уже такой пользователь в системе
    const existingUser = await User.findOne({ where: { discordId } });
    
    // Если пользователь уже авторизовывался, обновляем его роль
    if (existingUser) {
      existingUser.role = accessLevel;
      await existingUser.save();
    }
    
    res.status(201).json(whitelistEntry);
  } catch (error) {
    console.error('Ошибка при добавлении в белый список:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Изменение статуса в белом списке (только для админов)
router.put('/whitelist/:id', auth, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { accessLevel, notes, expirationDate, isActive } = req.body;
    
    const whitelistEntry = await WhiteList.findByPk(id);
    
    if (!whitelistEntry) {
      return res.status(404).json({ message: 'Запись в белом списке не найдена' });
    }
    
    // Защита привилегированного пользователя
    if (whitelistEntry.discordId === '670742574818132008' && accessLevel !== 'admin') {
      return res.status(403).json({ 
        message: 'Этому пользователю нельзя изменить уровень доступа администратора' 
      });
    }
    
    // Обработка даты истечения
    let validExpirationDate = whitelistEntry.expirationDate;
    if (expirationDate !== undefined) {
      if (expirationDate === null || expirationDate === '') {
        validExpirationDate = null;
      } else if (expirationDate !== 'Invalid date') {
        try {
          const dateObj = new Date(expirationDate);
          if (!isNaN(dateObj.getTime())) {
            validExpirationDate = dateObj;
          }
        } catch (err) {
          console.log('Ошибка при обработке даты:', err);
        }
      }
    }
    
    // Обновление данных
    whitelistEntry.accessLevel = accessLevel || whitelistEntry.accessLevel;
    whitelistEntry.notes = notes !== undefined ? notes : whitelistEntry.notes;
    whitelistEntry.expirationDate = validExpirationDate;
    whitelistEntry.isActive = isActive !== undefined ? isActive : whitelistEntry.isActive;
    
    await whitelistEntry.save();
    
    // Синхронизация роли с пользователем, если он существует
    const user = await User.findOne({ where: { discordId: whitelistEntry.discordId } });
    if (user && accessLevel) {
      user.role = accessLevel;
      await user.save();
    }
    
    res.json(whitelistEntry);
  } catch (error) {
    console.error('Ошибка при обновлении записи в белом списке:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удаление из белого списка (только для админов)
router.delete('/whitelist/:id', auth, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const whitelistEntry = await WhiteList.findByPk(id);
    
    if (!whitelistEntry) {
      return res.status(404).json({ message: 'Запись в белом списке не найдена' });
    }
    
    // Защита привилегированного пользователя
    if (whitelistEntry.discordId === '670742574818132008') {
      return res.status(403).json({ 
        message: 'Этого пользователя нельзя удалить из белого списка' 
      });
    }
    
    await whitelistEntry.destroy();
    
    res.json({ message: 'Запись успешно удалена из белого списка' });
  } catch (error) {
    console.error('Ошибка при удалении из белого списка:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// *** МАРШРУТЫ УПРАВЛЕНИЯ ПОЛЬЗОВАТЕЛЯМИ ***
// Изменение роли пользователя (только для админов)
router.put('/:id/role', auth, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Защита привилегированного пользователя
    if (user.discordId === '670742574818132008' && role !== 'admin') {
      return res.status(403).json({ 
        message: 'Этому пользователю нельзя изменить роль администратора' 
      });
    }
    
    if (!['admin', 'gamemaster', 'player', 'guest'].includes(role)) {
      return res.status(400).json({ message: 'Недопустимая роль' });
    }
    
    // Обновление роли пользователя
    user.role = role;
    await user.save();
    
    // Синхронизация с белым списком
    const whitelistEntry = await WhiteList.findOne({ 
      where: { discordId: user.discordId }
    });
    
    if (whitelistEntry) {
      whitelistEntry.accessLevel = role;
      await whitelistEntry.save();
    }
    
    res.json({ message: 'Роль пользователя успешно обновлена' });
  } catch (error) {
    console.error('Ошибка при обновлении роли пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Изменение статуса активности пользователя (только для админов)
router.put('/:id/status', auth, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    if (isActive === undefined) {
      return res.status(400).json({ message: 'Параметр isActive не указан' });
    }
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Защита привилегированного пользователя
    if (user.discordId === '670742574818132008' && !isActive) {
      return res.status(403).json({ 
        message: 'Этого пользователя нельзя деактивировать' 
      });
    }
    
    user.isActive = isActive;
    await user.save();
    
    // Синхронизация с белым списком
    const whitelistEntry = await WhiteList.findOne({
      where: { discordId: user.discordId }
    });
    
    if (whitelistEntry) {
      whitelistEntry.isActive = isActive;
      await whitelistEntry.save();
    }
    
    res.json({ message: 'Статус пользователя успешно обновлен' });
  } catch (error) {
    console.error('Ошибка при обновлении статуса пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// ВАЖНО: Этот маршрут должен быть в самом конце, чтобы другие маршруты /users/... обрабатывались правильно
// Получение конкретного пользователя (только для админов и мастеров)
router.get('/:id', auth, checkRole('admin', 'gamemaster'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;