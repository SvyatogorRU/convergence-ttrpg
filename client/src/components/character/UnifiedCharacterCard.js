import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Divider,
  Chip,
  IconButton,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Psychology as PsychologyIcon,
  LibraryAdd as LibraryAddIcon
} from '@mui/icons-material';
import { characterService, referenceService } from '../../services/api';

const UnifiedCharacterCard = ({ character, isGameMaster, onCharacterUpdated }) => {
  const [showHiddenStats, setShowHiddenStats] = useState(false);
  const [editMode, setEditMode] = useState({
    basicInfo: false,
    stats: false,
    skills: false,
    inventory: false
  });
  const [editedCharacter, setEditedCharacter] = useState({ ...character });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Диалоги для добавления элементов из справочника
  const [referenceDialogOpen, setReferenceDialogOpen] = useState(false);
  const [referenceType, setReferenceType] = useState('');
  const [referenceItems, setReferenceItems] = useState([]);
  const [selectedReferenceItem, setSelectedReferenceItem] = useState(null);
  
  // Состояние для новой характеристики
  const [newStat, setNewStat] = useState({ name: '', value: 1, isVisible: false, category: 'hidden' });

  // Включение режима редактирования для определенной секции
  const handleEnableEdit = (section) => {
    setEditedCharacter({ ...character });
    setEditMode(prev => ({ ...prev, [section]: true }));
  };

  // Отмена редактирования
  const handleCancelEdit = (section) => {
    setEditMode(prev => ({ ...prev, [section]: false }));
    setError('');
  };

  // Обработчик изменения базовой информации
  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setEditedCharacter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Обработчик изменения характеристики
  const handleStatChange = (statId, field, value) => {
    setEditedCharacter(prev => ({
      ...prev,
      characterStats: prev.characterStats.map(stat => 
        stat.id === statId ? { ...stat, [field]: value } : stat
      )
    }));
  };

  // Обработчик удаления характеристики
  const handleDeleteStat = async (statId) => {
    if (!confirm('Вы уверены, что хотите удалить эту характеристику?')) {
      return;
    }
    
    try {
      setLoading(true);
      // Здесь должен быть API запрос для удаления характеристики
      // await characterService.deleteStat(character.id, statId);
      
      // Временно обновляем локальное состояние
      setEditedCharacter(prev => ({
        ...prev,
        characterStats: prev.characterStats.filter(stat => stat.id !== statId)
      }));
      
      setSuccess('Характеристика успешно удалена');
    } catch (err) {
      console.error('Ошибка при удалении характеристики:', err);
      setError('Не удалось удалить характеристику');
    } finally {
      setLoading(false);
    }
  };

  // Обработчик добавления новой характеристики
  const handleAddStat = async () => {
    if (!newStat.name) {
      setError('Укажите название характеристики');
      return;
    }
    
    try {
      setLoading(true);
      // Здесь должен быть API запрос для добавления характеристики
      // const response = await characterService.addStat(character.id, newStat);
      
      // Временно обновляем локальное состояние с фиктивным ID
      const tempStat = {
        ...newStat,
        id: `temp-${Date.now()}`,
        characterId: character.id
      };
      
      setEditedCharacter(prev => ({
        ...prev,
        characterStats: [...prev.characterStats, tempStat]
      }));
      
      // Сбросить форму
      setNewStat({ name: '', value: 1, isVisible: false, category: 'hidden' });
      setSuccess('Характеристика успешно добавлена');
    } catch (err) {
      console.error('Ошибка при добавлении характеристики:', err);
      setError('Не удалось добавить характеристику');
    } finally {
      setLoading(false);
    }
  };

  // Сохранение изменений для раздела
  const handleSaveSection = async (section) => {
    try {
      setLoading(true);
      setError('');
      
      if (section === 'basicInfo') {
        await characterService.update(character.id, {
          name: editedCharacter.name,
          background: editedCharacter.background,
          homeRegion: editedCharacter.homeRegion,
          characterOccupation: editedCharacter.characterOccupation,
          avatarUrl: editedCharacter.avatarUrl
        });
      } else if (section === 'stats') {
        await characterService.updateStats(character.id, {
          stats: editedCharacter.characterStats
        });
      } else if (section === 'skills') {
        await characterService.updateSkills(character.id, {
          skills: editedCharacter.characterSkills
        });
      } else if (section === 'inventory') {
        // Обновление инвентаря - логика для добавления/удаления предметов
      }
      
      setEditMode(prev => ({ ...prev, [section]: false }));
      setSuccess(`Раздел "${section}" успешно обновлен`);
      
      // Уведомляем родительский компонент об изменениях
      if (onCharacterUpdated) {
        onCharacterUpdated();
      }
    } catch (err) {
      console.error(`Ошибка при сохранении раздела ${section}:`, err);
      setError(`Не удалось сохранить изменения: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Открытие диалога для выбора элемента из справочника
  const handleOpenReferenceDialog = async (type) => {
    try {
      setReferenceType(type);
      setLoading(true);
      
      const response = await referenceService.getAll({ type });
      setReferenceItems(response.data.items);
      
      setReferenceDialogOpen(true);
    } catch (err) {
      console.error('Ошибка при загрузке справочника:', err);
      setError('Не удалось загрузить справочник');
    } finally {
      setLoading(false);
    }
  };

  // Добавление выбранного элемента из справочника
  const handleAddReferenceItem = async () => {
    if (!selectedReferenceItem) {
      return;
    }
    
    try {
      setLoading(true);
      
      if (referenceType === 'skill') {
        // Добавление навыка из справочника
        const skillData = {
          name: selectedReferenceItem.name,
          value: 1, // Начальное значение
          category: selectedReferenceItem.category || 'physical',
          properties: selectedReferenceItem.properties
        };
        
        // await characterService.addSkill(character.id, skillData);
        
        // Временное обновление локального состояния
        setEditedCharacter(prev => ({
          ...prev,
          characterSkills: [...(prev.characterSkills || []), { 
            ...skillData, 
            id: `temp-${Date.now()}`,
            characterId: character.id 
          }]
        }));
      } else if (referenceType === 'item') {
        // Добавление предмета из справочника
        const itemData = {
          itemName: selectedReferenceItem.name,
          itemType: selectedReferenceItem.category || 'misc',
          description: selectedReferenceItem.description,
          properties: selectedReferenceItem.properties,
          quantity: 1,
          isEquipped: false
        };
        
        // await characterService.addInventoryItem(character.id, itemData);
        
        // Временное обновление локального состояния
        setEditedCharacter(prev => ({
          ...prev,
          characterInventories: [...(prev.characterInventories || []), { 
            ...itemData, 
            id: `temp-${Date.now()}`,
            characterId: character.id 
          }]
        }));
      } else if (referenceType === 'spell') {
        // Добавление заклинания из справочника
        const spellData = {
          name: selectedReferenceItem.name,
          level: selectedReferenceItem.properties?.level || 1,
          school: selectedReferenceItem.category,
          description: selectedReferenceItem.description,
          properties: selectedReferenceItem.properties
        };
        
        // await characterService.addSpell(character.id, spellData);
        
        // Временное обновление локального состояния (предполагая, что у персонажа есть массив characterSpells)
        setEditedCharacter(prev => ({
          ...prev,
          characterSpells: [...(prev.characterSpells || []), { 
            ...spellData, 
            id: `temp-${Date.now()}`,
            characterId: character.id 
          }]
        }));
      }
      
      setReferenceDialogOpen(false);
      setSelectedReferenceItem(null);
      setSuccess(`${selectedReferenceItem.name} успешно добавлен к персонажу`);
      
      // Уведомляем родительский компонент об изменениях
      if (onCharacterUpdated) {
        onCharacterUpdated();
      }
    } catch (err) {
      console.error('Ошибка при добавлении элемента из справочника:', err);
      setError('Не удалось добавить элемент из справочника');
    } finally {
      setLoading(false);
    }
  };

  // Получение цвета для уровня навыка
  const getSkillLevelColor = (level) => {
    if (level < 5) return 'primary.light';
    if (level < 10) return 'primary.main';
    if (level < 15) return 'secondary.light';
    if (level < 20) return 'secondary.main';
    return 'error.main';
  };

  // Получение названия уровня навыка
  const getSkillLevelName = (level) => {
    if (level < 5) return 'Новичок';
    if (level < 10) return 'Ученик';
    if (level < 15) return 'Адепт';
    if (level < 20) return 'Мастер';
    return 'Грандмастер';
  };

  // Группировка навыков по категориям
  const getGroupedSkills = () => {
    const grouped = {};
    
    (character.characterSkills || []).forEach(skill => {
      const category = skill.category || 'physical';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(skill);
    });
    
    return grouped;
  };

  if (!character) {
    return <Typography>Персонаж не найден</Typography>;
  }

  // Получаем сгруппированные навыки
  const groupedSkills = getGroupedSkills();

  return (
    <Box>
      {/* Основная информация о персонаже */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        {editMode.basicInfo ? (
          // Режим редактирования основной информации
          <Box>
            <Typography variant="h6" gutterBottom>Редактирование основной информации</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Имя персонажа"
                  name="name"
                  value={editedCharacter.name || ''}
                  onChange={handleBasicInfoChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Аватар (URL)"
                  name="avatarUrl"
                  value={editedCharacter.avatarUrl || ''}
                  onChange={handleBasicInfoChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Регион происхождения"
                  name="homeRegion"
                  value={editedCharacter.homeRegion || ''}
                  onChange={handleBasicInfoChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Род занятий"
                  name="characterOccupation"
                  value={editedCharacter.characterOccupation || ''}
                  onChange={handleBasicInfoChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Предыстория"
                  name="background"
                  value={editedCharacter.background || ''}
                  onChange={handleBasicInfoChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={1}>
                  <Button 
                    variant="outlined" 
                    onClick={() => handleCancelEdit('basicInfo')}
                    disabled={loading}
                  >
                    Отмена
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={<SaveIcon />}
                    onClick={() => handleSaveSection('basicInfo')}
                    disabled={loading}
                  >
                    Сохранить
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        ) : (
          // Режим просмотра основной информации
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box display="flex" alignItems="flex-start">
                <Avatar 
                  src={character.avatarUrl} 
                  alt={character.name}
                  sx={{ width: 100, height: 100, mr: 3 }}
                />
                <Box>
                  <Typography variant="h4" gutterBottom>{character.name}</Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {character.characterOccupation || 'Искатель приключений'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Регион: {character.homeRegion || 'Перекресток Миров'}
                  </Typography>
                </Box>
              </Box>
              
              {isGameMaster && (
                <IconButton onClick={() => handleEnableEdit('basicInfo')} color="primary">
                  <EditIcon />
                </IconButton>
              )}
            </Box>
            
            {character.background && (
              <Box mt={3}>
                <Typography variant="h6" gutterBottom>Предыстория</Typography>
                <Typography variant="body1" paragraph>
                  {character.background}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Характеристики персонажа */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Характеристики</Typography>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={showHiddenStats}
                  onChange={(e) => setShowHiddenStats(e.target.checked)}
                  color="primary"
                />
              }
              label="Показать скрытые"
            />
            
            {isGameMaster && (
              <IconButton onClick={() => handleEnableEdit('stats')} color="primary">
                <EditIcon />
              </IconButton>
            )}
          </Box>
        </Box>
        
        {editMode.stats ? (
          // Режим редактирования характеристик
          <Box>
            <Grid container spacing={3}>
              {/* Базовые характеристики */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Базовые характеристики</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  {editedCharacter.characterStats
                    .filter(stat => stat.category === 'basic')
                    .map((stat) => (
                      <Grid item xs={12} sm={6} md={4} key={stat.id}>
                        <Paper elevation={2} sx={{ p: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1">{stat.name}</Typography>
                            <Box display="flex" alignItems="center">
                              <TextField
                                type="number"
                                value={stat.value}
                                onChange={(e) => handleStatChange(stat.id, 'value', parseFloat(e.target.value))}
                                sx={{ width: '80px', mr: 1 }}
                                InputProps={{ inputProps: { min: 0 } }}
                              />
                              <IconButton size="small" onClick={() => handleDeleteStat(stat.id)} color="error">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                </Grid>
              </Grid>
              
              {/* Скрытые характеристики */}
              <Grid item xs={12} sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>Скрытые характеристики</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  {editedCharacter.characterStats
                    .filter(stat => stat.category === 'hidden')
                    .map((stat) => (
                      <Grid item xs={12} sm={6} md={4} key={stat.id}>
                        <Paper elevation={2} sx={{ p: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1">{stat.name}</Typography>
                            <Box display="flex" alignItems="center">
                              <TextField
                                type="number"
                                value={stat.value}
                                onChange={(e) => handleStatChange(stat.id, 'value', parseFloat(e.target.value))}
                                sx={{ width: '80px', mr: 1 }}
                                InputProps={{ inputProps: { min: 0 } }}
                              />
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={stat.isVisible}
                                    onChange={(e) => handleStatChange(stat.id, 'isVisible', e.target.checked)}
                                    size="small"
                                  />
                                }
                                label=""
                              />
                              <IconButton size="small" onClick={() => handleDeleteStat(stat.id)} color="error">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                </Grid>
              </Grid>
              
              {/* Производные характеристики */}
              <Grid item xs={12} sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>Производные характеристики</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  {editedCharacter.characterStats
                    .filter(stat => stat.category === 'derived')
                    .map((stat) => (
                      <Grid item xs={12} sm={6} md={4} key={stat.id}>
                        <Paper elevation={2} sx={{ p: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1">{stat.name}</Typography>
                            <Box display="flex" alignItems="center">
                              <TextField
                                type="number"
                                value={stat.value}
                                onChange={(e) => handleStatChange(stat.id, 'value', parseFloat(e.target.value))}
                                sx={{ width: '80px', mr: 1 }}
                                InputProps={{ inputProps: { min: 0 } }}
                              />
                              <IconButton size="small" onClick={() => handleDeleteStat(stat.id)} color="error">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                </Grid>
              </Grid>
              
              {/* Форма добавления новой характеристики */}
              <Grid item xs={12} sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>Добавить характеристику</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Название"
                      value={newStat.name}
                      onChange={(e) => setNewStat({ ...newStat, name: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      label="Значение"
                      type="number"
                      value={newStat.value}
                      onChange={(e) => setNewStat({ ...newStat, value: parseFloat(e.target.value) })}
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth>
                      <InputLabel>Категория</InputLabel>
                      <Select
                        value={newStat.category}
                        label="Категория"
                        onChange={(e) => setNewStat({ ...newStat, category: e.target.value })}
                      >
                        <MenuItem value="basic">Базовая</MenuItem>
                        <MenuItem value="hidden">Скрытая</MenuItem>
                        <MenuItem value="derived">Производная</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={newStat.isVisible}
                          onChange={(e) => setNewStat({ ...newStat, isVisible: e.target.checked })}
                        />
                      }
                      label="Видимость"
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddStat}
                      disabled={!newStat.name || loading}
                      fullWidth
                    >
                      Добавить
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12} sx={{ mt: 3 }}>
                <Box display="flex" justifyContent="flex-end" gap={1}>
                  <Button 
                    variant="outlined" 
                    onClick={() => handleCancelEdit('stats')}
                    disabled={loading}
                  >
                    Отмена
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={<SaveIcon />}
                    onClick={() => handleSaveSection('stats')}
                    disabled={loading}
                  >
                    Сохранить
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        ) : (
          // Режим просмотра характеристик
          <Grid container spacing={3}>
            {/* Базовые характеристики */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Базовые характеристики</Typography>
              <Grid container spacing={2}>
                {character.characterStats
                  ?.filter(stat => stat.category === 'basic')
                  .map((stat) => (
                    <Grid item xs={6} sm={4} key={stat.id}>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          textAlign: 'center', 
                          bgcolor: 'primary.light', 
                          color: 'primary.contrastText' 
                        }}
                      >
                        <Typography variant="h5">{stat.value}</Typography>
                        <Typography variant="body2">{stat.name}</Typography>
                      </Paper>
                    </Grid>
                ))}
              </Grid>
            </Grid>
            
            {/* Производные характеристики */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Производные показатели</Typography>
              <Grid container spacing={2}>
                {character.characterStats
                  ?.filter(stat => stat.category === 'derived')
                  .map((stat) => (
                    <Grid item xs={6} sm={4} key={stat.id}>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          textAlign: 'center', 
                          bgcolor: 'secondary.light', 
                          color: 'secondary.contrastText' 
                        }}
                      >
                        <Typography variant="h5">{stat.value}</Typography>
                        <Typography variant="body2">{stat.name}</Typography>
                      </Paper>
                    </Grid>
                ))}
              </Grid>
            </Grid>
            
            {/* Скрытые характеристики */}
            {(showHiddenStats || isGameMaster) && (
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Typography variant="h6" sx={{ mr: 1 }}>Скрытые характеристики</Typography>
                  <Tooltip title="Видны только мастеру и игроку, если открыты">
                    <PsychologyIcon color="action" fontSize="small" />
                  </Tooltip>
                </Box>
                
                <Grid container spacing={2}>
                  {character.characterStats
                    ?.filter(stat => stat.category === 'hidden' && (isGameMaster || stat.isVisible))
                    .map((stat) => (
                      <Grid item xs={6} sm={3} md={2} key={stat.id}>
                        <Paper 
                          elevation={1} 
                          sx={{ 
                            p: 2, 
                            textAlign: 'center', 
                            bgcolor: stat.isVisible ? 'success.light' : 'action.disabledBackground', 
                            color: stat.isVisible ? 'success.contrastText' : 'text.secondary'
                          }}
                        >
                          <Box display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="h5" sx={{ mr: 1 }}>{stat.value}</Typography>
                            {!stat.isVisible && isGameMaster && <VisibilityOffIcon fontSize="small" />}
                          </Box>
                          <Typography variant="body2">{stat.name}</Typography>
                          {stat.discoveredAt && (
                            <Typography variant="caption" display="block">
                              Открыто: {new Date(stat.discoveredAt).toLocaleDateString()}
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                    
                  {!character.characterStats?.some(stat => stat.category === 'hidden' && (isGameMaster || stat.isVisible)) && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Пока не открыто ни одной скрытой характеристики
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            )}
          </Grid>
        )}
      </Paper>

      {/* Навыки персонажа */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Навыки</Typography>
          {isGameMaster && (
            <Box>
              <Button 
                variant="outlined" 
                startIcon={<LibraryAddIcon />}
                onClick={() => handleOpenReferenceDialog('skill')}
                sx={{ mr: 1 }}
              >
                Из справочника
              </Button>
              <IconButton onClick={() => handleEnableEdit('skills')} color="primary">
                <EditIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Отображение навыков по категориям */}
        <Grid container spacing={3}>
          {Object.entries(groupedSkills).map(([category, skills]) => (
            <Grid item xs={12} md={6} key={category}>
              <Typography variant="h6" gutterBottom>
                {category === 'combat' ? 'Боевые' : 
                 category === 'physical' ? 'Физические' : 
                 category === 'social' ? 'Социальные' : 
                 category === 'mental' ? 'Ментальные' : 
                 category === 'craft' ? 'Ремесленные' : 
                 category === 'magic' ? 'Магические' : 
                 category === 'survival' ? 'Выживание' : 
                 category}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                {skills.map((skill) => (
                  <ListItem key={skill.id} sx={{ mb: 1 }}>
                    <Box width="100%">
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1">{skill.name}</Typography>
                        <Box display="flex" alignItems="center">
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {skill.value} 
                          </Typography>
                          <Chip 
                            label={getSkillLevelName(skill.value)} 
                            size="small" 
                            color={skill.value >= 15 ? "secondary" : "primary"}
                            variant={skill.value >= 20 ? "filled" : "outlined"}
                          />
                        </Box>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(skill.value % 5) * 20} // Прогресс до следующего порогового значения
                        sx={{ 
                          mt: 1, 
                          mb: 1, 
                          height: 8,
                          borderRadius: 1,
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getSkillLevelColor(skill.value)
                          }
                        }} 
                      />
                      
                      {/* Разблокированные техники навыка */}
                      {skill.unlockedTechniques && skill.unlockedTechniques.length > 0 && (
                        <Box mt={1}>
                          {skill.unlockedTechniques.map((technique, index) => (
                            <Chip 
                              key={index}
                              label={technique.name}
                              size="small"
                              variant="outlined"
                              color="success"
                              sx={{ mr: 0.5, mb: 0.5 }}
                              title={technique.description}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Grid>
          ))}
          
          {Object.keys(groupedSkills).length === 0 && (
            <Grid item xs={12}>
              <Typography variant="body1" align="center" color="text.secondary">
                У персонажа пока нет навыков
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Инвентарь персонажа */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Инвентарь</Typography>
          {isGameMaster && (
            <Box>
              <Button 
                variant="outlined" 
                startIcon={<LibraryAddIcon />}
                onClick={() => handleOpenReferenceDialog('item')}
                sx={{ mr: 1 }}
              >
                Из справочника
              </Button>
              <IconButton onClick={() => handleEnableEdit('inventory')} color="primary">
                <EditIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell align="center">Кол-во</TableCell>
                <TableCell align="right">Вес</TableCell>
                <TableCell align="right">Стоимость</TableCell>
                <TableCell>Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {character.characterInventories?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Tooltip title={item.description || ''}>
                      <Typography variant="body2">{item.itemName}</Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const types = {
                        'weapon': 'Оружие',
                        'armor': 'Броня',
                        'consumable': 'Расходник',
                        'material': 'Материал',
                        'artifact': 'Артефакт',
                        'misc': 'Разное'
                      };
                      return types[item.itemType] || item.itemType;
                    })()}
                  </TableCell>
                  <TableCell align="center">{item.quantity}</TableCell>
                  <TableCell align="right">{item.weight} кг</TableCell>
                  <TableCell align="right">{item.value} А</TableCell>
                  <TableCell>
                    {item.isEquipped && (
                      <Chip size="small" label="Экипировано" color="primary" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
              
              {(!character.characterInventories || character.characterInventories.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Инвентарь пуст
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Диалог для выбора элемента из справочника */}
      <Dialog
        open={referenceDialogOpen}
        onClose={() => setReferenceDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Выбор из справочника: {
            referenceType === 'skill' ? 'Навыки' :
            referenceType === 'item' ? 'Предметы' :
            referenceType === 'spell' ? 'Заклинания' :
            'Элемент'
          }
        </DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Box display="flex" justifyContent="center" my={5}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Название</TableCell>
                    <TableCell>Категория</TableCell>
                    <TableCell>Описание</TableCell>
                    <TableCell>Действие</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {referenceItems.map((item) => (
                    <TableRow key={item.id} 
                      selected={selectedReferenceItem?.id === item.id}
                      onClick={() => setSelectedReferenceItem(item)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.description?.substring(0, 100)}...</TableCell>
                      <TableCell>
                        <Button 
                          variant="contained"
                          size="small"
                          onClick={() => {
                            setSelectedReferenceItem(item);
                            handleAddReferenceItem();
                          }}
                        >
                          Добавить
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {referenceItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Нет доступных элементов в справочнике
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReferenceDialogOpen(false)}>
            Закрыть
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddReferenceItem}
            disabled={!selectedReferenceItem}
          >
            Добавить выбранное
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UnifiedCharacterCard;