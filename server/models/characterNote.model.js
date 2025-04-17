module.exports = (sequelize, Sequelize) => {
  const CharacterNote = sequelize.define('characterNote', {
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
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    content: {
      type: Sequelize.TEXT
    },
    category: {
      type: Sequelize.STRING // Категория заметки (квест, личное, открытие и т.д.)
    },
    isPrivate: {
      type: Sequelize.BOOLEAN, // Видна только игроку или мастеру тоже
      defaultValue: false
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

  return CharacterNote;
};