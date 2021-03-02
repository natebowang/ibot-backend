const {Sequelize, Model, DataTypes} = require("sequelize");
const sequelize = new Sequelize('postgres://wangbo@localhost:5432/ibot');

class User extends Model {
}

User.init({
        username: DataTypes.STRING(200),
        password: DataTypes.STRING(200),
        login_method_id: DataTypes.INTEGER,
        email: DataTypes.STRING(200),
        phone: DataTypes.STRING(200),
        avatar: DataTypes.STRING(200),
        user_state: DataTypes.INTEGER,
    }
    , {
        sequelize,
        timestamps: false,
        modelName: 'user'
    });

module.exports = {User};

// (async () => {
//     try {
//         await sequelize.authenticate();
//         console.log('Connection has been established successfully.');
//     } catch (error) {
//         console.error('Unable to connect to the database:', error);
//     }
// })();
//
//
