import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { resetPonds } from './data/api'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children, icon }) => (
    <div data-testid="marker" data-icon-url={icon?.options.iconUrl}>
      {children}
    </div>
  ),
  Popup: ({ children }) => <div>{children}</div>,
}))

describe('US01: admin sets sharing', () => {
  beforeEach(() => { resetPonds() })

  it('lets an admin share or hide a field', () => {
    render(<App initialRole="admin" />)

    const checkbox = screen.getByRole('checkbox', { name: /share pH for sungai balang/i })
    expect(checkbox).toBeChecked()

    fireEvent.click(checkbox)

    expect(screen.getByRole('checkbox', { name: /share pH for sungai balang/i })).not.toBeChecked()
  })
})

describe('US02: farmer sign-in and own pond', () => {
  beforeEach(() => { resetPonds() })

  it('shows only shared metrics for the signed-in farmer', () => {
    render(<App initialRole="farmer" initialFarmerId="farmer-1" />)

    expect(screen.getByRole('heading', { name: /farmer a/i })).toBeInTheDocument()
    expect(screen.getAllByText(/pH/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/do/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/alert/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/last reading/i).length).toBeGreaterThan(0)
    expect(screen.queryByText(/mortality rate/i)).not.toBeInTheDocument()
  })
})

describe('US03: searchable community list', () => {
  beforeEach(() => { resetPonds() })

  it('filters the community list by search text', () => {
    render(<App initialRole="farmer" initialFarmerId="farmer-1" />)

    const searchBox = screen.getByLabelText(/search community list/i)
    fireEvent.change(searchBox, { target: { value: 'kulai' } })

    expect(screen.getByRole('button', { name: /view kulai nursery/i })).toBeInTheDocument()
    expect(screen.queryByText(/sungai balang/i)).not.toBeInTheDocument()
  })
})

describe('US04: neighbour pond page', () => {
  beforeEach(() => { resetPonds() })

  it('shows shared readings on a selected neighbour pond', () => {
    render(<App initialRole="farmer" initialFarmerId="farmer-1" />)

    fireEvent.click(screen.getByRole('button', { name: /view kulai nursery/i }))

    expect(screen.getByRole('heading', { name: /kulai nursery/i })).toBeInTheDocument()
    expect(screen.getAllByText(/pH/i).length).toBeGreaterThan(0)
    expect(screen.queryByText(/feed plan/i)).not.toBeInTheDocument()
  })
})

describe('US05: Johor map', () => {
  beforeEach(() => { resetPonds() })

  it('shows Johor pond markers on the map', () => {
    render(<App initialRole="farmer" initialFarmerId="farmer-1" />)

    expect(screen.getByText(/johor pond map/i)).toBeInTheDocument()
    const markers = screen.getAllByTestId('marker')
    expect(markers.length).toBeGreaterThan(0)
    expect(markers.every((marker) => marker.dataset.iconUrl)).toBe(true)
  })
})
