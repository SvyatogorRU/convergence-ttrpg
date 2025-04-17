const express = require('express');
const router = express.Router();
const { Campaign, Character, User } = require('../models');
const { auth, checkRole } = require('../middleware/auth.middleware');

// Получение всех кампаний (только для админов)
router.get('/all', auth, checkRole('admin'), async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({
      include: [
        { 
          model: User, 
          as: 'GameMaster',
          attributes: ['id', 'username', 'avatar'] 
        },
        {
          model: Character,
          attributes: ['id', 'name']
        }
      ]
    });
    
    res.json(campaigns);
  } catch (error) {
    console.error('Ошибка при получении кампаний:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение кампаний мастера
router.get('/my', auth, checkRole('admin', 'gamemaster'), async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Character,
          attributes: ['id', 'name', 'userId'],
          include: [
            {
              model: User,
              attributes: ['id', 'username', 'avatar']
            }
          ]
        }
      ]
    });
    
    res.json(campaigns);
  } catch (error) {
    console.error('Ошибка при получении кампаний:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение кампаний, в которых участвует игрок
router.get('/player', auth, async (req, res) => {
  try {
    const characters = await Character.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'campaignId']
    });
    
    const campaignIds = characters.map(char => char.campaignId).filter(id => id);
    
    if (campaignIds.length === 0) {
      return res.json([]);
    }
    
    const campaigns = await Campaign.findAll({
      where: { id: campaignIds },
      include: [
        { 
          model: User, 
          as: 'GameMaster',
          attributes: ['id', 'username', 'avatar'] 
        }
      ]
    });
    
    res.json(campaigns);
  } catch (error) {
    console.error('Ошибка при получении кампаний игрока:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение конкретной кампании
router.get('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id, {
      include: [
        { 
          model: User, 
          as: 'GameMaster',
          attributes: ['id', 'username', 'avatar'] 
        },
        {
          model: Character,
          include: [
            {
              model: User,
              attributes: ['id', 'username', 'avatar']
            }
          ]
        }
      ]
    });
    
    if (!campaign) {
      return res.status(404).json({ message: 'Кампания не найдена' });
    }
    
    // Проверка прав доступа
    const isGameMaster = campaign.userId === req.user.id;
    const isPlayer = campaign.Characters.some(char => char.userId === req.user.id);
    const isAdmin = req.user.role === 'admin';
    
    if (!isGameMaster && !isPlayer && !isAdmin) {
      return res.status(403).json({ message: 'Нет доступа к этой кампании' });
    }
    
    res.json(campaign);
  } catch (error) {
    console.error('Ошибка при получении кампании:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создание новой кампании (только для мастеров)
router.post('/', auth, checkRole('admin', 'gamemaster'), async (req, res) => {
  try {
    const { name, description, setting, isActive } = req.body;
    
    const campaign = await Campaign.create({
      name,
      description,
      setting,
      isActive: isActive !== undefined ? isActive : true,
      userId: req.user.id // ID мастера
    });
    
    res.status(201).json(campaign);
  } catch (error) {
    console.error('Ошибка при создании кампании:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление кампании
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, setting, isActive } = req.body;
    
    const campaign = await Campaign.findByPk(id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Кампания не найдена' });
    }
    
    // Проверка прав доступа (только мастер кампании или админ)
    if (campaign.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Недостаточно прав для изменения кампании' });
    }
    
    // Обновление данных
    campaign.name = name || campaign.name;
    campaign.description = description || campaign.description;
    campaign.setting = setting || campaign.setting;
    campaign.isActive = isActive !== undefined ? isActive : campaign.isActive;
    
    await campaign.save();
    
    res.json(campaign);
  } catch (error) {
    console.error('Ошибка при обновлении кампании:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавление персонажа в кампанию
router.post('/:id/characters', auth, checkRole('admin', 'gamemaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const { characterId } = req.body;
    
    const campaign = await Campaign.findByPk(id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Кампания не найдена' });
    }
    
    // Проверка прав доступа (только мастер кампании или админ)
    if (campaign.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Недостаточно прав для изменения кампании' });
    }
    
    const character = await Character.findByPk(characterId);
    
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }
    
    // Привязка персонажа к кампании
    character.campaignId = id;
    await character.save();
    
    res.json({ message: 'Персонаж добавлен в кампанию' });
  } catch (error) {
    console.error('Ошибка при добавлении персонажа в кампанию:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удаление кампании (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaign = await Campaign.findByPk(id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Кампания не найдена' });
    }
    
    // Проверка прав доступа (только мастер кампании или админ)
    if (campaign.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Недостаточно прав для удаления кампании' });
    }
    
    // Soft delete - просто помечаем как неактивную
    campaign.isActive = false;
    await campaign.save();
    
    res.json({ message: 'Кампания успешно архивирована' });
  } catch (error) {
    console.error('Ошибка при удалении кампании:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;