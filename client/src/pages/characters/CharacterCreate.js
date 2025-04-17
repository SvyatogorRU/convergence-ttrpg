// client/src/pages/characters/CharacterCreate.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { characterService, userService } from '../../services/api';

// Компоненты для каждого шага создания персонажа
function BasicInfoStep({ formData, setFormData }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Основная информация персонажа
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Имя персонажа"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Род занятий"
            name="characterOccupation"
            value={formData.characterOccupation}
            onChange={handleChange}
            helperText="Укажите род деятельности персонажа"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Регион происхождения"
            name="homeRegion"
            value={formData.homeRegion}
            onChange={handleChange}
            helperText="По умолчанию: Перекресток Миров"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="URL аватара"
            name="avatarUrl"
            value={formData.avatarUrl}
            onChange={handleChange}
            helperText="Укажите ссылку на изображение персонажа (необязательно)"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Предыстория"
            name="background"
            value={formData.background}
            onChange={handleChange}
            helperText="Краткая история персонажа (необязательно)"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

function AttributesStep({ formData, setFormData }) {
  // Удалено: состояние отслеживания оставшихся очков
  // const [remainingPoints, setRemainingPoints] = useState(15);
  const [errorMessage, setErrorMessage] = useState('');

  // Базовые характеристики мира Конвергенции
  const baseStats = [
    { name: 'СИЛ', label: 'Сила', description: 'Физическая мощь, подъём тяжестей, урон оружием ближнего боя' },
    { name: 'ЛОВ', label: 'Ловкость', description: 'Координация, точность, рефлексы, скорость' },
    { name: 'ВЫН', label: 'Выносливость', description: 'Физическая стойкость, сопротивляемость, запас жизненных сил' },
    { name: 'ИНТ', label: 'Интеллект', description: 'Способность к обучению, анализу, логике, память' },
    { name: 'ВСП', label: 'Восприятие', description: 'Острота чувств, внимание к деталям, интуитивное понимание окружения' }
  ];

  useEffect(() => {
    // Проверка минимальных значений
    const hasAnyZero = formData.baseStats.some(stat => stat.value < 1);
    if (hasAnyZero) {
      setErrorMessage('Все базовые характеристики должны иметь значение не менее 1');
    } else {
      setErrorMessage('');
    }
  }, [formData.baseStats]);

  const handleStatChange = (index, value) => {
    // Проверяем, что новое значение не меньше минимального
    if (value < 1) value = 1;
    // УДАЛЕНО: Максимальное значение увеличено с 4 до 10
    if (value > 10) value = 10;
    
    // УДАЛЕНО: Проверка на достаточность очков
    // УДАЛЕНО: Больше не ограничиваем повышение характеристик оставшимися очками
    
    const updatedStats = [...formData.baseStats];
    updatedStats[index].value = value;
    setFormData(prev => ({
      ...prev,
      baseStats: updatedStats
    }));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Распределение характеристик
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        Распределите очки между характеристиками. Каждая характеристика должна иметь минимум 1 очко. Максимальное значение характеристики - 10.
      </Alert>
      
      {/* УДАЛЕНО: Отображение оставшихся очков */}
      
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {baseStats.map((stat, index) => (
          <Grid item xs={12} sm={6} key={stat.name}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">{stat.label} ({stat.name})</Typography>
                <TextField
                  type="number"
                  value={formData.baseStats[index].value}
                  onChange={(e) => handleStatChange(index, parseInt(e.target.value, 10))}
                  InputProps={{ inputProps: { min: 1, max: 10 } }}
                  sx={{ width: '80px' }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {stat.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function SkillsStep({ formData, setFormData }) {
  // Удалено: состояние отслеживания оставшихся очков
  // const [remainingPoints, setRemainingPoints] = useState(10);
  const [errorMessage, setErrorMessage] = useState('');

  // Категории навыков
  const skillCategories = {
    'combat': 'Боевые навыки',
    'physical': 'Физические навыки',
    'social': 'Социальные навыки',
    'mental': 'Ментальные навыки',
    'craft': 'Ремесленные навыки',
    'magic': 'Магические навыки',
    'survival': 'Выживальческие навыки'
  };

  // Основные навыки из мира Конвергенции по категориям
  const availableSkills = {
    'combat': [
      'Владение клинками', 'Владение топорами/дробящим', 'Владение древковым оружием',
      'Владение луками', 'Владение метательным оружием', 'Рукопашный бой', 'Тактика', 'Защитные техники'
    ],
    'physical': [
      'Акробатика', 'Атлетика', 'Скрытность', 'Ловкость рук', 'Верховая езда', 'Танец'
    ],
    'social': [
      'Убеждение', 'Запугивание', 'Обман', 'Этикет', 'Торговля', 'Лидерство', 'Дипломатия'
    ],
    'mental': [
      'История', 'Природоведение', 'Медицина', 'Алхимия', 'Аркановедение', 'Расследование', 'Языки'
    ],
    'craft': [
      'Кузнечное дело', 'Ювелирное дело', 'Кожевничество', 'Портняжное дело', 'Плотницкое дело', 'Инженерия'
    ],
    'magic': [
      'Аркановая эвокация', 'Аркановая трансмутация', 'Иллюзионизм', 
      'Божественное исцеление', 'Защитная магия', 'Призыв существ', 
      'Природная стихийная магия', 'Ци-манипуляция'
    ],
    'survival': [
      'Выслеживание', 'Охота', 'Травничество', 'Разведение огня', 
      'Ориентирование', 'Выживание в экстремальных условиях'
    ]
  };

  // УДАЛЕНО: Расчет оставшихся очков
  // useEffect(() => {
  //  const usedPoints = formData.skills.reduce((sum, skill) => sum + skill.value, 0);
  //  setRemainingPoints(10 - usedPoints);
  //  
  //  if (remainingPoints < 0) {
  //    setErrorMessage('Вы использовали больше очков, чем доступно');
  //  } else {
  //    setErrorMessage('');
  //  }
  // }, [formData.skills, remainingPoints]);

  const handleSkillChange = (index, value) => {
    // Проверяем, что новое значение в пределах допустимого диапазона
    if (value < 0) value = 0;
    if (value > 5) value = 5; // Максимальное стартовое значение навыка
    
    // УДАЛЕНО: Проверка на достаточность очков
    
    const updatedSkills = [...formData.skills];
    updatedSkills[index].value = value;
    setFormData(prev => ({
      ...prev,
      skills: updatedSkills
    }));
  };

  const handleAddSkill = (skill, category) => {
    // Проверяем, не добавлен ли уже этот навык
    if (formData.skills.some(s => s.name === skill)) {
      setErrorMessage(`Навык "${skill}" уже добавлен`);
      return;
    }
    
    // УДАЛЕНО: Проверка на достаточность очков
    
    // Добавляем навык с начальным значением 1
    const newSkill = {
      name: skill,
      value: 1,
      category
    };
    
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
    
    setNewSkill({ name: '', value: 0, category: 'physical' });
  };

  const handleRemoveSkill = (index) => {
    const updatedSkills = [...formData.skills];
    updatedSkills.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      skills: updatedSkills
    }));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Выбор начальных навыков
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        Выберите начальные навыки персонажа. Вы можете выбрать любые навыки из доступных категорий.
      </Alert>
      
      {/* УДАЛЕНО: Отображение оставшихся очков */}
      
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      
      {/* Выбранные навыки */}
      <Typography variant="h6" gutterBottom>
        Выбранные навыки
      </Typography>
      
      <Grid container spacing={2} mb={4}>
        {formData.skills.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" align="center">
              Вы еще не выбрали ни одного навыка
            </Typography>
          </Grid>
        ) : (
          formData.skills.map((skill, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1">{skill.name}</Typography>
                  <Box display="flex" alignItems="center">
                    <TextField
                      type="number"
                      value={skill.value}
                      onChange={(e) => handleSkillChange(index, parseInt(e.target.value, 10))}
                      InputProps={{ inputProps: { min: 1, max: 5 } }}
                      sx={{ width: '60px', mr: 1 }}
                    />
                    <Button 
                      variant="outlined" 
                      color="error" 
                      size="small"
                      onClick={() => handleRemoveSkill(index)}
                    >
                      X
                    </Button>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {skillCategories[skill.category]}
                </Typography>
              </Paper>
            </Grid>
          ))
        )}
      </Grid>
      
      {/* Доступные навыки по категориям */}
      <Typography variant="h6" gutterBottom>
        Доступные навыки
      </Typography>
      
      {Object.entries(skillCategories).map(([category, categoryName]) => (
        <Box key={category} mb={3}>
          <Typography variant="subtitle1" gutterBottom>
            {categoryName}
          </Typography>
          <Divider sx={{ mb: 1 }} />
          
          <Grid container spacing={1}>
            {availableSkills[category].map((skill) => (
              <Grid item key={skill}>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => handleAddSkill(skill, category)}
                  disabled={formData.skills.some(s => s.name === skill)}
                  sx={{ mb: 1 }}
                >
                  {skill}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
}

function UserSelectStep({ formData, setFormData, users }) {
  const handleUserChange = (e) => {
    setFormData(prev => ({
      ...prev,
      userId: e.target.value
    }));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Выбор пользователя
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Выберите пользователя, для которого создается персонаж. У каждого пользователя может быть только один персонаж.
      </Alert>
      
      <FormControl fullWidth>
        <InputLabel>Пользователь</InputLabel>
        <Select
          value={formData.userId}
          onChange={handleUserChange}
          label="Пользователь"
        >
          {users.map((user) => (
            <MenuItem 
              key={user.id} 
              value={user.id}
              disabled={user.hasCharacter}
            >
              {user.username} ({user.role}) {user.hasCharacter ? ' - уже имеет персонажа' : ''}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

function ReviewStep({ formData }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Проверка данных персонажа
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Основная информация</Typography>
            <Typography><strong>Имя:</strong> {formData.name}</Typography>
            <Typography><strong>Род занятий:</strong> {formData.characterOccupation || 'Не указано'}</Typography>
            <Typography><strong>Регион:</strong> {formData.homeRegion || 'Перекресток Миров'}</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Характеристики</Typography>
            <Grid container spacing={1}>
              {formData.baseStats.map((stat) => (
                <Grid item xs={6} key={stat.name}>
                  <Typography><strong>{stat.name}:</strong> {stat.value}</Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Выбранные навыки</Typography>
            <Grid container spacing={1}>
              {formData.skills.map((skill) => (
                <Grid item xs={6} sm={4} md={3} key={skill.name}>
                  <Typography><strong>{skill.name}:</strong> {skill.value}</Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
        
        {formData.background && (
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Предыстория</Typography>
              <Typography>{formData.background}</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

// Основной компонент для создания персонажа
const CharacterCreate = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  
  // Инициализация формы с базовыми характеристиками
  const [formData, setFormData] = useState({
    name: '',
    characterOccupation: '',
    homeRegion: 'Перекресток Миров',
    avatarUrl: '',
    background: '',
    userId: '',
    baseStats: [
      { name: 'СИЛ', value: 3 },
      { name: 'ЛОВ', value: 3 },
      { name: 'ВЫН', value: 3 },
      { name: 'ИНТ', value: 3 },
      { name: 'ВСП', value: 3 }
    ],
    skills: []
  });

  // Загрузка списка пользователей
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        const response = await userService.getAll();
        
        // Получаем информацию о том, есть ли у пользователя персонаж
        const usersWithCharacterInfo = await Promise.all(
          response.data.users.map(async (user) => {
            try {
              const charCheck = await characterService.checkUserHasCharacter(user.id);
              return {
                ...user,
                hasCharacter: charCheck.data.exists
              };
            } catch (err) {
              console.error(`Ошибка при проверке персонажа для пользователя ${user.id}:`, err);
              return {
                ...user,
                hasCharacter: false
              };
            }
          })
        );
        
        setUsers(usersWithCharacterInfo);
        
        // Если есть пользователи без персонажей, выбираем первого из них
        const userWithoutCharacter = usersWithCharacterInfo.find(user => !user.hasCharacter);
        if (userWithoutCharacter) {
          setFormData(prev => ({
            ...prev,
            userId: userWithoutCharacter.id
          }));
        }
      } catch (err) {
        console.error('Ошибка при загрузке пользователей:', err);
        setError('Не удалось загрузить список пользователей');
      } finally {
        setUsersLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Шаги создания персонажа
  const steps = ['Основная информация', 'Характеристики', 'Навыки', 'Выбор пользователя', 'Проверка'];

  // Получение компонента для текущего шага
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <BasicInfoStep formData={formData} setFormData={setFormData} />;
      case 1:
        return <AttributesStep formData={formData} setFormData={setFormData} />;
      case 2:
        return <SkillsStep formData={formData} setFormData={setFormData} />;
      case 3:
        return <UserSelectStep formData={formData} setFormData={setFormData} users={users} />;
      case 4:
        return <ReviewStep formData={formData} />;
      default:
        return 'Неизвестный шаг';
    }
  };

  // Проверка валидности текущего шага
  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return !!formData.name; // Должно быть указано имя
      case 1:
        // Все характеристики должны быть не менее 1
        const allAboveZero = formData.baseStats.every(stat => stat.value >= 1);
        return allAboveZero;
      case 2:
        // УДАЛЕНО: Проверка суммы значений навыков
        return true;
      case 3:
        // Должен быть выбран пользователь без персонажа
        const selectedUser = users.find(user => user.id === formData.userId);
        return !!formData.userId && selectedUser && !selectedUser.hasCharacter;
      default:
        return true;
    }
  };

  // Обработчик перехода к следующему шагу
  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Создание персонажа
      createCharacter();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  // Обработчик возврата к предыдущему шагу
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Создание персонажа
  const createCharacter = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Подготовка данных
      const characterData = {
        name: formData.name,
        characterOccupation: formData.characterOccupation,
        homeRegion: formData.homeRegion,
        avatarUrl: formData.avatarUrl,
        background: formData.background,
        userId: formData.userId,
        baseStats: formData.baseStats,
        skills: formData.skills
      };
      
      // Отправка запроса на создание
      const response = await characterService.create(characterData);
      
      // Переход на страницу созданного персонажа
      navigate(`/characters/${response.data.id}`);
    } catch (err) {
      console.error('Ошибка при создании персонажа:', err);
      setError('Не удалось создать персонажа: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Создание персонажа
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {usersLoading && activeStep === 3 ? (
          <Box display="flex" justifyContent="center" my={5}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {getStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0 || loading}
              >
                Назад
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid() || loading}
                endIcon={loading && <CircularProgress size={24} />}
              >
                {activeStep === steps.length - 1 ? 'Создать персонажа' : 'Далее'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default CharacterCreate;