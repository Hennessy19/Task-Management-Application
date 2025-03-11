import { check } from 'express-validator';

export const registerValidation = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
];  

export const loginValidation = [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
]

export const taskValidation = [
    check('title', 'Title is required').not().isEmpty(),
    // check('description', 'Description is required').not().isEmpty(),
    // check('priority', 'Priority is required').not().isEmpty(),
    // check('dueDate', 'Due Date is required').not().isEmpty(),
    // check('category', 'Category is required').not().isEmpty()
];
