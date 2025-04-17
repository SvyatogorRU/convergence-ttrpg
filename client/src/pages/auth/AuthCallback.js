import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  CircularProgress,
  Typography,
  Alert,
  Button
} from '@mui/material';

const AuthCallback = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('AuthCallback: URL параметры:', location.search);
    
    const processAuth = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');
        
        if (!token) {
          console.error('Токен не найден в URL');
          setError('Не удалось получить токен авторизации');
          setLoading(false);
          return;
        }
        
        console.log('Токен получен, сохраняем и проверяем...');
        
        // Сохраняем токен
        localStorage.setItem('token', token);
        
        // Проверяем токен, делая запрос к API
        try {
          await axios.get(`${process.env.REACT_APP_API_URL}/auth/verify`, {
            headers: { 'x-auth-token': token }
          });
          
          console.log('Токен проверен успешно, перенаправляем...');
          navigate('/');
        } catch (verifyError) {
          console.error('Ошибка проверки токена:', verifyError);
          localStorage.removeItem('token');
          setError('Ошибка проверки токена авторизации');
          setLoading(false);
        }
      } catch (err) {
        console.error('Общая ошибка при обработке авторизации:', err);
        setError('Произошла ошибка при обработке авторизации');
        setLoading(false);
      }
    };
    
    processAuth();
  }, [navigate, location.search]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        p={3}
      >
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h5" gutterBottom align="center">
          Завершаем авторизацию...
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          Пожалуйста, подождите, пока мы проверяем ваши данные
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      display="flex" 
      flexDirection="column"
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
      p={3}
    >
      {error ? (
        <>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Детали ошибки: проверьте консоль браузера
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Вернуться на страницу входа
          </Button>
        </>
      ) : (
        <Typography variant="h5" gutterBottom align="center">
          Авторизация успешна! Перенаправляем...
        </Typography>
      )}
    </Box>
  );
};

export default AuthCallback;