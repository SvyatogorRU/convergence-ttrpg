import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  People as PeopleIcon,
  FormatListBulleted as WhitelistIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Storage as StorageIcon
} from '@mui/icons-material';

const AdminPanel = () => {
  const navigate = useNavigate();

  const adminSections = [
    {
      title: 'Управление пользователями',
      description: 'Просмотр и изменение ролей пользователей системы',
      icon: <PeopleIcon fontSize="large" />,
      path: '/admin/users'
    },
    {
      title: 'Управление белым списком',
      description: 'Добавление и удаление пользователей из белого списка Discord',
      icon: <WhitelistIcon fontSize="large" />,
      path: '/admin/whitelist'
    },
    {
      title: 'Управление справочниками',
      description: 'Создание и редактирование справочников игры: навыки, предметы, заклинания и др.',
      icon: <StorageIcon fontSize="large" />,
      path: '/admin/reference'
    },
    {
      title: 'Настройки системы',
      description: 'Глобальные настройки и параметры приложения',
      icon: <SettingsIcon fontSize="large" />,
      path: '/admin/settings'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Панель администратора
      </Typography>
      
      <Box mb={4} p={2} bgcolor="background.paper" borderRadius={1}>
        <Typography variant="body1">
          Добро пожаловать в панель администратора. Здесь вы можете управлять всеми аспектами системы "Конвергенция".
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {adminSections.map((section) => (
          <Grid item xs={12} md={6} lg={4} key={section.title}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 6,
                  cursor: 'pointer'
                }
              }}
              onClick={() => navigate(section.path)}
            >
              <Box display="flex" alignItems="center" mb={2}>
                {section.icon}
                <Typography variant="h6" ml={1}>
                  {section.title}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {section.description}
              </Typography>
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(section.path);
                  }}
                >
                  Перейти
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      <Box mt={4}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Быстрый доступ
          </Typography>
          <Divider sx={{ my: 1 }} />
          <List>
            <ListItem button onClick={() => navigate('/admin/users')}>
              <ListItemIcon><PeopleIcon /></ListItemIcon>
              <ListItemText primary="Управление пользователями" />
            </ListItem>
            <ListItem button onClick={() => navigate('/admin/whitelist')}>
              <ListItemIcon><WhitelistIcon /></ListItemIcon>
              <ListItemText primary="Управление белым списком" />
            </ListItem>
            <ListItem button onClick={() => navigate('/admin/reference')}>
              <ListItemIcon><StorageIcon /></ListItemIcon>
              <ListItemText primary="Управление справочниками" />
            </ListItem>
            <ListItem button onClick={() => navigate('/')}>
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Вернуться на главную панель" />
            </ListItem>
          </List>
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminPanel;