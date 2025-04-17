module.exports = (sequelize, Sequelize) => {
  const ReferenceItem = sequelize.define('referenceItem', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    type: {
      type: Sequelize.ENUM('skill', 'item', 'spell', 'monster', 'location', 'race', 'class'),
      allowNull: false
    },
    category: {
      type: Sequelize.STRING,
      allowNull: true
    },
    description: {
      type: Sequelize.TEXT
    },
    properties: {
      type: Sequelize.JSON, // Различные свойства в зависимости от типа
      defaultValue: {}
    },
    requirements: {
      type: Sequelize.JSON, // Требования для использования (характеристики, уровень и т.д.)
      defaultValue: {}
    },
    isPublic: {
      type: Sequelize.BOOLEAN, // Доступен ли элемент для всех мастеров
      defaultValue: false
    },
    createdBy: {
      type: Sequelize.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
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

  return ReferenceItem;
};