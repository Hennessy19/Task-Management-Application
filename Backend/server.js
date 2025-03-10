import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import mongodb from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log('Connected to MongoDB successfully ✅✅');
    } catch (error) {
        console.log('Error: 🚩🚩', error.message);
    }
};

connectToDB();

app.use(express.json({extended: false}));

app.use('/api/auth', authRoutes);

if(process.env.NODE_ENV === 'production') {
    // Set the static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

mongoose.connection.on('connected', () => {
    console.log('Mongoose is connected');
});

mongoose.connection.on('error', (err) => {
    console.log('Mongoose connection error: ', err);
} );

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose is disconnected');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

