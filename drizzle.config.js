import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

export default {
    schema: './src/models/*.js',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
};