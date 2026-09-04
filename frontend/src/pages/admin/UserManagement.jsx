import { useState, useEffect } from 'react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import DataTable from '../../components/common/DataTable'
import Modal from '../../components/common/Modal'
import StatusBadge from '../../components/common/StatusBadge'
import AlertBanner from '../../components/common/AlertBanner'
import userService from '../../services/user.service'
import { UserPlus, Users } from 'lucide-react'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ username: '', password: '', full_name: '', email: '', role: 'farmer' })

  useEffect(() => {
    userService.getAll()
      .then(data => setUsers(data))
      .catch(err => console.error('Failed to fetch users:', err))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const newUser = await userService.create(form)
      setUsers(prev => [newUser, ...prev])
      setShowModal(false)
      setForm({ username: '', password: '', full_name: '', email: '', role: 'farmer' })
      setSuccess('User created successfully!')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user.')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (user) => {
    try {
      const updated = await userService.updateStatus(user.id, !user.is_active)
      setUsers(prev => prev.map(u => u.id === user.id ? updated : u))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user status.')
    }
  }

  const columns = [
    { key: 'username', label: 'Username', render: (val) => <span className="font-medium text-gray-800">{val}</span> },
    { key: 'full_name', label: 'Full Name' },
    { key: 'email', label: 'Email', render: (val) => val || '—' },
    { key: 'role', label: 'Role', render: (val) => (
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${val === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-prime-100 text-prime-700'}`}>
        {val === 'admin' ? 'Administrator' : 'Farmer'}
      </span>
    )},
    { key: 'is_active', label: 'Status', render: (val) => <StatusBadge status={val ? 'active' : 'inactive'} size="sm" /> },
    { key: 'created_at', label: 'Created', render: (val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
    { key: 'id', label: 'Actions', sortable: false, render: (val, row) => (
      <Button
        variant={row.is_active ? 'danger' : 'primary'}
        size="sm"
        onClick={() => handleToggleStatus(row)}
      >
        {row.is_active ? 'Deactivate' : 'Activate'}
      </Button>
    )},
  ]

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 loading-shimmer rounded-xl" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage farmer and administrator accounts</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <UserPlus size={16} />
          Create User
        </Button>
      </div>

      {success && <AlertBanner type="success" message={success} onDismiss={() => setSuccess('')} />}
      {error && <AlertBanner type="error" message={error} onDismiss={() => setError('')} autoDismiss={0} />}

      <Card>
        <DataTable columns={columns} data={users} emptyMessage="No users registered." emptyIcon={Users} />
      </Card>

      {/* Create User Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New User">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-prime-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-prime-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-prime-500"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-prime-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-prime-500"
              >
                <option value="farmer">Farmer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create User</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
