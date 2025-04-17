import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Контексты
import { AuthProvider } from './contexts/AuthContext';

// Компоненты маршрутизации
import PrivateRoute from './components/routes/PrivateRoute';
import RoleRoute from './components/routes/RoleRoute';

// Макеты
import MainLayout from './components/layouts/MainLayout';

// Страницы аутентификации
import Login from './pages/auth/Login';
import AuthCallback from './pages/auth/AuthCallback';

// Основные страницы
import Dashboard from './pages/Dashboard';

// Заглушки для страниц (будут реализованы позже)
const CharactersList = () => <div>Список персонажей (будет реализовано позже)</div>;
const CharacterDetail = () => <div>Детали персонажа (будет реализовано позже)</div>;
const CampaignsList = () => <div>Список кампаний (будет реализовано позже)</div>;
const CampaignDetail = () => <div>Детали кампании (будет реализовано позже)</div>;
const FormulaCalculator = () => <div>Калькулятор формул (будет реализовано позже)</div>;
const KnowledgeBase = () => <div>База знаний (будет реализовано позже)</div>;
const AdminPanel = () => <div>Панель администратора (будет реализовано позже)</div>;
const UserManagement = () => <div>Управление пользователями (будет реализовано позже)</div>;
import WhitelistManagement from './pages/admin/WhitelistManagement';

// Создание темы
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7e57c2',
    },
    secondary: {
      main: '#ff9800',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Публичные маршруты */}
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Защищенные маршруты */}
            <Route path="/" element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }>
              <Route index element={<Dashboard />} />
              
              {/* Персонажи */}
              <Route path="characters" element={<CharactersList />} />
              <Route path="characters/:id" element={<CharacterDetail />} />
              
              {/* Кампании */}
              <Route path="campaigns" element={<CampaignsList />} />
              <Route path="campaigns/:id" element={<CampaignDetail />} />
              
              {/* Формулы и знания */}
              <Route path="formulas" element={<FormulaCalculator />} />
              <Route path="knowledge" element={<KnowledgeBase />} />
              
              {/* Админ-маршруты */}
              <Route path="admin" element={
                <RoleRoute allowedRoles={['admin']}>
                  <AdminPanel />
                </RoleRoute>
              } />
              <Route path="admin/users" element={
                <RoleRoute allowedRoles={['admin']}>
                  <UserManagement />
                </RoleRoute>
              } />
              <Route path="admin/whitelist" element={
                <RoleRoute allowedRoles={['admin']}>
                  <WhitelistManagement />
                </RoleRoute>
              } />
            </Route>
            
            {/* Редирект для неизвестных маршрутов */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;