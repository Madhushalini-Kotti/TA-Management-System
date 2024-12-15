import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();  // Load environment variables

const sequelize = new Sequelize(
    process.env.DB_NAME,   // Use the environment variable for DB name
    process.env.DB_USER,   // Use the environment variable for DB user
    process.env.DB_PASSWORD,  // Use the environment variable for DB password
    {
        host: process.env.DB_HOST,  // Use the environment variable for DB host
        port: process.env.DB_PORT,  // Use the environment variable for DB port
        dialect: 'postgres',
        logging: false,
    }
);

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
