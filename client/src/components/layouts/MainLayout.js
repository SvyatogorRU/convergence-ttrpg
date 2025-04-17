import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  Divider,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Book as BookIcon,
  Calculate as CalculateIcon,
  Psychology as PsychologyIcon,
  Campaign as CampaignIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const MainLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Панель управления', icon: <DashboardIcon />, path: '/' },
    { text: 'Персонажи', icon: <PeopleIcon />, path: '/characters' },
    { text: 'Кампании', icon: <CampaignIcon />, path: '/campaigns' },
    { text: 'Калькулятор формул', icon: <CalculateIcon />, path: '/formulas' },
    { text: 'База знаний', icon: <BookIcon />, path: '/knowledge' }
  ];

  // Добавляем пункты админ-меню только для администраторов
  const adminMenuItems = currentUser && currentUser.role === 'admin' ? [
    { 
      text: 'Администрирование', 
      icon: <AdminIcon />, 
      path: '/admin',
      subItems: [
        { text: 'Главная панель', path: '/admin' },
        { text: 'Управление пользователями', path: '/admin/users' },
        { text: 'Управление белым списком', path: '/admin/whitelist' },
        { text: 'Управление справочниками', path: '/admin/reference' } // Новый пункт меню
      ] 
    }
  ] : [];
  
  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Конвергенция
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {/* Добавляем секцию администрирования */}
      {adminMenuItems.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <List>
            {adminMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton onClick={() => navigate(item.path)}>
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
            
            {/* Подменю администрирования */}
            {adminMenuItems[0]?.subItems && (
              <List component="div" disablePadding>
                {adminMenuItems[0].subItems.map((subItem) => (
                  <ListItemButton 
                    key={subItem.text} 
                    sx={{ pl: 4 }}
                    onClick={() => navigate(subItem.path)}
                  >
                    <ListItemText primary={subItem.text} />
                  </ListItemButton>
                ))}
              </List>
            )}
          </List>
        </>
      )}
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Система "Конвергенция"
          </Typography>
          {currentUser && (
            <>
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{ ml: 2 }}
                aria-controls="user-menu"
                aria-haspopup="true"
              >
                <Avatar 
                  alt={currentUser.username} 
                  src={currentUser.avatar ? `https://cdn.discordapp.com/avatars/${currentUser.discordId}/${currentUser.avatar}.png` : ''}
                  sx={{ width: 32, height: 32 }}
                />
              </IconButton>
              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem disabled>
                  {currentUser.username}
                </MenuItem>
                <MenuItem disabled>
                  Роль: {currentUser.role}
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Выйти
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Лучшая производительность для мобильных устройств
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;