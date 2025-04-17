module.exports = (sequelize, Sequelize) => {
  const Character = sequelize.define('character', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    background: {
      type: Sequelize.TEXT
    },
    avatarUrl: {
      type: Sequelize.STRING
    },
    // Добавьте эти поля, которых не хватает
    characterOccupation: {
      type: Sequelize.STRING
    },
    homeRegion: {
      type: Sequelize.STRING,
      defaultValue: "Перекресток Миров"
    },
    discoveredShards: {
      type: Sequelize.JSON,
      defaultValue: []
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
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

  return Character;
};