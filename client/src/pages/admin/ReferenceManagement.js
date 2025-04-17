import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tab,
  Tabs,
  Alert,
  Chip,
  CircularProgress,
  Switch,
  FormControlLabel,
  Tooltip,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterAlt as FilterIcon,
  Refresh as RefreshIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { referenceService, userService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// Компонент для отображения вкладки
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reference-tabpanel-${index}`}
      aria-labelledby={`reference-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ReferenceManagement = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Состояние для управления вкладками типов справочников
  const [activeTab, setActiveTab] = useState(0);
  const referenceTypes = [
    { value: 'skill', label: 'Навыки' },
    { value: 'item', label: 'Предметы' },
    { value: 'spell', label: 'Заклинания' },
    { value: 'monster', label: 'Монстры' },
    { value: 'location', label: 'Локации' },
    { value: 'race', label: 'Расы' },
    { value: 'class', label: 'Классы' }
  ];
  
  // Состояние для списка элементов справочника
  const [referenceItems, setReferenceItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Состояние для фильтрации и поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  
  // Состояние для диалога добавления/редактирования
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState({
    name: '',
    type: referenceTypes[0].value,
    category: '',
    description: '',
    properties: {},
    requirements: {},
    isPublic: false
  });
  
  // Состояние для управления правами на справочник
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [gameMasters, setGameMasters] = useState([]);
  const [selectedGameMaster, setSelectedGameMaster] = useState(null);
  const [permissions, setPermissions] = useState({
    referenceType: 'all',
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canGrantAccess: false
  });
  
  // Получение типа справочника для текущей вкладки
  const getCurrentReferenceType = () => {
    return referenceTypes[activeTab]?.value || 'skill';
  };
  
  // Загрузка элементов справочника
  const fetchReferenceItems = async () => {
    try {
      setLoading(true);
      setError('');
      
      const type = getCurrentReferenceType();
      
      // Загрузка категорий для данного типа справочника
      const categoriesResponse = await referenceService.getCategories(type);
      setCategories(categoriesResponse.data);
      
      // Параметры запроса
      const params = {
        type,
        search: searchQuery || undefined,
        category: categoryFilter || undefined,
        limit: rowsPerPage,
        offset: page * rowsPerPage
      };
      
      // Загрузка элементов справочника
      const response = await referenceService.getAll(params);
      
      setReferenceItems(response.data.items);
      setTotalItems(response.data.total);
    } catch (err) {
      console.error('Ошибка при загрузке справочника:', err);
      setError('Не удалось загрузить справочник: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузка мастеров для управления правами
  const fetchGameMasters = async () => {
    try {
      setLoading(true);
      
      const response = await userService.getAll({ role: 'gamemaster' });
      setGameMasters(response.data.users);
    } catch (err) {
      console.error('Ошибка при загрузке мастеров:', err);
      setError('Не удалось загрузить список мастеров');
    } finally {
      setLoading(false);
    }
  };
  
  // Обработчик смены вкладки
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Сбрасываем фильтры при смене вкладки
    setSearchQuery('');
    setCategoryFilter('');
    setPage(0);
  };
  
  // Обработчик смены страницы
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Обработчик изменения количества строк на странице
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Применение фильтров
  const handleApplyFilters = () => {
    setPage(0); // Сбрасываем на первую страницу
    fetchReferenceItems();
  };
  
  // Сброс фильтров
  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setPage(0);
    
    // После сброса фильтров загружаем данные
    setTimeout(() => fetchReferenceItems(), 0);
  };
  
  // Открытие диалога создания нового элемента
  const handleOpenCreateDialog = () => {
    setCurrentItem({
      name: '',
      type: getCurrentReferenceType(),
      category: '',
      description: '',
      properties: {},
      requirements: {},
      isPublic: false
    });
    setIsEditMode(false);
    setIsDialogOpen(true);
  };
  
  // Открытие диалога редактирования
  const handleOpenEditDialog = (item) => {
    setCurrentItem({
      ...item,
      properties: item.properties || {},
      requirements: item.requirements || {}
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Изменение полей элемента справочника
  const handleItemChange = (field, value) => {
    if (field === 'properties' || field === 'requirements') {
      // Попытка преобразовать строку JSON в объект
      try {
        const parsedValue = JSON.parse(value);
        setCurrentItem(prev => ({
          ...prev,
          [field]: parsedValue
        }));
      } catch (err) {
        // Если не удается распарсить как JSON, сохраняем как простое значение
        setCurrentItem(prev => ({
          ...prev,
          [field]: value
        }));
      }
    } else {
      setCurrentItem(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };
  
  // Сохранение элемента справочника
  const handleSaveItem = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Проверка обязательных полей
      if (!currentItem.name || !currentItem.type) {
        setError('Заполните обязательные поля: название и тип');
        setLoading(false);
        return;
      }
      
      // Преобразование объектов свойств и требований в строки JSON
      const itemToSave = {
        ...currentItem,
        properties: typeof currentItem.properties === 'string' 
          ? JSON.parse(currentItem.properties) 
          : currentItem.properties,
        requirements: typeof currentItem.requirements === 'string'
          ? JSON.parse(currentItem.requirements)
          : currentItem.requirements
      };
      
      if (isEditMode) {
        // Обновление существующего элемента
        await referenceService.update(currentItem.id, itemToSave);
        setSuccess('Элемент справочника успешно обновлен');
      } else {
        // Создание нового элемента
        await referenceService.create(itemToSave);
        setSuccess('Элемент справочника успешно создан');
      }
      
      setIsDialogOpen(false);
      fetchReferenceItems(); // Обновляем список
    } catch (err) {
      console.error('Ошибка при сохранении элемента справочника:', err);
      setError('Не удалось сохранить элемент справочника: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Удаление элемента справочника
  const handleDeleteItem = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот элемент справочника?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await referenceService.delete(id);
      setSuccess('Элемент справочника успешно удален');
      
      fetchReferenceItems(); // Обновляем список
    } catch (err) {
      console.error('Ошибка при удалении элемента справочника:', err);
      setError('Не удалось удалить элемент справочника: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Открытие диалога управления правами
  const handleOpenPermissionsDialog = () => {
    fetchGameMasters();
    setSelectedGameMaster(null);
    setPermissions({
      referenceType: 'all',
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canGrantAccess: false
    });
    setIsPermissionDialogOpen(true);
  };
  
  // Сохранение прав доступа
  const handleSavePermissions = async () => {
    if (!selectedGameMaster) {
      setError('Выберите мастера для назначения прав');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const permissionData = {
        userId: selectedGameMaster.id,
        ...permissions
      };
      
      await referenceService.addPermission(permissionData);
      setSuccess('Права доступа успешно обновлены');
      
      setIsPermissionDialogOpen(false);
    } catch (err) {
      console.error('Ошибка при обновлении прав доступа:', err);
      setError('Не удалось обновить права доступа: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Инициализация при монтировании компонента
  useEffect(() => {
    fetchReferenceItems();
  }, [activeTab, page, rowsPerPage]);
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Управление справочниками</Typography>
        
        {currentUser?.role === 'admin' && (
          <Button 
            variant="outlined" 
            startIcon={<AdminIcon />}
            onClick={handleOpenPermissionsDialog}
          >
            Управление правами
          </Button>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {referenceTypes.map((type, index) => (
            <Tab key={type.value} label={type.label} id={`reference-tab-${index}`} />
          ))}
        </Tabs>
        
        {/* Панель фильтрации */}
        <Box p={2}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Поиск"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon color="action" sx={{ mr: 1 }} />
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="category-filter-label">Категория</InputLabel>
                <Select
                  labelId="category-filter-label"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Категория"
                >
                  <MenuItem value="">Все категории</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  startIcon={<FilterIcon />}
                  onClick={handleApplyFilters}
                >
                  Применить фильтры
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleResetFilters}
                >
                  Сбросить
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreateDialog}
                >
                  Добавить
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {/* Таблица элементов справочника */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Категория</TableCell>
                  <TableCell>Описание</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Автор</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {referenceItems.length > 0 ? (
                  referenceItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category || '—'}</TableCell>
                      <TableCell>
                        {item.description 
                          ? item.description.length > 100 
                            ? item.description.substring(0, 100) + '...' 
                            : item.description 
                          : '—'
                        }
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={item.isPublic ? <PublicIcon /> : <LockIcon />}
                          label={item.isPublic ? 'Публичный' : 'Приватный'}
                          color={item.isPublic ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{item.Creator?.username || 'Система'}</TableCell>
                      <TableCell>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenEditDialog(item)}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteItem(item.id)}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Нет элементов справочника
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      {/* Диалог создания/редактирования элемента справочника */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {isEditMode ? 'Редактирование элемента справочника' : 'Создание нового элемента справочника'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Название *"
                value={currentItem.name}
                onChange={(e) => handleItemChange('name', e.target.value)}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Тип *</InputLabel>
                <Select
                  value={currentItem.type}
                  onChange={(e) => handleItemChange('type', e.target.value)}
                  label="Тип *"
                  disabled={isEditMode} // Тип нельзя изменить при редактировании
                >
                  {referenceTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                freeSolo
                options={categories}
                value={currentItem.category || ''}
                onChange={(_, newValue) => handleItemChange('category', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Категория"
                    margin="normal"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentItem.isPublic}
                    onChange={(e) => handleItemChange('isPublic', e.target.checked)}
                  />
                }
                label="Публичный (доступен всем мастерам)"
                sx={{ mt: 3 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Описание"
                value={currentItem.description || ''}
                onChange={(e) => handleItemChange('description', e.target.value)}
                multiline
                rows={4}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Свойства (JSON)"
                value={typeof currentItem.properties === 'object' 
                  ? JSON.stringify(currentItem.properties, null, 2) 
                  : currentItem.properties || '{}'}
                onChange={(e) => handleItemChange('properties', e.target.value)}
                multiline
                rows={6}
                margin="normal"
                helperText="Введите свойства элемента в формате JSON"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Требования (JSON)"
                value={typeof currentItem.requirements === 'object' 
                  ? JSON.stringify(currentItem.requirements, null, 2) 
                  : currentItem.requirements || '{}'}
                onChange={(e) => handleItemChange('requirements', e.target.value)}
                multiline
                rows={6}
                margin="normal"
                helperText="Введите требования элемента в формате JSON"
              />
            </Grid>
          </Grid>
          
          {/* Примеры структуры JSON для разных типов */}
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Пример структуры свойств для {
                currentItem.type === 'skill' ? 'навыка' :
                currentItem.type === 'item' ? 'предмета' :
                currentItem.type === 'spell' ? 'заклинания' :
                currentItem.type === 'monster' ? 'монстра' :
                'элемента справочника'
              }:
            </Typography>
            <Typography variant="caption" component="pre" sx={{ 
              p: 1, 
              bgcolor: 'background.paper', 
              border: '1px solid', 
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'auto'
            }}>
              {currentItem.type === 'skill' && 
                `{
  "baseCharacteristic": "ЛОВ",
  "secondaryCharacteristic": "ИНТ",
  "progression": "standard",
  "unlockedTechniques": [
    { "threshold": 5, "name": "Базовая техника", "description": "Описание базовой техники" },
    { "threshold": 10, "name": "Продвинутая техника", "description": "Описание продвинутой техники" }
  ]
}`}
              {currentItem.type === 'item' && 
                `{
  "weight": 1.5,
  "value": 50,
  "rarity": "common",
  "equipSlot": "hands",
  "effects": [
    { "type": "damage", "value": 5, "damageType": "physical" },
    { "type": "bonus", "characteristic": "СИЛ", "value": 1 }
  ]
}`}
              {currentItem.type === 'spell' && 
                `{
  "level": 3,
  "school": "evocation",
  "castingTime": "1 action",
  "range": 30,
  "duration": "instantaneous",
  "components": ["verbal", "somatic", "material"],
  "energyCost": 10,
  "effects": [
    { "type": "damage", "formula": "3d6", "damageType": "fire" }
  ]
}`}
              {currentItem.type === 'monster' && 
                `{
  "level": 5,
  "stats": {
    "СИЛ": 16,
    "ЛОВ": 14,
    "ВЫН": 15,
    "ИНТ": 8,
    "ВСП": 12
  },
  "hitPoints": 80,
  "armorClass": 15,
  "attacks": [
    { "name": "Укус", "toHit": 6, "damage": "2d6+3", "damageType": "physical" }
  ],
  "resistances": ["fire", "cold"],
  "weaknesses": ["lightning"],
  "specialAbilities": [
    { "name": "Регенерация", "description": "Восстанавливает 5 ОЗ в начале своего хода" }
  ]
}`}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>
            Отмена
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveItem}
            disabled={loading || !currentItem.name || !currentItem.type}
          >
            {isEditMode ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Диалог управления правами доступа */}
      <Dialog
        open={isPermissionDialogOpen}
        onClose={() => setIsPermissionDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Управление правами доступа к справочникам
        </DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Box display="flex" justifyContent="center" my={5}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Выберите мастера для назначения прав
                </Typography>
                <Autocomplete
                  options={gameMasters}
                  getOptionLabel={(option) => option.username}
                  value={selectedGameMaster}
                  onChange={(_, newValue) => setSelectedGameMaster(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Мастер игры"
                      margin="normal"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Настройка прав доступа
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Тип справочника</InputLabel>
                  <Select
                    value={permissions.referenceType}
                    onChange={(e) => setPermissions({ ...permissions, referenceType: e.target.value })}
                    label="Тип справочника"
                  >
                    <MenuItem value="all">Все типы</MenuItem>
                    {referenceTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={permissions.canView}
                        onChange={(e) => setPermissions({ ...permissions, canView: e.target.checked })}
                        color="primary"
                      />
                    }
                    label="Просмотр"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={permissions.canCreate}
                        onChange={(e) => setPermissions({ ...permissions, canCreate: e.target.checked })}
                        color="primary"
                      />
                    }
                    label="Создание"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={permissions.canEdit}
                        onChange={(e) => setPermissions({ ...permissions, canEdit: e.target.checked })}
                        color="primary"
                      />
                    }
                    label="Редактирование"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={permissions.canDelete}
                        onChange={(e) => setPermissions({ ...permissions, canDelete: e.target.checked })}
                        color="primary"
                      />
                    }
                    label="Удаление"
                  />
                  <Tooltip title="Разрешить мастеру давать права доступа другим мастерам">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={permissions.canGrantAccess}
                          onChange={(e) => setPermissions({ ...permissions, canGrantAccess: e.target.checked })}
                          color="primary"
                        />
                      }
                      label="Управление правами"
                    />
                  </Tooltip>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPermissionDialogOpen(false)}>
            Отмена
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSavePermissions}
            disabled={loading || !selectedGameMaster}
          >
            Сохранить права
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReferenceManagement;