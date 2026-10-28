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
  Modal,
} from 'react-native';
import { RouteProp, NavigationProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES } from '../commons/theme';
import { Category, Priority, Task, RootStackParamList } from '../commons/types';
import { isValidDate, isBeforeToday, parseDateString } from '../utils/dateHelper';
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

  // State cho Modal chọn ngày
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [pickerDay, setPickerDay] = useState<number>(new Date().getDate());
  const [pickerMonth, setPickerMonth] = useState<number>(new Date().getMonth() + 1);
  const [pickerYear, setPickerYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    navigation.setOptions({
      title: editTaskId ? 'Sửa công việc' : 'Thêm công việc',
    });

    if (editTaskId) {
      loadTaskData();
    }
  }, [editTaskId]);

  const loadTaskData = async () => {
    try {
      const tasks = await getStoredTasks();
      const current = tasks.find((t) => t.id === editTaskId);
      if (current) {
        setTitle(current.title);
        setNote(current.note || '');
        setCategory(current.category);
        setPriority(current.priority);
        setDueDate(current.dueDate);

        const parsed = parseDateString(current.dueDate);
        if (parsed) {
          setPickerDay(parsed.getDate());
          setPickerMonth(parsed.getMonth() + 1);
          setPickerYear(parsed.getFullYear());
        }
      }
    } catch (e) {
      Alert.alert('Thất bại', 'Không thể nạp dữ liệu công việc cũ');
    }
  };

  // Xử lý nhập tên việc và bắt chạm ngưỡng 50 ký tự
  const handleTitleChange = (text: string) => {
    if (text.length >= 50) {
      setErrors((prev) => ({
        ...prev,
        title: 'Đã đạt giới hạn tối đa 50 ký tự!',
      }));
    } else {
      setErrors((prev) => ({ ...prev, title: undefined }));
    }
    setTitle(text);
  };

  // Xác nhận từ bộ chọn ngày thuần
  const handleConfirmDatePicker = () => {
    const formattedDay = pickerDay < 10 ? `0${pickerDay}` : `${pickerDay}`;
    const formattedMonth = pickerMonth < 10 ? `0${pickerMonth}` : `${pickerMonth}`;
    const dateStr = `${formattedDay}/${formattedMonth}/${pickerYear}`;

    setDueDate(dateStr);
    setErrors((prev) => ({ ...prev, dueDate: undefined }));
    setShowDatePicker(false);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Tên công việc không được để trống';
    } else if (title.trim().length > 50) {
      newErrors.title = 'Tên công việc không được vượt quá 50 ký tự';
    }

    if (!dueDate.trim()) {
      newErrors.dueDate = 'Vui lòng nhập hoặc chọn hạn hoàn thành';
    } else if (!isValidDate(dueDate.trim())) {
      newErrors.dueDate = 'Hạn phải đúng định dạng dd/mm/yyyy và là ngày có thật';
    } else if (!editTaskId && isBeforeToday(dueDate.trim())) {
      newErrors.dueDate = 'Hạn hoàn thành không được trước ngày hôm nay';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Alert.alert('Thất bại', 'Vui lòng kiểm tra và sửa các thông tin bị lỗi bên dưới.');
      return;
    }

    try {
      const tasks = await getStoredTasks();

      if (editTaskId) {
        const updated = tasks.map((t) =>
          t.id === editTaskId
            ? { ...t, title: title.trim(), note: note.trim(), category, priority, dueDate: dueDate.trim() }
            : t
        );
        await setStoredTasks(updated);
        Alert.alert('Thành công', 'Đã cập nhật công việc thành công!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
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
        Alert.alert('Thành công', 'Đã thêm công việc mới thành công!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e) {
      Alert.alert('Thất bại', 'Đã xảy ra lỗi khi lưu vào bộ nhớ, vui lòng thử lại!');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Tên công việc */}
        <View style={styles.formGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Tên công việc (*):</Text>
            <Text style={[styles.charCount, title.length >= 50 && styles.charCountLimit]}>
              {title.length}/50
            </Text>
          </View>
          <TextInput
            style={[styles.input, !!errors.title && styles.inputError]}
            value={title}
            onChangeText={handleTitleChange}
            placeholder="Nhập tên việc..."
            placeholderTextColor={COLORS.textSecondary}
            maxLength={50}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        {/* Hạn hoàn thành kèm nút bấm chọn ngày */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Hạn hoàn thành (dd/mm/yyyy) (*):</Text>
          <View style={styles.dateInputContainer}>
            <TextInput
              style={[styles.input, styles.dateInput, !!errors.dueDate && styles.inputError]}
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
            <Pressable
              style={({ pressed }) => [styles.pickerTriggerBtn, pressed && styles.btnPressed]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color="#FFFFFF" />
              <Text style={styles.pickerTriggerText}>Chọn lịch</Text>
            </Pressable>
          </View>
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
            placeholder="Nhập ghi chú thêm..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Nút Submit */}
        <Pressable
          style={({ pressed }) => [styles.submitBtn, pressed && styles.btnPressed]}
          onPress={handleSave}
        >
          <Text style={styles.submitBtnText}>{editTaskId ? 'Cập nhật' : 'Tạo mới'}</Text>
        </Pressable>

        {/* Modal Chọn ngày tự vẽ (Không dùng thư viện ngoài) */}
        <Modal
          visible={showDatePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeaderTitle}>Chọn ngày hoàn thành</Text>

              <View style={styles.pickerSelectorContainer}>
                {/* Ngày */}
                <View style={styles.columnBox}>
                  <Text style={styles.colLabel}>Ngày</Text>
                  <Pressable
                    style={styles.counterBtn}
                    onPress={() => setPickerDay((d) => (d >= 31 ? 1 : d + 1))}
                  >
                    <Ionicons name="chevron-up" size={20} color={COLORS.text} />
                  </Pressable>
                  <Text style={styles.counterVal}>{pickerDay}</Text>
                  <Pressable
                    style={styles.counterBtn}
                    onPress={() => setPickerDay((d) => (d <= 1 ? 31 : d - 1))}
                  >
                    <Ionicons name="chevron-down" size={20} color={COLORS.text} />
                  </Pressable>
                </View>

                {/* Tháng */}
                <View style={styles.columnBox}>
                  <Text style={styles.colLabel}>Tháng</Text>
                  <Pressable
                    style={styles.counterBtn}
                    onPress={() => setPickerMonth((m) => (m >= 12 ? 1 : m + 1))}
                  >
                    <Ionicons name="chevron-up" size={20} color={COLORS.text} />
                  </Pressable>
                  <Text style={styles.counterVal}>{pickerMonth}</Text>
                  <Pressable
                    style={styles.counterBtn}
                    onPress={() => setPickerMonth((m) => (m <= 1 ? 12 : m - 1))}
                  >
                    <Ionicons name="chevron-down" size={20} color={COLORS.text} />
                  </Pressable>
                </View>

                {/* Năm */}
                <View style={styles.columnBox}>
                  <Text style={styles.colLabel}>Năm</Text>
                  <Pressable
                    style={styles.counterBtn}
                    onPress={() => setPickerYear((y) => y + 1)}
                  >
                    <Ionicons name="chevron-up" size={20} color={COLORS.text} />
                  </Pressable>
                  <Text style={styles.counterVal}>{pickerYear}</Text>
                  <Pressable
                    style={styles.counterBtn}
                    onPress={() => setPickerYear((y) => (y <= 2020 ? 2020 : y - 1))}
                  >
                    <Ionicons name="chevron-down" size={20} color={COLORS.text} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.modalBtnRow}>
                <Pressable
                  style={[styles.modalActionBtn, styles.modalCancelBtn]}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.modalCancelText}>Hủy</Text>
                </Pressable>

                <Pressable
                  style={[styles.modalActionBtn, styles.modalConfirmBtn]}
                  onPress={handleConfirmDatePicker}
                >
                  <Text style={styles.modalConfirmText}>Xác nhận</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  charCount: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  charCountLimit: {
    color: COLORS.error,
    fontWeight: 'bold',
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
  dateInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  dateInput: {
    flex: 1,
  },
  pickerTriggerBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    height: 46,
  },
  pickerTriggerText: {
    color: '#FFF',
    fontSize: SIZES.xs,
    fontWeight: '700',
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.xs,
    marginTop: 4,
  },
  textArea: {
    height: 90,
    paddingTop: 10,
    marginTop: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
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
  // Style Modal Picker
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalHeaderTitle: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: COLORS.text,
  },
  pickerSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  columnBox: {
    alignItems: 'center',
    width: 70,
  },
  colLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  counterBtn: {
    padding: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
  },
  counterVal: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: 6,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalActionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelBtn: {
    backgroundColor: '#F1F5F9',
  },
  modalConfirmBtn: {
    backgroundColor: COLORS.primary,
  },
  modalCancelText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default TaskFormScreen;