// client/src/components/formula/FormulaCalculator.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Calculate as CalculateIcon,
  Info as InfoIcon,
  Save as SaveIcon,
  BookmarkAdd as BookmarkAddIcon,
  History as HistoryIcon,
  Science as ScienceIcon,
  FileUpload as FileUploadIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { formulaService } from '../../services/api';

// Категории формул
const formulaCategories = [
  { id: 'core', name: 'Основные системы' },
  { id: 'combat', name: 'Боевая система' },
  { id: 'skills', name: 'Проверки навыков' },
  { id: 'magic', name: 'Магические эффекты' },
  { id: 'economy', name: 'Экономика и торговля' },
  { id: 'crafting', name: 'Крафтинг' },
  { id: 'custom', name: 'Пользовательские формулы' }
];

// Пример формул
const mockFormulas = [
  {
    id: 'f1',
    name: 'Базовая атака ближнего боя',
    description: 'Рассчитывает значение атаки для ближнего боя на основе характеристик персонажа и навыков',
    category: 'combat',
    formula: '(СИЛ * 1.5) + (ЛОВ * 0.5) + (Навык_оружия * 2) + Бонус_оружия + Тактический_модификатор',
    parameters: [
      { name: 'СИЛ', description: 'Сила персонажа', type: 'number', defaultValue: 10 },
      { name: 'ЛОВ', description: 'Ловкость персонажа', type: 'number', defaultValue: 10 },
      { name: 'Навык_оружия', description: 'Уровень навыка владения оружием', type: 'number', defaultValue: 5 },
      { name: 'Бонус_оружия', description: 'Бонус атаки от оружия', type: 'number', defaultValue: 0 },
      { name: 'Тактический_модификатор', description: 'Бонус от тактического преимущества', type: 'number', defaultValue: 0 }
    ],
    sampleCalculation: 'Для персонажа с СИЛ 14, ЛОВ 12, Навык_оружия 3, Бонус_оружия 2:\n(14 * 1.5) + (12 * 0.5) + (3 * 2) + 2 = 21 + 6 + 6 + 2 = 35',
    creator: 'system',
    isPrivate: false,
    createdAt: '2025-01-10',
    updatedAt: '2025-02-15'
  },
  {
    id: 'f2',
    name: 'Расчет защиты от физических атак',
    description: 'Определяет значение защиты от физического урона',
    category: 'combat',
    formula: '(ЛОВ * 1) + (СИЛ * 0.5) + (Навык_уклонения * 1.5) + Защита_брони + Защита_щита + Тактический_модификатор',
    parameters: [
      { name: 'ЛОВ', description: 'Ловкость персонажа', type: 'number', defaultValue: 10 },
      { name: 'СИЛ', description: 'Сила персонажа', type: 'number', defaultValue: 10 },
      { name: 'Навык_уклонения', description: 'Уровень навыка уклонения', type: 'number', defaultValue: 2 },
      { name: 'Защита_брони', description: 'Показатель защиты брони', type: 'number', defaultValue: 4 },
      { name: 'Защита_щита', description: 'Показатель защиты щита', type: 'number', defaultValue: 0 },
      { name: 'Тактический_модификатор', description: 'Бонус от тактического преимущества', type: 'number', defaultValue: 0 }
    ],
    sampleCalculation: 'Для персонажа с ЛОВ 13, СИЛ 10, Навык_уклонения 2, Защита_брони 4:\n(13 * 1) + (10 * 0.5) + (2 * 1.5) + 4 = 13 + 5 + 3 + 4 = 25',
    creator: 'system',
    isPrivate: false,
    createdAt: '2025-01-10',
    updatedAt: '2025-02-15'
  },
  {
    id: 'f3',
    name: 'Магическая атака',
    description: 'Рассчитывает значение магической атаки',
    category: 'magic',
    formula: '(РЕЗ * 1.5) + (ИНТ * 0.5) + (Навык_школы_магии * 2) + Бонус_фокусировки - Сложность_заклинания + Тактический_модификатор',
    parameters: [
      { name: 'РЕЗ', description: 'Резонанс (магическая характеристика)', type: 'number', defaultValue: 12 },
      { name: 'ИНТ', description: 'Интеллект персонажа', type: 'number', defaultValue: 14 },
      { name: 'Навык_школы_магии', description: 'Уровень навыка в соответствующей школе магии', type: 'number', defaultValue: 4 },
      { name: 'Бонус_фокусировки', description: 'Бонус от магической фокусировки', type: 'number', defaultValue: 0 },
      { name: 'Сложность_заклинания', description: 'Базовая сложность заклинания', type: 'number', defaultValue: 10 },
      { name: 'Тактический_модификатор', description: 'Бонус от тактического преимущества', type: 'number', defaultValue: 0 }
    ],
    sampleCalculation: 'Для мага с РЕЗ 16, ИНТ 14, Навык_школы_магии 4, Бонус_фокусировки 3, Сложность_заклинания 15:\n(16 * 1.5) + (14 * 0.5) + (4 * 2) + 3 - 15 = 24 + 7 + 8 + 3 - 15 = 27',
    creator: 'system',
    isPrivate: false,
    createdAt: '2025-01-15',
    updatedAt: '2025-01-15'
  },
  {
    id: 'f4',
    name: 'Проверка навыка',
    description: 'Рассчитывает результат проверки навыка',
    category: 'skills',
    formula: '(Связанная_характеристика * 1.5) + (Вторичная_характеристика * 0.5) + (Уровень_навыка * 0.4) + Ситуативные_модификаторы',
    parameters: [
      { name: 'Связанная_характеристика', description: 'Основная характеристика для навыка', type: 'number', defaultValue: 12 },
      { name: 'Вторичная_характеристика', description: 'Дополнительная характеристика', type: 'number', defaultValue: 10 },
      { name: 'Уровень_навыка', description: 'Текущий уровень проверяемого навыка', type: 'number', defaultValue: 3 },
      { name: 'Ситуативные_модификаторы', description: 'Бонусы или штрафы от ситуации', type: 'number', defaultValue: 0 }
    ],
    sampleCalculation: 'Для персонажа с основной характеристикой 14, вторичной 12, навыком 4 и без модификаторов:\n(14 * 1.5) + (12 * 0.5) + (4 * 0.4) = 21 + 6 + 1.6 = 28.6',
    creator: 'system',
    isPrivate: false,
    createdAt: '2025-01-20',
    updatedAt: '2025-01-20'
  },
  {
    id: 'f5',
    name: 'Торговая цена при покупке',
    description: 'Определяет реальную цену товара при покупке у NPC с учетом навыков персонажа',
    category: 'economy',
    formula: 'Базовая_стоимость * (1 + (30 - ХАР - Навык_торговли * 2) / 100)',
    parameters: [
      { name: 'Базовая_стоимость', description: 'Стандартная цена товара', type: 'number', defaultValue: 100 },
      { name: 'ХАР', description: 'Харизма персонажа', type: 'number', defaultValue: 10 },
      { name: 'Навык_торговли', description: 'Уровень навыка торговли', type: 'number', defaultValue: 0 }
    ],
    sampleCalculation: 'Для товара стоимостью 250 астров, персонаж с ХАР 13, Навык_торговли 5:\n250 * (1 + (30 - 13 - 5 * 2) / 100) = 250 * (1 + (30 - 13 - 10) / 100) = 250 * (1 + 7 / 100) = 250 * 1.07 = 267.5',
    creator: 'system',
    isPrivate: false,
    createdAt: '2025-01-25',
    updatedAt: '2025-01-25'
  }
];

