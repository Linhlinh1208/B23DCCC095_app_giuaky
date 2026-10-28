import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, NavigationProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SafeScreenLayout from '../layouts/SafeScreenLayout';
import ProgressBar from '../components/ProgressBar';
import TaskCard from '../components/TaskCard';
import { COLORS, SIZES } from '../commons/theme';
import { Task, RootStackParamList } from '../commons/types';
import { parseDateString, isTaskOverdue } from '../utils/dateHelper';
import { getStoredTasks, setStoredTasks } from '../services/storageService';

type FilterType = 'ALL' | 'UNDONE' | 'DONE' | 'OVERDUE';
type SortType = 'DUE_DATE' | 'PRIORITY';

interface HomeScreenProps {
  navigation: NavigationProp<RootStackParamList, 'Home'>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortType>('DUE_DATE');

  const loadTasks = async () => {
    const data = await getStoredTasks();
    setTasks(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const saveTasks = async (newTasks: Task[]) => {
    setTasks(newTasks);
    await setStoredTasks(newTasks);
  };

  const handleToggleDone = (id: string) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    );
    saveTasks(updated);
  };

  const handleDeleteSingle = (task: Task) => {
    Alert.alert(
      'Xác nhận xoá',
      `Bạn có chắc chắn muốn xoá công việc "${task.title}" không?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: () => {
            const updated = tasks.filter((t) => t.id !== task.id);
            saveTasks(updated);
          },
        },
      ]
    );
  };

  const completedCount = useMemo(
    () => tasks.filter((t) => t.done).length,
    [tasks]
  );

  const handleDeleteCompleted = () => {
    if (completedCount === 0) return;
    Alert.alert(
      'Xác nhận xoá',
      `Bạn có chắc muốn xoá ${completedCount} công việc đã hoàn thành?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá tất cả',
          style: 'destructive',
          onPress: () => {
            const remaining = tasks.filter((t) => !t.done);
            saveTasks(remaining);
          },
        },
      ]
    );
  };

  const priorityWeight: Record<string, number> = { Cao: 3, 'Trung bình': 2, Thấp: 1 };

  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (
          searchQuery.trim() !== '' &&
          !task.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
        ) {
          return false;
        }

        if (filter === 'UNDONE') return !task.done;
        if (filter === 'DONE') return task.done;
        if (filter === 'OVERDUE') return isTaskOverdue(task);
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'DUE_DATE') {
          const dateA = parseDateString(a.dueDate)?.getTime() || 0;
          const dateB = parseDateString(b.dueDate)?.getTime() || 0;
          return dateA - dateB;
        } else {
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
      });
  }, [tasks, filter, searchQuery, sortBy]);

  return (
    <SafeScreenLayout>
      <ProgressBar total={tasks.length} completed={completedCount} />

      {/* Tìm kiếm & Nút thêm */}
      <View style={styles.topControlRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên công việc..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => navigation.navigate('TaskForm')}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Thêm việc</Text>
        </Pressable>
      </View>

      {/* Nút bộ lọc */}
      <View style={styles.filterRow}>
        {(
          [
            { key: 'ALL', label: 'Tất cả' },
            { key: 'UNDONE', label: 'Chưa xong' },
            { key: 'DONE', label: 'Đã xong' },
            { key: 'OVERDUE', label: 'Quá hạn' },
          ] as { key: FilterType; label: string }[]
        ).map((item) => {
          const active = filter === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => setFilter(item.key)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  active && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Sắp xếp và Xoá đã xong */}
      <View style={styles.actionRow}>
        <Pressable
          style={styles.sortButton}
          onPress={() =>
            setSortBy((prev) =>
              prev === 'DUE_DATE' ? 'PRIORITY' : 'DUE_DATE'
            )
          }
        >
          <Ionicons name="swap-vertical" size={15} color={COLORS.primary} />
          <Text style={styles.sortButtonText}>
            {sortBy === 'DUE_DATE' ? 'Hạn gần nhất' : 'Ưu tiên Cao → Thấp'}
          </Text>
        </Pressable>

        <Pressable
          disabled={completedCount === 0}
          onPress={handleDeleteCompleted}
          style={[
            styles.deleteCompletedButton,
            completedCount === 0 && styles.deleteCompletedDisabled,
          ]}
        >
          <Ionicons
            name="trash-outline"
            size={14}
            color={completedCount === 0 ? COLORS.disabledText : COLORS.error}
          />
          <Text
            style={[
              styles.deleteCompletedText,
              completedCount === 0 && styles.deleteCompletedTextDisabled,
            ]}
          >
            Xoá đã xong ({completedCount})
          </Text>
        </Pressable>
      </View>

      {/* Danh sách */}
      <FlatList
        data={filteredAndSortedTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggleDone={() => handleToggleDone(item.id)}
            onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            onLongPress={() => handleDeleteSingle(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={48} color={COLORS.disabledText} />
            <Text style={styles.emptyText}>Không tìm thấy công việc phù hợp</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeScreenLayout>
  );
};

const styles = StyleSheet.create({
  topControlRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    height: 44,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: SIZES.sm,
    padding: 0,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 44,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: SIZES.sm,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 8,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 6,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 6,
    alignItems: 'center',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  sortButtonText: {
    fontSize: SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  deleteCompletedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  deleteCompletedDisabled: {
    backgroundColor: COLORS.disabled,
  },
  deleteCompletedText: {
    fontSize: SIZES.xs,
    color: COLORS.error,
    fontWeight: '600',
  },
  deleteCompletedTextDisabled: {
    color: COLORS.disabledText,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.md,
    marginTop: 10,
  },
});

export default HomeScreen;