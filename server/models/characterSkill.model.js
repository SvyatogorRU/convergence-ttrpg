module.exports = (sequelize, Sequelize) => {
  const CharacterSkill = sequelize.define('characterSkill', {
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
    experience: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    category: {
      type: Sequelize.ENUM('combat', 'physical', 'social', 'mental', 'craft', 'magic', 'survival'),
      defaultValue: 'physical'
    },
    isVisible: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    // Особые техники навыка, доступные при достижении пороговых значений (5, 10, 15, 20, 25)
    unlockedTechniques: {
      type: Sequelize.JSON,
      defaultValue: []
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

  return CharacterSkill;
};