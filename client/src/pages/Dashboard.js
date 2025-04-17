import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Панель управления
      </Typography>
      
      <Typography variant="h6" gutterBottom>
        Добро пожаловать, {currentUser?.username}!
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Персонажи
            </Typography>
            <Typography variant="body2" paragraph>
              Управление персонажами, развитие характеристик и навыков.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/characters')}
            >
              Перейти к персонажам
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Кампании
            </Typography>
            <Typography variant="body2" paragraph>
              Ваши активные кампании и сессии.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/campaigns')}
            >
              Перейти к кампаниям
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Калькулятор формул
            </Typography>
            <Typography variant="body2" paragraph>
              Инструмент для проверки и балансировки формул системы.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/formulas')}
            >
              Открыть калькулятор
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              База знаний
            </Typography>
            <Typography variant="body2" paragraph>
              Справочные материалы по игровой системе.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/knowledge')}
            >
              Открыть базу знаний
            </Button>
          </Paper>
        </Grid>
        
        {currentUser?.role === 'admin' && (
          <Grid item xs={12} md={6} lg={4}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Панель администратора
              </Typography>
              <Typography variant="body2" paragraph>
                Управление пользователями, белым списком и системными настройками.
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/admin')}
              >
                Перейти в панель
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;