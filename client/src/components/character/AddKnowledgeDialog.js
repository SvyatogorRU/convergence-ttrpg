// client/src/components/character/AddKnowledgeDialog.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import { characterService } from '../../services/api';

// Пример знаний для выбора
const exampleKnowledgeList = [
  {
    id: 'k1',
    title: 'Основы мира Конвергенции',
    category: 'world-basics',
    content: 'Описание основ мира',
    tags: ['основы', 'мир', 'магия']
  },
  {
    id: 'k2',
    title: 'Система характеристик',
    category: 'mechanics-chars',
    content: 'Описание системы характеристик',
    tags: ['механики', 'характеристики']
  },
  {
    id: 'k3',
    title: 'Перекресток Миров',
    category: 'world-geography',
    content: 'Описание города Перекресток Миров',
    tags: ['география', 'город']
  },
  {
    id: 'k4',
    title: 'Осколки иных миров',
    category: 'world-fragments',
    content: 'Информация об осколках миров',
    tags: ['осколки', 'схождение']
  },
  {
    id: 'k5',
    title: 'Система навыков',
    category: 'mechanics-skills',
    content: 'Описание системы навыков',
    tags: ['навыки', 'механики']
  }
];

/**
 * Компонент диалога добавления знания персонажу
 * @param {Object} props
 * @param {boolean} props.open - состояние открытия диалога
 * @param {Function} props.onClose - функция закрытия диалога
 * @param {Object} props.character - объект персонажа
 * @param {Function} props.onSave - функция сохранения знания
 */
const AddKnowledgeDialog = ({ open, onClose, character, onSave }) => {
  const [selectedKnowledge, setSelectedKnowledge] = useState(null);
  const [comprehensionLevel, setComprehensionLevel] = useState(1);
  const [discoveryContext, setDiscoveryContext] = useState('');
  const [isFullyRevealed, setIsFullyRevealed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [knowledgeList, setKnowledgeList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');

  // Загрузка списка знаний при открытии диалога
  useEffect(() => {
    if (open) {
      loadKnowledgeList();
    }
  }, [open]);

  // Загрузка списка знаний для выбора
  const loadKnowledgeList = async () => {
    setLoading(true);
    try {
      // В реальном приложении здесь будет API-запрос
      // const response = await knowledgeService.getAll();
      // setKnowledgeList(response.data);
      
      // Имитация загрузки данных
      setTimeout(() => {
        setKnowledgeList(exampleKnowledgeList);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Ошибка при загрузке знаний:', err);
      setError('Не удалось загрузить список знаний');
      setLoading(false);
    }
  };

  // Фильтрация знаний по поисковому запросу
  const getFilteredKnowledge = () => {
    if (!searchQuery) return knowledgeList;
    
    const query = searchQuery.toLowerCase();
    return knowledgeList.filter(
      knowledge => 
        knowledge.title.toLowerCase().includes(query) || 
        knowledge.content.toLowerCase().includes(query) ||
        (knowledge.tags && knowledge.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  };

  // Обработчик выбора знания
  const handleKnowledgeSelect = (_, knowledge) => {
    setSelectedKnowledge(knowledge);
    // Сброс других полей при выборе нового знания
    setComprehensionLevel(1);
    setDiscoveryContext('');
  };

  // Обработчик изменения уровня понимания
  const handleComprehensionChange = (e) => {
    setComprehensionLevel(Number(e.target.value));
  };

  // Обработчик изменения контекста получения
  const handleContextChange = (e) => {
    setDiscoveryContext(e.target.value);
  };

  // Обработчик изменения заметок
  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  // Обработчик изменения флага полного раскрытия
  const handleIsFullyRevealedChange = (e) => {
    setIsFullyRevealed(e.target.checked);
  };

  // Обработчик сохранения знания
  const handleSave = async () => {
    if (!selectedKnowledge) {
      setError('Необходимо выбрать знание');
      return;
    }

    try {
      setLoading(true);
      const knowledgeData = {
        knowledgeId: selectedKnowledge.id,
        comprehensionLevel,
        discoveryContext,
        isFullyRevealed,
        notes
      };
      
      // В реальном приложении здесь будет API-запрос
      // await characterService.addKnowledge(character.id, knowledgeData);
      
      // Вызов функции onSave с данными для родительского компонента
      if (onSave) {
        onSave(knowledgeData);
      }
      
      // Сброс формы
      resetForm();
      onClose();
    } catch (err) {
      console.error('Ошибка при добавлении знания:', err);
      setError('Не удалось добавить знание: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  // Сброс формы
  const resetForm = () => {
    setSelectedKnowledge(null);
    setComprehensionLevel(1);
    setDiscoveryContext('');
    setIsFullyRevealed(true);
    setSearchQuery('');
    setError('');
    setNotes('');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { maxHeight: '90vh' } }}
    >
      <DialogTitle>Добавление знания персонажу</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Autocomplete
              options={getFilteredKnowledge()}
              getOptionLabel={(option) => option.title}
              value={selectedKnowledge}
              onChange={handleKnowledgeSelect}
              loading={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Выберите знание из справочника"
                  required
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box>
                    <Typography variant="subtitle2">{option.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.content.substring(0, 100)}...
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      {option.tags && option.tags.map(tag => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  </Box>
                </li>
              )}
            />
          </Grid>
          
          {selectedKnowledge && (
            <>
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper', mb: 2 }}>
                  <Typography variant="h6">{selectedKnowledge.title}</Typography>
                  <Box sx={{ mb: 1 }}>
                    {selectedKnowledge.tags && selectedKnowledge.tags.map(tag => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    {selectedKnowledge.content}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Уровень понимания</InputLabel>
                  <Select
                    value={comprehensionLevel}
                    onChange={handleComprehensionChange}
                    label="Уровень понимания"
                  >
                    <MenuItem value={1}>1 - Начальное знакомство</MenuItem>
                    <MenuItem value={2}>2 - Базовое понимание</MenuItem>
                    <MenuItem value={3}>3 - Уверенное владение</MenuItem>
                    <MenuItem value={4}>4 - Глубокое понимание</MenuItem>
                    <MenuItem value={5}>5 - Мастерское владение</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Контекст получения"
                  placeholder="Как персонаж получил это знание?"
                  value={discoveryContext}
                  onChange={handleContextChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Заметки"
                  multiline
                  rows={3}
                  placeholder="Дополнительные заметки о знании персонажа"
                  value={notes}
                  onChange={handleNotesChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isFullyRevealed}
                      onChange={handleIsFullyRevealedChange}
                    />
                  }
                  label="Полностью раскрыто (персонаж полностью усвоил знание)"
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Если не отмечено, знание будет отображаться в карточке персонажа как частично изученное
                </Typography>
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading || !selectedKnowledge}
        >
          {loading ? <CircularProgress size={24} /> : 'Добавить знание'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddKnowledgeDialog;