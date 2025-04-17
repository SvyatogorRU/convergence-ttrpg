module.exports = (sequelize, Sequelize) => {
  const CharacterStat = sequelize.define('characterStat', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    characterId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'characters',
        key: 'id'
      }
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    value: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    experiencePoints: {
      type: Sequelize.FLOAT, // Очки опыта для повышения этой характеристики
      defaultValue: 0
    },
    requiredPointsToLevelUp: {
      type: Sequelize.FLOAT, // Необходимое количество очков для повышения
      defaultValue: 0
    },
    isVisible: {
      type: Sequelize.BOOLEAN,
      defaultValue: true // Базовые характеристики видимы, скрытые - нет
    },
    category: {
      type: Sequelize.ENUM('basic', 'hidden', 'derived'), // Категория характеристики
      defaultValue: 'basic'
    },
    discoveredAt: {
      type: Sequelize.DATE, // Когда была открыта скрытая характеристика
      allowNull: true
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  });

  return CharacterStat;
};