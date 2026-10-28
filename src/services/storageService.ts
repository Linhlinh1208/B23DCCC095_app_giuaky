import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../commons/types';

const STORAGE_KEY = '@planner_tasks_storage';

// Vùng đệm lưu trữ trên RAM (tránh crash khi native module chưa nạp hoặc đang hot-reload)
let memoryCache: Task[] = [];
let isStorageInitialized = false;

/**
 * Kiểm tra nhanh xem module Native của AsyncStorage có khả dụng không
 */
const isNativeStorageAvailable = (): boolean => {
  return typeof AsyncStorage !== 'undefined' && AsyncStorage !== null && typeof AsyncStorage.getItem === 'function';
};

/**
 * Lấy danh sách công việc từ AsyncStorage
 * Ưu tiên đọc từ ổ đĩa máy ảo/thiết bị, nếu gặp trục trặc thì tự động fallback về RAM
 */
export const getStoredTasks = async (): Promise<Task[]> => {
  if (!isNativeStorageAvailable()) {
    console.warn('[Storage] Native AsyncStorage chưa sẵn sàng, dùng memoryCache tạm thời.');
    return memoryCache;
  }

  try {
    const rawData = await AsyncStorage.getItem(STORAGE_KEY);
    
    if (rawData !== null && rawData !== undefined) {
      const parsedTasks = JSON.parse(rawData) as Task[];
      memoryCache = Array.isArray(parsedTasks) ? parsedTasks : [];
      isStorageInitialized = true;
      return memoryCache;
    }

    // Nếu là lần đầu mở app và chưa có dữ liệu trên máy
    if (!isStorageInitialized) {
      isStorageInitialized = true;
      return memoryCache;
    }

    return memoryCache;
  } catch (error) {
    console.warn('[Storage] Ngoại lệ khi đọc từ AsyncStorage, chuyển sang dùng cache RAM:', error);
    return memoryCache;
  }
};

/**
 * Lưu toàn bộ danh sách công việc vào AsyncStorage
 * Cập nhật tức thì vào memoryCache trước, sau đó ghi bất đồng bộ xuống ổ đĩa
 */
export const setStoredTasks = async (tasks: Task[]): Promise<void> => {
  // Cập nhật ngay bộ nhớ tạm để UI luôn có dữ liệu mới nhất
  memoryCache = [...tasks];

  if (!isNativeStorageAvailable()) {
    console.warn('[Storage] Native module null, dữ liệu được giữ tạm trên RAM.');
    return;
  }

  try {
    const jsonString = JSON.stringify(tasks);
    await AsyncStorage.setItem(STORAGE_KEY, jsonString);
  } catch (error) {
    console.warn('[Storage] Không thể ghi vào AsyncStorage (đã lưu tạm trên RAM):', error);
    // Không re-throw lỗi ra ngoài để tránh văng Alert thất bại trên giao diện
  }
};

/**
 * Xóa sạch toàn bộ dữ liệu (nếu cần reset ứng dụng)
 */
export const clearStoredTasks = async (): Promise<void> => {
  memoryCache = [];
  if (isNativeStorageAvailable()) {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('[Storage] Lỗi khi xoá AsyncStorage:', error);
    }
  }
};