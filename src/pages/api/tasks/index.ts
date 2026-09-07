import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import type { ApiResponse } from '@/types';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<unknown>>) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const farmId = req.query.farmId as string;
  if (!token || !farmId) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const id = req.query.id as string;

  if (req.method === 'GET') {
    const tasks = await prisma.reminder.findMany({ where: { farmId }, orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }] });
    return res.status(200).json({ success: true, data: tasks });
  }
  if (req.method === 'POST') {
    const { title, description, reminderType, dueDate, priority, assignedTo } = req.body;
    if (!title || !dueDate) return res.status(400).json({ success: false, error: 'Task title and due date are required.' });
    const task = await prisma.reminder.create({ data: { farmId, title, description, reminderType: reminderType || 'CUSTOM', dueDate: new Date(dueDate), priority: priority || 'MEDIUM', assignedTo: assignedTo || undefined } });
    return res.status(201).json({ success: true, data: task });
  }
  if (req.method === 'PUT' && id) {
    const task = await prisma.reminder.findFirst({ where: { id, farmId } });
    if (!task) return res.status(404).json({ success: false, error: 'Task not found.' });
    const updateData: any = {};
    if (req.body.completed !== undefined) {
      const completed = Boolean(req.body.completed);
      updateData.completed = completed;
      updateData.completedDate = completed ? new Date() : null;
    }
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.reminderType !== undefined) updateData.reminderType = req.body.reminderType;
    if (req.body.dueDate !== undefined) updateData.dueDate = new Date(req.body.dueDate);
    if (req.body.priority !== undefined) updateData.priority = req.body.priority;
    if (req.body.assignedTo !== undefined) updateData.assignedTo = req.body.assignedTo || null;
    const updated = await prisma.reminder.update({ where: { id }, data: updateData });
    return res.status(200).json({ success: true, data: updated });
  }
  if (req.method === 'DELETE' && id) {
    const task = await prisma.reminder.findFirst({ where: { id, farmId } });
    if (!task) return res.status(404).json({ success: false, error: 'Task not found.' });
    await prisma.reminder.delete({ where: { id } });
    return res.status(200).json({ success: true, data: null });
  }
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).json({ success: false, error: 'Method not allowed' });
}