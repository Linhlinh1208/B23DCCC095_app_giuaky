import { Task } from '../commons/types';

export const parseDateString = (str: string): Date | null => {
  if (!str) return null;
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  return new Date(year, month, day, 0, 0, 0, 0);
};

export const isValidDate = (str: string): boolean => {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = str.match(regex);
  if (!match) return false;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const year = parseInt(match[3], 10);

  if (month < 0 || month > 11) return false;
  if (year < 1900 || year > 2100) return false;

  const d = new Date(year, month, day);
  return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
};

export const isBeforeToday = (str: string): boolean => {
  const target = parseDateString(str);
  if (!target) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return target.getTime() < today.getTime();
};

export const isTaskOverdue = (task: Task): boolean => {
  if (task.done) return false;
  return isBeforeToday(task.dueDate);
};

export const getDueDateStatusText = (dueDateStr: string): string => {
  const target = parseDateString(dueDateStr);
  if (!target) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hạn hôm nay';
  if (diffDays > 0) return `Còn ${diffDays} ngày`;
  return `Quá hạn ${Math.abs(diffDays)} ngày`;
};