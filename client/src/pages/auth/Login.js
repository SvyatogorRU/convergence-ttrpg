import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Alert
} from '@mui/material';

const Login = () => {
  const { currentUser, loading, error, login } = useAuth();
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Загрузка...</Typography>
      </Box>
    );
  }
  if (currentUser) {
    return <Navigate to="/" />;
  }
  return (
    <Container component="main" maxWidth="sm">
      <Paper 
        elevation={3}
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 4
        }}
      >
        <Typography component="h1" variant="h4" gutterBottom>
          Система "Конвергенция"
        </Typography>
        <Typography variant="subtitle1" gutterBottom align="center" sx={{ mb: 3 }}>
          Авторизуйтесь через Discord для доступа к системе
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={login}
          sx={{ 
            backgroundColor: '#5865F2',
            '&:hover': {
              backgroundColor: '#4752C4',
            }
          }}
        >
          Войти через Discord
        </Button>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
          Доступ к системе предоставляется только авторизованным пользователям.
          Если у вас нет доступа, обратитесь к администратору системы.
        </Typography>
      </Paper>
    </Container>
  );
};
export default Login;