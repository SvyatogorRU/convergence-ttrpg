const express = require('express');
const router = express.Router();
const { Character, CharacterStat, CharacterSkill, CharacterKnowledge } = require('../models');
const { auth, checkRole } = require('../middleware/auth.middleware');

// Получение всех персонажей (только для мастера)
router.get('/', auth, checkRole('admin', 'gamemaster'), async (req, res) => {
  try {
    const characters = await Character.findAll({
      include: [
        { model: CharacterStat },
        { model: CharacterSkill }
      ]
    });
    
    res.json(characters);
  } catch (error) {
    console.error('Ошибка при получении персонажей:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение своих персонажей
router.get('/my', auth, async (req, res) => {
  try {
    const characters = await Character.findAll({
      where: { userId: req.user.id },
      include: [
        { model: CharacterStat },
        { model: CharacterSkill }
      ]
    });
    
    res.json(characters);
  } catch (error) {
    console.error('Ошибка при получении персонажей:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение конкретного персонажа
router.get('/:id', auth, async (req, res) => {
  try {
    const character = await Character.findByPk(req.params.id, {
      include: [
        { model: CharacterStat },
        { model: CharacterSkill }
      ]
    });
    
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }
    
    // Проверка, принадлежит ли персонаж пользователю или является ли пользователь мастером
    if (character.userId !== req.user.id && !['admin', 'gamemaster'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Нет доступа к этому персонажу' });
    }
    
    res.json(character);
  } catch (error) {
    console.error('Ошибка при получении персонажа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создание персонажа (только мастером)
router.post('/', auth, checkRole('admin', 'gamemaster'), async (req, res) => {
  try {
    const { name, userId, campaignId, baseStats, skills } = req.body;
    
    // Создание персонажа
    const character = await Character.create({
      name,
      userId,
      campaignId
    });
    
    // Добавление базовых характеристик
    if (baseStats && Array.isArray(baseStats)) {
      await Promise.all(baseStats.map(stat => 
        CharacterStat.create({
          characterId: character.id,
          name: stat.name,
          value: stat.value,
          isVisible: stat.isVisible || true
        })
      ));
    }
    
    // Добавление навыков
    if (skills && Array.isArray(skills)) {
      await Promise.all(skills.map(skill => 
        CharacterSkill.create({
          characterId: character.id,
          name: skill.name,
          value: skill.value
        })
      ));
    }
    
    // Получение созданного персонажа со всеми связями
    const newCharacter = await Character.findByPk(character.id, {
      include: [
        { model: CharacterStat },
        { model: CharacterSkill }
      ]
    });
    
    res.status(201).json(newCharacter);
  } catch (error) {
    console.error('Ошибка при создании персонажа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление характеристик персонажа (только мастером)
router.put('/:id/stats', auth, checkRole('admin', 'gamemaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const { stats } = req.body;
    
    const character = await Character.findByPk(id);
    
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }
    
    // Обновление характеристик
    if (stats && Array.isArray(stats)) {
      await Promise.all(stats.map(async stat => {
        const [characterStat, created] = await CharacterStat.findOrCreate({
          where: { 
            characterId: character.id,
            name: stat.name
          },
          defaults: {
            value: stat.value,
            isVisible: stat.isVisible
          }
        });
        
        if (!created) {
          characterStat.value = stat.value;
          characterStat.isVisible = stat.isVisible;
          await characterStat.save();
        }
      }));
    }
    
    const updatedCharacter = await Character.findByPk(id, {
      include: [
        { model: CharacterStat },
        { model: CharacterSkill }
      ]
    });
    
    res.json(updatedCharacter);
  } catch (error) {
    console.error('Ошибка при обновлении характеристик:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавление знаний персонажу
router.post('/:id/knowledge', auth, checkRole('admin', 'gamemaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const { knowledgeId } = req.body;
    
    const character = await Character.findByPk(id);
    
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }
    
    await CharacterKnowledge.create({
      characterId: id,
      knowledgeId,
      discoveredAt: new Date()
    });
    
    res.status(201).json({ message: 'Знание добавлено персонажу' });
  } catch (error) {
    console.error('Ошибка при добавлении знания:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;