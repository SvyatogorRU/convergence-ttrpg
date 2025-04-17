// client/src/pages/characters/CharacterView.js
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
import CharacterCard from '../../components/character/CharacterCard';
import CharacterEditDialog from '../../components/character/CharacterEditDialog';

const CharacterView = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const isGameMaster = currentUser && ['admin', 'gamemaster'].includes(currentUser.role);

  // Загрузка данных персонажа
  const fetchCharacter = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Если пользователь мастер или админ, запрашиваем полную информацию
      const response = isGameMaster 
        ? await characterService.getFullInfo(id)
        : await characterService.getById(id);
      
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
    setEditDialogOpen(false);
    fetchCharacter(); // Перезагружаем данные персонажа
  };

  useEffect(() => {
    fetchCharacter();
  }, [id, isGameMaster]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {loading ? 'Загрузка персонажа...' : character ? character.name : 'Персонаж'}
        </Typography>
        
        {isGameMaster && character && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setEditDialogOpen(true)}
          >
            Редактировать персонажа
          </Button>
        )}
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
        <CharacterCard 
          character={character} 
          isGameMaster={isGameMaster} 
        />
      ) : (
        <Alert severity="info">
          Персонаж не найден или у вас нет к нему доступа
        </Alert>
      )}

      {isGameMaster && character && (
        <CharacterEditDialog 
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          character={character}
          onSave={handleCharacterUpdated}
        />
      )}
    </Box>
  );
};

export default CharacterView;