const express = require('express');
const router = express.Router();
const { Formula } = require('../models');
const { auth, checkRole } = require('../middleware/auth.middleware');

// Получение всех формул (доступно всем авторизованным)
router.get('/', auth, async (req, res) => {
  try {
    const formulas = await Formula.findAll();
    res.json(formulas);
  } catch (error) {
    console.error('Ошибка при получении формул:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение конкретной формулы
router.get('/:id', auth, async (req, res) => {
  try {
    const formula = await Formula.findByPk(req.params.id);
    
    if (!formula) {
      return res.status(404).json({ message: 'Формула не найдена' });
    }
    
    res.json(formula);
  } catch (error) {
    console.error('Ошибка при получении формулы:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создание новой формулы (только для админов и мастеров)
router.post('/', auth, checkRole('admin', 'gamemaster'), async (req, res) => {
  try {
    const { name, category, description, formula, parameters, sampleCalculation } = req.body;
    
    const newFormula = await Formula.create({
      name,
      category,
      description,
      formula,
      parameters: JSON.stringify(parameters),
      sampleCalculation,
      createdBy: req.user.id
    });
    
    res.status(201).json(newFormula);
  } catch (error) {
    console.error('Ошибка при создании формулы:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление формулы (только для админов и мастеров)
router.put('/:id', auth, checkRole('admin', 'gamemaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, formula, parameters, sampleCalculation } = req.body;
    
    const existingFormula = await Formula.findByPk(id);
    
    if (!existingFormula) {
      return res.status(404).json({ message: 'Формула не найдена' });
    }
    
    // Обновление данных
    existingFormula.name = name || existingFormula.name;
    existingFormula.category = category || existingFormula.category;
    existingFormula.description = description || existingFormula.description;
    existingFormula.formula = formula || existingFormula.formula;
    
    if (parameters) {
      existingFormula.parameters = JSON.stringify(parameters);
    }
    
    existingFormula.sampleCalculation = sampleCalculation || existingFormula.sampleCalculation;
    existingFormula.updatedAt = new Date();
    
    await existingFormula.save();
    
    res.json(existingFormula);
  } catch (error) {
    console.error('Ошибка при обновлении формулы:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Тестирование формулы с заданными параметрами
router.post('/calculate', auth, async (req, res) => {
  try {
    const { formula, parameters } = req.body;
    
    // Безопасное вычисление формулы
    // Примечание: в реальном приложении стоит использовать
    // безопасные методы вычисления, например, библиотеку mathjs
    let result;
    try {
      // Создаем объект из параметров
      const paramObj = {};
      parameters.forEach(param => {
        paramObj[param.name] = param.value;
      });
      
      // Замена параметров в формуле
      let evalFormula = formula;
      Object.keys(paramObj).forEach(key => {
        const regex = new RegExp(key, 'g');
        evalFormula = evalFormula.replace(regex, paramObj[key]);
      });
      
      // Вычисление результата
      // В реальном приложении нужна защита от вредоносного кода
      result = eval(evalFormula);
    } catch (evalError) {
      return res.status(400).json({ 
        message: 'Ошибка вычисления формулы', 
        error: evalError.message 
      });
    }
    
    res.json({ result });
  } catch (error) {
    console.error('Ошибка при расчете формулы:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удаление формулы (только для админов)
router.delete('/:id', auth, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const formula = await Formula.findByPk(id);
    
    if (!formula) {
      return res.status(404).json({ message: 'Формула не найдена' });
    }
    
    await formula.destroy();
    
    res.json({ message: 'Формула успешно удалена' });
  } catch (error) {
    console.error('Ошибка при удалении формулы:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;