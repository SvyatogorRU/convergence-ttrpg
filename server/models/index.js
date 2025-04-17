const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {
  sequelize,
  Sequelize,
  User: require('./user.model')(sequelize, Sequelize),
  WhiteList: require('./whitelist.model')(sequelize, Sequelize),
  Character: require('./character.model')(sequelize, Sequelize),
  Campaign: require('./campaign.model')(sequelize, Sequelize),
  CharacterStat: require('./characterStat.model')(sequelize, Sequelize),
  CharacterSkill: require('./characterSkill.model')(sequelize, Sequelize),
  Formula: require('./formula.model')(sequelize, Sequelize),
  Knowledge: require('./knowledge.model')(sequelize, Sequelize),
  CharacterKnowledge: require('./characterKnowledge.model')(sequelize, Sequelize),
  CharacterInventory: require('./characterInventory.model')(sequelize, Sequelize),
  CharacterNote: require('./characterNote.model')(sequelize, Sequelize),
};

// Определение связей
db.User.hasMany(db.Character);
db.Character.belongsTo(db.User);

db.Campaign.hasMany(db.Character);
db.Character.belongsTo(db.Campaign);

db.User.hasMany(db.Campaign);
db.Campaign.belongsTo(db.User, { as: 'GameMaster' });

db.Character.hasMany(db.CharacterStat);
db.CharacterStat.belongsTo(db.Character);

db.Character.hasMany(db.CharacterSkill);
db.CharacterSkill.belongsTo(db.Character);

db.Character.hasMany(db.CharacterInventory);
db.CharacterInventory.belongsTo(db.Character);

db.Character.hasMany(db.CharacterNote);
db.CharacterNote.belongsTo(db.Character);

db.Character.belongsToMany(db.Knowledge, { through: db.CharacterKnowledge });
db.Knowledge.belongsToMany(db.Character, { through: db.CharacterKnowledge });

// Связь между WhiteList и User (кто добавил запись)
db.WhiteList.belongsTo(db.User, { 
  foreignKey: 'addedBy', 
  as: 'AddedByUser' 
});

db.User.hasMany(db.WhiteList, { 
  foreignKey: 'addedBy', 
  as: 'AddedWhitelistEntries' 
});

module.exports = db;