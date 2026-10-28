import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { RouteProp, NavigationProp } from '@react-navigation/native';
import { COLORS, SIZES } from '../commons/theme';
import { Category, Priority, Task, RootStackParamList } from '../commons/types';
import { isValidDate, isBeforeToday } from '../utils/dateHelper';
import { getStoredTasks, setStoredTasks } from '../services/storageService';

const CATEGORIES: Category[] = ['Học tập', 'Công việc', 'Sức khoẻ', 'Cá nhân'];
const PRIORITIES: Priority[] = ['Cao', 'Trung bình', 'Thấp'];

interface TaskFormScreenProps {
  navigation: NavigationProp<RootStackParamList, 'TaskForm'>;
  route: RouteProp<RootStackParamList, 'TaskForm'>;
}

interface FormErrors {
  title?: string;
  dueDate?: string;
}

const TaskFormScreen: React.FC<TaskFormScreenProps> = ({ navigation, route }) => {
  const editTaskId = route.params?.taskId;

  const [title, setTitle] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [priority, setPriority] = useState<Priority>(PRIORITIES[1]);
  const [dueDate, setDueDate] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    navigation.setOptions({
      title: editTaskId ? 'Sửa công việc' : 'Thêm công việc',
    });

    if (editTaskId) {
      loadTaskData();
    }
  }, [editTaskId]);

  const loadTaskData = async () => {
    const tasks = await getStoredTasks();
    const current = tasks.find((t) => t.id === editTaskId);
    if (current) {
      setTitle(current.title);
      setNote(current.note || '');
      setCategory(current.category);
      setPriority(current.priority);
      setDueDate(current.dueDate);
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Tên công việc không được để trống';
    } else if (title.trim().length > 50) {
      newErrors.title = 'Tên công việc không được vượt quá 50 ký tự';
    }

    if (!dueDate.trim()) {
      newErrors.dueDate = 'Vui lòng nhập hạn hoàn thành';
    } else if (!isValidDate(dueDate.trim())) {
      newErrors.dueDate = 'Hạn phải đúng định dạng dd/mm/yyyy và là ngày có thật';
    } else if (!editTaskId && isBeforeToday(dueDate.trim())) {
      newErrors.dueDate = 'Hạn hoàn thành không được trước ngày hôm nay';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const tasks = await getStoredTasks();

      if (editTaskId) {
        const updated = tasks.map((t) =>
          t.id === editTaskId
            ? { ...t, title: title.trim(), note: note.trim(), category, priority, dueDate: dueDate.trim() }
            : t
        );
        await setStoredTasks(updated);
      } else {
        const newTask: Task = {
          id: 'task_' + Date.now().toString(),
          title: title.trim(),
          note: note.trim(),
          category,
          priority,
          dueDate: dueDate.trim(),
          done: false,
        };
        await setStoredTasks([newTask, ...tasks]);
      }

      navigation.goBack();
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lưu công việc');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Ô Tên việc */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tên công việc (*):</Text>
          <TextInput
            style={[styles.input, !!errors.title && styles.inputError]}
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (errors.title) setErrors({ ...errors, title: undefined });
            }}
            placeholder="Nhập tên việc (tối đa 50 ký tự)..."
            placeholderTextColor={COLORS.textSecondary}
            maxLength={50}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        {/* Ô Hạn hoàn thành */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Hạn hoàn thành (dd/mm/yyyy) (*):</Text>
          <TextInput
            style={[styles.input, !!errors.dueDate && styles.inputError]}
            value={dueDate}
            onChangeText={(text) => {
              setDueDate(text);
              if (errors.dueDate) setErrors({ ...errors, dueDate: undefined });
            }}
            placeholder="Ví dụ: 30/10/2026"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="numeric"
            maxLength={10}
          />
          {errors.dueDate && <Text style={styles.errorText}>{errors.dueDate}</Text>}
        </View>

        {/* Danh mục */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Danh mục:</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map((cat) => {
              const selected = category === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[styles.choiceChip, selected && styles.choiceChipActive]}
                >
                  <Text style={[styles.choiceText, selected && styles.choiceTextActive]}>
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Mức ưu tiên */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Mức ưu tiên:</Text>
          <View style={styles.chipRow}>
            {PRIORITIES.map((pri) => {
              const selected = priority === pri;
              return (
                <Pressable
                  key={pri}
                  onPress={() => setPriority(pri)}
                  style={[styles.choiceChip, selected && styles.choiceChipActive]}
                >
                  <Text style={[styles.choiceText, selected && styles.choiceTextActive]}>
                    {pri}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Ghi chú */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Ghi chú:</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={note}
            onChangeText={setNote}
            placeholder="Nhập ghi chú thêm nếu có..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <Pressable
          style={({ pressed }) => [styles.submitBtn, pressed && styles.btnPressed]}
          onPress={handleSave}
        >
          <Text style={styles.submitBtnText}>{editTaskId ? 'Cập nhật' : 'Tạo mới'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 46,
    color: COLORS.text,
    fontSize: SIZES.sm,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.xs,
    marginTop: 4,
  },
  textArea: {
    height: 90,
    paddingTop: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  choiceChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  choiceText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  choiceTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  btnPressed: {
    opacity: 0.8,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: SIZES.md,
    fontWeight: 'bold',
  },
});

export default TaskFormScreen;