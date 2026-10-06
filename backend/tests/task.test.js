const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server');
const Task = require('../models/Task');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

describe('Task API', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  beforeEach(async () => {
    await Task.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it('should return 400 for invalid task creation (missing title)', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ description: 'No title provided' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toContain('Title is required');
  });

  it('should successfully update task status', async () => {
    const task = await Task.create({ title: 'Test Task', status: 'To Do' });

    const res = await request(app)
      .patch(`/api/tasks/${task._id}`)
      .send({ status: 'In Progress' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('In Progress');
    
    const updatedTask = await Task.findById(task._id);
    expect(updatedTask.status).toBe('In Progress');
  });
});
