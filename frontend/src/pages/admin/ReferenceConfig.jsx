import { useState, useEffect } from 'react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import AlertBanner from '../../components/common/AlertBanner'
import referenceService from '../../services/reference.service'
import { Save, SlidersHorizontal } from 'lucide-react'

const GROWTH_STAGES = ['Seedling', 'Vegetative', 'Reproductive', 'Ripening']
const NUTRIENTS = ['nitrogen', 'phosphorus', 'potassium']

export default function ReferenceConfig() {
  const [refs, setRefs] = useState([])
  const [editValues, setEditValues] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    referenceService.getAll()
      .then(data => {
        setRefs(data)
        const map = {}
        data.forEach(r => {
          map[`${r.nutrient}_${r.growth_stage}`] = { min: r.min_sufficient, max: r.max_sufficient }
        })
        setEditValues(map)
      })
      .catch(err => console.error('Failed to fetch reference values:', err))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (nutrient, stage, field, value) => {
    const key = `${nutrient}_${stage}`
    setEditValues(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: parseFloat(value) || 0 }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    const values = []
    for (const nutrient of NUTRIENTS) {
      for (const stage of GROWTH_STAGES) {
        const key = `${nutrient}_${stage}`
        const val = editValues[key]
        if (val) {
          values.push({
            nutrient,
            growth_stage: stage,
            min_sufficient: val.min,
            max_sufficient: val.max,
          })
        }
      }
    }

    try {
      await referenceService.update(values)
      setSuccess('Reference values updated successfully!')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update reference values.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="h-96 loading-shimmer rounded-xl" />
  }

  const nutrientLabels = { nitrogen: 'Nitrogen (N)', phosphorus: 'Phosphorus (P)', potassium: 'Potassium (K)' }
  const nutrientColors = { nitrogen: 'border-green-200 bg-green-50', phosphorus: 'border-blue-200 bg-blue-50', potassium: 'border-amber-200 bg-amber-50' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">SSNM/NOPT Reference Configuration</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure sufficient nutrient ranges per growth stage</p>
        </div>
        <Button onClick={handleSave} loading={saving}>
          <Save size={16} />
          Save All Changes
        </Button>
      </div>

      {success && <AlertBanner type="success" message={success} onDismiss={() => setSuccess('')} />}
      {error && <AlertBanner type="error" message={error} onDismiss={() => setError('')} autoDismiss={0} />}

      {NUTRIENTS.map(nutrient => (
        <Card key={nutrient} className={`border ${nutrientColors[nutrient]}`}>
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal size={16} className="text-gray-600" />
            <h3 className="text-base font-semibold text-gray-800">{nutrientLabels[nutrient]}</h3>
            <span className="text-xs text-gray-400">(mg/kg)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {GROWTH_STAGES.map(stage => {
              const key = `${nutrient}_${stage}`
              const val = editValues[key] || { min: 0, max: 0 }
              return (
                <div key={stage} className="p-3 bg-white rounded-lg border border-gray-100">
                  <p className="text-xs font-semibold text-gray-600 mb-2">{stage}</p>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase">Min Sufficient</label>
                      <input
                        type="number"
                        step="0.1"
                        value={val.min}
                        onChange={e => handleChange(nutrient, stage, 'min', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-prime-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase">Max Sufficient</label>
                      <input
                        type="number"
                        step="0.1"
                        value={val.max}
                        onChange={e => handleChange(nutrient, stage, 'max', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-prime-500"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      ))}

      {/* Last updated info */}
      {refs.length > 0 && refs[0].updated_by_name && (
        <p className="text-xs text-gray-400 text-right">
          Last modified by: {refs[0].updated_by_name} on {new Date(refs[0].updated_at).toLocaleString()}
        </p>
      )}
    </div>
  )
}
