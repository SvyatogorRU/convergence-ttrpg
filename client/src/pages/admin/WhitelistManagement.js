// src/pages/admin/WhitelistManagement.js
import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, TextField, Dialog, 
  DialogTitle, DialogContent, DialogActions,
  Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, FormControl, 
  InputLabel, Select, MenuItem
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import axios from 'axios';

const WhitelistManagement = () => {
  const [whitelist, setWhitelist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentEntry, setCurrentEntry] = useState({
    discordId: '',
    accessLevel: 'player',
    notes: '',
    expirationDate: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  // Загрузка данных белого списка
  const fetchWhitelist = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/users/whitelist`,
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      setWhitelist(response.data);
    } catch (err) {
      setError('Ошибка при загрузке данных белого списка');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Добавление записи в белый список
  const addToWhitelist = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/users/whitelist`,
        currentEntry,
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      setOpenDialog(false);
      fetchWhitelist();
    } catch (err) {
      setError('Ошибка при добавлении в белый список');
      console.error(err);
    }
  };

  // Обновление записи в белом списке
  const updateWhitelistEntry = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/users/whitelist/${currentEntry.id}`,
        currentEntry,
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      setOpenDialog(false);
      fetchWhitelist();
    } catch (err) {
      setError('Ошибка при обновлении записи');
      console.error(err);
    }
  };

  // Удаление записи из белого списка
  const deleteWhitelistEntry = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/users/whitelist/${id}`,
          { headers: { 'x-auth-token': localStorage.getItem('token') } }
        );
        fetchWhitelist();
      } catch (err) {
        setError('Ошибка при удалении записи');
        console.error(err);
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
    setCurrentEntry(entry);
    setIsEditing(true);
    setOpenDialog(true);
  };

  // Открытие диалога для добавления
  const handleAdd = () => {
    setCurrentEntry({
      discordId: '',
      accessLevel: 'player',
      notes: '',
      expirationDate: ''
    });
    setIsEditing(false);
    setOpenDialog(true);
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchWhitelist();
  }, []);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Управление белым списком</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={handleAdd}
        >
          Добавить пользователя
        </Button>
      </Box>

      {error && <Typography color="error" mb={2}>{error}</Typography>}

      {loading ? (
        <Typography>Загрузка данных...</Typography>
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
              {whitelist.map(entry => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.discordId}</TableCell>
                  <TableCell>{entry.accessLevel}</TableCell>
                  <TableCell>{entry.notes}</TableCell>
                  <TableCell>{entry.isActive ? 'Активен' : 'Неактивен'}</TableCell>
                  <TableCell>
                    {entry.expirationDate ? new Date(entry.expirationDate).toLocaleDateString() : 'Бессрочно'}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(entry)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => deleteWhitelistEntry(entry.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
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
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Уровень доступа</InputLabel>
              <Select
                value={currentEntry.accessLevel}
                onChange={(e) => setCurrentEntry({...currentEntry, accessLevel: e.target.value})}
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
              value={currentEntry.notes}
              onChange={(e) => setCurrentEntry({...currentEntry, notes: e.target.value})}
            />
            <TextField
              margin="dense"
              label="Дата истечения (оставьте пустым для бессрочного)"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={currentEntry.expirationDate ? currentEntry.expirationDate.substring(0, 10) : ''}
              onChange={(e) => setCurrentEntry({...currentEntry, expirationDate: e.target.value})}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
            <Button type="submit" color="primary">
              {isEditing ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default WhitelistManagement;