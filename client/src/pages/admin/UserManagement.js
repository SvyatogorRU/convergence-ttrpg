import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Avatar,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Edit,
  Refresh,
  VerifiedUser,
  Block
} from '@mui/icons-material';
import { userService } from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Загрузка списка пользователей
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userService.getAll();
      console.log('Users data:', response.data);
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Ошибка при загрузке пользователей: ' + (err.response?.data?.message || err.message));
      
      setSnackbar({
        open: true,
        message: 'Ошибка при загрузке пользователей',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Изменение роли пользователя
  const updateUserRole = async () => {
    try {
      setError('');
      await userService.updateRole(currentUser.id, currentUser.role);
      
      setOpenDialog(false);
      
      setSnackbar({
        open: true,
        message: 'Роль пользователя успешно обновлена',
        severity: 'success'
      });
      
      fetchUsers();
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Ошибка при обновлении роли: ' + (err.response?.data?.message || err.message));
      
      setSnackbar({
        open: true,
        message: 'Ошибка при обновлении роли пользователя',
        severity: 'error'
      });
    }
  };

  // Открытие диалога редактирования
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setOpenDialog(true);
  };

  // Изменение статуса активности пользователя
  const toggleUserActive = async (user) => {
    const newStatus = !user.isActive;
    const message = newStatus ? 'активировать' : 'деактивировать';
    
    if (window.confirm(`Вы уверены, что хотите ${message} пользователя ${user.username}?`)) {
      try {
        setError('');
        await userService.updateStatus(user.id, newStatus);
        
        setSnackbar({
          open: true,
          message: `Пользователь успешно ${newStatus ? 'активирован' : 'деактивирован'}`,
          severity: 'success'
        });
        
        fetchUsers();
      } catch (err) {
        console.error('Error updating user status:', err);
        setError('Ошибка при обновлении статуса: ' + (err.response?.data?.message || err.message));
        
        setSnackbar({
          open: true,
          message: 'Ошибка при обновлении статуса пользователя',
          severity: 'error'
        });
      }
    }
  };

  // Закрытие снэкбара
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Получение цвета для чипа роли
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'gamemaster':
        return 'warning';
      case 'player':
        return 'success';
      default:
        return 'default';
    }
  };

  // Получение русского названия роли
  const getRoleName = (role) => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'gamemaster':
        return 'Мастер';
      case 'player':
        return 'Игрок';
      case 'guest':
        return 'Гость';
      default:
        return role;
    }
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    console.log('UserManagement component mounted');
    fetchUsers();
  }, []);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Управление пользователями</Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Refresh />}
          onClick={fetchUsers}
        >
          Обновить
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" paragraph>
          Здесь вы можете управлять пользователями системы, изменять их роли и статусы активности.
          Для добавления пользователей используйте раздел "Управление белым списком".
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
                <TableCell>Аватар</TableCell>
                <TableCell>Имя пользователя</TableCell>
                <TableCell>Discord ID</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Последний вход</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Пользователи не найдены
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar 
                        src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png` : ''} 
                        alt={user.username}
                      />
                    </TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.discordId}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleName(user.role)}
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Активен' : 'Неактивен'}
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Нет данных'}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => handleEditUser(user)} 
                        color="primary"
                        title="Изменить роль"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        onClick={() => toggleUserActive(user)} 
                        color={user.isActive ? 'error' : 'success'}
                        title={user.isActive ? 'Деактивировать' : 'Активировать'}
                      >
                        {user.isActive ? <Block /> : <VerifiedUser />}
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
        maxWidth="xs"
      >
        <DialogTitle>
          Изменить роль пользователя
        </DialogTitle>
        <DialogContent>
          {currentUser && (
            <>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar 
                  src={currentUser.avatar ? `https://cdn.discordapp.com/avatars/${currentUser.discordId}/${currentUser.avatar}.png` : ''} 
                  alt={currentUser.username}
                  sx={{ width: 56, height: 56, mr: 2 }}
                />
                <Box>
                  <Typography variant="h6">{currentUser.username}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentUser.email}
                  </Typography>
                </Box>
              </Box>
              
              <TextField
                label="Discord ID"
                fullWidth
                value={currentUser.discordId}
                disabled
                margin="dense"
                sx={{ mb: 2 }}
              />
              
              <FormControl fullWidth margin="dense">
                <InputLabel>Роль</InputLabel>
                <Select
                  value={currentUser.role}
                  onChange={(e) => setCurrentUser({...currentUser, role: e.target.value})}
                  label="Роль"
                >
                  <MenuItem value="admin">Администратор</MenuItem>
                  <MenuItem value="gamemaster">Мастер</MenuItem>
                  <MenuItem value="player">Игрок</MenuItem>
                  <MenuItem value="guest">Гость</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button onClick={updateUserRole} color="primary" variant="contained">
            Сохранить
          </Button>
        </DialogActions>
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

export default UserManagement;