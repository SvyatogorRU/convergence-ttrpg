import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, TextField, Dialog, 
  DialogTitle, DialogContent, DialogActions,
  Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, FormControl, 
  InputLabel, Select, MenuItem, Alert, Snackbar,
  CircularProgress, FormControlLabel, Switch, Chip
} from '@mui/material';
import { Edit, Delete, Add, Refresh } from '@mui/icons-material';
import { whitelistService } from '../../services/api';

const WhitelistManagement = () => {
  const [whitelist, setWhitelist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [currentEntry, setCurrentEntry] = useState({
    discordId: '',
    accessLevel: 'player',
    notes: '',
    expirationDate: '',
    isActive: true
  });
  const [isEditing, setIsEditing] = useState(false);

  // Загрузка данных белого списка
  const fetchWhitelist = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching whitelist data...');
      const response = await whitelistService.getAll();
      console.log('Whitelist data:', response.data);
      setWhitelist(response.data);
    } catch (err) {
      console.error('Error fetching whitelist:', err);
      setError('Ошибка при загрузке данных белого списка: ' + (err.response?.data?.message || err.message));
      
      // Показываем уведомление
      setSnackbar({
        open: true,
        message: 'Ошибка при загрузке данных белого списка',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Добавление записи в белый список
  const addToWhitelist = async () => {
    try {
      setError('');
      const result = await whitelistService.add(currentEntry);
      console.log('Added to whitelist:', result);
      
      setOpenDialog(false);
      
      // Показываем уведомление об успехе
      setSnackbar({
        open: true,
        message: 'Пользователь успешно добавлен в белый список',
        severity: 'success'
      });
      
      fetchWhitelist();
    } catch (err) {
      console.error('Error adding to whitelist:', err);
      setError('Ошибка при добавлении в белый список: ' + (err.response?.data?.message || err.message));
    }
  };

  // Обновление записи в белом списке
  const updateWhitelistEntry = async () => {
    try {
      setError('');
      const result = await whitelistService.update(currentEntry.id, currentEntry);
      console.log('Updated whitelist entry:', result);
      
      setOpenDialog(false);
      
      // Показываем уведомление об успехе
      setSnackbar({
        open: true,
        message: 'Запись успешно обновлена',
        severity: 'success'
      });
      
      fetchWhitelist();
    } catch (err) {
      console.error('Error updating whitelist entry:', err);
      setError('Ошибка при обновлении записи: ' + (err.response?.data?.message || err.message));
    }
  };

  // Удаление записи из белого списка
  const deleteWhitelistEntry = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      try {
        setError('');
        await whitelistService.delete(id);
        
        // Показываем уведомление об успехе
        setSnackbar({
          open: true,
          message: 'Запись успешно удалена',
          severity: 'success'
        });
        
        fetchWhitelist();
      } catch (err) {
        console.error('Error deleting whitelist entry:', err);
        setError('Ошибка при удалении записи: ' + (err.response?.data?.message || err.message));
        
        // Показываем уведомление об ошибке
        setSnackbar({
          open: true,
          message: 'Ошибка при удалении записи',
          severity: 'error'
        });
      }
    }
  };

  // Обработка отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      updateWhitelistEntry();
    } else {
      addToWhitelist();
    }
  };

  // Открытие диалога для редактирования
  const handleEdit = (entry) => {
    // Приводим дату к формату yyyy-MM-dd для input type="date"
    let formattedEntry = { ...entry };
    if (formattedEntry.expirationDate) {
      formattedEntry.expirationDate = new Date(formattedEntry.expirationDate)
        .toISOString().split('T')[0];
    }
    
    setCurrentEntry(formattedEntry);
    setIsEditing(true);
    setOpenDialog(true);
  };

  // Открытие диалога для добавления
  const handleAdd = () => {
    setCurrentEntry({
      discordId: '',
      accessLevel: 'player',
      notes: '',
      expirationDate: '',
      isActive: true
    });
    setIsEditing(false);
    setOpenDialog(true);
  };

  // Закрытие снэкбара
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    console.log('WhitelistManagement component mounted');
    fetchWhitelist();
  }, []);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Управление белым списком</Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<Refresh />}
            onClick={fetchWhitelist}
            sx={{ mr: 2 }}
          >
            Обновить
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Add />}
            onClick={handleAdd}
          >
            Добавить пользователя
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" paragraph>
          Здесь вы можете управлять списком пользователей, которым разрешен доступ к системе через Discord OAuth.
          Только пользователи из этого списка смогут авторизоваться в приложении.
        </Typography>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Discord ID</TableCell>
                <TableCell>Уровень доступа</TableCell>
                <TableCell>Заметки</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Дата истечения</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {whitelist.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Белый список пуст. Добавьте пользователей для доступа к системе.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                whitelist.map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.discordId}</TableCell>
                    <TableCell>
                      <Chip 
                        label={entry.accessLevel} 
                        color={
                          entry.accessLevel === 'admin' ? 'error' :
                          entry.accessLevel === 'gamemaster' ? 'warning' :
                          entry.accessLevel === 'player' ? 'success' : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{entry.notes}</TableCell>
                    <TableCell>
                      <Chip 
                        label={entry.isActive ? 'Активен' : 'Неактивен'} 
                        color={entry.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {entry.expirationDate ? new Date(entry.expirationDate).toLocaleDateString() : 'Бессрочно'}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(entry)} color="primary">
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => deleteWhitelistEntry(entry.id)} color="error">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {isEditing ? 'Редактировать запись' : 'Добавить пользователя в белый список'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Discord ID"
              fullWidth
              value={currentEntry.discordId}
              onChange={(e) => setCurrentEntry({...currentEntry, discordId: e.target.value})}
              required
              helperText="Введите числовой ID пользователя Discord (не имя пользователя)"
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel>Уровень доступа</InputLabel>
              <Select
                value={currentEntry.accessLevel}
                onChange={(e) => setCurrentEntry({...currentEntry, accessLevel: e.target.value})}
                label="Уровень доступа"
              >
                <MenuItem value="admin">Администратор</MenuItem>
                <MenuItem value="gamemaster">Мастер</MenuItem>
                <MenuItem value="player">Игрок</MenuItem>
                <MenuItem value="guest">Гость</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Заметки"
              fullWidth
              multiline
              rows={3}
              value={currentEntry.notes || ''}
              onChange={(e) => setCurrentEntry({...currentEntry, notes: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Дата истечения"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={currentEntry.expirationDate || ''}
              onChange={(e) => setCurrentEntry({...currentEntry, expirationDate: e.target.value})}
              helperText="Оставьте пустым для бессрочного доступа"
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={currentEntry.isActive || false}
                  onChange={(e) => setCurrentEntry({...currentEntry, isActive: e.target.checked})}
                  color="primary"
                />
              }
              label="Активен"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
            <Button type="submit" color="primary" variant="contained">
              {isEditing ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          elevation={6} 
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WhitelistManagement;