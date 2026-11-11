import { seedPonds } from './seed.js'

let pondStore = structuredClone(seedPonds)

export const farmers = [
  { id: 'farmer-1', name: 'Farmer A' },
  { id: 'farmer-2', name: 'Farmer B' },
]

export function resetPonds() {
  pondStore = structuredClone(seedPonds)
}

function filterVisibleFields(pond, role, farmerId) {
  const isAdmin = role === 'admin'
  const visibleFields = Object.fromEntries(
    Object.entries(pond.fields).filter(([key, field]) => {
      if (isAdmin) return true
      if (pond.ownerId === farmerId) {
        return field.shared || key === 'pH' || key === 'dissolvedOxygen' || key === 'alert' || key === 'lastReading'
      }
      return field.shared
    }),
  )

  return {
    ...pond,
    fields: visibleFields,
    isOwner: pond.ownerId === farmerId,
  }
}

export function getPonds({ role = 'farmer', farmerId = 'farmer-1', search = '' } = {}) {
  const normalized = search.trim().toLowerCase()

  return pondStore
    .filter((pond) => {
      if (!normalized) return true
      const haystack = `${pond.name} ${pond.location} ${pond.district}`.toLowerCase()
      return haystack.includes(normalized)
    })
    .map((pond) => filterVisibleFields(pond, role, farmerId))
}

export function getPondById(id, { role = 'farmer', farmerId = 'farmer-1' } = {}) {
  const pond = pondStore.find((entry) => entry.id === id)
  if (!pond) return null
  return filterVisibleFields(pond, role, farmerId)
}

export function toggleFieldSharing(pondId, fieldKey, shared) {
  pondStore = pondStore.map((pond) => {
    if (pond.id !== pondId) return pond

    return {
      ...pond,
      fields: {
        ...pond.fields,
        [fieldKey]: {
          ...pond.fields[fieldKey],
          shared,
        },
      },
    }
  })

  return getPonds({ role: 'admin' })
}
