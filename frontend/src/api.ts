import axios from 'axios';
import type { Task, TaskInput } from './types';

const API_URL = 'http://localhost:5005/api/tasks';

export const getTasks = async (status?: string) => {
  const url = status && status !== 'All' ? `${API_URL}?status=${status}` : API_URL;
  const response = await axios.get(url);
  return response.data.data as Task[];
};

export const createTask = async (task: TaskInput) => {
  const response = await axios.post(API_URL, task);
  return response.data.data as Task;
};

export const updateTaskStatus = async (id: string, status: string) => {
  const response = await axios.patch(`${API_URL}/${id}`, { status });
  return response.data.data as Task;
};

export const deleteTask = async (id: string) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data.success;
};
