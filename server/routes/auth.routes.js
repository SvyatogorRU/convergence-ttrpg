const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { User, WhiteList } = require('../models');

// Параметры для OAuth2 Discord
const DISCORD_API = 'https://discord.com/api/v10';
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
// Добавляем проверку для CLIENT_URL
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Генерация ссылки для авторизации через Discord
router.get('/discord', (req, res) => {
  const url = `${DISCORD_API}/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=identify%20email`;
  
  res.json({ url });
});

// Обработка callback от Discord
router.all('/discord/callback', async (req, res) => {
  // Код может прийти в query или в body
  const code = req.query.code || (req.body && req.body.code);
  
  if (!code) {
    return res.status(400).json({ message: 'Код авторизации не предоставлен' });
  }
  
  try {
    // Обмен кода на токен доступа
    const tokenResponse = await axios.post(
      `${DISCORD_API}/oauth2/token`,
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const { access_token } = tokenResponse.data;
    
    // Получение информации о пользователе
    const userResponse = await axios.get(`${DISCORD_API}/users/@me`, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
    
    const { id: discordId, username, email, avatar } = userResponse.data;
    
    // Проверка наличия пользователя в белом списке
    const whiteListEntry = await WhiteList.findOne({ where: { discordId, isActive: true } });
    
    if (!whiteListEntry) {
      return res.status(403).json({ message: 'У вас нет доступа к этому приложению' });
    }
    
    // Проверка срока действия доступа
    if (whiteListEntry.expirationDate && new Date(whiteListEntry.expirationDate) < new Date()) {
      return res.status(403).json({ message: 'Срок вашего доступа истек' });
    }
    
    // Поиск пользователя в базе или создание нового
    let user = await User.findOne({ where: { discordId } });
    
    if (!user) {
      // Создание нового пользователя
      user = await User.create({
        username,
        email,
        discordId,
        avatar,
        role: whiteListEntry.accessLevel,
        lastLogin: new Date(),
        isActive: true
      });
    } else {
      // Особая обработка для привилегированного пользователя
      if (discordId === '670742574818132008') {
        // Гарантируем, что у этого пользователя всегда роль admin
        whiteListEntry.accessLevel = 'admin';
        await whiteListEntry.save();
        user.role = 'admin';
      } else {
        // Синхронизация роли из белого списка
        user.role = whiteListEntry.accessLevel;
      }
      
      // Обновление данных пользователя
      user.username = username;
      user.email = email;
      user.avatar = avatar;
      user.lastLogin = new Date();
      user.isActive = true;
      await user.save();
    }
    
    // Создание JWT токена
    const token = jwt.sign(
      { id: user.id, role: user.role, discordId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );
    
    // Отправка токена клиенту - ИСПРАВЛЕННАЯ СТРОКА
    res.redirect(`${CLIENT_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Ошибка авторизации через Discord:', error);
    res.status(500).json({ message: 'Ошибка при авторизации через Discord' });
  }
});

// Проверка токена
router.get('/verify', async (req, res) => {
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({ message: 'Токен не предоставлен' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Неверный токен или неактивный пользователь' });
    }
    
    // Проверка, не истек ли срок действия в белом списке
    const whiteListEntry = await WhiteList.findOne({ 
      where: { 
        discordId: user.discordId, 
        isActive: true 
      } 
    });
    
    if (!whiteListEntry || (whiteListEntry.expirationDate && new Date(whiteListEntry.expirationDate) < new Date())) {
      return res.status(403).json({ message: 'Ваш доступ к приложению истек' });
    }
    
    // Особая обработка для привилегированного пользователя
    if (user.discordId === '670742574818132008' && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
      
      if (whiteListEntry && whiteListEntry.accessLevel !== 'admin') {
        whiteListEntry.accessLevel = 'admin';
        await whiteListEntry.save();
      }
    } else {
      // Синхронизация роли из белого списка
      if (whiteListEntry && user.role !== whiteListEntry.accessLevel) {
        user.role = whiteListEntry.accessLevel;
        await user.save();
      }
    }
    
    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      discordId: user.discordId
    });
  } catch (error) {
    return res.status(401).json({ message: 'Неверный токен' });
  }
});

module.exports = router;