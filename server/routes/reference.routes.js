const express = require('express');
const router = express.Router();
const { ReferenceItem, ReferencePermission, User } = require('../models');
const { auth, checkRole } = require('../middleware/auth.middleware');
const { Op } = require('sequelize');

// Middleware для проверки прав на справочник
const checkReferencePermission = (permissionType) => {
  return async (req, res, next) => {
    try {
      // Администраторы имеют все права
      if (req.user.role === 'admin') {
        return next();
      }

      // Для остальных проверяем наличие соответствующих прав
      const referenceType = req.query.type || req.body.type || 'all';
      
      const permission = await ReferencePermission.findOne({
        where: {
          userId: req.user.id,
          [Op.or]: [
            { referenceType },
            { referenceType: 'all' }
          ]
        }
      });

      if (!permission) {
        return res.status(403).json({ message: 'У вас нет прав доступа к этому типу справочника' });
      }

      // Проверяем конкретный тип права
      if (!permission[permissionType]) {
        return res.status(403).json({ message: `У вас нет ${permissionType} прав для этого типа справочника` });
      }

      next();
    } catch (error) {
      console.error('Ошибка при проверке прав на справочник:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  };
};

// Получение всех элементов справочника по типу
// Доступно админам и мастерам с правами просмотра
router.get('/', auth, checkRole('admin', 'gamemaster'), checkReferencePermission('canView'), async (req, res) => {
  try {
    const { type, category, search, limit = 50, offset = 0 } = req.query;
    
    const whereCondition = {};
    
    if (type) {
      whereCondition.type = type;
    }
    
    if (category) {
      whereCondition.category = category;
    }
    
    if (search) {
      whereCondition.name = {
        [Op.iLike]: `%${search}%`
      };
    }
    
    // Для не-администраторов показываем только публичные элементы или созданные ими
    if (req.user.role !== 'admin') {
      whereCondition[Op.or] = [
        { isPublic: true },
        { createdBy: req.user.id }
      ];
    }
    
    const referenceItems = await ReferenceItem.findAndCountAll({
      where: whereCondition,
      include: [
        { 
          model: User, 
          as: 'Creator',
          attributes: ['id', 'username']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      items: referenceItems.rows,
      total: referenceItems.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Ошибка при получении справочных данных:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение категорий для определенного типа справочника
router.get('/categories', auth, checkRole('admin', 'gamemaster'), async (req, res) => {
  try {
    const { type } = req.query;
    
    if (!type) {
      return res.status(400).json({ message: 'Не указан тип справочника' });
    }
    
    // Получаем уникальные категории для данного типа
    const categories = await ReferenceItem.findAll({
      attributes: ['category'],
      where: {
        type,
        category: {
          [Op.not]: null
        }
      },
      group: ['category']
    });
    
    res.json(categories.map(item => item.category));
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение конкретного элемента справочника
router.get('/:id', auth, checkRole('admin', 'gamemaster'), checkReferencePermission('canView'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const referenceItem = await ReferenceItem.findByPk(id, {
      include: [
        { 
          model: User, 
          as: 'Creator',
          attributes: ['id', 'username']
        }
      ]
    });
    
    if (!referenceItem) {
      return res.status(404).json({ message: 'Элемент справочника не найден' });
    }
    
    // Проверка прав доступа для не-администраторов
    if (req.user.role !== 'admin' && !referenceItem.isPublic && referenceItem.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'У вас нет доступа к этому элементу справочника' });
    }
    
    res.json(referenceItem);
  } catch (error) {
    console.error('Ошибка при получении элемента справочника:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создание нового элемента справочника
router.post('/', auth, checkRole('admin', 'gamemaster'), checkReferencePermission('canCreate'), async (req, res) => {
  try {
    const { name, type, category, description, properties, requirements, isPublic } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ message: 'Необходимо указать название и тип' });
    }
    
    const referenceItem = await ReferenceItem.create({
      name,
      type,
      category,
      description,
      properties: properties || {},
      requirements: requirements || {},
      isPublic: isPublic !== undefined ? isPublic : false,
      createdBy: req.user.id
    });
    
    res.status(201).json(referenceItem);
  } catch (error) {
    console.error('Ошибка при создании элемента справочника:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление элемента справочника
router.put('/:id', auth, checkRole('admin', 'gamemaster'), checkReferencePermission('canEdit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, properties, requirements, isPublic } = req.body;
    
    const referenceItem = await ReferenceItem.findByPk(id);
    
    if (!referenceItem) {
      return res.status(404).json({ message: 'Элемент справочника не найден' });
    }
    
    // Проверка прав доступа для не-администраторов
    if (req.user.role !== 'admin' && referenceItem.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Вы можете редактировать только созданные вами элементы' });
    }
    
    // Обновление полей
    if (name) referenceItem.name = name;
    if (category !== undefined) referenceItem.category = category;
    if (description !== undefined) referenceItem.description = description;
    if (properties) referenceItem.properties = properties;
    if (requirements) referenceItem.requirements = requirements;
    if (isPublic !== undefined) referenceItem.isPublic = isPublic;
    
    await referenceItem.save();
    
    res.json(referenceItem);
  } catch (error) {
    console.error('Ошибка при обновлении элемента справочника:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удаление элемента справочника
router.delete('/:id', auth, checkRole('admin', 'gamemaster'), checkReferencePermission('canDelete'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const referenceItem = await ReferenceItem.findByPk(id);
    
    if (!referenceItem) {
      return res.status(404).json({ message: 'Элемент справочника не найден' });
    }
    
    // Проверка прав доступа для не-администраторов
    if (req.user.role !== 'admin' && referenceItem.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Вы можете удалять только созданные вами элементы' });
    }
    
    await referenceItem.destroy();
    
    res.json({ message: 'Элемент справочника успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении элемента справочника:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// *** МАРШРУТЫ ДЛЯ УПРАВЛЕНИЯ ПРАВАМИ ДОСТУПА К СПРАВОЧНИКАМ ***

// Получение всех прав (только для админов)
router.get('/permissions/all', auth, checkRole('admin'), async (req, res) => {
  try {
    const permissions = await ReferencePermission.findAll({
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'username', 'role']
        },
        {
          model: User,
          as: 'Grantor',
          attributes: ['id', 'username']
        }
      ]
    });
    
    res.json(permissions);
  } catch (error) {
    console.error('Ошибка при получении прав доступа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение прав пользователя
router.get('/permissions/user/:userId', auth, checkRole('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    const permissions = await ReferencePermission.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: 'Grantor',
          attributes: ['id', 'username']
        }
      ]
    });
    
    res.json(permissions);
  } catch (error) {
    console.error('Ошибка при получении прав пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение прав текущего пользователя
router.get('/permissions/my', auth, checkRole('admin', 'gamemaster'), async (req, res) => {
  try {
    const permissions = await ReferencePermission.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: 'Grantor',
          attributes: ['id', 'username']
        }
      ]
    });
    
    res.json(permissions);
  } catch (error) {
    console.error('Ошибка при получении прав пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавление или обновление прав доступа (только для админов)
router.post('/permissions', auth, checkRole('admin'), async (req, res) => {
  try {
    const { userId, referenceType, canView, canCreate, canEdit, canDelete, canGrantAccess } = req.body;
    
    if (!userId || !referenceType) {
      return res.status(400).json({ message: 'Укажите пользователя и тип справочника' });
    }
    
    // Проверяем, что пользователь существует и является мастером
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    if (user.role !== 'gamemaster') {
      return res.status(400).json({ message: 'Права доступа можно выдать только мастеру игры' });
    }
    
    // Проверяем, существуют ли уже права для этого пользователя и типа
    const [permission, created] = await ReferencePermission.findOrCreate({
      where: { userId, referenceType },
      defaults: {
        canView: canView !== undefined ? canView : true,
        canCreate: canCreate !== undefined ? canCreate : false,
        canEdit: canEdit !== undefined ? canEdit : false,
        canDelete: canDelete !== undefined ? canDelete : false,
        canGrantAccess: canGrantAccess !== undefined ? canGrantAccess : false,
        grantedBy: req.user.id
      }
    });
    
    if (!created) {
      // Обновляем существующие права
      if (canView !== undefined) permission.canView = canView;
      if (canCreate !== undefined) permission.canCreate = canCreate;
      if (canEdit !== undefined) permission.canEdit = canEdit;
      if (canDelete !== undefined) permission.canDelete = canDelete;
      if (canGrantAccess !== undefined) permission.canGrantAccess = canGrantAccess;
      
      await permission.save();
    }
    
    res.status(created ? 201 : 200).json(permission);
  } catch (error) {
    console.error('Ошибка при управлении правами доступа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удаление прав доступа (только для админов)
router.delete('/permissions/:id', auth, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const permission = await ReferencePermission.findByPk(id);
    
    if (!permission) {
      return res.status(404).json({ message: 'Права доступа не найдены' });
    }
    
    await permission.destroy();
    
    res.json({ message: 'Права доступа успешно удалены' });
  } catch (error) {
    console.error('Ошибка при удалении прав доступа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;