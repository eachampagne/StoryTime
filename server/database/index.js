const { Sequelize, DataTypes, QueryTypes } = require('sequelize');
const orm = new Sequelize('stories', 'root', '', {
  host: '127.0.0.1',
  dialect: 'mysql'
});

orm.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch((error) => {
  console.error('Unable to connect to the database: ', error);
});

const User = orm.define('users', {
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  badges: Sequelize.STRING
}, {
  timestamps: false
})

const Prompt = orm.define('prompts', {
  matchWords: Sequelize.STRING,//grabbed with external api
}, {
  timestamps: true
});


const Badges = orm.define('badges', {
  mostLikes: {
    type: DataTypes.STRING,
    defaultValue: 'No winner yet'
  },
  mostWordMatchCt: {
    type: DataTypes.STRING,
    defaultValue: 'No winner yet'
  },
  mostContributions: {
    type: DataTypes.STRING,
    defaultValue: 'No winner yet'
  }
}, {
  timestamps: false
});

const Text = orm.define('texts', {
  text: Sequelize.STRING,
  winner: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  wordMatchCt: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: false
});

const Character = orm.define('characters', {
  name: Sequelize.STRING,
  bio: Sequelize.STRING,
}, {
  timestamps: false
});

const CharacterText = orm.define('character_text');

User.hasMany(Text);
Text.belongsTo(User);
Prompt.hasMany(Text);
Text.belongsTo(Prompt);
Badges.hasMany(Prompt);
Prompt.belongsTo(Badges);

Text.belongsToMany(Character, { through: CharacterText });
Character.belongsToMany(Text, { through: CharacterText });
Character.belongsTo(User);
User.hasMany(Character);

User.sync();
Prompt.sync();
Text.sync();
Badges.sync();
Character.sync();
CharacterText.sync();


exports.User = User;
exports.Prompt = Prompt;
exports.Text = Text;
exports.Badges = Badges;
exports.Character = Character;
exports.CharacterText = CharacterText; // not sure if this needs to be exported yet