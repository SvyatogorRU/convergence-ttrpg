// client/src/components/knowledge/KnowledgeReferenceSystem.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  CircularProgress,
  Chip,
  Button,
  IconButton,
  Divider,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  TreeView,
  TreeItem,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ArrowForward as ArrowForwardIcon,
  CloudDownload as CloudDownloadIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

// Пример структуры категорий знаний
const knowledgeCategories = [
  {
    id: 'world',
    name: 'Мир Конвергенции',
    children: [
      { id: 'world-basics', name: 'Основы мира' },
      { id: 'world-geography', name: 'География' },
      { id: 'world-history', name: 'История' },
      { id: 'world-fragments', name: 'Осколки миров' }
    ]
  },
  {
    id: 'mechanics',
    name: 'Механики',
    children: [
      { id: 'mechanics-basics', name: 'Основные системы' },
      { id: 'mechanics-formulas', name: 'Система формул' },
      { id: 'mechanics-chars', name: 'Характеристики' },
      { id: 'mechanics-skills', name: 'Навыки' },
      { id: 'mechanics-combat', name: 'Боевая система' },
      { id: 'mechanics-economy', name: 'Экономика' },
      { id: 'mechanics-groups', name: 'Группы' },
      { id: 'mechanics-knowledge', name: 'Система знаний' }
    ]
  },
  {
    id: 'player-guide',
    name: 'Справочник игрока',
    children: [
      { id: 'guide-basics', name: 'Начальная информация' },
      { id: 'guide-creation', name: 'Создание персонажа' }
    ]
  }
];

// Пример записей знаний
const mockKnowledgeEntries = [
  {
    id: 'k1',
    title: 'Основы мира Конвергенции',
    category: 'world-basics',
    content: `# Мир Конвергенции

## Фундаментальные принципы
Мир Конвергенции существует на пересечении множества реальностей. Магия здесь всегда была естественной частью мироздания, питающей все живое и неживое. Этот мир уникален тем, что притягивает к себе фрагменты других реальностей — явление, известное как "Схождение".

## Магические основы
Магия в этом мире - естественное явление, подобно воздуху или воде. Различные расы и культуры по-разному взаимодействуют с магическими потоками, создавая уникальные традиции и школы магического искусства.`,
    tags: ['основы', 'мир', 'магия', 'схождение'],
    accessLevel: 'all',
    visibilityConditions: null,
    createdAt: '2025-01-15',
    updatedAt: '2025-03-20'
  },
  {
    id: 'k2',
    title: 'Система характеристик',
    category: 'mechanics-chars',
    content: `# Система характеристик

## Базовые характеристики (видимые всем)

- **Сила (СИЛ)**: Физическая мощь, подъём тяжестей, урон оружием ближнего боя
- **Ловкость (ЛОВ)**: Координация, точность, рефлексы, скорость
- **Выносливость (ВЫН)**: Физическая стойкость, сопротивляемость, запас жизненных сил
- **Интеллект (ИНТ)**: Способность к обучению, анализу, логике, память
- **Восприятие (ВСП)**: Острота чувств, внимание к деталям, интуитивное понимание окружения

## Скрытые характеристики

- **Воля (ВОЛ)**: Ментальная стойкость, решимость, самоконтроль
  - *Открытие*: Успешное сопротивление эффекту ментального контроля или панике

- **Харизма (ХАР)**: Личное обаяние, убедительность, лидерские качества
  - *Открытие*: Успешное влияние на группу незнакомцев или вдохновение союзников`,
    tags: ['механики', 'характеристики', 'базовые', 'скрытые'],
    accessLevel: 'all',
    visibilityConditions: null,
    createdAt: '2025-01-10',
    updatedAt: '2025-02-25'
  },
  {
    id: 'k3',
    title: 'Система формул',
    category: 'mechanics-formulas',
    content: `# Система детерминированных формул

## Основные принципы
Вместо случайных бросков кубиков, все результаты действий определяются математическими формулами, основанными на характеристиках персонажа, навыках и ситуативных факторах. Эта система:

- **Вознаграждает развитие навыков** - высокие навыки надежно дают хорошие результаты
- **Поощряет стратегическое планирование** - игроки могут сосредоточиться на улучшении ключевых параметров
- **Устраняет элемент случайности** - нет фрустрации от "невезения" при высоких навыках
- **Остается скрытой от игроков** - они видят только описательные результаты`,
    tags: ['механики', 'формулы', 'действия', 'детерминизм'],
    accessLevel: 'gm',
    visibilityConditions: { minRole: 'gamemaster' },
    createdAt: '2025-01-05',
    updatedAt: '2025-04-10'
  },
  {
    id: 'k4',
    title: 'Перекресток Миров',
    category: 'world-geography',
    content: `# Перекресток Миров

## Общее описание
Перекресток Миров — центральный город континента, служащий нейтральной зоной и отправной точкой для всех искателей приключений. Город получил свое название благодаря уникальному расположению на пересечении торговых путей и магических потоков.

## Уникальные особенности
- **Изменчивый климат**: Благодаря особой магической аномалии климат города непредсказуемо меняется, проходя через все сезоны за короткие промежутки времени. Некоторые районы города могут одновременно находиться в разных климатических условиях.

- **Нейтральная территория**: Город не принадлежит ни одному из государств и управляется Советом представителей всех основных рас и фракций.`,
    tags: ['география', 'город', 'нейтральная территория'],
    accessLevel: 'all',
    visibilityConditions: null,
    createdAt: '2025-02-05',
    updatedAt: '2025-02-05'
  },
  {
    id: 'k5',
    title: 'Механика Схождения',
    category: 'world-fragments',
    content: `# Механика Схождения

## Основная концепция

Схождение — уникальный феномен мира Конвергенции, при котором фрагменты иных реальностей проникают в мир, интегрируясь с ним и изменяя ландшафт, структуру общества, магические законы и другие аспекты. Эти вторжения называются "осколками миров" и являются источником многообразия и непредсказуемости игрового мира.`,
    tags: ['схождение', 'осколки', 'механика'],
    accessLevel: 'gm',
    visibilityConditions: { minRole: 'gamemaster' },
    createdAt: '2025-03-01',
    updatedAt: '2025-03-01'
  }
];

