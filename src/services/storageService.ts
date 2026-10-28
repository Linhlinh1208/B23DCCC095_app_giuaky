import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_TASKS } from '../commons/initialData';
import { Task } from '../commons/types';

const STORAGE_KEY = '@planner_tasks_storage';

export const getStoredTasks = async (): Promise<Task[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data !== null) {
      return JSON.parse(data) as Task[];
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
    return INITIAL_TASKS;
  } catch (error) {
    console.error('Lỗi lấy dữ liệu từ AsyncStorage:', error);
    return [];
  }
};

export const setStoredTasks = async (tasks: Task[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Lỗi lưu AsyncStorage:', error);
  }
};