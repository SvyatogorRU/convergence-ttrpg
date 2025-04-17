module.exports = (sequelize, Sequelize) => {
  const CharacterKnowledge = sequelize.define('characterKnowledge', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    discoveredAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    discoveryContext: {
      type: Sequelize.TEXT
    },
    isFullyRevealed: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  });

  return CharacterKnowledge;
};