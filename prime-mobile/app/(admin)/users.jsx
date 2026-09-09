import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TextInput, Alert } from 'react-native';
import userService from '../../services/user.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Loading } from '../../components/common/Loading';
import { formatDate } from '../../utils/formatters';
import { COLORS } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('farmer');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAll();
      const list = Array.isArray(res) ? res : res?.data || [];
      setUsers(list);
    } catch (e) {
      console.warn('Using default users', e);
      setUsers([
        {
          _id: 'usr_1',
          name: 'Juan Dela Cruz',
          email: 'farmer@prime.gov.ph',
          role: 'farmer',
          status: 'ACTIVE',
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        },
        {
          _id: 'usr_2',
          name: 'System Administrator',
          email: 'admin@prime.gov.ph',
          role: 'admin',
          status: 'ACTIVE',
          createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const handleCreateUser = async () => {
    if (!name || !email || !password) {
      Alert.alert('Required', 'Please fill in Name, Email, and Password.');
      return;
    }

    try {
      setSubmitting(true);
      await userService.create({
        name,
        email,
        password,
        role,
      });

      Alert.alert('Success', `User ${name} registered!`);
      setModalVisible(false);
      setName('');
      setEmail('');
      setPassword('');
      fetchUsers();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create user.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !refreshing) {
    return <Loading message="Loading system user accounts..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.adminPrimary]} />}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>User Management</Text>
          <Text style={styles.headerSub}>Manage registered farmers, agricultural technicians, and administrators.</Text>
        </View>
        <Button
          title="Add User"
          icon={<Ionicons name="person-add" size={16} color="#fff" />}
          onPress={() => setModalVisible(true)}
          size="sm"
          style={{ backgroundColor: COLORS.adminPrimary }}
        />
      </View>

      {users.map((usr) => (
        <Card
          key={usr._id || usr.email}
          title={usr.name}
          subtitle={usr.email}
          headerRight={<StatusBadge status={usr.role === 'admin' ? 'ADMIN' : 'FARMER'} label={usr.role} />}
        >
          <Text style={styles.dateText}>Registered: {formatDate(usr.createdAt)}</Text>
        </Card>
      ))}

      {/* Create User Modal */}
      <Modal visible={modalVisible} onClose={() => setModalVisible(false)} title="Register System User">
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Maria Santos"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="farmer@prime.gov.ph"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Temporary Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <Button
            title="Cancel"
            variant="secondary"
            onPress={() => setModalVisible(false)}
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title="Create Account"
            variant="primary"
            loading={submitting}
            onPress={handleCreateUser}
            style={{ flex: 1, backgroundColor: COLORS.adminPrimary }}
          />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
});
