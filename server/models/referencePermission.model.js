module.exports = (sequelize, Sequelize) => {
  const ReferencePermission = sequelize.define('referencePermission', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    referenceType: {
      type: Sequelize.ENUM('skill', 'item', 'spell', 'monster', 'location', 'race', 'class', 'all'),
      allowNull: false,
      defaultValue: 'all'
    },
    canView: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    canCreate: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    canEdit: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    canDelete: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    canGrantAccess: {
      type: Sequelize.BOOLEAN, // Может ли пользователь давать доступ другим мастерам
      defaultValue: false
    },
    grantedBy: {
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

  return ReferencePermission;
};