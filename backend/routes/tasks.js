const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Task = require('../models/Task');

const taskSchema = Joi.object({
  title: Joi.string().trim().max(100).required().messages({
    'string.empty': 'Title cannot be empty',
    'string.max': 'Title cannot be more than 100 characters',
    'any.required': 'Title is required'
  }),
  description: Joi.string().trim().allow('').optional(),
  status: Joi.string().valid('To Do', 'In Progress', 'Done').optional(),
  priority: Joi.string().valid('Low', 'Medium', 'High').optional()
});

const updateSchema = Joi.object({
  status: Joi.string().valid('To Do', 'In Progress', 'Done').required().messages({
    'any.only': 'Invalid status',
    'any.required': 'Status is required'
  })
});

router.post('/', async (req, res) => {
  const { error, value } = taskSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(err => err.message);
    return res.status(400).json({ success: false, errors });
  }

  const task = new Task(value);
  await task.save();
  res.status(201).json({ success: true, data: task });
});

router.get('/', async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) {
    filter.status = status;
  }
  
  const tasks = await Task.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: tasks });
});

router.patch('/:id', async (req, res) => {
  const { error, value } = updateSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(err => err.message);
    return res.status(400).json({ success: false, errors });
  }

  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { status: value.status },
    { new: true, runValidators: true }
  );

  if (!task) {
    return res.status(404).json({ success: false, errors: ['Task not found'] });
  }

  res.status(200).json({ success: true, data: task });
});

router.delete('/:id', async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  
  if (!task) {
    return res.status(404).json({ success: false, errors: ['Task not found'] });
  }

  res.status(200).json({ success: true, data: {} });
});

module.exports = router;
