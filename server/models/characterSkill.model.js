module.exports = (sequelize, Sequelize) => {
  const CharacterSkill = sequelize.define('characterSkill', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
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