// Компонент калькулятора формул
const FormulaCalculator = () => {
  const { currentUser } = useAuth();
  const isGameMaster = currentUser && ['admin', 'gamemaster'].includes(currentUser.role);
  
  const [loading, setLoading] = useState(false);
  const [formulas, setFormulas] = useState([]);
  const [filteredFormulas, setFilteredFormulas] = useState([]);
  const [selectedFormula, setSelectedFormula] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState('');
  const [paramValues, setParamValues] = useState({});
  const [calculationResult, setCalculationResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFormula, setNewFormula] = useState({
    name: '',
    description: '',
    category: '',
    formula: '',
    parameters: [],
    sampleCalculation: '',
    isPrivate: false
  });
  const [editingParam, setEditingParam] = useState(null);
  const [paramFormData, setParamFormData] = useState({
    name: '',
    description: '',
    type: 'number',
    defaultValue: 0
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showParamDialog, setShowParamDialog] = useState(false);
  const [favoriteFormulas, setFavoriteFormulas] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [resultsHistory, setResultsHistory] = useState([]);

  // Загрузка формул
  useEffect(() => {
    const fetchFormulas = async () => {
      setLoading(true);
      try {
        // В реальном приложении этот код будет заменен на API-запрос
        // const response = await formulaService.getAll();
        // setFormulas(response.data);
        
        // Используем моковые данные
        setFormulas(mockFormulas);
        setFilteredFormulas(mockFormulas);
        
        // Загрузка избранных формул из localStorage
        const savedFavorites = localStorage.getItem('favoriteFormulas');
        if (savedFavorites) {
          setFavoriteFormulas(JSON.parse(savedFavorites));
        }
        
        // Загрузка истории расчетов из localStorage
        const savedHistory = localStorage.getItem('calculationHistory');
        if (savedHistory) {
          setResultsHistory(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error('Ошибка при загрузке формул:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFormulas();
  }, []);

  // Фильтрация формул при изменении поиска или категории
  useEffect(() => {
    let filtered = [...formulas];
    
    if (searchText) {
      const lowercaseSearch = searchText.toLowerCase();
      filtered = filtered.filter(formula => 
        formula.name.toLowerCase().includes(lowercaseSearch) || 
        formula.description.toLowerCase().includes(lowercaseSearch) ||
        formula.formula.toLowerCase().includes(lowercaseSearch)
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(formula => formula.category === selectedCategory);
    }
    
    setFilteredFormulas(filtered);
  }, [formulas, searchText, selectedCategory]);

  // Инициализация значений параметров при выборе формулы
  useEffect(() => {
    if (selectedFormula) {
      const initialValues = {};
      selectedFormula.parameters.forEach(param => {
        initialValues[param.name] = param.defaultValue;
      });
      setParamValues(initialValues);
      setCalculationResult(null);
    }
  }, [selectedFormula]);

  // Обработчики событий
  const handleCategoryToggle = (category) => {
    setExpandedCategory(expandedCategory === category ? '' : category);
  };

  const handleFormulaSelect = (formula) => {
    setSelectedFormula(formula);
    setCalculationResult(null);
    setShowResults(false);
  };

  const handleParamChange = (paramName, value) => {
    setParamValues(prev => ({
      ...prev,
      [paramName]: Number(value)
    }));
  };

  const calculateFormula = () => {
    setCalculating(true);
    
    try {
      // Безопасное вычисление формулы
      let formula = selectedFormula.formula;
      
      // Замена параметров их значениями
      Object.keys(paramValues).forEach(paramName => {
        const regex = new RegExp(paramName, 'g');
        formula = formula.replace(regex, paramValues[paramName]);
      });
      
      // Выполнение вычисления
      // Примечание: в реальной системе нужен более безопасный подход к вычислениям
      const result = eval(formula);
      
      setCalculationResult({
        formula: selectedFormula.formula,
        substituted: formula,
        result: result,
        timestamp: new Date().toISOString()
      });
      
      // Добавление результата в историю
      const historyItem = {
        id: Date.now(),
        formulaName: selectedFormula.name,
        parameters: { ...paramValues },
        result: result,
        timestamp: new Date().toISOString()
      };
      
      const updatedHistory = [historyItem, ...resultsHistory.slice(0, 19)];
      setResultsHistory(updatedHistory);
      localStorage.setItem('calculationHistory', JSON.stringify(updatedHistory));
      
      setShowResults(true);
    } catch (error) {
      console.error('Ошибка при расчете формулы:', error);
      setCalculationResult({
        error: `Ошибка вычисления: ${error.message}`
      });
    } finally {
      setCalculating(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleOpenCreateDialog = () => {
    setNewFormula({
      name: '',
      description: '',
      category: '',
      formula: '',
      parameters: [],
      sampleCalculation: '',
      isPrivate: false
    });
    setValidationErrors({});
    setShowCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setShowCreateDialog(false);
  };

  const handleFormulaInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewFormula(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOpenParamDialog = (param = null) => {
    if (param) {
      setEditingParam(param);
      setParamFormData({
        name: param.name,
        description: param.description,
        type: param.type || 'number',
        defaultValue: param.defaultValue
      });
    } else {
      setEditingParam(null);
      setParamFormData({
        name: '',
        description: '',
        type: 'number',
        defaultValue: 0
      });
    }
    setShowParamDialog(true);
  };

  const handleCloseParamDialog = () => {
    setShowParamDialog(false);
  };

  const handleParamFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setParamFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveParam = () => {
    // Валидация
    const errors = {};
    if (!paramFormData.name) errors.name = 'Имя параметра обязательно';
    if (!paramFormData.description) errors.description = 'Описание обязательно';
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    if (editingParam) {
      // Обновление существующего параметра
      setNewFormula(prev => ({
        ...prev,
        parameters: prev.parameters.map(p => 
          p === editingParam ? { ...paramFormData } : p
        )
      }));
    } else {
      // Добавление нового параметра
      setNewFormula(prev => ({
        ...prev,
        parameters: [...prev.parameters, { ...paramFormData }]
      }));
    }
    
    setShowParamDialog(false);
  };

  const handleDeleteParam = (param) => {
    setNewFormula(prev => ({
      ...prev,
      parameters: prev.parameters.filter(p => p !== param)
    }));
  };

  const handleSaveFormula = async () => {
    // Валидация
    const errors = {};
    if (!newFormula.name) errors.name = 'Название формулы обязательно';
    if (!newFormula.description) errors.description = 'Описание обязательно';
    if (!newFormula.category) errors.category = 'Категория обязательна';
    if (!newFormula.formula) errors.formula = 'Формула обязательна';
    if (newFormula.parameters.length === 0) errors.parameters = 'Добавьте хотя бы один параметр';
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    try {
      // В реальном приложении здесь будет API-запрос
      // await formulaService.create(newFormula);
      
      // Для демонстрации добавляем формулу локально
      const newFormulaWithId = {
        ...newFormula,
        id: `f${formulas.length + 1}`,
        creator: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setFormulas([...formulas, newFormulaWithId]);
      setShowCreateDialog(false);
      
      // Выбираем созданную формулу
      setSelectedFormula(newFormulaWithId);
    } catch (error) {
      console.error('Ошибка при создании формулы:', error);
      setValidationErrors({ submit: 'Ошибка при сохранении формулы' });
    }
  };

  const toggleFavorite = (formulaId) => {
    let updatedFavorites;
    if (favoriteFormulas.includes(formulaId)) {
      updatedFavorites = favoriteFormulas.filter(id => id !== formulaId);
    } else {
      updatedFavorites = [...favoriteFormulas, formulaId];
    }
    
    setFavoriteFormulas(updatedFavorites);
    localStorage.setItem('favoriteFormulas', JSON.stringify(updatedFavorites));
  };

  const clearHistory = () => {
    setResultsHistory([]);
    localStorage.removeItem('calculationHistory');
  };

  // Компоненты для диалогов и форм
  const renderParameterDialog = () => (
    <Dialog open={showParamDialog} onClose={handleCloseParamDialog} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingParam ? 'Редактирование параметра' : 'Добавление параметра'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Название параметра"
              name="name"
              value={paramFormData.name}
              onChange={handleParamFormChange}
              error={!!validationErrors.name}
              helperText={validationErrors.name}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Описание"
              name="description"
              value={paramFormData.description}
              onChange={handleParamFormChange}
              error={!!validationErrors.description}
              helperText={validationErrors.description}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Тип параметра</InputLabel>
              <Select
                name="type"
                value={paramFormData.type}
                onChange={handleParamFormChange}
                label="Тип параметра"
              >
                <MenuItem value="number">Число</MenuItem>
                <MenuItem value="boolean">Логический</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Значение по умолчанию"
              name="defaultValue"
              type={paramFormData.type === 'number' ? 'number' : 'text'}
              value={paramFormData.defaultValue}
              onChange={handleParamFormChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseParamDialog}>Отмена</Button>
        <Button variant="contained" onClick={handleSaveParam}>Сохранить</Button>
      </DialogActions>
    </Dialog>
  );

  const renderCreateFormulaDialog = () => (
    <Dialog open={showCreateDialog} onClose={handleCloseCreateDialog} maxWidth="md" fullWidth>
      <DialogTitle>Создание новой формулы</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Название формулы"
              name="name"
              value={newFormula.name}
              onChange={handleFormulaInputChange}
              error={!!validationErrors.name}
              helperText={validationErrors.name}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!validationErrors.category}>
              <InputLabel>Категория</InputLabel>
              <Select
                name="category"
                value={newFormula.category}
                onChange={handleFormulaInputChange}
                label="Категория"
                required
              >
                {formulaCategories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.category && (
                <Typography variant="caption" color="error">
                  {validationErrors.category}
                </Typography>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  name="isPrivate"
                  checked={newFormula.isPrivate}
                  onChange={handleFormulaInputChange}
                />
              }
              label="Приватная формула (видна только вам)"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Описание"
              name="description"
              value={newFormula.description}
              onChange={handleFormulaInputChange}
              multiline
              rows={2}
              error={!!validationErrors.description}
              helperText={validationErrors.description}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Формула"
              name="formula"
              value={newFormula.formula}
              onChange={handleFormulaInputChange}
              error={!!validationErrors.formula}
              helperText={validationErrors.formula || "Используйте имена параметров в точности как они определены"}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1">Параметры</Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleOpenParamDialog()}
                size="small"
              >
                Добавить параметр
              </Button>
            </Box>
            {validationErrors.parameters && (
              <Typography variant="caption" color="error" sx={{ mb: 1, display: 'block' }}>
                {validationErrors.parameters}
              </Typography>
            )}
            {newFormula.parameters.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Название</TableCell>
                      <TableCell>Описание</TableCell>
                      <TableCell>Тип</TableCell>
                      <TableCell>По умолчанию</TableCell>
                      <TableCell>Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {newFormula.parameters.map((param, index) => (
                      <TableRow key={index}>
                        <TableCell>{param.name}</TableCell>
                        <TableCell>{param.description}</TableCell>
                        <TableCell>{param.type === 'number' ? 'Число' : 'Логический'}</TableCell>
                        <TableCell>{param.defaultValue}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleOpenParamDialog(param)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteParam(param)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Нет добавленных параметров
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Пример расчета"
              name="sampleCalculation"
              value={newFormula.sampleCalculation}
              onChange={handleFormulaInputChange}
              multiline
              rows={3}
              placeholder="Опишите пример расчета по формуле для лучшего понимания"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseCreateDialog}>Отмена</Button>
        <Button 
          variant="contained" 
          onClick={handleSaveFormula}
          startIcon={<SaveIcon />}
        >
          Сохранить формулу
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Рендеринг истории результатов
  const renderResultsHistory = () => (
    <Dialog
      open={showResults}
      onClose={() => setShowResults(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Результаты расчетов
          </Typography>
          <Button 
            size="small" 
            color="error" 
            onClick={clearHistory}
            disabled={resultsHistory.length === 0}
          >
            Очистить историю
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {calculationResult && !calculationResult.error && (
          <Paper
            variant="outlined"
            sx={{ p: 2, mb: 3, background: 'rgba(76, 175, 80, 0.1)', borderColor: 'success.main' }}
          >
            <Typography variant="subtitle1" gutterBottom>
              Текущий расчет:
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Формула:</strong> {calculationResult.formula}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Подстановка:</strong> {calculationResult.substituted}
            </Typography>
            <Typography variant="h6" color="success.main">
              <strong>Результат:</strong> {calculationResult.result}
            </Typography>
          </Paper>
        )}
        
        {calculationResult && calculationResult.error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {calculationResult.error}
          </Alert>
        )}
        
        <Typography variant="subtitle1" gutterBottom>
          История расчетов:
        </Typography>
        
        {resultsHistory.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell>Формула</TableCell>
                  <TableCell>Параметры</TableCell>
                  <TableCell>Результат</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resultsHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {new Date(item.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{item.formulaName}</TableCell>
                    <TableCell>
                      {Object.entries(item.parameters).map(([key, value]) => (
                        <Typography key={key} variant="caption" display="block">
                          {key}: {value}
                        </Typography>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">
                        {item.result}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            История расчетов пуста
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowResults(false)}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Калькулятор формул
      </Typography>
      
      <Grid container spacing={3}>
        {/* Левая панель с фильтрами и списком формул */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Фильтры
            </Typography>
            <TextField
              fullWidth
              placeholder="Поиск формул..."
              value={searchText}
              onChange={handleSearchChange}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Категория</InputLabel>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Категория"
              >
                <MenuItem value="">Все категории</MenuItem>
                {formulaCategories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {isGameMaster && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateDialog}
                fullWidth
              >
                Создать формулу
              </Button>
            )}
          </Paper>
          
          <Typography variant="h6" gutterBottom>
            Доступные формулы
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" my={3}>
              <CircularProgress />
            </Box>
          ) : filteredFormulas.length > 0 ? (
            <>
              {favoriteFormulas.length > 0 && (
                <Accordion 
                  expanded={expandedCategory === 'favorites'}
                  onChange={() => handleCategoryToggle('favorites')}
                  sx={{ mb: 2 }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      <strong>Избранное</strong> ({favoriteFormulas.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense disablePadding>
                      {formulas
                        .filter(formula => favoriteFormulas.includes(formula.id))
                        .map(formula => (
                          <ListItem
                            key={formula.id}
                            button
                            selected={selectedFormula?.id === formula.id}
                            onClick={() => handleFormulaSelect(formula)}
                            secondaryAction={
                              <IconButton 
                                edge="end" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(formula.id);
                                }}
                              >
                                <BookmarkAddIcon color="primary" />
                              </IconButton>
                            }
                          >
                            <ListItemText
                              primary={formula.name}
                              secondary={formula.description.substring(0, 60) + '...'}
                            />
                          </ListItem>
                        ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              )}
              
              {/* Группировка формул по категориям */}
              {formulaCategories.map(category => {
                const categoryFormulas = filteredFormulas.filter(
                  formula => formula.category === category.id
                );
                
                if (categoryFormulas.length === 0) return null;
                
                return (
                  <Accordion 
                    key={category.id}
                    expanded={expandedCategory === category.id}
                    onChange={() => handleCategoryToggle(category.id)}
                    sx={{ mb: 2 }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>
                        <strong>{category.name}</strong> ({categoryFormulas.length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense disablePadding>
                        {categoryFormulas.map(formula => (
                          <ListItem
                            key={formula.id}
                            button
                            selected={selectedFormula?.id === formula.id}
                            onClick={() => handleFormulaSelect(formula)}
                            secondaryAction={
                              <IconButton 
                                edge="end" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(formula.id);
                                }}
                              >
                                {favoriteFormulas.includes(formula.id) ? (
                                  <BookmarkAddIcon color="primary" />
                                ) : (
                                  <BookmarkAddIcon color="action" />
                                )}
                              </IconButton>
                            }
                          >
                            <ListItemText
                              primary={formula.name}
                              secondary={formula.description.substring(0, 60) + '...'}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </>
          ) : (
            <Alert severity="info">
              Формул не найдено. Измените критерии поиска или создайте новую формулу.
            </Alert>
          )}
        </Grid>
        
        {/* Правая панель с расчетами */}
        <Grid item xs={12} md={8}>
          {selectedFormula ? (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h5">{selectedFormula.name}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {selectedFormula.description}
                  </Typography>
                </Box>
                <Box display="flex">
                  <Button 
                    startIcon={<HistoryIcon />}
                    onClick={() => setShowResults(true)}
                    sx={{ mr: 1 }}
                  >
                    История
                  </Button>
                  <IconButton 
                    onClick={() => toggleFavorite(selectedFormula.id)}
                    color={favoriteFormulas.includes(selectedFormula.id) ? "primary" : "default"}
                  >
                    <BookmarkAddIcon />
                  </IconButton>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Формула:
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    backgroundColor: 'background.paper',
                    fontFamily: 'monospace',
                    fontSize: '1.1rem'
                  }}
                >
                  {selectedFormula.formula}
                </Paper>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Параметры расчета
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {selectedFormula.parameters.map((param) => (
                  <Grid item xs={12} sm={6} md={4} key={param.name}>
                    <TextField
                      fullWidth
                      label={param.name}
                      type="number"
                      value={paramValues[param.name] || ''}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      helperText={param.description}
                    />
                  </Grid>
                ))}
              </Grid>
              
              <Box display="flex" justifyContent="space-between">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={calculateFormula}
                  disabled={calculating}
                  startIcon={calculating ? <CircularProgress size={20} /> : <CalculateIcon />}
                >
                  Рассчитать
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<InfoIcon />}
                  onClick={() => setShowResults(true)}
                  disabled={resultsHistory.length === 0}
                >
                  Показать результаты ({resultsHistory.length})
                </Button>
              </Box>
              
              {calculationResult && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Результат
                  </Typography>
                  
                  {calculationResult.error ? (
                    <Alert severity="error">
                      {calculationResult.error}
                    </Alert>
                  ) : (
                    <>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Подстановка параметров:
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 1, backgroundColor: 'background.paper' }}>
                          <Typography fontFamily="monospace">
                            {calculationResult.substituted}
                          </Typography>
                        </Paper>
                      </Box>
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Результат вычисления:
                      </Typography>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          bgcolor: 'success.light', 
                          color: 'success.contrastText' 
                        }}
                      >
                        <Typography variant="h4" align="center">
                          {calculationResult.result}
                        </Typography>
                      </Paper>
                    </>
                  )}
                </Box>
              )}
              
              {selectedFormula.sampleCalculation && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Пример расчета
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                    <Typography whiteSpace="pre-line">
                      {selectedFormula.sampleCalculation}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Paper>
          ) : (
            <Paper 
              elevation={3} 
              sx={{ 
                p: 5, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center',
                height: '400px',
                textAlign: 'center'
              }}
            >
              <ScienceIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Выберите формулу для расчета
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '600px' }}>
                Система формул "Конвергенции" использует детерминированные математические модели вместо бросков кубиков.
                Это делает результаты предсказуемыми и зависящими от характеристик персонажа и его навыков.
              </Typography>
              
              <Button
                variant="contained"
                startIcon={<HistoryIcon />}
                sx={{ mt: 3 }}
                onClick={() => setShowResults(true)}
                disabled={resultsHistory.length === 0}
              >
                История расчетов ({resultsHistory.length})
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>
      
      {/* Диалоги */}
      {renderParameterDialog()}
      {renderCreateFormulaDialog()}
      {renderResultsHistory()}
    </Box>
  );
};

export default FormulaCalculator;