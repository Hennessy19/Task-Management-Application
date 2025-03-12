import express from 'express';
import auth from '../middleware/auth.js';
import { taskValidation } from '../middleware/validators.js';
import { getTasks, getTask, createTask, updateTask, deleteTask, getFilteredTasks, searchTasks, getTaskStats } from '../controllers/taskController.js';

const router = express.Router();    

// @route    GET api/tasks
// @desc     Get all tasks
// @access   Private
router.get('/', auth, getTasks);

// @route    GET api/tasks/:id
// @desc     Get single task
// @access   Private
router.get('/:id', auth, getTask);

// @route    POST api/tasks
// @desc     Create task
// @access   Private
router.post('/', [auth, taskValidation], createTask);

// @route    PUT api/tasks/:id
// @desc     Update task
// @access   Private
router.put('/:id', auth, updateTask);

// @route    DELETE api/tasks/:id
// @desc     Delete task
// @access   Private
router.delete('/:id', auth, deleteTask);

// @route    GET api/tasks/filter
// @desc     Get filtered tasks
// @access   Private
router.get('/filter', auth, getFilteredTasks);

// @route    GET api/tasks/search
// @desc     Search tasks
// @access   Private
router.get('/search', auth, searchTasks);

// @route    GET api/tasks/stats
// @desc     Get task stats
// @access   Private
router.get('/stats', auth, getTaskStats);

export default router;