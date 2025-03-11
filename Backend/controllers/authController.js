import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

export const registerUser = async (req, res) => {
    console.log("Request Body :: 2️⃣ ",req.body);
    const errors = validationResult(req); // check for errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email}); // check if user with this email exists exists
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // create a new user incase they don't exist
        user = new User({
            name,
            email,
            password
        });

        // hash the password
        const salt = await bcryptjs.genSalt(10); // generate a salt, A salt is a random value that is used with the password for hashing
        user.password = await bcryptjs.hash(password, salt); // hash the password, Hashing the password means that it is converted into a fixed length string of characters that is not reversible

        await user.save(); // save the user to the database

        // create a payload
        const payload = {
            user: {
                id: user.id
            }
        };

        // sign the token, this token is what will be used to access protected routes
        // the JWT_SECRET is a secret key that is used to sign the token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {expiresIn: '24h'},
             (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    }catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};

export const loginUser = async (req, res) => {
    const errors = validationResult(req); // check for errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email }); // check if user with this email exists
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials provided' });
        }

        const isMatch = await bcryptjs.compare(password, user.password); // check if the password provided matches the hashed password in the database
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Password provided' });
        }

        // create a payload
        const payload = {
            user: {
                id: user.id
            }
        };

        // sign the token, this token is what will be used to access protected routes
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {expiresIn: '24h'},
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            });

    }catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // get the user by id and exclude the password
        res.json(user);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};