// Компонент для панели фильтров
const FilterPanel = ({ filters, onFilterChange, onClearFilters }) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }} variant="outlined">
      <Box display="flex" alignItems="center" mb={1}>
        <FilterListIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="div">
          Фильтры
        </Typography>
        <Button 
          size="small" 
          sx={{ ml: 'auto' }}
          onClick={onClearFilters}
          startIcon={<ClearIcon />}
        >
          Очистить
        </Button>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Autocomplete
            multiple
            options={['основы', 'механики', 'характеристики', 'формулы', 'география']}
            value={filters.tags}
            onChange={(_, newValue) => onFilterChange('tags', newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Теги" variant="outlined" size="small" />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option}
                  size="small"
                  {...getTagProps({ index })}
                />
              ))
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            select
            fullWidth
            label="Уровень доступа"
            value={filters.accessLevel}
            onChange={(e) => onFilterChange('accessLevel', e.target.value)}
            SelectProps={{
              native: true,
            }}
            size="small"
          >
            <option value="">Все</option>
            <option value="all">Общедоступно</option>
            <option value="gm">Только для мастеров</option>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            select
            fullWidth
            label="Сортировка"
            value={filters.sort}
            onChange={(e) => onFilterChange('sort', e.target.value)}
            SelectProps={{
              native: true,
            }}
            size="small"
          >
            <option value="title_asc">По названию (А-Я)</option>
            <option value="title_desc">По названию (Я-А)</option>
            <option value="date_desc">Новые сначала</option>
            <option value="date_asc">Старые сначала</option>
          </TextField>
        </Grid>
      </Grid>
    </Paper>
  );
};

// Вспомогательная функция для создания структуры дерева категорий
const renderCategoryTree = (categories, expanded, handleNodeToggle) => {
  return categories.map((category) => (
    <TreeItem 
      key={category.id} 
      nodeId={category.id} 
      label={category.name}
    >
      {category.children &&
        category.children.map((child) => (
          <TreeItem 
            key={child.id} 
            nodeId={child.id} 
            label={child.name} 
          />
        ))}
    </TreeItem>
  ));
};

