// client/src/components/character/CharacterEditDialog.js
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Tabs,
  Tab,
  Box,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { characterService } from '../../services/api';

// Компонент таба в диалоге
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`edit-tabpanel-${index}`}
      aria-labelledby={`edit-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CharacterEditDialog = ({ open, onClose, character, onSave }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Стейт для редактируемого персонажа
  const [editedCharacter, setEditedCharacter] = useState({
    ...character,
    stats: character?.characterStats || [],
    skills: character?.characterSkills || [],
    inventory: character?.characterInventories || []
  });
  
  // Стейт для новой статы/навыка/предмета
  const [newStat, setNewStat] = useState({ name: '', value: 1, isVisible: true });
  const [newSkill, setNewSkill] = useState({ name: '', value: 0, category: 'physical' });
  const [newItem, setNewItem] = useState({ 
    itemName: '', 
    itemType: 'misc', 
    quantity: 1,
    description: '',
    value: 0,
    weight: 0,
    isEquipped: false
  });

  // Обработчик изменения таба
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Обработчик изменения базовых полей персонажа
  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setEditedCharacter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Обработчик изменения характеристики
  const handleStatChange = (index, field, value) => {
    const updatedStats = [...editedCharacter.stats];
    updatedStats[index][field] = value;
    setEditedCharacter(prev => ({
      ...prev,
      stats: updatedStats
    }));
  };

  // Обработчик добавления новой характеристики
  const handleAddStat = () => {
    // Определение категории
    const baseStats = ['СИЛ', 'ЛОВ', 'ВЫН', 'ИНТ', 'ВСП'];
    const hiddenStats = ['ВОЛ', 'ХАР', 'РЕЗ', 'БСВ', 'ВСЛ', 'ГАР', 'ИНТЦ', 'МДР', 'УДЧ'];
    
    let category = 'basic';
    if (baseStats.includes(newStat.name)) {
      category = 'basic';
    } else if (hiddenStats.includes(newStat.name)) {
      category = 'hidden';
    } else {
      category = 'derived';
    }
    
    const statToAdd = {
      ...newStat,
      characterId: character.id,
      category,
      isVisible: category === 'basic' || category === 'derived' ? true : newStat.isVisible
    };
    
    setEditedCharacter(prev => ({
      ...prev,
      stats: [...prev.stats, statToAdd]
    }));
    
    setNewStat({ name: '', value: 1, isVisible: true });
  };

  // Обработчик удаления характеристики
  const handleDeleteStat = (index) => {
    const updatedStats = [...editedCharacter.stats];
    updatedStats.splice(index, 1);
    setEditedCharacter(prev => ({
      ...prev,
      stats: updatedStats
    }));
  };

  // Обработчик изменения навыка
  const handleSkillChange = (index, field, value) => {
    const updatedSkills = [...editedCharacter.skills];
    updatedSkills[index][field] = value;
    setEditedCharacter(prev => ({
      ...prev,
      skills: updatedSkills
    }));
  };

  // Обработчик добавления нового навыка
  const handleAddSkill = () => {
    const skillToAdd = {
      ...newSkill,
      characterId: character.id
    };
    
    setEditedCharacter(prev => ({
      ...prev,
      skills: [...prev.skills, skillToAdd]
    }));
    
    setNewSkill({ name: '', value: 0, category: 'physical' });
  };

  // Обработчик удаления навыка
  const handleDeleteSkill = (index) => {
    const updatedSkills = [...editedCharacter.skills];
    updatedSkills.splice(index, 1);
    setEditedCharacter(prev => ({
      ...prev,
      skills: updatedSkills
    }));
  };

  // Обработчик изменения предмета инвентаря
  const handleItemChange = (index, field, value) => {
    const updatedInventory = [...editedCharacter.inventory];
    updatedInventory[index][field] = value;
    setEditedCharacter(prev => ({
      ...prev,
      inventory: updatedInventory
    }));
  };

  // Обработчик добавления нового предмета
  const handleAddItem = () => {
    const itemToAdd = {
      ...newItem,
      characterId: character.id
    };
    
    setEditedCharacter(prev => ({
      ...prev,
      inventory: [...prev.inventory, itemToAdd]
    }));
    
    setNewItem({ 
      itemName: '', 
      itemType: 'misc', 
      quantity: 1,
      description: '',
      value: 0,
      weight: 0,
      isEquipped: false
    });
  };

  // Обработчик удаления предмета
  const handleDeleteItem = (index) => {
    const updatedInventory = [...editedCharacter.inventory];
    updatedInventory.splice(index, 1);
    setEditedCharacter(prev => ({
      ...prev,
      inventory: updatedInventory
    }));
  };

  // Сохранение изменений
  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Обновление базовой информации
      await characterService.update(character.id, {
        name: editedCharacter.name,
        background: editedCharacter.background,
        homeRegion: editedCharacter.homeRegion,
        characterOccupation: editedCharacter.characterOccupation
      });
      
      // Обновление характеристик
      await characterService.updateStats(character.id, {
        stats: editedCharacter.stats
      });
      
      // Обновление навыков
      await characterService.updateSkills(character.id, {
        skills: editedCharacter.skills
      });
      
      // Обновление инвентаря
      // Удаление старых предметов
      for (const item of character.characterInventories || []) {
        const exists = editedCharacter.inventory.some(i => i.id === item.id);
        if (!exists) {
          await characterService.deleteInventoryItem(character.id, item.id);
        }
      }
      
      // Добавление/обновление предметов
      for (const item of editedCharacter.inventory) {
        if (item.id) {
          await characterService.updateInventoryItem(character.id, item.id, item);
        } else {
          await characterService.addInventoryItem(character.id, item);
        }
      }
      
      setSuccess('Персонаж успешно обновлен');
      setLoading(false);
      
      // Уведомляем родительский компонент
      if (onSave) {
        onSave();
      }
    } catch (err) {
      console.error('Ошибка при сохранении персонажа:', err);
      setError('Не удалось сохранить изменения: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Редактирование персонажа: {character?.name}
      </DialogTitle>
      
      <DialogContent dividers>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="character edit tabs"
        >
          <Tab label="Основное" />
          <Tab label="Характеристики" />
          <Tab label="Навыки" />
          <Tab label="Инвентарь" />
        </Tabs>
        
        {/* Основная информация */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
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
                label="URL аватара"
                name="avatarUrl"
                value={editedCharacter.avatarUrl || ''}
                onChange={handleBasicInfoChange}
                helperText="Укажите ссылку на изображение персонажа"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Предыстория"
                name="background"
                value={editedCharacter.background || ''}
                onChange={handleBasicInfoChange}
                multiline
                rows={6}
              />
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Характеристики */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Базовые характеристики
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              {editedCharacter.stats
                .filter(stat => stat.category === 'basic')
                .map((stat, index) => {
                  const statIndex = editedCharacter.stats.findIndex(s => s.id === stat.id);
                  return (
                    <ListItem key={stat.id || index}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={4}>
                          <Typography variant="body1">{stat.name}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            type="number"
                            label="Значение"
                            value={stat.value}
                            onChange={(e) => handleStatChange(statIndex, 'value', parseFloat(e.target.value))}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={stat.isVisible}
                                onChange={(e) => handleStatChange(statIndex, 'isVisible', e.target.checked)}
                                disabled={stat.category === 'basic'} // Базовые характеристики всегда видимы
                              />
                            }
                            label="Видимость"
                          />
                        </Grid>
                        <Grid item xs={1}>
                          <IconButton edge="end" onClick={() => handleDeleteStat(statIndex)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </ListItem>
                  );
                })}
            </List>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Скрытые характеристики
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              {editedCharacter.stats
                .filter(stat => stat.category === 'hidden')
                .map((stat, index) => {
                  const statIndex = editedCharacter.stats.findIndex(s => s.id === stat.id);
                  return (
                    <ListItem key={stat.id || index}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={4}>
                          <Typography variant="body1">{stat.name}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            type="number"
                            label="Значение"
                            value={stat.value}
                            onChange={(e) => handleStatChange(statIndex, 'value', parseFloat(e.target.value))}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={stat.isVisible}
                                onChange={(e) => handleStatChange(statIndex, 'isVisible', e.target.checked)}
                              />
                            }
                            label="Видимость"
                          />
                        </Grid>
                        <Grid item xs={1}>
                          <IconButton edge="end" onClick={() => handleDeleteStat(statIndex)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </ListItem>
                  );
                })}
            </List>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Добавить характеристику
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Название"
                  value={newStat.name}
                  onChange={(e) => setNewStat({ ...newStat, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Значение"
                  value={newStat.value}
                  onChange={(e) => setNewStat({ ...newStat, value: parseFloat(e.target.value) })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
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
                  disabled={!newStat.name}
                  fullWidth
                >
                  Добавить
                </Button>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
        
        {/* Навыки */}
        <TabPanel value={activeTab} index={2}>
          <List>
            {editedCharacter.skills.map((skill, index) => (
              <ListItem key={skill.id || index}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Название"
                      value={skill.name}
                      onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Значение"
                      value={skill.value}
                      onChange={(e) => handleSkillChange(index, 'value', parseFloat(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControl fullWidth>
                      <InputLabel>Категория</InputLabel>
                      <Select
                        value={skill.category || 'physical'}
                        onChange={(e) => handleSkillChange(index, 'category', e.target.value)}
                        label="Категория"
                      >
                        <MenuItem value="combat">Боевые</MenuItem>
                        <MenuItem value="physical">Физические</MenuItem>
                        <MenuItem value="social">Социальные</MenuItem>
                        <MenuItem value="mental">Ментальные</MenuItem>
                        <MenuItem value="craft">Ремесленные</MenuItem>
                        <MenuItem value="magic">Магические</MenuItem>
                        <MenuItem value="survival">Выживание</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Опыт"
                      value={skill.experience || 0}
                      onChange={(e) => handleSkillChange(index, 'experience', parseFloat(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton edge="end" onClick={() => handleDeleteSkill(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </ListItem>
            ))}
          </List>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Добавить навык
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Название"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                type="number"
                label="Значение"
                value={newSkill.value}
                onChange={(e) => setNewSkill({ ...newSkill, value: parseFloat(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Категория</InputLabel>
                <Select
                  value={newSkill.category}
                  onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                  label="Категория"
                >
                  <MenuItem value="combat">Боевые</MenuItem>
                  <MenuItem value="physical">Физические</MenuItem>
                  <MenuItem value="social">Социальные</MenuItem>
                  <MenuItem value="mental">Ментальные</MenuItem>
                  <MenuItem value="craft">Ремесленные</MenuItem>
                  <MenuItem value="magic">Магические</MenuItem>
                  <MenuItem value="survival">Выживание</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddSkill}
                disabled={!newSkill.name}
                fullWidth
              >
                Добавить
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Инвентарь */}
        <TabPanel value={activeTab} index={3}>
          <List>
            {editedCharacter.inventory.map((item, index) => (
              <ListItem key={item.id || index}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label="Название"
                      value={item.itemName}
                      onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <FormControl fullWidth>
                      <InputLabel>Тип</InputLabel>
                      <Select
                        value={item.itemType}
                        onChange={(e) => handleItemChange(index, 'itemType', e.target.value)}
                        label="Тип"
                      >
                        <MenuItem value="weapon">Оружие</MenuItem>
                        <MenuItem value="armor">Броня</MenuItem>
                        <MenuItem value="consumable">Расходник</MenuItem>
                        <MenuItem value="material">Материал</MenuItem>
                        <MenuItem value="artifact">Артефакт</MenuItem>
                        <MenuItem value="misc">Разное</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={1}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Кол-во"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value, 10))}
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Вес"
                      value={item.weight}
                      onChange={(e) => handleItemChange(index, 'weight', parseFloat(e.target.value))}
                      InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Цена"
                      value={item.value}
                      onChange={(e) => handleItemChange(index, 'value', parseInt(e.target.value, 10))}
                      // Продолжение файла client/src/components/character/CharacterEditDialog.js (продолжение Grid item для TextField цены)
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={item.isEquipped}
                          onChange={(e) => handleItemChange(index, 'isEquipped', e.target.checked)}
                        />
                      }
                      label="Экипировано"
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton edge="end" onClick={() => handleDeleteItem(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Описание"
                      value={item.description || ''}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      multiline
                      rows={2}
                    />
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
              </ListItem>
            ))}
          </List>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Добавить предмет
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Название"
                value={newItem.itemName}
                onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Тип</InputLabel>
                <Select
                  value={newItem.itemType}
                  onChange={(e) => setNewItem({ ...newItem, itemType: e.target.value })}
                  label="Тип"
                >
                  <MenuItem value="weapon">Оружие</MenuItem>
                  <MenuItem value="armor">Броня</MenuItem>
                  <MenuItem value="consumable">Расходник</MenuItem>
                  <MenuItem value="material">Материал</MenuItem>
                  <MenuItem value="artifact">Артефакт</MenuItem>
                  <MenuItem value="misc">Разное</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={1}>
              <TextField
                fullWidth
                type="number"
                label="Кол-во"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value, 10) })}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <TextField
                fullWidth
                type="number"
                label="Вес"
                value={newItem.weight}
                onChange={(e) => setNewItem({ ...newItem, weight: parseFloat(e.target.value) })}
                InputProps={{ inputProps: { min: 0, step: 0.1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <TextField
                fullWidth
                type="number"
                label="Цена"
                value={newItem.value}
                onChange={(e) => setNewItem({ ...newItem, value: parseInt(e.target.value, 10) })}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newItem.isEquipped}
                    onChange={(e) => setNewItem({ ...newItem, isEquipped: e.target.checked })}
                  />
                }
                label="Экипировано"
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddItem}
                disabled={!newItem.itemName}
                fullWidth
              >
                Добавить
              </Button>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Описание"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Отмена
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
        >
          Сохранить
        </Button>
      </DialogActions>
      
      {/* Снэкбары для уведомлений */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default CharacterEditDialog;