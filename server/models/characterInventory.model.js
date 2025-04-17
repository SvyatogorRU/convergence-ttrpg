module.exports = (sequelize, Sequelize) => {
  const CharacterInventory = sequelize.define('characterInventory', {
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
    itemName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    itemType: {
      type: Sequelize.ENUM('weapon', 'armor', 'consumable', 'material', 'artifact', 'misc'),
      defaultValue: 'misc'
    },
    quantity: {
      type: Sequelize.INTEGER,
      defaultValue: 1
    },
    description: {
      type: Sequelize.TEXT
    },
    properties: {
      type: Sequelize.JSON, // Особые свойства предмета
      defaultValue: {}
    },
    isEquipped: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    weight: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    value: {
      type: Sequelize.INTEGER, // Стоимость в астрах (базовая валюта)
      defaultValue: 0
    },
    rarity: {
      type: Sequelize.ENUM('common', 'uncommon', 'rare', 'very_rare', 'legendary', 'unique'),
      defaultValue: 'common'
    },
    origin: {
      type: Sequelize.STRING, // Происхождение предмета (осколок мира, рынок и т.д.)
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

  return CharacterInventory;
};