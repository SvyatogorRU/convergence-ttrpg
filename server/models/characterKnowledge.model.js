module.exports = (sequelize, Sequelize) => {
  const CharacterKnowledge = sequelize.define('characterKnowledge', {
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
    knowledgeId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'knowledge',
        key: 'id'
      }
    },
    discoveredAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    discoveryContext: {
      type: Sequelize.TEXT
    },
    comprehensionLevel: {
      type: Sequelize.INTEGER, // Уровень понимания знания (1-5)
      defaultValue: 1
    },
    isFullyRevealed: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    // Очки опыта за навыки, полученные в результате открытия знания
    experienceGained: {
      type: Sequelize.JSON,
      defaultValue: {}
    }
  });

  return CharacterKnowledge;
};