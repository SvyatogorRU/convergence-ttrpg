// client/src/components/character/AddNoteDialog.js
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Chip,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { characterService } from '../../services/api';

// Категории заметок
const NOTE_CATEGORIES = [
  { id: 'quest', name: 'Задание' },
  { id: 'npc', name: 'Персонаж' },
  { id: 'location', name: 'Локация' },
  { id: 'lore', name: 'Мировая история' },
  { id: 'personal', name: 'Личное' },
  { id: 'magic', name: 'Магия' },
  { id: 'item', name: 'Предмет' },
  { id: 'creature', name: 'Существо' },
  { id: 'other', name: 'Прочее' }
];

/**
 * Компонент диалога для добавления заметки персонажу
 * @param {Object} props
 * @param {boolean} props.open - состояние открытия диалога
 * @param {Function} props.onClose - функция закрытия диалога
 * @param {Object} props.character - объект персонажа
 * @param {Object} props.note - заметка для редактирования (если есть)
 * @param {Function} props.onSave - функция сохранения заметки
 */
const AddNoteDialog = ({ open, onClose, character, note = null, onSave }) => {
  // Состояние формы
  const [title, setTitle] = useState(note ? note.title : '');
  const [content, setContent] = useState(note ? note.content : '');
  const [category, setCategory] = useState(note ? note.category : 'other');
  const [isPrivate, setIsPrivate] = useState(note ? note.isPrivate : false);
  const [customCategory, setCustomCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tags, setTags] = useState(note?.tags || []);
  const [tagInput, setTagInput] = useState('');

  // Обработчик ввода заголовка
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  // Обработчик ввода содержимого
  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  // Обработчик изменения категории
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  // Обработчик изменения приватности
  const handlePrivateChange = (e) => {
    setIsPrivate(e.target.checked);
  };

  // Обработчик ввода своей категории
  const handleCustomCategoryChange = (e) => {
    setCustomCategory(e.target.value);
  };

  // Обработчик ввода тега
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  // Обработчик добавления тега
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // Обработчик нажатия Enter при вводе тега
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Обработчик удаления тега
  const handleDeleteTag = (tagToDelete) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  // Обработчик сохранения заметки
  const handleSave = async () => {
    // Валидация формы
    if (!title.trim()) {
      setError('Заголовок заметки обязателен');
      return;
    }

    if (!content.trim()) {
      setError('Содержимое заметки обязательно');
      return;
    }

    // Подготовка данных для сохранения
    const noteData = {
      title: title.trim(),
      content: content.trim(),
      category: category === 'custom' ? customCategory.trim() : category,
      isPrivate,
      tags
    };

    try {
      setLoading(true);
      
      if (note) {
        // Обновление существующей заметки
        // await characterService.updateNote(character.id, note.id, noteData);
      } else {
        // Создание новой заметки
        // await characterService.addNote(character.id, noteData);
      }

      // Вызов коллбэка onSave для обновления UI
      if (onSave) {
        onSave(noteData);
      }
      
      // Сброс формы и закрытие диалога
      resetForm();
      onClose();
    } catch (err) {
      console.error('Ошибка при сохранении заметки:', err);
      setError('Не удалось сохранить заметку: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  // Сброс формы
  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('other');
    setIsPrivate(false);
    setCustomCategory('');
    setTags([]);
    setTagInput('');
    setError('');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {note ? 'Редактирование заметки' : 'Добавление новой заметки'}
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              autoFocus
              label="Заголовок"
              fullWidth
              required
              value={title}
              onChange={handleTitleChange}
              error={!!error && !title.trim()}
              helperText={!title.trim() && error ? 'Заголовок обязателен' : ''}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Категория</InputLabel>
              <Select
                value={category}
                onChange={handleCategoryChange}
                label="Категория"
              >
                {NOTE_CATEGORIES.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
                <MenuItem value="custom">Своя категория</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            {category === 'custom' ? (
              <TextField
                fullWidth
                label="Введите категорию"
                value={customCategory}
                onChange={handleCustomCategoryChange}
                required={category === 'custom'}
                error={category === 'custom' && !customCategory.trim()}
                helperText={category === 'custom' && !customCategory.trim() ? 'Введите название категории' : ''}
              />
            ) : (
              <FormControlLabel
                control={
                  <Switch
                    checked={isPrivate}
                    onChange={handlePrivateChange}
                  />
                }
                label="Личная заметка (видна только игроку)"
              />
            )}
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Содержимое заметки"
              multiline
              rows={8}
              fullWidth
              required
              value={content}
              onChange={handleContentChange}
              error={!!error && !content.trim()}
              helperText={!content.trim() && error ? 'Содержимое обязательно' : ''}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Теги"
                  placeholder="Введите тег и нажмите Enter"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyPress={handleTagKeyPress}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                  fullWidth
                >
                  Добавить тег
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Теги помогают быстрее находить заметки и группировать их по темам
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
                  {tags.map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleDeleteTag(tag)}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                  {tags.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Нет добавленных тегов
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading || !title.trim() || !content.trim() || (category === 'custom' && !customCategory.trim())}
        >
          {loading ? <CircularProgress size={24} /> : note ? 'Сохранить изменения' : 'Добавить заметку'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddNoteDialog;