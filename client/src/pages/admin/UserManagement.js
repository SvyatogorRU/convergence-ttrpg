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
  Snackbar,
  TablePagination,
  InputAdornment,
  Grid,
  Tooltip
} from '@mui/material';
import {
  Edit,
  Refresh,
  VerifiedUser,
  Block,
  Search,
  FilterAlt
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
  
  // Параметры поиска и фильтрации
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Параметры пагинации
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  // Загрузка списка пользователей с учетом фильтров и пагинации
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        search: searchQuery || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        limit: rowsPerPage,
        offset: page * rowsPerPage
      };
      
      const response = await userService.getAll(params);
      console.log('Users data:', response.data);
      
      setUsers(response.data.users);
      setTotalUsers(response.data.total);
    } catch (err) {
      console.error('Ошибка при получении пользователей:', err);
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
      
      // Проверка на привилегированного пользователя
      if (currentUser.discordId === '670742574818132008' && currentUser.role !== 'admin') {
        setSnackbar({
          open: true,
          message: 'Этому пользователю нельзя изменить роль администратора',
          severity: 'error'
        });
        setOpenDialog(false);
        return;
      }
      
      await userService.updateRole(currentUser.id, currentUser.role);
      
      setOpenDialog(false);
      
      setSnackbar({
        open: true,
        message: 'Роль пользователя успешно обновлена',
        severity: 'success'
      });
      
      fetchUsers();
    } catch (err) {
      console.error('Ошибка при обновлении роли:', err);
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
    
    // Проверка на привилегированного пользователя
    if (user.discordId === '670742574818132008' && !newStatus) {
      setSnackbar({
        open: true,
        message: 'Этого пользователя нельзя деактивировать',
        severity: 'error'
      });
      return;
    }
    
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
        console.error('Ошибка при обновлении статуса:', err);
        setError('Ошибка при обновлении статуса: ' + (err.response?.data?.message || err.message));
        
        setSnackbar({
          open: true,
          message: 'Ошибка при обновлении статуса пользователя',
          severity: 'error'
        });
      }
    }
  };

  // Обработчики пагинации
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Применение фильтров
  const applyFilters = () => {
    setPage(0); // Сбрасываем на первую страницу при изменении фильтров
    fetchUsers();
  };

  // Сброс фильтров
  const resetFilters = () => {
    setSearchQuery('');
    setRoleFilter('');
    setStatusFilter('');
    setPage(0);
    
    // После сброса фильтров загружаем данные
    setTimeout(() => fetchUsers(), 0);
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

  // Загрузка данных при изменении параметров пагинации
  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);

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
        
        {/* Панель поиска и фильтрации */}
        <Box mt={2}>
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
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                helperText="Поиск по имени, Discord ID и email"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Роль</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  label="Роль"
                >
                  <MenuItem value="">Все роли</MenuItem>
                  <MenuItem value="admin">Администратор</MenuItem>
                  <MenuItem value="gamemaster">Мастер</MenuItem>
                  <MenuItem value="player">Игрок</MenuItem>
                  <MenuItem value="guest">Гость</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Статус</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Статус"
                >
                  <MenuItem value="">Все статусы</MenuItem>
                  <MenuItem value="active">Активные</MenuItem>
                  <MenuItem value="inactive">Неактивные</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<FilterAlt />}
                  onClick={applyFilters}
                  fullWidth
                >
                  Применить
                </Button>
                <Button
                  variant="outlined"
                  onClick={resetFilters}
                >
                  Сброс
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <>
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
                        <Tooltip title="Изменить роль">
                          <IconButton 
                            onClick={() => handleEditUser(user)} 
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={user.isActive ? 'Деактивировать' : 'Активировать'}>
                          <IconButton 
                            onClick={() => toggleUserActive(user)} 
                            color={user.isActive ? 'error' : 'success'}
                            disabled={user.discordId === '670742574818132008' && user.isActive}
                          >
                            {user.isActive ? <Block /> : <VerifiedUser />}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={totalUsers}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Строк на странице:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
          />
        </>
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
                  disabled={currentUser.discordId === '670742574818132008'}
                >
                  <MenuItem value="admin">Администратор</MenuItem>
                  <MenuItem value="gamemaster">Мастер</MenuItem>
                  <MenuItem value="player">Игрок</MenuItem>
                  <MenuItem value="guest">Гость</MenuItem>
                </Select>
                {currentUser.discordId === '670742574818132008' && (
                  <Typography variant="caption" color="error">
                    Роль этого пользователя не может быть изменена
                  </Typography>
                )}
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button 
            onClick={updateUserRole} 
            color="primary" 
            variant="contained"
            disabled={currentUser?.discordId === '670742574818132008' && currentUser?.role !== 'admin'}
          >
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