// client/src/components/character/CharacterCard.js
import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Divider, 
  Avatar, 
  Grid, 
  Paper, 
  Tabs, 
  Tab, 
  List, 
  ListItem, 
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  AccountCircle,
  Backpack,
  Psychology,
  Whatshot,
  SportsKabaddi,
  Visibility,
  VisibilityOff,
  Book,
  Note
} from '@mui/icons-material';

// Компонент табов для карточки персонажа
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`character-tabpanel-${index}`}
      aria-labelledby={`character-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CharacterCard = ({ character, isGameMaster = false }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Получение цвета прогресс-бара для навыка в зависимости от уровня
  const getSkillLevelColor = (level) => {
    if (level < 5) return 'primary.light';
    if (level < 10) return 'primary.main';
    if (level < 15) return 'secondary.light';
    if (level < 20) return 'secondary.main';
    return 'error.main';
  };

  // Получение названия уровня навыка
  const getSkillLevelName = (level) => {
    if (level < 5) return 'Новичок';
    if (level < 10) return 'Ученик';
    if (level < 15) return 'Адепт';
    if (level < 20) return 'Мастер';
    return 'Грандмастер';
  };

  // Получение категории навыка на русском
  const getSkillCategoryName = (category) => {
    const categories = {
      'combat': 'Боевые',
      'physical': 'Физические',
      'social': 'Социальные',
      'mental': 'Ментальные',
      'craft': 'Ремесленные',
      'magic': 'Магические',
      'survival': 'Выживание'
    };
    return categories[category] || category;
  };

  // Группировка навыков по категориям
  const groupedSkills = {};
  character.characterSkills?.forEach(skill => {
    const category = getSkillCategoryName(skill.category);
    if (!groupedSkills[category]) {
      groupedSkills[category] = [];
    }
    groupedSkills[category].push(skill);
  });

  if (!character) {
    return <Typography>Персонаж не найден</Typography>;
  }

  return (
    <Card elevation={3} sx={{ maxWidth: '100%', mb: 4 }}>
      <CardContent>
        {/* Основная информация */}
        <Box display="flex" alignItems="flex-start" mb={3}>
          <Avatar 
            src={character.avatarUrl} 
            alt={character.name}
            sx={{ width: 100, height: 100, mr: 3 }}
          />
          <Box>
            <Typography variant="h4" gutterBottom>{character.name}</Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {character.characterOccupation || 'Искатель приключений'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Регион: {character.homeRegion || 'Перекресток Миров'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Табы для разделов карточки */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="character tabs"
        >
          <Tab icon={<AccountCircle />} label="Характеристики" />
          <Tab icon={<SportsKabaddi />} label="Навыки" />
          <Tab icon={<Backpack />} label="Инвентарь" />
          <Tab icon={<Book />} label="Знания" />
          <Tab icon={<Note />} label="Заметки" />
          <Tab icon={<Psychology />} label="Личность" />
        </Tabs>

        {/* Таб с характеристиками */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Базовые характеристики */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>Базовые характеристики</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  {character.characterStats?.filter(stat => stat.category === 'basic').map((stat) => (
                    <Grid item xs={6} sm={4} key={stat.id}>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          textAlign: 'center', 
                          bgcolor: 'primary.light', 
                          color: 'primary.contrastText' 
                        }}
                      >
                        <Typography variant="h5">{stat.value}</Typography>
                        <Typography variant="body2">{stat.name}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
            
            {/* Производные характеристики */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>Производные показатели</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  {character.characterStats?.filter(stat => stat.category === 'derived').map((stat) => (
                    <Grid item xs={6} sm={4} key={stat.id}>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          textAlign: 'center', 
                          bgcolor: 'secondary.light', 
                          color: 'secondary.contrastText' 
                        }}
                      >
                        <Typography variant="h5">{stat.value}</Typography>
                        <Typography variant="body2">{stat.name}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
            
            {/* Скрытые характеристики (видны только если открыты) */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" gutterBottom>Открытые скрытые характеристики</Typography>
                  {isGameMaster && (
                    <Tooltip title="Все скрытые характеристики видны Мастеру">
                      <Visibility color="primary" />
                    </Tooltip>
                  )}
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  {character.characterStats?.filter(stat => stat.category === 'hidden' && (stat.isVisible || isGameMaster)).map((stat) => (
                    <Grid item xs={6} sm={4} md={3} key={stat.id}>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          textAlign: 'center', 
                          bgcolor: stat.isVisible ? 'success.light' : 'action.disabledBackground', 
                          color: stat.isVisible ? 'success.contrastText' : 'text.secondary'
                        }}
                      >
                        <Box display="flex" justifyContent="center" alignItems="center">
                          <Typography variant="h5" sx={{ mr: 1 }}>{stat.value}</Typography>
                          {!stat.isVisible && isGameMaster && <VisibilityOff fontSize="small" />}
                        </Box>
                        <Typography variant="body2">{stat.name}</Typography>
                        {stat.discoveredAt && (
                          <Typography variant="caption" display="block">
                            Открыто: {new Date(stat.discoveredAt).toLocaleDateString()}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                  
                  {character.characterStats?.filter(stat => stat.category === 'hidden' && (stat.isVisible || isGameMaster)).length === 0 && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Пока не открыто ни одной скрытой характеристики
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Таб с навыками */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {Object.entries(groupedSkills).map(([category, skills]) => (
              <Grid item xs={12} md={6} key={category}>
                <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>{category}</Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <List dense>
                    {skills.map((skill) => (
                      <ListItem key={skill.id} sx={{ mb: 1 }}>
                        <Box width="100%">
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1">{skill.name}</Typography>
                            <Box display="flex" alignItems="center">
                              <Typography variant="body2" sx={{ mr: 1 }}>
                                {skill.value} 
                              </Typography>
                              <Chip 
                                label={getSkillLevelName(skill.value)} 
                                size="small" 
                                color={skill.value >= 15 ? "secondary" : "primary"}
                                variant={skill.value >= 20 ? "filled" : "outlined"}
                              />
                            </Box>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={(skill.value % 5) * 20} // Прогресс до следующего порогового значения
                            sx={{ 
                              mt: 1, 
                              mb: 1, 
                              height: 8,
                              borderRadius: 1,
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getSkillLevelColor(skill.value)
                              }
                            }} 
                          />
                          
                          {/* Разблокированные техники навыка */}
                          {skill.unlockedTechniques && skill.unlockedTechniques.length > 0 && (
                            <Box mt={1}>
                              {skill.unlockedTechniques.map((technique, index) => (
                                <Chip 
                                  key={index}
                                  label={technique.name}
                                  size="small"
                                  variant="outlined"
                                  color="success"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                  icon={<Whatshot />}
                                  title={technique.description}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            ))}
            
            {Object.keys(groupedSkills).length === 0 && (
              <Grid item xs={12}>
                <Typography variant="body1" align="center" color="text.secondary">
                  У персонажа пока нет навыков
                </Typography>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Таб с инвентарём */}
        <TabPanel value={tabValue} index={2}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Тип</TableCell>
                  <TableCell align="center">Кол-во</TableCell>
                  <TableCell align="right">Вес</TableCell>
                  <TableCell align="right">Стоимость</TableCell>
                  <TableCell>Статус</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {character.characterInventories?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Tooltip title={item.description || ''}>
                        <Typography variant="body2">{item.itemName}</Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const types = {
                          'weapon': 'Оружие',
                          'armor': 'Броня',
                          'consumable': 'Расходник',
                          'material': 'Материал',
                          'artifact': 'Артефакт',
                          'misc': 'Разное'
                        };
                        return types[item.itemType] || item.itemType;
                      })()}
                    </TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="right">{item.weight} кг</TableCell>
                    <TableCell align="right">{item.value} А</TableCell>
                    <TableCell>
                      {item.isEquipped && (
                        <Chip size="small" label="Экипировано" color="primary" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                
                {(!character.characterInventories || character.characterInventories.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Инвентарь пуст
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Таб с открытыми знаниями */}
        <TabPanel value={tabValue} index={3}>
          {character.knowledges && character.knowledges.length > 0 ? (
            <Grid container spacing={2}>
              {character.knowledges.map((knowledge) => (
                <Grid item xs={12} sm={6} md={4} key={knowledge.id}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 2, 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      {knowledge.title}
                    </Typography>
                    <Chip 
                      label={knowledge.category || 'Общее знание'} 
                      size="small" 
                      sx={{ alignSelf: 'flex-start', mb: 1 }}
                    />
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {knowledge.preview || knowledge.content.substring(0, 150) + '...'}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                      Открыто: {
                        knowledge.characterKnowledge?.discoveredAt ? 
                        new Date(knowledge.characterKnowledge.discoveredAt).toLocaleDateString() : 
                        'Недавно'
                      }
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" align="center" color="text.secondary">
              Персонаж пока не открыл ни одного знания
            </Typography>
          )}
        </TabPanel>
        
        {/* Таб с заметками */}
        <TabPanel value={tabValue} index={4}>
          {character.characterNotes && character.characterNotes.length > 0 ? (
            <Grid container spacing={2}>
              {character.characterNotes
                .filter(note => !note.isPrivate || isGameMaster)
                .map((note) => (
                <Grid item xs={12} sm={6} key={note.id}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 2, 
                      position: 'relative',
                      backgroundColor: note.isPrivate ? 'rgba(0,0,0,0.03)' : undefined
                    }}
                  >
                    {note.isPrivate && (
                      <Tooltip title="Личная заметка">
                        <VisibilityOff 
                          fontSize="small" 
                          color="action" 
                          sx={{ position: 'absolute', top: 8, right: 8 }}
                        />
                      </Tooltip>
                    )}
                    <Typography variant="h6" gutterBottom>
                      {note.title}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {note.category && `Категория: ${note.category}`}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      {note.content}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1, textAlign: 'right' }}>
                      {new Date(note.createdAt).toLocaleDateString()}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" align="center" color="text.secondary">
              У персонажа пока нет заметок
            </Typography>
          )}
        </TabPanel>
        
        {/* Таб с информацией о личности персонажа */}
        <TabPanel value={tabValue} index={5}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Предыстория</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
              {character.background || 'Предыстория персонажа пока не написана.'}
            </Typography>
            
            {/* Отображение осколков миров, с которыми взаимодействовал персонаж */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Открытые осколки миров</Typography>
            <Divider sx={{ mb: 2 }} />
            {character.discoveredShards && character.discoveredShards.length > 0 ? (
              <Grid container spacing={2}>
                {character.discoveredShards.map((shard, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Typography variant="subtitle1">{shard.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Тип: {shard.type}
                      </Typography>
                      <Typography variant="body2">
                        {shard.description}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Обнаружен: {new Date(shard.discoveredAt).toLocaleDateString()}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body1" align="center" color="text.secondary">
                Персонаж пока не обнаружил ни одного осколка иного мира
              </Typography>
            )}
          </Paper>
        </TabPanel>
      </CardContent>
    </Card>
  );
};

export default CharacterCard;