const { DataTypes } = require('sequelize');

module.exports = userModel;

function userModel(sequelize) {
    const elements = {
        userName: {
            allowNull: false,
            type: DataTypes.STRING
        },
        email: {
            allowNull: false,
            type: DataTypes.STRING
        },
        userTitle: {
            allowNull: true,
            type: DataTypes.STRING,
            DefaultValue: 'No title achieved yet.'
        },
        userDescription: {
            allowNull: true,
            type: DataTypes.STRING
        },
        totalPoints: {
            allowNull: false,
            type: DataTypes.SMALLINT,
            defaultValue: 0
        },
        passHash: {
            allowNull: false,
            type: DataTypes.STRING
        }
    }

    const options = {
        defaultScope: {
            elements: { exclude: ['hash'] }
        },
        scopes: {
            withHash: { elements: {}, }
        }
    };

    return sequelize.define('User', elements, options);
}