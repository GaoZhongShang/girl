import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, Button, Alert } from 'react-native';
import { Device, Category } from '../api/client';

interface Props {
  onAdd: () => void;
  onBack: () => void;
  devices?: Device[];
  categories?: Category[];
}

export default function DeviceListScreen({ onAdd, onBack, devices = [], categories = [] }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const filteredDevices = selectedCategory
    ? devices.filter(device => device.categoryId === selectedCategory)
    : devices;

  const renderCategory = ({ item }: { item: Category }) => (
    <View style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.deviceCount}>{item.deviceCount} 台设备</Text>
      </View>
      <Button
        title="查看设备"
        onPress={() => setSelectedCategory(item.id)}
        color="#1B3A5C"
      />
    </View>
  );

  const renderDevice = ({ item }: { item: Device }) => (
    <View style={styles.deviceCard}>
      <View style={styles.deviceHeader}>
        <View style={styles.deviceIcon}>
          <Text style={styles.deviceIconText}>🖥️</Text>
        </View>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.name}</Text>
          <Text style={styles.deviceModel}>{item.model}</Text>
          <Text style={styles.categoryTag}>{item.categoryName}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Button
          title="编辑"
          color="#64748B"
          style={styles.actionButton}
        />
        <Button
          title="删除"
          color="#EF4444"
          style={styles.actionButton}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button title="返回" onPress={onBack} color="#1B3A5C" />
        <Text style={styles.title}>设备管理</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>设备分类</Text>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={item => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryList}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {selectedCategory
            ? `${categories.find(c => c.id === selectedCategory)?.name} 设备`
            : '所有设备'}
        </Text>

        {filteredDevices.length > 0 ? (
          <FlatList
            data={filteredDevices}
            renderItem={renderDevice}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.deviceList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>暂无设备</Text>
          </View>
        )}
      </View>

      <View style={styles.fab}>
        <Button
          title="新增设备"
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B3A5C',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 40,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2332',
    marginBottom: 12,
  },
  categoryList: {
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  categoryHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2332',
    marginBottom: 4,
  },
  deviceCount: {
    fontSize: 12,
    color: '#94A3B8',
  },
  deviceList: {
    paddingBottom: 100,
  },
  deviceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceIconText: {
    fontSize: 20,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2332',
    marginBottom: 4,
  },
  deviceModel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  categoryTag: {
    fontSize: 11,
    color: '#1B3A5C',
    backgroundColor: '#E2EBF6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
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
  emptyState: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
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