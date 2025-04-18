// client/src/components/character/CharacterSheetExporter.js
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Tabs,
  Tab,
  Box,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Grid,
  Alert,
  LinearProgress,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  FileCopy as FileCopyIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  Code as CodeIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';

/**
 * Компонент для экспорта карточки персонажа в различные форматы
 * @param {Object} props
 * @param {boolean} props.open - состояние открытия диалога
 * @param {Function} props.onClose - функция закрытия диалога
 * @param {Object} props.character - объект персонажа
 */
const CharacterSheetExporter = ({ open, onClose, character }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState('');
  const [exportOptions, setExportOptions] = useState({
    includeBasicStats: true,
    includeHiddenStats: true,
    includeDerivedStats: true,
    includeSkills: true,
    includeInventory: true,
    includeKnowledge: true,
    includeNotes: true,
    includePrivateNotes: false,
    includeBiography: true,
    includeHistory: false,
    includeAvatar: true,
    includeMechanics: false
  });
  
  // Пример HTML-шаблона для предпросмотра экспорта
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewGenerated, setPreviewGenerated] = useState(false);
  
  // Опции форматирования по типу экспорта
  const [formatOptions, setFormatOptions] = useState({
    paperSize: 'a4',
    orientation: 'portrait',
    theme: 'default',
    fontSize: 'medium',
    includeHeader: true,
    includeFooter: true
  });

  // Обработчик изменения вкладки
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Обработчик изменения формата экспорта
  const handleFormatChange = (event) => {
    setExportFormat(event.target.value);
  };

  // Обработчик изменения опций экспорта
  const handleOptionChange = (event) => {
    setExportOptions({
      ...exportOptions,
      [event.target.name]: event.target.checked
    });
  };

  // Обработчик изменения опций форматирования
  const handleFormatOptionChange = (event) => {
    const { name, value } = event.target;
    setFormatOptions({
      ...formatOptions,
      [name]: value
    });
  };

  // Генерация шаблона для предпросмотра
  const generatePreview = () => {
    setLoading(true);
    
    // Имитация генерации предпросмотра
    setTimeout(() => {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1 style="text-align: center;">${character.name}</h1>
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            ${exportOptions.includeAvatar && character.avatarUrl ? 
              `<img src="${character.avatarUrl}" alt="${character.name}" style="width: 100px; height: 100px; border-radius: 50%; margin-right: 20px;">` : ''}
            <div>
              <p><strong>Род занятий:</strong> ${character.characterOccupation || 'Искатель приключений'}</p>
              <p><strong>Регион:</strong> ${character.homeRegion || 'Перекресток Миров'}</p>
            </div>
          </div>
          
          ${exportOptions.includeBasicStats ? `
            <h2>Базовые характеристики</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
              ${character.characterStats?.filter(stat => stat.category === 'basic').map(stat => 
                `<div style="border: 1px solid #ccc; padding: 10px; border-radius: 5px; min-width: 100px; text-align: center;">
                  <h3 style="margin: 0;">${stat.name}</h3>
                  <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${stat.value}</p>
                </div>`
              ).join('') || 'Нет базовых характеристик'}
            </div>
          ` : ''}
          
          ${exportOptions.includeDerivedStats ? `
            <h2>Производные показатели</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
              ${character.characterStats?.filter(stat => stat.category === 'derived').map(stat => 
                `<div style="border: 1px solid #ccc; padding: 10px; border-radius: 5px; min-width: 120px; text-align: center;">
                  <h3 style="margin: 0;">${stat.name}</h3>
                  <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${stat.value}</p>
                </div>`
              ).join('') || 'Нет производных показателей'}
            </div>
          ` : ''}
          
          ${exportOptions.includeHiddenStats && exportOptions.includeHiddenStats ? `
            <h2>Скрытые характеристики</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
              ${character.characterStats?.filter(stat => stat.category === 'hidden' && stat.isVisible).map(stat => 
                `<div style="border: 1px solid #ccc; padding: 10px; border-radius: 5px; min-width: 100px; text-align: center;">
                  <h3 style="margin: 0;">${stat.name}</h3>
                  <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${stat.value}</p>
                </div>`
              ).join('') || 'Нет открытых скрытых характеристик'}
            </div>
          ` : ''}
          
          ${exportOptions.includeSkills ? `
            <h2>Навыки</h2>
            <div style="margin-bottom: 20px;">
              ${(() => {
                const skillCategories = {};
                character.characterSkills?.forEach(skill => {
                  if (!skillCategories[skill.category]) {
                    skillCategories[skill.category] = [];
                  }
                  skillCategories[skill.category].push(skill);
                });
                
                return Object.entries(skillCategories).map(([category, skills]) => `
                  <div style="margin-bottom: 15px;">
                    <h3 style="margin-bottom: 5px;">${getCategoryName(category)}</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                      ${skills.map(skill => 
                        `<div style="border: 1px solid #ccc; padding: 8px; border-radius: 5px; min-width: 150px;">
                          <strong>${skill.name}</strong>: ${skill.value}
                        </div>`
                      ).join('')}
                    </div>
                  </div>
                `).join('') || 'Нет навыков';
              })()}
            </div>
          ` : ''}
          
          ${exportOptions.includeInventory && character.characterInventories?.length > 0 ? `
            <h2>Инвентарь</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f2f2f2;">
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Предмет</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Тип</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Кол-во</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Вес</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Статус</th>
                </tr>
              </thead>
              <tbody>
                ${character.characterInventories.map(item => `
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">
                      <strong>${item.itemName}</strong>
                      ${item.description ? `<br><small>${item.description}</small>` : ''}
                    </td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${getItemTypeName(item.itemType)}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.weight}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                      ${item.isEquipped ? 'Экипировано' : 'В инвентаре'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}
          
          ${exportOptions.includeBiography && character.background ? `
            <h2>Биография</h2>
            <div style="border: 1px solid #ccc; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p>${character.background}</p>
            </div>
          ` : ''}
        </div>
      `;
      
      setPreviewHtml(html);
      setPreviewGenerated(true);
      setLoading(false);
    }, 1000);
  };

  // Функция экспорта
  const handleExport = () => {
    setLoading(true);
    setExportSuccess(false);
    setExportError('');
    
    // Имитация процесса экспорта
    setTimeout(() => {
      try {
        switch (exportFormat) {
          case 'pdf':
            console.log('Экспорт в PDF:', { character, exportOptions, formatOptions });
            // Здесь будет код для генерации PDF
            break;
          case 'html':
            console.log('Экспорт в HTML:', { character, exportOptions, formatOptions });
            // Здесь будет код для генерации HTML
            break;
          case 'json':
            console.log('Экспорт в JSON:', { character, exportOptions });
            // Здесь будет код для генерации JSON
            break;
          case 'text':
            console.log('Экспорт в текстовый формат:', { character, exportOptions });
            // Здесь будет код для генерации текстового документа
            break;
          default:
            throw new Error('Неподдерживаемый формат экспорта');
        }
        
        setExportSuccess(true);
      } catch (error) {
        console.error('Ошибка при экспорте:', error);
        setExportError('Не удалось экспортировать: ' + error.message);
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  // Вспомогательная функция для получения названия категории навыка
  const getCategoryName = (category) => {
    const categories = {
      'combat': 'Боевые навыки',
      'physical': 'Физические навыки',
      'social': 'Социальные навыки',
      'mental': 'Ментальные навыки',
      'craft': 'Ремесленные навыки',
      'magic': 'Магические навыки',
      'survival': 'Выживальческие навыки'
    };
    return categories[category] || category;
  };

  // Вспомогательная функция для получения названия типа предмета
  const getItemTypeName = (itemType) => {
    const types = {
      'weapon': 'Оружие',
      'armor': 'Броня',
      'consumable': 'Расходник',
      'material': 'Материал',
      'artifact': 'Артефакт',
      'misc': 'Разное'
    };
    return types[itemType] || itemType;
  };

  // Вспомогательный компонент TabPanel
  const TabPanel = (props) => {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`export-tabpanel-${index}`}
        aria-labelledby={`export-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        Экспорт карточки персонажа
      </DialogTitle>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        centered
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Опции" />
        <Tab label="Форматирование" />
        <Tab label="Предпросмотр" />
      </Tabs>
      
      <DialogContent dividers>
        {/* Вкладка с опциями экспорта */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Формат экспорта
                </Typography>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Формат</InputLabel>
                  <Select
                    value={exportFormat}
                    onChange={handleFormatChange}
                    label="Формат"
                  >
                    <MenuItem value="pdf">PDF документ</MenuItem>
                    <MenuItem value="html">HTML страница</MenuItem>
                    <MenuItem value="json">JSON данные</MenuItem>
                    <MenuItem value="text">Текстовый документ</MenuItem>
                  </Select>
                </FormControl>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ mr: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', width: 40, height: 40 }}>
                    {exportFormat === 'pdf' && <PdfIcon fontSize="large" color="primary" />}
                    {exportFormat === 'html' && <CodeIcon fontSize="large" color="secondary" />}
                    {exportFormat === 'json' && <CodeIcon fontSize="large" color="warning" />}
                    {exportFormat === 'text' && <FileDownloadIcon fontSize="large" color="success" />}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1">
                      {exportFormat === 'pdf' && 'PDF документ'}
                      {exportFormat === 'html' && 'HTML страница'}
                      {exportFormat === 'json' && 'JSON данные'}
                      {exportFormat === 'text' && 'Текстовый документ'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {exportFormat === 'pdf' && 'Универсальный формат для печати или просмотра на устройствах'}
                      {exportFormat === 'html' && 'Для просмотра в веб-браузере или встраивания на сайт'}
                      {exportFormat === 'json' && 'Для программного использования и интеграции с другими системами'}
                      {exportFormat === 'text' && 'Простой текстовый формат для базового представления данных'}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Описание формата
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {exportFormat === 'pdf' && 'PDF документ содержит полное форматирование, изображения и структурированные данные. Идеально подходит для печати или сохранения окончательной версии карточки персонажа.'}
                  {exportFormat === 'html' && 'HTML версия карточки персонажа может быть открыта в любом веб-браузере, сохранена локально или размещена онлайн для доступа через интернет.'}
                  {exportFormat === 'json' && 'JSON формат представляет данные в структурированном виде, который удобен для программной обработки, импорта в другие системы или архивирования.'}
                  {exportFormat === 'text' && 'Текстовый формат представляет данные в простом виде без форматирования, идеален для быстрого использования или импорта в текстовые редакторы.'}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={7}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Включаемые разделы
                </Typography>
                <FormGroup>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={exportOptions.includeBasicStats}
                            onChange={handleOptionChange}
                            name="includeBasicStats"
                          />
                        }
                        label="Базовые характеристики"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={exportOptions.includeHiddenStats}
                            onChange={handleOptionChange}
                            name="includeHiddenStats"
                          />
                        }
                        label="Скрытые характеристики (открытые)"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={exportOptions.includeDerivedStats}
                            onChange={handleOptionChange}
                            name="includeDerivedStats"
                          />
                        }
                        label="Производные показатели"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={exportOptions.includeSkills}
                            onChange={handleOptionChange}
                            name="includeSkills"
                          />
                        }
                        label="Навыки и умения"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={exportOptions.includeInventory}
                            onChange={handleOptionChange}
                            name="includeInventory"
                          />
                        }
                        label="Инвентарь"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={exportOptions.includeKnowledge}
                            onChange={handleOptionChange}
                            name="includeKnowledge"
                          />
                        }
                        label="Знания"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={exportOptions.includeNotes}
                            onChange={handleOptionChange}
                            name="includeNotes"
                          />
                        }
                        label="Заметки"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={exportOptions.includePrivateNotes}
                            onChange={handleOptionChange}
                            name="includePrivateNotes"
                            disabled={!exportOptions.includeNotes}
                          />
                        }
                        label="Личные заметки"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={exportOptions.includeBiography}
                            onChange={handleOptionChange}
                            name="includeBiography"
                          />
                        }
                        label="Биография"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={exportOptions.includeHistory}
                            onChange={handleOptionChange}
                            name="includeHistory"
                          />
                        }
                        label="История изменений"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={exportOptions.includeAvatar}
                            onChange={handleOptionChange}
                            name="includeAvatar"
                          />
                        }
                        label="Аватар персонажа"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={exportOptions.includeMechanics}
                            onChange={handleOptionChange}
                            name="includeMechanics"
                          />
                        }
                        label="Детали механик"
                      />
                    </Grid>
                  </Grid>
                </FormGroup>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Вкладка с форматированием */}
        <TabPanel value={activeTab} index={1}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Опции форматирования для {
                exportFormat === 'pdf' ? 'PDF документа' :
                exportFormat === 'html' ? 'HTML страницы' :
                exportFormat === 'json' ? 'JSON данных' :
                'текстового документа'
              }
            </Typography>
            
            <Grid container spacing={3}>
              {(exportFormat === 'pdf' || exportFormat === 'html') && (
                <>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Размер бумаги</InputLabel>
                      <Select
                        name="paperSize"
                        value={formatOptions.paperSize}
                        onChange={handleFormatOptionChange}
                        label="Размер бумаги"
                      >
                        <MenuItem value="a4">A4</MenuItem>
                        <MenuItem value="a5">A5</MenuItem>
                        <MenuItem value="letter">Letter</MenuItem>
                        <MenuItem value="legal">Legal</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Ориентация</InputLabel>
                      <Select
                        name="orientation"
                        value={formatOptions.orientation}
                        onChange={handleFormatOptionChange}
                        label="Ориентация"
                      >
                        <MenuItem value="portrait">Портретная</MenuItem>
                        <MenuItem value="landscape">Альбомная</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Тема</InputLabel>
                      <Select
                        name="theme"
                        value={formatOptions.theme}
                        onChange={handleFormatOptionChange}
                        label="Тема"
                      >
                        <MenuItem value="default">Стандартная</MenuItem>
                        <MenuItem value="dark">Тёмная</MenuItem>
                        <MenuItem value="fantasy">Фэнтези</MenuItem>
                        <MenuItem value="minimalist">Минималистичная</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Размер шрифта</InputLabel>
                      <Select
                        name="fontSize"
                        value={formatOptions.fontSize}
                        onChange={handleFormatOptionChange}
                        label="Размер шрифта"
                      >
                        <MenuItem value="small">Мелкий</MenuItem>
                        <MenuItem value="medium">Средний</MenuItem>
                        <MenuItem value="large">Крупный</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formatOptions.includeHeader}
                          onChange={(e) => setFormatOptions({
                            ...formatOptions,
                            includeHeader: e.target.checked
                          })}
                          name="includeHeader"
                        />
                      }
                      label="Включить заголовок"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formatOptions.includeFooter}
                          onChange={(e) => setFormatOptions({
                            ...formatOptions,
                            includeFooter: e.target.checked
                          })}
                          name="includeFooter"
                        />
                      }
                      label="Включить нижний колонтитул"
                    />
                  </Grid>
                </>
              )}
              
              {exportFormat === 'json' && (
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formatOptions.prettyPrint}
                        onChange={(e) => setFormatOptions({
                          ...formatOptions,
                          prettyPrint: e.target.checked
                        })}
                        name="prettyPrint"
                      />
                    }
                    label="Форматированный JSON (с отступами)"
                  />
                </Grid>
              )}
              
              {exportFormat === 'text' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Формат текста</InputLabel>
                      <Select
                        name="textFormat"
                        value={formatOptions.textFormat || 'plain'}
                        onChange={handleFormatOptionChange}
                        label="Формат текста"
                      >
                        <MenuItem value="plain">Простой текст</MenuItem>
                        <MenuItem value="markdown">Markdown</MenuItem>
                        <MenuItem value="bbcode">BBCode (форумы)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formatOptions.useAsciiArt || false}
                          onChange={(e) => setFormatOptions({
                            ...formatOptions,
                            useAsciiArt: e.target.checked
                          })}
                          name="useAsciiArt"
                        />
                      }
                      label="Использовать ASCII-графику для разделителей"
                    />
                  </Grid>
                </>
              )}
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <Alert severity="info" icon={<InfoIcon />}>
                <Typography variant="subtitle2">Рекомендации по форматированию</Typography>
                <Typography variant="body2">
                  {exportFormat === 'pdf' && 'Для печатных карточек рекомендуется использовать формат A4 с портретной ориентацией и средним размером шрифта. Темная тема лучше выглядит на экране, стандартная - при печати.'}
                  {exportFormat === 'html' && 'HTML-версия лучше всего выглядит с включенным заголовком и нижним колонтитулом. Выбор темы влияет только на внешний вид, но не на функциональность.'}
                  {exportFormat === 'json' && 'Форматированный JSON с отступами удобнее для чтения человеком, но занимает больше места. Для программного использования эта опция не имеет значения.'}
                  {exportFormat === 'text' && 'Markdown-формат позволяет сохранить некоторое форматирование и структуру, что удобно для последующего редактирования. Простой текст максимально совместим с любыми текстовыми редакторами.'}
                </Typography>
              </Alert>
            </Box>
          </Box>
        </TabPanel>
        
        {/* Вкладка с предпросмотром */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {!previewGenerated ? (
              <Box sx={{ textAlign: 'center', my: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<PreviewIcon />}
                  onClick={generatePreview}
                  disabled={loading}
                >
                  Сгенерировать предпросмотр
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Предпросмотр показывает примерный вид экспортированного документа на основе выбранных опций
                </Typography>
              </Box>
            ) : loading ? (
              <Box sx={{ width: '100%', my: 3 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                  Генерация предпросмотра...
                </Typography>
              </Box>
            ) : (
              <Box sx={{ width: '100%', my: 2 }}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    maxHeight: '500px',
                    overflow: 'auto',
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                    background: formatOptions.theme === 'dark' ? '#1a1a1a' : '#ffffff',
                    color: formatOptions.theme === 'dark' ? '#ffffff' : '#000000'
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </Paper>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    sx={{ mx: 1 }}
                    onClick={() => console.log('Print preview')}
                  >
                    Печать
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FileCopyIcon />}
                    sx={{ mx: 1 }}
                    onClick={() => console.log('Copy preview HTML')}
                  >
                    Копировать HTML
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </TabPanel>
      </DialogContent>
      
      <DialogActions
        sx={{
          justifyContent: 'space-between',
          px: 3,
          py: 2
        }}
      >
        <Button onClick={onClose}>Отмена</Button>
        
        <Box>
          {exportSuccess && (
            <Alert severity="success" sx={{ display: 'inline-flex', mr: 2 }}>
              Экспорт успешно завершен!
            </Alert>
          )}
          
          {exportError && (
            <Alert severity="error" sx={{ display: 'inline-flex', mr: 2 }}>
              {exportError}
            </Alert>
          )}
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : `Экспорт в ${exportFormat.toUpperCase()}`}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default CharacterSheetExporter;