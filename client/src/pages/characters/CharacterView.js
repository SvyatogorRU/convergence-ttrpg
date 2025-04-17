import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert,
  Button
} from '@mui/material';
import { characterService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import UnifiedCharacterCard from '../../components/character/UnifiedCharacterCard';

const CharacterView = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const isGameMaster = currentUser && ['admin', 'gamemaster'].includes(currentUser.role);

  // Загрузка данных персонажа
  const fetchCharacter = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Используем getById для всех пользователей, мастера увидят все детали персонажа
      const response = await characterService.getById(id);
      setCharacter(response.data);
    } catch (err) {
      console.error('Ошибка при получении персонажа:', err);
      setError('Не удалось загрузить данные персонажа: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Обработчик после сохранения изменений
  const handleCharacterUpdated = () => {
    fetchCharacter(); // Перезагружаем данные персонажа
  };

  useEffect(() => {
    fetchCharacter();
  }, [id]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {loading ? 'Загрузка персонажа...' : character ? character.name : 'Персонаж'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : character ? (
        <UnifiedCharacterCard 
          character={character} 
          isGameMaster={isGameMaster}
          onCharacterUpdated={handleCharacterUpdated}
        />
      ) : (
        <Alert severity="info">
          Персонаж не найден или у вас нет к нему доступа
        </Alert>
      )}
    </Box>
  );
};

export default CharacterView;