// Компонент просмотра деталей знания
const KnowledgeDetail = ({ entry, onClose, onEdit, canEdit }) => {
  return (
    <Dialog open={!!entry} onClose={onClose} maxWidth="md" fullWidth>
      {entry && (
        <>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">{entry.title}</Typography>
              {canEdit && (
                <IconButton onClick={() => onEdit(entry)}>
                  <EditIcon />
                </IconButton>
              )}
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ mb: 2 }}>
              {entry.tags.map(tag => (
                <Chip 
                  key={tag} 
                  label={tag} 
                  size="small" 
                  sx={{ mr: 0.5, mb: 0.5 }} 
                />
              ))}
              <Chip 
                label={entry.accessLevel === 'gm' ? 'Только для мастеров' : 'Общедоступно'} 
                color={entry.accessLevel === 'gm' ? 'secondary' : 'primary'}
                size="small" 
                sx={{ mr: 0.5, mb: 0.5 }} 
              />
              <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                Последнее обновление: {new Date(entry.updatedAt).toLocaleDateString()}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 1 }} />
            
            <div dangerouslySetInnerHTML={{ __html: entry.content.replace(/\n/g, '<br>') }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Закрыть</Button>
            <Button startIcon={<CloudDownloadIcon />}>Экспорт</Button>
            {canEdit && (
              <Button 
                variant="contained" 
                startIcon={<ArrowForwardIcon />}
              >
                Добавить персонажу
              </Button>
            )}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

// Компонент редактирования знания
const KnowledgeEditor = ({ entry, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [],
    accessLevel: 'all'
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title || '',
        content: entry.content || '',
        category: entry.category || '',
        tags: entry.tags || [],
        accessLevel: entry.accessLevel || 'all'
      });
    }
  }, [entry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagsChange = (_, newTags) => {
    setFormData(prev => ({
      ...prev,
      tags: newTags
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {entry ? 'Редактирование знания' : 'Создание нового знания'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Название"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Категория"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              SelectProps={{
                native: true,
              }}
              margin="normal"
            >
              <option value="">Выберите категорию</option>
              {knowledgeCategories.flatMap(cat => 
                cat.children.map(child => (
                  <option key={child.id} value={child.id}>
                    {cat.name} - {child.name}
                  </option>
                ))
              )}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Уровень доступа"
              name="accessLevel"
              value={formData.accessLevel}
              onChange={handleChange}
              required
              SelectProps={{
                native: true,
              }}
              margin="normal"
            >
              <option value="all">Общедоступно</option>
              <option value="gm">Только для мастеров</option>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              freeSolo
              options={['основы', 'механики', 'характеристики', 'формулы', 'география']}
              value={formData.tags}
              onChange={handleTagsChange}
              renderInput={(params) => (
                <TextField {...params} label="Теги" variant="outlined" margin="normal" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                  />
                ))
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Содержимое"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              multiline
              rows={15}
              margin="normal"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!formData.title || !formData.category || !formData.content}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Основной компонент системы справочников
const KnowledgeReferenceSystem = () => {
  const { currentUser } = useAuth();
  const isGameMaster = currentUser && ['admin', 'gamemaster'].includes(currentUser.role);
  
  const [loading, setLoading] = useState(false);
  const [knowledgeEntries, setKnowledgeEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expandedNodes, setExpandedNodes] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    tags: [],
    accessLevel: '',
    sort: 'title_asc'
  });
  const [bookmarkedEntries, setBookmarkedEntries] = useState([]);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Здесь будет реальный запрос к API
        // В данном случае используем моковые данные
        setKnowledgeEntries(mockKnowledgeEntries);
        setFilteredEntries(mockKnowledgeEntries);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Фильтрация записей при изменении фильтров или поиске
  useEffect(() => {
    let result = [...knowledgeEntries];
    
    // Фильтрация по категории
    if (selectedCategory) {
      result = result.filter(entry => entry.category === selectedCategory);
    }
    
    // Фильтрация по поиску
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(entry => 
        entry.title.toLowerCase().includes(query) || 
        entry.content.toLowerCase().includes(query) ||
        entry.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Фильтрация по тегам
    if (filters.tags.length > 0) {
      result = result.filter(entry => 
        filters.tags.some(tag => entry.tags.includes(tag))
      );
    }
    
    // Фильтрация по уровню доступа
    if (filters.accessLevel) {
      result = result.filter(entry => entry.accessLevel === filters.accessLevel);
    }
    
    // Сортировка
    result.sort((a, b) => {
      switch (filters.sort) {
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        case 'date_desc':
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case 'date_asc':
          return new Date(a.updatedAt) - new Date(b.updatedAt);
        default:
          return 0;
      }
    });
    
    // Фильтрация по вкладке "Закладки"
    if (activeTab === 1) {
      result = result.filter(entry => bookmarkedEntries.includes(entry.id));
    }
    
    setFilteredEntries(result);
  }, [
    knowledgeEntries, 
    searchQuery, 
    selectedCategory, 
    filters, 
    activeTab,
    bookmarkedEntries
  ]);

  // Обработчики
  const handleCategorySelect = (event, nodeIds) => {
    setSelectedCategory(nodeIds);
  };

  const handleNodeToggle = (event, nodeIds) => {
    setExpandedNodes(nodeIds);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      tags: [],
      accessLevel: '',
      sort: 'title_asc'
    });
  };

  const handleEntrySelect = (entry) => {
    setSelectedEntry(entry);
  };

  const handleEntryClose = () => {
    setSelectedEntry(null);
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
  };

  const handleCreateEntry = () => {
    setEditingEntry({});
  };

  const handleSaveEntry = (formData) => {
    // Здесь будет код отправки данных на сервер
    console.log('Сохранение записи:', formData);
    
    if (editingEntry.id) {
      // Обновление существующей записи
      const updatedEntries = knowledgeEntries.map(entry => 
        entry.id === editingEntry.id 
          ? { ...entry, ...formData, updatedAt: new Date().toISOString() } 
          : entry
      );
      setKnowledgeEntries(updatedEntries);
    } else {
      // Создание новой записи
      const newEntry = {
        id: `k${knowledgeEntries.length + 1}`,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setKnowledgeEntries([...knowledgeEntries, newEntry]);
    }
    
    setEditingEntry(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleBookmarkToggle = (entryId) => {
    if (bookmarkedEntries.includes(entryId)) {
      setBookmarkedEntries(bookmarkedEntries.filter(id => id !== entryId));
    } else {
      setBookmarkedEntries([...bookmarkedEntries, entryId]);
    }
  };

  // Рендеринг компонента
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        База знаний
      </Typography>
      
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ mb: 2 }}
      >
        <Tab label="Справочники" />
        <Tab label="Закладки" />
      </Tabs>
      
      <Grid container spacing={3}>
        {/* Боковая панель с категориями */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, mb: 2 }} variant="outlined">
            <TextField
              fullWidth
              placeholder="Поиск в базе знаний..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              size="small"
              sx={{ mb: 2 }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Категории
            </Typography>
            
            <TreeView
              expanded={expandedNodes}
              selected={selectedCategory}
              onNodeSelect={handleCategorySelect}
              onNodeToggle={handleNodeToggle}
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpandIcon={<ChevronRightIcon />}
              sx={{ height: 400, overflow: 'auto' }}
            >
              {renderCategoryTree(knowledgeCategories, expandedNodes, handleNodeToggle)}
            </TreeView>
          </Paper>
          
          {isGameMaster && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              fullWidth
              onClick={handleCreateEntry}
            >
              Добавить знание
            </Button>
          )}
        </Grid>
        
        {/* Основная панель со списком знаний */}
        <Grid item xs={12} md={9}>
          <FilterPanel 
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
          
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {filteredEntries.length === 0 ? (
                <Alert severity="info">
                  {activeTab === 1 
                    ? 'У вас еще нет закладок. Нажмите на иконку закладки рядом с интересующим знанием, чтобы добавить его в этот список.'
                    : 'Нет записей, соответствующих условиям поиска'}
                </Alert>
              ) : (
                <List>
                  {filteredEntries.map((entry) => (
                    <Paper 
                      key={entry.id} 
                      sx={{ 
                        mb: 2, 
                        borderLeft: entry.accessLevel === 'gm' 
                          ? '4px solid #f44336' // Красная полоса для мастерских знаний
                          : '4px solid #4caf50'  // Зеленая полоса для общедоступных
                      }}
                      variant="outlined"
                    >
                      <ListItem
                        button
                        onClick={() => handleEntrySelect(entry)}
                        secondaryAction={
                          <IconButton edge="end" onClick={(e) => {
                            e.stopPropagation();
                            handleBookmarkToggle(entry.id);
                          }}>
                            {bookmarkedEntries.includes(entry.id) 
                              ? <BookmarkIcon color="primary" />
                              : <BookmarkBorderIcon />}
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1">
                              {entry.title}
                              {entry.accessLevel === 'gm' && (
                                <Chip
                                  label="Только для мастеров"
                                  size="small"
                                  color="secondary"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {entry.content.substring(0, 150)}...
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                {entry.tags.map(tag => (
                                  <Chip 
                                    key={tag} 
                                    label={tag} 
                                    size="small" 
                                    sx={{ mr: 0.5, mb: 0.5 }} 
                                  />
                                ))}
                              </Box>
                            </>
                          }
                        />
                      </ListItem>
                    </Paper>
                  ))}
                </List>
              )}
            </>
          )}
        </Grid>
      </Grid>

      {/* Диалог просмотра деталей */}
      {selectedEntry && (
        <KnowledgeDetail
          entry={selectedEntry}
          onClose={handleEntryClose}
          onEdit={handleEditEntry}
          canEdit={isGameMaster}
        />
      )}

      {/* Диалог редактирования */}
      {editingEntry !== null && (
        <KnowledgeEditor
          entry={editingEntry.id ? editingEntry : null}
          onClose={() => setEditingEntry(null)}
          onSave={handleSaveEntry}
        />
      )}
    </Box>
  );
};

export default KnowledgeReferenceSystem;