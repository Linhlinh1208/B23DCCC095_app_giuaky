export type Category = 'Học tập' | 'Công việc' | 'Sức khoẻ' | 'Cá nhân';
export type Priority = 'Cao' | 'Trung bình' | 'Thấp';

export interface Task {
  id: string;
  title: string;
  note?: string;
  category: Category;
  priority: Priority;
  dueDate: string;
  done: boolean;
}

export type RootStackParamList = {
  Home: undefined;
  TaskForm: { taskId?: string } | undefined;
  TaskDetail: { taskId: string };
};