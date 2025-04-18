// client/src/components/character/CharacterCard.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Chip,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Edit as EditIcon,
  AddBox as AddBoxIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  AddCircle as AddCircleIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import CharacterEditDialog from '../../pages/characters/CharacterEditDialog';
import AddKnowledgeDialog from './AddKnowledgeDialog';
import AddNoteDialog from './AddNoteDialog';

// Компонент панели вкладок
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`character-tabpanel-${index}`}
      aria-labelledby={`character-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Основной компонент карточки персонажа
const CharacterCard = ({ character, isGameMaster, onUpdate }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isFormulaDialogOpen, setIsFormulaDialogOpen] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState('');
  const [formulaTooltipOpen, setFormulaTooltipOpen] = useState(false);
  const [addNoteDialogOpen, setAddNoteDialogOpen] = useState(false);
  const [addKnowledgeDialogOpen, setAddKnowledgeDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [expandedSkillCategory, setExpandedSkillCategory] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [statInfoOpen, setStatInfoOpen] = useState(null);
  const { currentUser } = useAuth();

  // Группировка навыков по категориям
  const skillsByCategory = {};
  if (character?.characterSkills) {
    character.characterSkills.forEach(skill => {
      if (!skillsByCategory[skill.category]) {
        skillsByCategory[skill.category] = [];
      }
      skillsByCategory[skill.category].push(skill);
    });
  }

  // Получение названия категории навыков
  const getSkillCategoryName = (category) => {
    const categoryNames = {
      'combat': 'Боевые навыки',
      'physical': 'Физические навыки',
      'social': 'Социальные навыки',
      'mental': 'Ментальные навыки',
      'craft': 'Ремесленные навыки',
      'magic': 'Магические навыки',
      'survival': 'Выживальческие навыки'
    };
    return categoryNames[category] || category;
  };

  // Обработчики изменения вкладки
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Показ/скрытие категории навыков
  const toggleSkillCategory = (category) => {
    setExpandedSkillCategory(expandedSkillCategory === category ? null : category);
  };

  // Показ/скрытие информации о формулах статов
  const toggleStatInfo = (statName) => {
    setStatInfoOpen(statInfoOpen === statName ? null : statName);
  };

  // Открытие диалога формул
  const handleFormulaOpen = (formula) => {
    setSelectedFormula(formula);
    setIsFormulaDialogOpen(true);
  };

  // Получение формулы для производных характеристик
  const getStatFormula = (statName) => {
    const formulas = {
      'Здоровье': '20 + (ВЫН × 5) + (СИЛ × 2)',
      'Стамина': '20 + (ВЫН × 3) + (СИЛ × 2)',
      'Аркановая энергия': 'Если РЕЗ открыт: (РЕЗ × 6) + (ИНТ × 3), иначе: (ИНТ × 3)',
      'Внутренняя энергия': 'Если ВСЛ открыт: (ВСЛ × 5) + (ВЫН × 3) + (ВОЛ × 2), иначе: (ВЫН × 3)',
      'Божественная милость': 'Если БСВ открыт: (БСВ × 6) + (ВОЛ × 3) + (МДР × 2), иначе: (ВОЛ × 2)',
      'Природная гармония': 'Если ГАР открыт: (ГАР × 6) + (ВСП × 3) + (ИНТ × 2), иначе: (ВСП × 2)',
      'Ментальная устойчивость': 'Если ВОЛ открыт: 10 + (ВОЛ × 4) + (ИНТ × 2), иначе: 10 + (ИНТ × 2)'
    };
    return formulas[statName] || 'Формула не определена';
  };

  // Фильтрация характеристик по категориям
  const filterStatsByCategory = (category) => {
    return character?.characterStats?.filter(stat => stat.category === category) || [];
  };

  // Компонент описания характеристики
  const StatDescription = ({ statName }) => {
    const descriptions = {
      'СИЛ': 'Физическая мощь, подъём тяжестей, урон оружием ближнего боя',
      'ЛОВ': 'Координация, точность, рефлексы, скорость',
      'ВЫН': 'Физическая стойкость, сопротивляемость, запас жизненных сил',
      'ИНТ': 'Способность к обучению, анализу, логике, память',
      'ВСП': 'Острота чувств, внимание к деталям, интуитивное понимание окружения',
      'ВОЛ': 'Ментальная стойкость, решимость, самоконтроль',
      'ХАР': 'Личное обаяние, убедительность, лидерские качества',
      'РЕЗ': 'Чувствительность к аркановой магии, манипуляция энергетическими потоками',
      'БСВ': 'Связь с божественными сущностями и планами',
      'ВСЛ': 'Контроль над внутренней энергией тела (ци/прана)',
      'ГАР': 'Связь с природой, духами, естественное равновесие',
      'ИНТЦ': 'Предчувствие опасности, подсознательное понимание, "шестое чувство"',
      'МДР': 'Глубина понимания, жизненный опыт, проницательность, способность к размышлению',
      'УДЧ': 'Благоприятные случайности, счастливые совпадения, судьба',
      'Здоровье': 'Общий запас жизненных сил персонажа, определяет способность выдерживать повреждения',
      'Стамина': 'Запас физической энергии для выполнения действий, требующих усилий',
      'Аркановая энергия': 'Запас магической энергии для использования арканой магии',
      'Внутренняя энергия': 'Запас внутренней силы для техник боевых искусств и подобных умений',
      'Божественная милость': 'Запас божественной силы для применения чудес и благословений',
      'Природная гармония': 'Запас природной силы для использования природной магии',
      'Ментальная устойчивость': 'Способность сопротивляться ментальным воздействиям и контролю'
    };

    return (
      <Typography variant="body2" color="text.secondary">
        {descriptions[statName] || 'Нет описания'}
      </Typography>
    );
  };

  // Добавление новой заметки
  const handleAddNote = (noteData) => {
    console.log('Добавление новой заметки:', noteData);
    // Здесь будет код для отправки заметки на сервер
    setAddNoteDialogOpen(false);
    if (onUpdate) onUpdate();
  };

  // Добавление нового знания
  const handleAddKnowledge = (knowledgeData) => {
    console.log('Добавление нового знания:', knowledgeData);
    // Здесь будет код для отправки знания на сервер
    setAddKnowledgeDialogOpen(false);
    if (onUpdate) onUpdate();
  };

  // Отображение истории изменений
  const renderCharacterHistory = () => {
    // Для примера я добавлю несколько фиктивных записей
    const historyItems = [
      { date: '2025-04-15', user: 'Мастер Игры', action: 'Обновление характеристики СИЛ с 3 на 4' },
      { date: '2025-04-14', user: 'Мастер Игры', action: 'Добавление навыка "Владение клинками" (2)' },
      { date: '2025-04-12', user: 'Система', action: 'Создание персонажа' }
    ];

    return (
      <Dialog 
        open={historyOpen} 
        onClose={() => setHistoryOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>История изменений персонажа</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell>Пользователь</TableCell>
                  <TableCell>Действие</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historyItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.user}</TableCell>
                    <TableCell>{item.action}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <>
      <Paper elevation={3} sx={{ mb: 3, overflow: 'hidden' }}>
        {/* Заголовок карточки с основной информацией */}
        <Box 
          sx={{ 
            p: 3, 
            background: 'linear-gradient(to right, #1a1a2e, #16213e)',
            color: 'white'
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar
                src={character?.avatarUrl || ''}
                alt={character?.name}
                sx={{ width: 100, height: 100, border: '2px solid #61dafb' }}
              />
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom>{character?.name}</Typography>
              <Typography variant="subtitle1">
                {character?.characterOccupation || 'Искатель приключений'} из {character?.homeRegion || 'Перекрестка Миров'}
              </Typography>
              {isGameMaster && (
                <Box mt={1}>
                  <Button 
                    variant="contained" 
                    size="small" 
                    startIcon={<HistoryIcon />}
                    onClick={() => setHistoryOpen(true)}
                    sx={{ mr: 1 }}
                  >
                    История
                  </Button>
                  <Button 
                    variant="contained" 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => setEditDialogOpen(true)}
                  >
                    Редактировать
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>

        {/* Вкладки разделов */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Характеристики" />
            <Tab label="Навыки" />
            <Tab label="Инвентарь" />
            <Tab label="Знания" />
            <Tab label="Заметки" />
            <Tab label="Биография" />
          </Tabs>
        </Box>

        {/* Содержимое вкладки Характеристики */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {/* Базовые характеристики */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Базовые характеристики
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Характеристика</TableCell>
                      <TableCell align="center">Значение</TableCell>
                      <TableCell>Описание</TableCell>
                      {isGameMaster && <TableCell align="center">Действия</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filterStatsByCategory('basic').map((stat) => (
                      <TableRow key={stat.id}>
                        <TableCell>
                          <Typography variant="subtitle1">{stat.name}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={stat.value}
                            color="primary"
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell>
                          <StatDescription statName={stat.name} />
                        </TableCell>
                        {isGameMaster && (
                          <TableCell align="center">
                            <Tooltip title="Изменить">
                              <IconButton 
                                size="small"
                                onClick={() => setEditDialogOpen(true)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Производные показатели */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Производные показатели
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Показатель</TableCell>
                      <TableCell align="center">Значение</TableCell>
                      <TableCell>Формула</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filterStatsByCategory('derived').map((stat) => (
                      <TableRow key={stat.id}>
                        <TableCell>
                          <Typography variant="subtitle1">{stat.name}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={stat.value}
                            color="secondary"
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Tooltip
                              title={getStatFormula(stat.name)}
                              placement="top"
                              open={statInfoOpen === stat.name}
                            >
                              <IconButton 
                                size="small" 
                                onClick={() => toggleStatInfo(stat.name)}
                              >
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Typography variant="body2" ml={1}>
                              {getStatFormula(stat.name)}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Скрытые характеристики (видно только мастеру или если они открыты) */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Скрытые характеристики
                {!isGameMaster && (
                  <Typography variant="caption" sx={{ ml: 2 }}>
                    (видны только после открытия)
                  </Typography>
                )}
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Характеристика</TableCell>
                      <TableCell align="center">Значение</TableCell>
                      <TableCell>Описание</TableCell>
                      <TableCell align="center">Статус</TableCell>
                      {isGameMaster && <TableCell align="center">Действия</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filterStatsByCategory('hidden')
                      .filter(stat => isGameMaster || stat.isVisible)
                      .map((stat) => (
                        <TableRow key={stat.id}>
                          <TableCell>
                            <Typography variant="subtitle1">{stat.name}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={stat.value}
                              color={stat.isVisible ? "success" : "default"}
                              variant={stat.isVisible ? "filled" : "outlined"}
                            />
                          </TableCell>
                          <TableCell>
                            <StatDescription statName={stat.name} />
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              icon={stat.isVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                              label={stat.isVisible ? "Открыто" : "Скрыто"}
                              color={stat.isVisible ? "success" : "default"}
                              size="small"
                            />
                          </TableCell>
                          {isGameMaster && (
                            <TableCell align="center">
                              <Tooltip title={stat.isVisible ? "Скрыть" : "Открыть"}>
                                <IconButton 
                                  size="small"
                                  onClick={() => console.log(`Toggle visibility for ${stat.name}`)}
                                >
                                  {stat.isVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Изменить">
                                <IconButton 
                                  size="small"
                                  onClick={() => setEditDialogOpen(true)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {isGameMaster && (
                <Box mt={2}>
                  <Button 
                    variant="outlined"
                    startIcon={<AddBoxIcon />}
                    onClick={() => setEditDialogOpen(true)}
                  >
                    Добавить характеристику
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* Содержимое вкладки Навыки */}
        <TabPanel value={activeTab} index={1}>
          <Box>
            {Object.keys(skillsByCategory).map((category) => (
              <Paper 
                key={category} 
                variant="outlined" 
                sx={{ mb: 2, overflow: 'hidden' }}
              >
                <Box 
                  sx={{ 
                    p: 2, 
                    cursor: 'pointer', 
                    background: expandedSkillCategory === category ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                    '&:hover': { background: 'rgba(0, 0, 0, 0.03)' }
                  }}
                  onClick={() => toggleSkillCategory(category)}
                >
                  <Typography variant="h6">
                    {getSkillCategoryName(category)} ({skillsByCategory[category].length})
                  </Typography>
                </Box>
                <Collapse in={expandedSkillCategory === category}>
                  <Divider />
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Навык</TableCell>
                          <TableCell align="center">Значение</TableCell>
                          <TableCell>Опыт</TableCell>
                          {isGameMaster && <TableCell align="center">Действия</TableCell>}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {skillsByCategory[category].map((skill) => (
                          <TableRow key={skill.id}>
                            <TableCell>{skill.name}</TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={skill.value}
                                color="primary"
                                variant="filled"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box
                                  sx={{
                                    width: '100%',
                                    backgroundColor: 'background.paper',
                                    height: 10,
                                    borderRadius: 5,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    position: 'relative',
                                    mr: 1
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: `${(skill.experience / ((skill.value + 1) * 10)) * 100}%`,
                                      bgcolor: 'primary.main',
                                      height: '100%',
                                      borderRadius: 5,
                                    }}
                                  />
                                </Box>
                                <Typography variant="body2">
                                  {skill.experience || 0}/{(skill.value + 1) * 10}
                                </Typography>
                              </Box>
                            </TableCell>
                            {isGameMaster && (
                              <TableCell align="center">
                                <Tooltip title="Изменить">
                                  <IconButton 
                                    size="small"
                                    onClick={() => setEditDialogOpen(true)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Collapse>
              </Paper>
            ))}
            {Object.keys(skillsByCategory).length === 0 && (
              <Alert severity="info">У персонажа пока нет навыков</Alert>
            )}
            {isGameMaster && (
              <Box mt={2}>
                <Button 
                  variant="outlined"
                  startIcon={<AddBoxIcon />}
                  onClick={() => setEditDialogOpen(true)}
                >
                  Добавить навык
                </Button>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Содержимое вкладки Инвентарь */}
        <TabPanel value={activeTab} index={2}>
          <Box>
            {character?.characterInventories && character.characterInventories.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Название</TableCell>
                      <TableCell>Тип</TableCell>
                      <TableCell align="center">Количество</TableCell>
                      <TableCell align="center">Вес</TableCell>
                      <TableCell align="center">Цена</TableCell>
                      <TableCell>Статус</TableCell>
                      {isGameMaster && <TableCell align="center">Действия</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {character.characterInventories.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography variant="subtitle2">{item.itemName}</Typography>
                          {item.description && (
                            <Typography variant="body2" color="text.secondary">
                              {item.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const typeNames = {
                              'weapon': 'Оружие',
                              'armor': 'Броня',
                              'consumable': 'Расходник',
                              'material': 'Материал',
                              'artifact': 'Артефакт',
                              'misc': 'Разное'
                            };
                            return typeNames[item.itemType] || item.itemType;
                          })()}
                        </TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="center">{item.weight}</TableCell>
                        <TableCell align="center">{item.value}</TableCell>
                        <TableCell>
                          {item.isEquipped ? (
                            <Chip 
                              label="Экипировано" 
                              color="success" 
                              size="small" 
                            />
                          ) : (
                            <Chip 
                              label="В инвентаре" 
                              variant="outlined" 
                              size="small" 
                            />
                          )}
                        </TableCell>
                        {isGameMaster && (
                          <TableCell align="center">
                            <Tooltip title="Изменить">
                              <IconButton 
                                size="small"
                                onClick={() => setEditDialogOpen(true)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">У персонажа пока нет предметов в инвентаре</Alert>
            )}
            {isGameMaster && (
              <Box mt={2}>
                <Button 
                  variant="outlined"
                  startIcon={<AddBoxIcon />}
                  onClick={() => setEditDialogOpen(true)}
                >
                  Добавить предмет
                </Button>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Содержимое вкладки Знания */}
        <TabPanel value={activeTab} index={3}>
          <Box>
            {character?.characterKnowledges && character.characterKnowledges.length > 0 ? (
              <List>
                {character.characterKnowledges.map((item) => (
                  <Paper 
                    key={item.id} 
                    sx={{ mb: 2, p: 2 }}
                    variant="outlined"
                  >
                    <Typography variant="h6">{item.knowledge?.title || 'Неизвестное знание'}</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Получено: {new Date(item.discoveredAt).toLocaleDateString()}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body1">
                      {item.knowledge?.content || 'Содержимое знания'}
                    </Typography>
                    <Box mt={1} display="flex" justifyContent="space-between" alignItems="center">
                      <Chip 
                        label={`Уровень понимания: ${item.comprehensionLevel}/5`}
                        color={item.isFullyRevealed ? "success" : "warning"}
                        size="small"
                      />
                      {isGameMaster && (
                        <Button 
                          size="small" 
                          startIcon={<EditIcon />}
                          onClick={() => console.log('Редактирование знания')}
                        >
                          Изменить
                        </Button>
                      )}
                    </Box>
                  </Paper>
                ))}
              </List>
            ) : (
              <Alert severity="info">У персонажа пока нет открытых знаний</Alert>
            )}
            {isGameMaster && (
              <Box mt={2}>
                <Button 
                  variant="outlined"
                  startIcon={<AddCircleIcon />}
                  onClick={() => setAddKnowledgeDialogOpen(true)}
                >
                  Добавить знание
                </Button>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Содержимое вкладки Заметки */}
        <TabPanel value={activeTab} index={4}>
          <Box>
            {character?.characterNotes && character.characterNotes.length > 0 ? (
              <List>
                {character.characterNotes.map((note) => (
                  <Paper 
                    key={note.id} 
                    sx={{ mb: 2, p: 2 }}
                    variant="outlined"
                  >
                    <Typography variant="h6">{note.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {note.category && (
                        <Chip 
                          label={note.category}
                          size="small"
                          sx={{ mr: 1, my: 0.5 }}
                        />
                      )}
                      Добавлено: {new Date(note.createdAt).toLocaleDateString()}
                      {note.isPrivate && (
                        <Chip 
                          label="Личная заметка"
                          size="small"
                          color="primary"
                          sx={{ ml: 1, my: 0.5 }}
                        />
                      )}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body1">{note.content}</Typography>
                  </Paper>
                ))}
              </List>
            ) : (
              <Alert severity="info">У персонажа пока нет заметок</Alert>
            )}
            <Box mt={2}>
              <Button 
                variant="outlined"
                startIcon={<NotesIcon />}
                onClick={() => setAddNoteDialogOpen(true)}
              >
                Добавить заметку
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Содержимое вкладки Биография */}
        <TabPanel value={activeTab} index={5}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Предыстория персонажа
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              {character?.background ? (
                <Typography variant="body1">
                  {character.background}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  У персонажа пока нет предыстории
                </Typography>
              )}
            </Paper>
            {isGameMaster && (
              <Box mt={2}>
                <Button 
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setEditDialogOpen(true)}
                >
                  Редактировать биографию
                </Button>
              </Box>
            )}
          </Box>
        </TabPanel>
      </Paper>

      {/* Диалог отображения формулы */}
      <Dialog 
        open={isFormulaDialogOpen} 
        onClose={() => setIsFormulaDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Формула расчета</DialogTitle>
        <DialogContent>
          <Typography variant="body1">{selectedFormula}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsFormulaDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования персонажа */}
      {isGameMaster && editDialogOpen && (
        <CharacterEditDialog 
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          character={character}
          onSave={() => {
            setEditDialogOpen(false);
            if (onUpdate) onUpdate();
          }}
        />
      )}

      {/* Диалог добавления заметки */}
      <Dialog 
        open={addNoteDialogOpen} 
        onClose={() => setAddNoteDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Добавить заметку</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Заголовок"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Категория"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Содержание заметки"
            multiline
            rows={8}
            fullWidth
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddNoteDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={() => handleAddNote({
              title: 'Тестовая заметка',
              content: 'Текст заметки',
              category: 'Квест'
            })}
            variant="contained"
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог добавления знания */}
      <Dialog 
        open={addKnowledgeDialogOpen} 
        onClose={() => setAddKnowledgeDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Добавить знание</DialogTitle>
        <DialogContent>
          <TextField
            label="Выберите знание из справочника"
            fullWidth
            variant="outlined"
            sx={{ mb: 2, mt: 1 }}
          />
          <Box sx={{ display: 'flex', mb: 2 }}>
            <TextField
              label="Уровень понимания (1-5)"
              type="number"
              InputProps={{ inputProps: { min: 1, max: 5 } }}
              sx={{ mr: 2, width: '50%' }}
            />
            <TextField
              label="Контекст получения"
              sx={{ width: '50%' }}
            />
          </Box>
          <TextField
            label="Примечания"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddKnowledgeDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={() => handleAddKnowledge({
              knowledgeId: '123',
              comprehensionLevel: 2,
              isFullyRevealed: true
            })}
            variant="contained"
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог истории персонажа */}
      {renderCharacterHistory()}
    </>
  );
};

export default CharacterCard;