module.exports = (sequelize, Sequelize) => {
  const Formula = sequelize.define('formula', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    category: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.TEXT
    },
    formula: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    parameters: {
      type: Sequelize.JSON
    },
    sampleCalculation: {
      type: Sequelize.TEXT
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

  return Formula;
};