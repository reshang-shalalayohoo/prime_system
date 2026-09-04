import { useState, useEffect } from 'react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import DataTable from '../../components/common/DataTable'
import AlertBanner from '../../components/common/AlertBanner'
import fertilizerService from '../../services/fertilizer.service'
import { Plus, FlaskConical } from 'lucide-react'

export default function FertilizerLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ fertilizer_type: '', amount_kg: '', notes: '' })

  useEffect(() => {
    fertilizerService.getLogs()
      .then(data => setLogs(data))
      .catch(err => console.error('Failed to fetch fertilizer logs:', err))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const newLog = await fertilizerService.create(form)
      setLogs(prev => [{ ...newLog, field_name: 'Main Rice Paddy' }, ...prev])
      setForm({ fertilizer_type: '', amount_kg: '', notes: '' })
      setShowForm(false)
      setSuccess('Fertilizer application recorded successfully!')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save fertilizer log.')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'applied_at',
      label: 'Date Applied',
      render: (val) => new Date(val).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    },
    { key: 'fertilizer_type', label: 'Fertilizer Type' },
    { key: 'amount_kg', label: 'Amount (kg/ha)', render: (val) => `${val} kg/ha` },
    { key: 'field_name', label: 'Field' },
    { key: 'notes', label: 'Notes', render: (val) => <span className="text-xs text-gray-500 line-clamp-2 max-w-xs">{val || '—'}</span> },
  ]

  const fertilizerTypes = [
    'Urea (46-0-0)',
    'Complete (14-14-14)',
    'Ammonium Phosphate (16-20-0)',
    'Solophos (0-18-0)',
    'Muriate of Potash (0-0-60)',
    'Ammonium Sulfate (21-0-0)',
    'Other'
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fertilizer Log</h1>
          <p className="text-sm text-gray-500 mt-0.5">Record and track fertilizer applications</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} />
          Record Application
        </Button>
      </div>

      {success && <AlertBanner type="success" message={success} onDismiss={() => setSuccess('')} />}
      {error && <AlertBanner type="error" message={error} onDismiss={() => setError('')} autoDismiss={0} />}

      {showForm && (
        <Card title="New Fertilizer Application" className="animate-slide-in">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fertilizer Type</label>
              <select
                value={form.fertilizer_type}
                onChange={e => setForm({ ...form, fertilizer_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-prime-500"
                required
              >
                <option value="">Select type...</option>
                {fertilizerTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (kg/ha)</label>
              <input
                type="number"
                step="0.1"
                value={form.amount_kg}
                onChange={e => setForm({ ...form, amount_kg: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-prime-500"
                placeholder="e.g., 50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <input
                type="text"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-prime-500"
                placeholder="Application notes..."
              />
            </div>
            <div className="md:col-span-3 flex gap-2 justify-end">
              <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>Save Application</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <DataTable columns={columns} data={logs} emptyMessage="No fertilizer applications recorded yet." emptyIcon={FlaskConical} />
      </Card>
    </div>
  )
}
