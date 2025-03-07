import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import mongodb from 'mongodb';


const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;


const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log('Connected to MongoDB successfully ✅✅');
    } catch (error) {
        console.log('Error: 🚩🚩', error.message);
    }
};

connectToDB();

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

