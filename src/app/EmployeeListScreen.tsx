import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, Button, Alert, RefreshControl } from 'react-native';
import { Employee } from '../api/client';

interface Props {
  onAdd: () => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
}

export default function EmployeeListScreen({ onAdd, onView, onEdit }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/users');
      if (response.ok) {
        const result = await response.json();
        if (result.code === 200) {
          setEmployees(result.data.employees);
        }
      }
    } catch (error) {
      Alert.alert('错误', '加载员工列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      '确认删除',
      '确定要删除该员工吗？此操作不可撤销。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          onPress: async () => {
            try {
              const response = await fetch(`http://localhost:5000/api/users/${id}`, {
                method: 'DELETE',
              });
              if (response.ok) {
                setEmployees(employees.filter(emp => emp.id !== id));
              }
            } catch (error) {
              Alert.alert('错误', '删除失败');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = employees.filter(emp =>
    emp.name.includes(search) ||
    emp.email.toLowerCase().includes(search.toLowerCase())
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadEmployees();
    setTimeout(() => setRefreshing(false), 2000);
  };

  const renderEmployee = ({ item }: { item: Employee }) => (
    <View style={styles.employeeCard}>
      <View style={styles.employeeHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name[0]}</Text>
        </View>
        <View style={styles.employeeInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.email}>{item.email}</Text>
          <Text style={styles.dept}>{item.dept}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Button
          title="详情"
          onPress={() => onView(item.id)}
          color="#1B3A5C"
          style={styles.actionButton}
        />
        <Button
          title="编辑"
          onPress={() => onEdit(item.id)}
          color="#64748B"
          style={styles.actionButton}
        />
        <Button
          title="删除"
          onPress={() => handleDelete(item.id)}
          color="#EF4444"
          style={styles.actionButton}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>员工管理</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="搜索员工..."
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredEmployees}
        renderItem={renderEmployee}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <View style={styles.fab}>
        <Button
          title="新增员工"
          onPress={onAdd}
          color="#F47B20"
          style={styles.fabButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B3A5C',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  searchInput: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2EBF6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  list: {
    paddingHorizontal: 16,
  },
  employeeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EEF2F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#64748B',
  },
  employeeInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A2332',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  dept: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    paddingVertical: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
  },
  fabButton: {
    borderRadius: 25,
    width: 56,
    height: 56,
  },
});