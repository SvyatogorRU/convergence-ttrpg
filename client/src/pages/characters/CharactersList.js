// client/src/pages/characters/CharactersList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { characterService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const CharactersList = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [myCharacter, setMyCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const isGameMaster = currentUser && ['admin', 'gamemaster'].includes(currentUser.role);

  // Загрузка персонажей
  const fetchCharacters = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Получаем персонажа текущего пользователя (если он не мастер)
      if (!isGameMaster) {
        try {
          const myCharResponse = await characterService.getMyCharacter();
          setMyCharacter(myCharResponse.data);
        } catch (err) {
          // Если у пользователя нет персонажа, это не ошибка
          if (err.response && err.response.status === 404) {
            setMyCharacter(null);
          } else {
            console.error('Ошибка при получении персонажа пользователя:', err);
          }
        }
      } else {
        // Для мастеров получаем список всех персонажей
        const response = await characterService.getAll();
        setCharacters(response.data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при получении персонажей:', err);
      setError('Не удалось загрузить персонажей: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, [isGameMaster]);

  // Переход к созданию персонажа
  const handleCreateCharacter = () => {
    navigate('/characters/create');
  };

  // Переход к просмотру персонажа
  const handleViewCharacter = (id) => {
    navigate(`/characters/${id}`);
  };

  // Переход к редактированию персонажа
  const handleEditCharacter = (id) => {
    navigate(`/characters/${id}/edit`);
  };

  // Функция получения базовой характеристики персонажа
  const getBaseStat = (character, statName) => {
    const stat = character.characterStats?.find(s => s.name === statName);
    return stat ? stat.value : '-';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {isGameMaster ? 'Управление персонажами' : 'Мой персонаж'}
        </Typography>
        
        {isGameMaster && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateCharacter}
          >
            Создать персонажа
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
      ) : (
        <>
          {/* Для обычных игроков показываем только их персонажа */}
          {!isGameMaster && (
            <>
              {myCharacter ? (
                <Card elevation={3}>
                  <CardContent>
                    <Box display="flex" alignItems="flex-start">
                      <Avatar 
                        src={myCharacter.avatarUrl} 
                        alt={myCharacter.name}
                        sx={{ width: 100, height: 100, mr: 3 }}
                      />
                      <Box>
                        <Typography variant="h5" gutterBottom>{myCharacter.name}</Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                          {myCharacter.characterOccupation || 'Искатель приключений'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Регион: {myCharacter.homeRegion || 'Перекресток Миров'}
                        </Typography>
                        
                        <Box display="flex" mt={2}>
                          {/* Базовые характеристики */}
                          <Box mr={4}>
                            <Typography variant="subtitle2" gutterBottom>Базовые характеристики:</Typography>
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography variant="body2">СИЛ: {getBaseStat(myCharacter, 'СИЛ')}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">ЛОВ: {getBaseStat(myCharacter, 'ЛОВ')}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">ВЫН: {getBaseStat(myCharacter, 'ВЫН')}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">ИНТ: {getBaseStat(myCharacter, 'ИНТ')}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">ВСП: {getBaseStat(myCharacter, 'ВСП')}</Typography>
                              </Grid>
                            </Grid>
                          </Box>
                          
                          {/* Информация о навыках */}
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>Навыки:</Typography>
                            <Box>
                              {myCharacter.characterSkills && myCharacter.characterSkills.length > 0 ? (
                                myCharacter.characterSkills.slice(0, 5).map((skill) => (
                                  <Chip 
                                    key={skill.id}
                                    label={`${skill.name}: ${skill.value}`}
                                    size="small"
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                  />
                                ))
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  Нет навыков
                                </Typography>
                              )}
                              {myCharacter.characterSkills && myCharacter.characterSkills.length > 5 && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  И еще {myCharacter.characterSkills.length - 5} навыков...
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Button 
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewCharacter(myCharacter.id)}
                    >
                      Открыть карточку персонажа
                    </Button>
                  </CardActions>
                </Card>
              ) : (
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    У вас пока нет персонажа
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Обратитесь к Мастеру игры для создания персонажа
                  </Typography>
                  <PersonAddIcon color="action" sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
                </Paper>
              )}
            </>
          )}
          
          {/* Для мастеров показываем список всех персонажей */}
          {isGameMaster && (
            <>
              {characters.length === 0 ? (
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Персонажей пока нет
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Создайте первого персонажа, нажав кнопку "Создать персонажа"
                  </Typography>
                  <PersonAddIcon color="action" sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {characters.map((character) => (
                    <Grid item xs={12} md={6} key={character.id}>
                      <Card elevation={3}>
                        <CardContent>
                          <Box display="flex" alignItems="flex-start">
                            <Avatar 
                              src={character.avatarUrl} 
                              alt={character.name}
                              sx={{ width: 60, height: 60, mr: 2 }}
                            />
                            <Box sx={{ width: '100%' }}>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Typography variant="h6">{character.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {character.id.substring(0, 8)}...
                                </Typography>
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {character.characterOccupation || 'Искатель приключений'} • 
                                {character.homeRegion || 'Перекресток Миров'}
                              </Typography>
                              
                              <Box display="flex" flexWrap="wrap" mt={1}>
                                <Typography variant="body2" mr={2}>
                                  <strong>СИЛ:</strong> {getBaseStat(character, 'СИЛ')}
                                </Typography>
                                <Typography variant="body2" mr={2}>
                                  <strong>ЛОВ:</strong> {getBaseStat(character, 'ЛОВ')}
                                </Typography>
                                <Typography variant="body2" mr={2}>
                                  <strong>ВЫН:</strong> {getBaseStat(character, 'ВЫН')}
                                </Typography>
                                <Typography variant="body2" mr={2}>
                                  <strong>ИНТ:</strong> {getBaseStat(character, 'ИНТ')}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>ВСП:</strong> {getBaseStat(character, 'ВСП')}
                                </Typography>
                              </Box>
                              
                              <Box mt={1}>
                                <Typography variant="body2">
                                  <strong>Навыки:</strong> {character.characterSkills?.length || 0}
                                </Typography>
                              </Box>
                              
                              <Typography variant="caption" display="block" color="text.secondary" mt={1}>
                                Персонаж пользователя: {character.user?.username || 'Неизвестно'}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                        <Divider />
                        <CardActions>
                          <Tooltip title="Просмотреть">
                            <IconButton 
                              onClick={() => handleViewCharacter(character.id)}
                              color="primary"
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Редактировать">
                            <IconButton 
                              onClick={() => handleEditCharacter(character.id)}
                              color="secondary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default CharactersList;