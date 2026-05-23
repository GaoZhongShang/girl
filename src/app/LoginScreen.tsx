import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Button, Text, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password) {
      Alert.alert('错误', '请填写用户名和密码');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('登录失败');
      }

      const { token } = await response.json();
      login(token);
      onLogin();
    } catch (error) {
      Alert.alert('登录失败', '用户名或密码错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandContainer}>
        <View style={styles.brandIcon}>
          <Text style={styles.brandIconText}>🔒</Text>
        </View>
        <View>
          <Text style={styles.brandTitle}>CORP ASSISTANT</Text>
          <Text style={styles.brandSubtitle}>企业内部移动助手</Text>
        </View>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>管理员登录</Text>

        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="用户名"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="密码"
          secureTextEntry
        />

        <Button
          title={loading ? "登录中..." : "登录"}
          onPress={handleSubmit}
          disabled={loading}
          color="#1B3A5C"
        />

        <View style={styles.hintContainer}>
          <Text style={styles.hintTitle}>测试账号</Text>
          <Text>用户名: admin</Text>
          <Text>密码: admin123</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 50,
  },
  brandIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#F47B20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandIconText: {
    fontSize: 40,
    color: 'white',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B3A5C',
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  formContainer: {
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B3A5C',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2EBF6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#F8FAFC',
  },
  hintContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    alignItems: 'center',
  },
  hintTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
});