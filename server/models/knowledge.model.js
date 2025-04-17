module.exports = (sequelize, Sequelize) => {
  const Knowledge = sequelize.define('knowledge', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    category: {
      type: Sequelize.STRING
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    preview: {
      type: Sequelize.TEXT
    },
    visibilityConditions: {
      type: Sequelize.JSON
    },
    gameMechanics: {
      type: Sequelize.JSON
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

  return Knowledge;
};