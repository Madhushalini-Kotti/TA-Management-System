import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('TA Management System', 'postgres', 'kmr2023', {
    host: 'localhost',
    dialect: 'postgres', 
    logging: false, 
});

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

testConnection();

export default sequelize;

