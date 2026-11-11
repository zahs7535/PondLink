import { useMemo, useState } from 'react'
import { Icon } from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import './App.css'
import { farmers, getPondById, getPonds, toggleFieldSharing } from './data/api'

const pondMarkerIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function App({ initialRole = 'farmer', initialFarmerId = 'farmer-1' }) {
  const [role, setRole] = useState(initialRole)
  const [selectedFarmerId, setSelectedFarmerId] = useState(initialFarmerId)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPondId, setSelectedPondId] = useState(null)
  const [dataVersion, setDataVersion] = useState(0)

  const adminPonds = useMemo(() => getPonds({ role: 'admin' }), [role, dataVersion])
  const farmerPonds = useMemo(
    () => getPonds({ role: 'farmer', farmerId: selectedFarmerId, search: searchTerm }),
    [selectedFarmerId, searchTerm, dataVersion],
  )

  const myPond = useMemo(
    () =>
      getPonds({ role: 'farmer', farmerId: selectedFarmerId }).find(
        (pond) => pond.ownerId === selectedFarmerId,
      ) ?? null,
    [selectedFarmerId, dataVersion],
  )
  const visibleMyPond = searchTerm ? null : myPond
  const communityPonds = visibleMyPond
    ? farmerPonds.filter((pond) => pond.id !== visibleMyPond.id)
    : farmerPonds
  const selectedPond = selectedPondId
    ? getPondById(selectedPondId, { role, farmerId: selectedFarmerId })
    : visibleMyPond

  const handleShareToggle = (pondId, fieldKey, value) => {
    toggleFieldSharing(pondId, fieldKey, value)
    setDataVersion((current) => current + 1)
  }

  return (
    <div className="app-shell">
      <div className="sample-banner">Sample data</div>

      <header className="top-bar">
        <div>
          <p className="eyebrow">Johor pond network</p>
          <h1>PondLink</h1>
        </div>
        <div className="role-switch" aria-label="Role switch">
          <button
            type="button"
            className={role === 'admin' ? 'role-btn active' : 'role-btn'}
            onClick={() => setRole('admin')}
          >
            Admin
          </button>
          <button
            type="button"
            className={role === 'farmer' ? 'role-btn active' : 'role-btn'}
            onClick={() => setRole('farmer')}
          >
            Farmer
          </button>
        </div>
      </header>

      {role === 'admin' ? (
        <main className="panel admin-panel">
          <h2>Admin sharing</h2>
          {adminPonds.map((pond) => (
            <section key={pond.id} className="pond-card">
              <h3>{pond.name}</h3>
              <div className="toggle-grid">
                {Object.entries(pond.fields).map(([fieldKey, field]) => (
                  <label key={`${pond.id}-${fieldKey}`} className="toggle-row">
                    <input
                      type="checkbox"
                      checked={field.shared}
                      aria-label={`Share ${field.label} for ${pond.name}`}
                      onChange={(event) => handleShareToggle(pond.id, fieldKey, event.target.checked)}
                    />
                    <span>Share {field.label}</span>
                  </label>
                ))}
              </div>
            </section>
          ))}
        </main>
      ) : (
        <main className="farmer-layout">
          <section className="panel">
            <div className="farmer-header">
              <div>
                <p className="eyebrow">Farmer sign-in</p>
                <h2>{farmers.find((farmer) => farmer.id === selectedFarmerId)?.name}</h2>
              </div>
              <select
                value={selectedFarmerId}
                onChange={(event) => {
                  setSelectedFarmerId(event.target.value)
                  setSelectedPondId(null)
                }}
                aria-label="Choose farmer"
              >
                {farmers.map((farmer) => (
                  <option key={farmer.id} value={farmer.id}>
                    {farmer.name}
                  </option>
                ))}
              </select>
            </div>

            {visibleMyPond ? (
              <div className="pond-card detail-card">
                <h3>{visibleMyPond.name}</h3>
                <div className="metric-grid">
                  {Object.entries(visibleMyPond.fields).map(([fieldKey, field]) => (
                    <div key={`${visibleMyPond.id}-${fieldKey}`} className="metric-pill">
                      <span>{field.label}</span>
                      <strong>{field.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <section className="panel">
            <h2>Community list</h2>
            <label className="search-box">
              <span>Search community list</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by pond or area"
              />
            </label>

            <div className="community-list">
              {communityPonds.map((pond) => (
                <button
                  key={pond.id}
                  type="button"
                  className={selectedPondId === pond.id ? 'pond-list-item active' : 'pond-list-item'}
                  onClick={() => setSelectedPondId(pond.id)}
                >
                  <span>{pond.name}</span>
                  <small>{pond.location}</small>
                  <b>View {pond.name}</b>
                </button>
              ))}
            </div>
          </section>

          <section className="panel map-panel">
            <h2>Johor pond map</h2>
            <div className="map-wrap">
              <MapContainer center={[2.1, 103.8]} zoom={8} scrollWheelZoom={false} className="map-box">
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {communityPonds.map((pond) => (
                  <Marker
                    key={pond.id}
                    position={[pond.coordinates.lat, pond.coordinates.lng]}
                    icon={pondMarkerIcon}
                  >
                    <Popup>
                      <button type="button" onClick={() => setSelectedPondId(pond.id)}>
                        {pond.name}
                      </button>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </section>

          {selectedPond ? (
            <section className="panel detail-panel">
              <h2>{selectedPond.name}</h2>
              <div className="detail-meta">
                <span>{selectedPond.location}</span>
                <span>{selectedPond.district}</span>
              </div>
              <div className="metric-grid">
                {Object.entries(selectedPond.fields).map(([fieldKey, field]) => (
                  <div key={`${selectedPond.id}-${fieldKey}`} className="metric-pill">
                    <span>{field.label}</span>
                    <strong>{field.value}</strong>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </main>
      )}
    </div>
  )
}

export default App
