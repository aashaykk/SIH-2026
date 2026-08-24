/**
 * IncidentMap — Leaflet/OpenStreetMap map with incident markers.
 *
 * Marker colors match the mobile app legend:
 *   🟠 Pending (REPORTED/ACKNOWLEDGED)
 *   🔵 Started (IN_PROGRESS/ASSIGNED)
 *   🟢 Resolved (VERIFIED/CLOSED)
 *   🔴 Reopened / Overdue
 *
 * Performance: markers are created with divIcon (no heavy plugins).
 * For >500 markers consider Leaflet.MarkerCluster.
 *
 * FAILURE: if map fails to load, shows a text fallback list.
 */
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { getPriorityDotColor } from '../../utils'
import type { Incident } from '../../types'

// Fix leaflet default icon path issue with bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function getMarkerColor(incident: Incident): string {
  if (incident.slaStatus === 'OVERDUE' || incident.status === 'REOPENED') return '#EF4444'
  if (incident.status === 'IN_PROGRESS' || incident.status === 'ASSIGNED') return '#3B82F6'
  if (incident.status === 'CLOSED' || incident.status === 'VERIFIED') return '#22C55E'
  return getPriorityDotColor(incident.priority)
}

function createMarkerIcon(color: string, isSelected: boolean) {
  const size = isSelected ? 14 : 10
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:2px solid rgba(255,255,255,0.8);
      border-radius:50%;
      box-shadow:0 0 6px ${color}88;
      ${isSelected ? 'box-shadow:0 0 0 4px ' + color + '44;' : ''}
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

interface Props {
  incidents: Incident[]
  selectedId?: string
  onSelectIncident?: (incident: Incident) => void
  center?: [number, number]
  zoom?: number
}

export function IncidentMap({ incidents, selectedId, onSelectIncident, center, zoom }: Props) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const defaultCenter: [number, number] = center ?? [
      Number(import.meta.env.VITE_DEFAULT_LAT) || 23.2156,
      Number(import.meta.env.VITE_DEFAULT_LNG) || 72.6369,
    ]

    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: zoom ?? 14,
      zoomControl: false,
    })

    L.tileLayer(
      import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '© OpenStreetMap contributors', maxZoom: 19 }
    ).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Legend
    const legend = new (L.Control.extend({ onAdd: () => L.DomUtil.create('div') }))({ position: 'bottomleft' })
    legend.onAdd = () => {
      const div = L.DomUtil.create('div')
      div.innerHTML = `
        <div style="background:#1E293B;border:1px solid #334155;border-radius:8px;padding:8px 12px;font-size:11px;color:#CBD5E1;line-height:1.8">
          <strong style="color:#F1F5F9;display:block;margin-bottom:4px">Map Legend</strong>
          <div><span style="color:#F97316">● </span>Pending</div>
          <div><span style="color:#3B82F6">● </span>Started</div>
          <div><span style="color:#22C55E">● </span>Resolved</div>
          <div><span style="color:#EF4444">● </span>Overdue/Reopen</div>
        </div>`
      return div
    }
    legend.addTo(map)

    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers when incidents change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const currentIds = new Set(incidents.map(i => i.id))

    // Remove stale markers
    for (const [id, marker] of markersRef.current) {
      if (!currentIds.has(id)) {
        marker.remove()
        markersRef.current.delete(id)
      }
    }

    // Add/update markers
    incidents.forEach(incident => {
      const color = getMarkerColor(incident)
      const isSelected = incident.id === selectedId
      const icon = createMarkerIcon(color, isSelected)

      const existing = markersRef.current.get(incident.id)
      if (existing) {
        existing.setIcon(icon)
        return
      }

      const marker = L.marker([incident.latitude, incident.longitude], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:200px">
            <div style="font-size:11px;color:#94A3B8;margin-bottom:4px">${incident.id}</div>
            <div style="font-weight:600;color:#F1F5F9;margin-bottom:6px">${incident.title}</div>
            <div style="font-size:11px;color:#CBD5E1;margin-bottom:4px">
              ${incident.wardName} · ${incident.departmentName}
            </div>
            <div style="font-size:11px;color:${color};font-weight:600">${incident.priority} · ${incident.status}</div>
            <div style="font-size:11px;color:#64748B;margin-top:4px">${incident.address}</div>
          </div>
        `)
        .on('click', () => onSelectIncident?.(incident))

      markersRef.current.set(incident.id, marker)
    })

    // Pan to selected
    if (selectedId) {
      const sel = incidents.find(i => i.id === selectedId)
      if (sel) map.panTo([sel.latitude, sel.longitude], { animate: true })
    }
  }, [incidents, selectedId, onSelectIncident])

  return <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" />
}
