import { Task } from './types';

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Nộp báo cáo giữa kỳ môn Lập trình di động',
    note: 'Nộp file zip đúng cú pháp HoTen_MSSV',
    category: 'Học tập',
    priority: 'Cao',
    dueDate: '15/10/2026', // Việc quá hạn
    done: false,
  },
  {
    id: 'task-2',
    title: 'Học từ vựng tiếng Anh giao tiếp',
    note: 'Ôn 30 flashcard',
    category: 'Học tập',
    priority: 'Trung bình',
    dueDate: '20/10/2026', // Việc đã hoàn thành
    done: true,
  },
  {
    id: 'task-3',
    title: 'Chạy bộ 5km công viên',
    note: 'Chạy buổi sáng giữ thể lực',
    category: 'Sức khoẻ',
    priority: 'Thấp',
    dueDate: '29/10/2026',
    done: false,
  },
  {
    id: 'task-4',
    title: 'Họp nhóm hoàn thiện slide đồ án',
    note: 'Thống nhất qua Google Meet',
    category: 'Công việc',
    priority: 'Cao',
    dueDate: '30/10/2026',
    done: false,
  },
  {
    id: 'task-5',
    title: 'Dọn dẹp phòng làm việc',
    note: 'Sắp xếp lại sách vở',
    category: 'Cá nhân',
    priority: 'Thấp',
    dueDate: '31/10/2026',
    done: false,
  },
  {
    id: 'task-6',
    title: 'Khám sức khỏe tổng quát',
    note: 'Khám tại bệnh viện đại học',
    category: 'Sức khoẻ',
    priority: 'Trung bình',
    dueDate: '05/11/2026',
    done: false,
  },
];