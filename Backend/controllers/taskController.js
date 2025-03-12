import Task from '../models/Task.js';
import { validationResult } from 'express-validator';

// Get all tasks for a single User
export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// Get single task by Id
export const getTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }
         // Check user owns the task
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        
        res.json(task);
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Task not found' });
        }
        res.status(500).send('Server Error');
    }
};

// Create a new task
export const createTask = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { title, description, priority, dueDate, status, category } = req.body;
    try {
        const newTask = new Task({
            user: req.user.id,
            title,
            description,
            priority,
            status,
            dueDate,
            category
        });
        const task = await newTask.save();
        res.json(task);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// Update a task
export const updateTask = async (req, res) => {
    const { title, description, priority, status ,dueDate, category } = req.body;

    // build task object
    const taskFields = {};
    if (title) taskFields.title = title;
    if (description) taskFields.description = description;
    if (priority) taskFields.priority = priority;
    if (dueDate) taskFields.dueDate = dueDate;
    if(status) taskFields.status = status;
    if (category) taskFields.category = category;
    try {
        let task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }
        // Check user owns the task
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // Update the task, $set is a mongoose method to update the fields, new: true is to return the updated task
        task = await Task.findByIdAndUpdate(req.params.id, { $set: taskFields }, { new: true });
        res.json(task);
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Task not found' });
        }
        res.status(500).send('Server Error');
    }
};

// Delete a task
export const deleteTask = async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }
        // Check user owns the task
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Task.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Task removed' });
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Task not found' });
        }
        res.status(500).send('Server Error');
    }
};

// get tasks filtered by status, priority or date range
export const getFilteredTasks = async (req, res) => {
    const { status, priority, startDate, endDate, category } = req.query;

    try {
      // Build filter object
      let filter = { user: req.user.id };
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (category) filter.category = category;
      
      // Date range filter
      if (startDate || endDate) {
        filter.dueDate = {};
        if (startDate) filter.dueDate.$gte = new Date(startDate);
        if (endDate) filter.dueDate.$lte = new Date(endDate);
      }
      
      const tasks = await Task.find(filter).sort({ dueDate: 1 });
      res.json(tasks);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };

  export const searchTasks = async (req, res) => {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ msg: 'Search query is required' });
    }
    
    try {
      const tasks = await Task.find({
        user: req.user.id,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      }).sort({ createdAt: -1 });
      
      res.json(tasks);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };

  export const getTaskStats = async (req, res) => {
    try {
      // Count tasks by status
      const statusCounts = await Task.aggregate([
        { $match: { user: mongoose.Types.ObjectId(req.user.id) } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      // Count tasks by priority
      const priorityCounts = await Task.aggregate([
        { $match: { user: mongoose.Types.ObjectId(req.user.id) } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]);
      
      // Count tasks by due date (overdue, due today, due this week, future)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
      
      const overdueTasks = await Task.countDocuments({
        user: req.user.id,
        dueDate: { $lt: today },
        status: { $ne: 'Completed' }
      });
      
      const dueTodayTasks = await Task.countDocuments({
        user: req.user.id,
        dueDate: { $gte: today, $lte: endOfToday }
      });
      
      const dueThisWeekTasks = await Task.countDocuments({
        user: req.user.id,
        dueDate: { $gt: endOfToday, $lte: endOfWeek }
      });
      
      const futureTasks = await Task.countDocuments({
        user: req.user.id,
        dueDate: { $gt: endOfWeek }
      });
      
      // Recently completed tasks
      const recentlyCompleted = await Task.find({
        user: req.user.id,
        status: 'Completed'
      }).sort({ updatedAt: -1 }).limit(5);
      
      res.json({
        statusCounts,
        priorityCounts,
        dueDates: {
          overdue: overdueTasks,
          today: dueTodayTasks,
          thisWeek: dueThisWeekTasks,
          future: futureTasks
        },
        recentlyCompleted
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };