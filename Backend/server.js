import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import mongodb from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import cors from 'cors';
import helmet from 'helmet';
import ratelimit from 'express-rate-limit';
import errorHandler from './middleware/errorHandler.js';


const app = express();
dotenv.config();
app.use(cors());// Cross-Origin Resource Sharing (CORS) is a security feature that restricts cross-origin HTTP requests that are initiated from scripts running in the browser.
app.use(helmet()); // Helmet helps you secure your Express apps by setting various HTTP headers.

// Rate Limiting 
const limiter = ratelimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/',limiter);


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
app.use('/api/tasks', taskRoutes);

app.use(errorHandler);

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

