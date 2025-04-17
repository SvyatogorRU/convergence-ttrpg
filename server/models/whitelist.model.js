module.exports = (sequelize, Sequelize) => {
  const WhiteList = sequelize.define('whitelist', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    discordId: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    accessLevel: {
      type: Sequelize.ENUM('admin', 'gamemaster', 'player', 'creator', 'tester', 'guest'),
      defaultValue: 'guest'
    },
    addedBy: {
      type: Sequelize.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    expirationDate: {
      type: Sequelize.DATE
    },
    notes: {
      type: Sequelize.TEXT
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

  return WhiteList;
};