// server/routes/characters.routes.js
const express = require('express');
const router = express.Router();
const { 
  Character, 
  CharacterStat, 
  CharacterSkill, 
  CharacterKnowledge, 
  CharacterInventory,
  CharacterNote,
  Knowledge
} = require('../models');
const { auth, checkRole } = require('../middleware/auth.middleware');
const { Op } = require('sequelize');

// Получение всех персонажей (только для мастера и админа)
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

// Проверка существования персонажа у пользователя
router.get('/check', auth, async (req, res) => {
  try {
    const character = await Character.findOne({
      where: { userId: req.user.id }
    });
    
    res.json({ exists: !!character, characterId: character ? character.id : null });
  } catch (error) {
    console.error('Ошибка при проверке персонажа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение персонажа игрока
router.get('/my', auth, async (req, res) => {
  try {
    const character = await Character.findOne({
      where: { userId: req.user.id },
      include: [
        { 
          model: CharacterStat,
          where: { 
            [Op.or]: [
              { isVisible: true },
              { category: 'derived' }
            ]
          },
          required: false
        },
        { model: CharacterSkill },
        { 
          model: CharacterInventory,
          where: { isEquipped: true },
          required: false
        },
        {
          model: Knowledge,
          through: {
            model: CharacterKnowledge,
            where: { isFullyRevealed: true }
          },
          required: false
        }
      ]
    });
    
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }
    
    res.json(character);
  } catch (error) {
    console.error('Ошибка при получении персонажа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение полной информации о персонаже (для мастера/админа)
router.get('/:id/full', auth, checkRole('admin', 'gamemaster'), async (req, res) => {
  try {
    const character = await Character.findByPk(req.params.id, {
      include: [
        { model: CharacterStat },
        { model: CharacterSkill },
        { model: CharacterInventory },
        { model: CharacterNote },
        {
          model: Knowledge,
          through: {
            model: CharacterKnowledge
          }
        }
      ]
    });
    
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }
    
    res.json(character);
  } catch (error) {
    console.error('Ошибка при получении персонажа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение конкретного персонажа (игрок может видеть только своего)
router.get('/:id', auth, async (req, res) => {
  try {
    const character = await Character.findByPk(req.params.id, {
      include: [
        { 
          model: CharacterStat,
          where: { 
            [Op.or]: [
              { isVisible: true },
              { category: 'derived' }
            ]
          },
          required: false
        },
        { model: CharacterSkill },
        { 
          model: CharacterInventory,
          where: { isEquipped: true },
          required: false
        },
        {
          model: Knowledge,
          through: {
            model: CharacterKnowledge,
            where: { isFullyRevealed: true }
          },
          required: false
        }
      ]
    });
    
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }
    
    // Проверка, принадлежит ли персонаж пользователю или является ли пользователь мастером/админом
    if (character.userId !== req.user.id && !['admin', 'gamemaster'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Нет доступа к этому персонажу' });
    }
    
    res.json(character);
  } catch (error) {
    console.error('Ошибка при получении персонажа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создание персонажа (только для мастера или админа)
router.post('/', auth, checkRole('admin', 'gamemaster'), async (req, res) => {
  try {
    const { userId, name, background, avatarUrl, homeRegion, characterOccupation, baseStats, skills } = req.body;
    
    // Проверяем, есть ли уже персонаж у этого пользователя
    const existingCharacter = await Character.findOne({ where: { userId } });
    if (existingCharacter) {
      return res.status(400).json({ message: 'У пользователя уже есть персонаж' });
    }
    
    // Создание персонажа
    const character = await Character.create({
      userId,
      name,
      background,
      avatarUrl,
      homeRegion,
      characterOccupation
    });
    
    // Добавление базовых характеристик
    if (baseStats && Array.isArray(baseStats)) {
      await Promise.all(baseStats.map(stat => {
        const category = ['СИЛ', 'ЛОВ', 'ВЫН', 'ИНТ', 'ВСП'].includes(stat.name) ? 'basic' : 'hidden';
        const isVisible = category === 'basic';
        
        return CharacterStat.create({
          characterId: character.id,
          name: stat.name,
          value: stat.value,
          isVisible,
          category
        });
      }));
      
      // Расчет и добавление производных характеристик
      await calculateAndAddDerivedStats(character.id, baseStats);
    }
    
    // Добавление навыков
    if (skills && Array.isArray(skills)) {
      await Promise.all(skills.map(skill => 
        CharacterSkill.create({
          characterId: character.id,
          name: skill.name,
          value: skill.value,
          category: skill.category || 'physical'
        })
      ));
    }
    
    // Добавление стартового инвентаря
    const startingInventory = [
      { itemName: 'Простая одежда', itemType: 'misc', description: 'Базовая одежда для начинающего искателя приключений', value: 5 },
      { itemName: 'Маленький нож', itemType: 'weapon', description: 'Базовый урон = СИЛ/2 + 1', value: 10, isEquipped: true },
      { itemName: 'Мешочек с монетами', itemType: 'misc', description: '10 астров', value: 10 },
      { itemName: 'Фляга с водой', itemType: 'consumable', description: 'Достаточно на 1 день', value: 2 },
      { itemName: 'Рацион', itemType: 'consumable', description: 'Еда на 1 день', value: 5 }
    ];
    
    await Promise.all(startingInventory.map(item => 
      CharacterInventory.create({
        characterId: character.id,
        ...item
      })
    ));
    
    // Добавление первой заметки
    await CharacterNote.create({
      characterId: character.id,
      title: 'Первые шаги в Перекрестке Миров',
      content: 'Вы прибыли в Перекресток Миров - нейтральный торговый центр, расположенный на пересечении важнейших путей континента. Город известен своим изменчивым климатом и открытостью для всех рас и культур.',
      category: 'начало истории'
    });
    
    // Получение созданного персонажа со всеми связями
    const newCharacter = await Character.findByPk(character.id, {
      include: [
        { model: CharacterStat },
        { model: CharacterSkill },
        { model: CharacterInventory },
        { model: CharacterNote }
      ]
    });
    
    res.status(201).json(newCharacter);
  } catch (error) {
    console.error('Ошибка при создании персонажа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление базовых характеристик персонажа (только для мастера и админа)
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
      // Собираем базовые статы для последующего расчета производных
      const basicStats = [];
      
      await Promise.all(stats.map(async stat => {
        // Определяем категорию статы
        const category = ['СИЛ', 'ЛОВ', 'ВЫН', 'ИНТ', 'ВСП'].includes(stat.name) ? 'basic' : 
                         ['ВОЛ', 'ХАР', 'РЕЗ', 'БСВ', 'ВСЛ', 'ГАР', 'ИНТЦ', 'МДР', 'УДЧ'].includes(stat.name) ? 'hidden' : 'derived';
        
        // Определяем видимость
        const isVisible = category === 'basic' || (category === 'hidden' && stat.isVisible);
        
        const [characterStat, created] = await CharacterStat.findOrCreate({
          where: { 
            characterId: character.id,
            name: stat.name
          },
          defaults: {
            value: stat.value,
            isVisible,
            category,
            discoveredAt: category === 'hidden' && isVisible ? new Date() : null
          }
        });
        
        if (!created) {
          characterStat.value = stat.value;
          
          // Если скрытый стат стал видимым, обновляем дату открытия
          if (category === 'hidden' && isVisible && !characterStat.isVisible) {
            characterStat.discoveredAt = new Date();
          }
          
          characterStat.isVisible = isVisible;
          await characterStat.save();
        }
        
        if (category === 'basic' || category === 'hidden') {
          basicStats.push({ name: stat.name, value: stat.value });
        }
      }));
      
      // Пересчитываем производные показатели
      if (basicStats.length > 0) {
        await calculateAndAddDerivedStats(character.id, basicStats);
      }
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

// Обновление навыков персонажа
router.put('/:id/skills', auth, checkRole('admin', 'gamemaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const { skills } = req.body;
    
    const character = await Character.findByPk(id);
    
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }
    
    // Обновление навыков
    if (skills && Array.isArray(skills)) {
      await Promise.all(skills.map(async skill => {
        const [characterSkill, created] = await CharacterSkill.findOrCreate({
          where: { 
            characterId: character.id,
            name: skill.name
          },
          defaults: {
            value: skill.value,
            category: skill.category || 'physical',
            experience: skill.experience || 0
          }
        });
        
        if (!created) {
          characterSkill.value = skill.value;
          characterSkill.experience = skill.experience || characterSkill.experience;
          characterSkill.category = skill.category || characterSkill.category;
          
          // Проверка на открытие новых техник
          const newTechniques = checkForNewTechniques(characterSkill.name, skill.value, characterSkill.unlockedTechniques);
          if (newTechniques.length > 0) {
            characterSkill.unlockedTechniques = [...characterSkill.unlockedTechniques, ...newTechniques];
          }
          
          await characterSkill.save();
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
    console.error('Ошибка при обновлении навыков:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавление предмета в инвентарь
router.post('/:id/inventory', auth, checkRole('admin', 'gamemaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const itemData = req.body;
    
    const character = await Character.findByPk(id);
    
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }
    
    // Проверяем наличие такого же предмета
    const existingItem = await CharacterInventory.findOne({
      where: {
        characterId: id,
        itemName: itemData.itemName,
        itemType: itemData.itemType
      }
    });
    
    if (existingItem && itemData.stackable !== false) {
      // Если предмет уже есть и может складываться, увеличиваем количество
      existingItem.quantity += itemData.quantity || 1;
      await existingItem.save();
      
      res.status(200).json(existingItem);
    } else {
      // Иначе добавляем новый предмет
      const newItem = await CharacterInventory.create({
        characterId: id,
        ...itemData
      });
      
      res.status(201).json(newItem);
    }
  } catch (error) {
    console.error('Ошибка при добавлении предмета:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удаление предмета из инвентаря
router.delete('/:characterId/inventory/:itemId', auth, checkRole('admin', 'gamemaster'), async (req, res) => {
  try {
    const { characterId, itemId } = req.params;
    const { quantity } = req.query;
    
    const item = await CharacterInventory.findOne({
      where: {
        id: itemId,
        characterId
      }
    });
    
    if (!item) {
      return res.status(404).json({ message: 'Предмет не найден' });
    }
    
    if (quantity && item.quantity > quantity) {
      // Уменьшаем количество предмета
      item.quantity -= parseInt(quantity);
      await item.save();
      res.json(item);
    } else {
      // Удаляем предмет полностью
      await item.destroy();
      res.json({ message: 'Предмет удален' });
    }
  } catch (error) {
    console.error('Ошибка при удалении предмета:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавление заметки
router.post('/:id/notes', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, isPrivate } = req.body;
    
    const character = await Character.findByPk(id);
    
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }
    
    // Проверяем права доступа (только владелец или мастер/админ)
    if (character.userId !== req.user.id && !['admin', 'gamemaster'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Нет доступа к этому персонажу' });
    }
    
    const note = await CharacterNote.create({
      characterId: id,
      title,
      content,
      category,
      isPrivate: isPrivate || false
    });
    
    res.status(201).json(note);
  } catch (error) {
    console.error('Ошибка при создании заметки:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавление знания персонажу
router.post('/:id/knowledge', auth, checkRole('admin', 'gamemaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const { knowledgeId, discoveryContext, comprehensionLevel, isFullyRevealed } = req.body;
    
    const character = await Character.findByPk(id);
    
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }
    
    // Проверяем, не открыто ли уже это знание
    const existingKnowledge = await CharacterKnowledge.findOne({
      where: {
        characterId: id,
        knowledgeId
      }
    });
    
    if (existingKnowledge) {
      // Обновляем существующую запись
      existingKnowledge.comprehensionLevel = comprehensionLevel || existingKnowledge.comprehensionLevel;
      existingKnowledge.isFullyRevealed = isFullyRevealed !== undefined ? isFullyRevealed : existingKnowledge.isFullyRevealed;
      
      if (discoveryContext) {
        existingKnowledge.discoveryContext = discoveryContext;
      }
      
      await existingKnowledge.save();
      
      res.status(200).json(existingKnowledge);
    } else {
      // Создаем новую запись
      const newKnowledge = await CharacterKnowledge.create({
        characterId: id,
        knowledgeId,
        discoveryContext,
        comprehensionLevel: comprehensionLevel || 1,
        isFullyRevealed: isFullyRevealed !== undefined ? isFullyRevealed : true
      });
      
      res.status(201).json(newKnowledge);
    }
  } catch (error) {
    console.error('Ошибка при добавлении знания:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Вспомогательная функция для расчета производных характеристик
async function calculateAndAddDerivedStats(characterId, baseStats) {
  try {
    // Преобразуем массив статов в объект для удобства обращения
    const statObj = {};
    baseStats.forEach(stat => {
      statObj[stat.name] = stat.value;
    });
    
    // Функция для безопасного получения значения характеристики
    const getStat = (name, defaultValue = 0) => statObj[name] !== undefined ? statObj[name] : defaultValue;
    
    // Расчет производных характеристик на основе формул из документации
    const derivedStats = [
      // Здоровье (ЗД)
      {
        name: 'Здоровье',
        value: 20 + (getStat('ВЫН') * 5) + (getStat('СИЛ') * 2),
        category: 'derived',
        isVisible: true
      },
      // Физическая энергия/Стамина (СТМ)
      {
        name: 'Стамина',
        value: 20 + (getStat('ВЫН') * 3) + (getStat('СИЛ') * 2),
        category: 'derived',
        isVisible: true
      },
      // Аркановая энергия (АЭ)
      {
        name: 'Аркановая энергия',
        value: getStat('РЕЗ') ? (getStat('РЕЗ') * 6) + (getStat('ИНТ') * 3) : (getStat('ИНТ') * 3),
        category: 'derived',
        isVisible: true
      },
      // Внутренняя энергия (ЦИ)
      {
        name: 'Внутренняя энергия',
        value: getStat('ВСЛ') ? (getStat('ВСЛ') * 5) + (getStat('ВЫН') * 3) + (getStat('ВОЛ') * 2) : (getStat('ВЫН') * 3),
        category: 'derived',
        isVisible: true
      },
      // Божественная милость (БМ)
      {
        name: 'Божественная милость',
        value: getStat('БСВ') ? (getStat('БСВ') * 6) + (getStat('ВОЛ') * 3) + (getStat('МДР') * 2) : (getStat('ВОЛ') * 2),
        category: 'derived',
        isVisible: true
      },
      // Природная гармония (ПГ)
      {
        name: 'Природная гармония',
        value: getStat('ГАР') ? (getStat('ГАР') * 6) + (getStat('ВСП') * 3) + (getStat('ИНТ') * 2) : (getStat('ВСП') * 2),
        category: 'derived',
        isVisible: true
      },
      // Ментальная устойчивость (МУ)
      {
        name: 'Ментальная устойчивость',
        value: getStat('ВОЛ') ? 10 + (getStat('ВОЛ') * 4) + (getStat('ИНТ') * 2) : 10 + (getStat('ИНТ') * 2),
        category: 'derived',
        isVisible: true
      }
    ];
    
    // Добавляем или обновляем производные характеристики
    for (const stat of derivedStats) {
      const [derivedStat, created] = await CharacterStat.findOrCreate({
        where: {
          characterId,
          name: stat.name
        },
        defaults: {
          value: stat.value,
          category: 'derived',
          isVisible: true
        }
      });
      
      if (!created) {
        derivedStat.value = stat.value;
        await derivedStat.save();
      }
    }
    
    return true;
  } catch (error) {
    console.error('Ошибка при расчете производных характеристик:', error);
    return false;
  }
}

// Функция для проверки открытия новых техник навыков
function checkForNewTechniques(skillName, skillValue, currentTechniques) {
  // Пороговые значения для техник: 5, 10, 15, 20, 25
  const thresholds = [5, 10, 15, 20, 25];
  const newTechniques = [];
  
  // Техники для различных навыков при достижении пороговых значений
  const skillTechniques = {
    // Примеры для боевых навыков
    'Владение клинками': {
      5: { name: "Точный удар", description: "Способность наносить удары с повышенной точностью (+2 к атаке)" },
      10: { name: "Молниеносная атака", description: "Возможность атаковать первым независимо от инициативы (1 раз за бой)" },
      15: { name: "Серия ударов", description: "Нанесение двух последовательных атак с небольшим штрафом (-2 к каждой)" },
      20: { name: "Критическое рассечение", description: "Повышенный шанс критического удара (+50% к базовому)" },
      25: { name: "Смертельный танец", description: "Смертоносная комбинация из 3 ударов без штрафов" }
    },
    // Пример для навыка алхимии
    'Алхимия': {
      5: { name: "Эффективное использование", description: "20% экономия ингредиентов" },
      10: { name: "Ускоренное приготовление", description: "Сокращение времени создания зелий на 30%" },
      15: { name: "Стабилизация формул", description: "Увеличение срока действия зелий на 50%" },
      20: { name: "Усиленные эффекты", description: "Повышение эффективности создаваемых зелий на 40%" },
      25: { name: "Алхимическое чудо", description: "Создание зелий с эффектами, обычно недоступными алхимии" }
    }
    // Другие навыки и их техники будут добавлены здесь
  };
  
  // Проверяем, есть ли для данного навыка техники
  if (skillTechniques[skillName]) {
    // Проходим по всем пороговым значениям
    for (const threshold of thresholds) {
      // Если значение навыка достигло или превысило порог
      if (skillValue >= threshold) {
        const technique = skillTechniques[skillName][threshold];
        if (technique) {
          // Проверяем, не открыта ли уже эта техника
          const alreadyUnlocked = currentTechniques && currentTechniques.some(t => t.name === technique.name);
          if (!alreadyUnlocked) {
            newTechniques.push({
              ...technique,
              unlockedAt: new Date(),
              threshold
            });
          }
        }
      }
    }
  }
  
  return newTechniques;
}

module.exports = router;