'use client'

import React, {
  useState, useEffect, useRef, useCallback, useMemo, Suspense
} from 'react'
import {
  Activity, AlertTriangle, Calendar, Flame, MapPin, RefreshCw,
  Shield, TrendingUp, Wind, Cpu, Award, CheckCircle2,
  AlertCircle, BarChart3, TrendingDown, Globe2, Search, Layers,
  Download, Clock, Zap, X, Filter, FileText, MessageSquare,
  Navigation, Satellite, Thermometer, Droplets, BarChart2,
  Star, Info, Plus, Map, Eye, ChevronDown, ChevronUp,
  ChevronRight, Crosshair, RotateCcw, Settings, BookOpen,
  Users, Database, Maximize2
} from 'lucide-react'
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Bar, Line, AreaChart, Area,
  ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis,
  Radar, Legend
} from 'recharts'
import {
  WORLD_CITIES, GLOBAL_HOTSPOTS, POLLUTANTS, MAP_LAYERS,
  DATA_SOURCES, AQI_CATEGORIES, CONTINENTS,
  generateAQI, generatePollutants, getCategory,
  geocodeLocation, reverseGeocode,
  seededRandom, getOffsetDateISO, formatOffsetDateShort,
  type Hotspot, type WorldCity
} from './lib/globals'

// ─────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────
interface Location { lat: number; lon: number; label: string; country: string }
type TabId = 'map' | 'analytics' | 'timemachine' | 'rankings' | 'command'
type BasemapId = 'dark' | 'satellite' | 'terrain' | 'light'

const BASEMAPS: Record<BasemapId, { url: string; label: string; icon: string }> = {
  dark:      { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',          label: 'Dark',      icon: '🌑' },
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', label: 'Satellite', icon: '🛰️' },
  terrain:   { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',                       label: 'Terrain',   icon: '🏔️' },
  light:     { url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',         label: 'Light',     icon: '☀️' },
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (n: number, d = 0) => n.toLocaleString('en-IN', { maximumFractionDigits: d })
const pct = (n: number) => `${Math.min(100, Math.round(n))}%`

function AIInsight({ location, pollutants, date }: { location: Location; pollutants: ReturnType<typeof generatePollutants>; date: string }) {
  const cat = getCategory(pollutants.aqi)
  const topFire = GLOBAL_HOTSPOTS.filter(h =>
    Math.abs(h.lat - location.lat) < 15 && Math.abs(h.lon - location.lon) < 15
  ).slice(0, 2)

  const drivers =
    pollutants.aqi > 300 ? 'Severe biomass burning and transboundary transport dominate the pollution load.' :
    pollutants.aqi > 200 ? 'Active agricultural fires with meteorological trapping are primary drivers.' :
    pollutants.aqi > 100 ? 'Mixed vehicular, industrial, and secondary aerosol formation contributing.' :
    'Background natural sources with minor anthropogenic influence.'

  const recommendation =
    pollutants.aqi > 300 ? 'Immediate emergency response: restrict outdoor activity, deploy masks, activate GRAP/equivalent.' :
    pollutants.aqi > 200 ? 'Advisory for sensitive groups. Consider traffic restrictions and industrial curbs.' :
    pollutants.aqi > 100 ? 'Moderate precautions for children and elderly. Monitor industrial compliance.' :
    'Air quality acceptable. Continue routine monitoring.'

  return (
    <div className="space-y-3">
      <div className="p-3.5 rounded-xl border" style={{ borderColor: cat.color + '40', backgroundColor: cat.bg }}>
        <div className="flex items-center gap-2 mb-1.5">
          <Cpu className="w-3.5 h-3.5" style={{ color: cat.color }} />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: cat.color }}>AI Pollution Assessment</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          <strong className="text-slate-100">{location.label}</strong> on {date} records AQI <strong style={{ color: cat.color }}>{pollutants.aqi}</strong> — <em>{cat.label}</em>. {drivers}
        </p>
      </div>

      {topFire.length > 0 && (
        <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5">
          <p className="text-[10px] font-bold text-red-400 mb-1.5 flex items-center gap-1.5"><Flame className="w-3 h-3" /> Nearby Hotspot Activity</p>
          {topFire.map(h => (
            <p key={h.id} className="text-[10px] text-slate-400 leading-relaxed">
              🔥 <strong className="text-slate-200">{h.region}</strong> — {h.fires.toLocaleString()} fire counts, HCHO max {h.max_hcho} µmol/m²
            </p>
          ))}
        </div>
      )}

      <div className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
        <p className="text-[10px] font-bold text-indigo-400 mb-1 flex items-center gap-1.5"><Shield className="w-3 h-3" /> Policy Recommendation</p>
        <p className="text-[10px] text-slate-300 leading-relaxed">{recommendation}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-lg border border-slate-700 bg-slate-900/40">
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Primary Source</p>
          <p className="text-[10px] text-slate-200 font-semibold">{pollutants.fire > 200 ? '🔥 Biomass Burning' : pollutants.no2 > 40 ? '🏭 Industrial' : '🚗 Vehicular'}</p>
        </div>
        <div className="p-2.5 rounded-lg border border-slate-700 bg-slate-900/40">
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Confidence Score</p>
          <p className="text-[10px] text-emerald-400 font-semibold">87.4% (CNN-LSTM)</p>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function GlobalPlatform() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [location, setLocation] = useState<Location>({ lat: 22.0, lon: 78.0, label: 'India', country: 'India' })
  const [date, setDate] = useState('2026-11-10')
  const [dateRange, setDateRange] = useState({ start: '2026-10-01', end: '2026-11-10' })
  const [tab, setTab] = useState<TabId>('map')
  const [basemap, setBasemap] = useState<BasemapId>('dark')
  const [activePollutant, setActivePollutant] = useState('aqi')
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>(
    Object.fromEntries(MAP_LAYERS.map(l => [l.id, l.defaultOn]))
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState<WorldCity[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [nlpQuery, setNlpQuery] = useState('')
  const [nlpResponse, setNlpResponse] = useState('')
  const [showLayers, setShowLayers] = useState(false)
  const [showSources, setShowSources] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [filterContinent, setFilterContinent] = useState('All')
  const [rankSort, setRankSort] = useState<'aqi' | 'hcho' | 'pm25' | 'fire' | 'population'>('aqi')
  const [timeRange, setTimeRange] = useState(30)
  const [isLive, setIsLive] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [gridData, setGridData] = useState<any[]>([])
  const [geocoding, setGeocoding] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [compareLocations, setCompareLocations] = useState<Location[]>([])
  const [showHotspotPanel, setShowHotspotPanel] = useState(false)
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null)

  const mapRef = useRef<any>(null)
  const layerGroupRef = useRef<any>(null)
  const basemapLayerRef = useRef<any>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // ── Derived Data ───────────────────────────────────────────────────────────
  const pollutants = useMemo(() => generatePollutants(location.lat, location.lon, date), [location, date])
  const category = useMemo(() => getCategory(pollutants.aqi), [pollutants])

  const cityRankings = useMemo(() => {
    let cities = WORLD_CITIES.map(c => ({
      ...c,
      ...generatePollutants(c.lat, c.lon, date),
    }))
    if (filterContinent !== 'All') cities = cities.filter(c => c.continent === filterContinent)
    return cities.sort((a, b) => {
      if (rankSort === 'population') return b.population - a.population
      return (b as any)[rankSort] - (a as any)[rankSort]
    })
  }, [date, filterContinent, rankSort])

  const historicalData = useMemo(() => {
    return Array.from({ length: timeRange }, (_, i) => {
      const offset = -(timeRange - 1 - i)
      const ds = getOffsetDateISO(date, offset)
      const p = generatePollutants(location.lat, location.lon, ds)
      const rFireVal = seededRandom(location.lat, location.lon, ds, 'historical-fires')
      return {
        date: formatOffsetDateShort(date, offset),
        ...p,
        fires: GLOBAL_HOTSPOTS.reduce((a, h) => {
          if (Math.abs(h.lat - location.lat) < 8 && Math.abs(h.lon - location.lon) < 8) return a + h.fires
          return a
        }, 0) + Math.round(rFireVal * 200),
      }
    })
  }, [location, date, timeRange])

  const forecastData = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const ds = getOffsetDateISO(date, i)
    const p = generatePollutants(location.lat, location.lon, ds)
    return {
      date: formatOffsetDateShort(date, i),
      ...p,
      confidence: Math.round(95 - i * 8),
    }
  }), [location, date])

  const sourceAttribution = useMemo(() => {
    const fire = pollutants.fire
    const base = fire > 150 ? [
      { name: 'Biomass Burning', value: 48 },
      { name: 'Vehicular', value: 18 },
      { name: 'Industrial', value: 14 },
      { name: 'Dust', value: 12 },
      { name: 'Secondary', value: 8 },
    ] : [
      { name: 'Vehicular', value: 34 },
      { name: 'Industrial', value: 28 },
      { name: 'Dust', value: 16 },
      { name: 'Biomass Burning', value: 14 },
      { name: 'Secondary', value: 8 },
    ]
    return base
  }, [pollutants])

  const nearbyHotspots = useMemo(() =>
    GLOBAL_HOTSPOTS.filter(h =>
      Math.abs(h.lat - location.lat) < 20 && Math.abs(h.lon - location.lon) < 20
    ).slice(0, 5)
  , [location])

  const PIE_COLORS = ['#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#6b7280']

  // ── Leaflet Map Initialization ─────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || tab !== 'map') return
    const L = require('leaflet')
    const container = document.getElementById('global-map')
    if (!container) return

    if (!mapRef.current) {
      mapRef.current = L.map('global-map', {
        center: [location.lat, location.lon],
        zoom: 4,
        minZoom: 2,
        maxZoom: 14,
        zoomControl: false,
        attributionControl: false,
        worldCopyJump: true,
      })
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current)
      L.control.scale({ metric: true, imperial: false, position: 'bottomleft' }).addTo(mapRef.current)

      // Click handler for map to reverse geocode and fly
      mapRef.current.on('click', async (e: any) => {
        const { lat, lng } = e.latlng
        setGeocoding(true)
        const label = await reverseGeocode(lat, lng)
        setLocation({ lat, lon: lng, label, country: '' })
        setGeocoding(false)
      })

      setMapReady(true)
    }

    return () => {}
  }, [tab])

  // ── Basemap Switcher ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return
    const L = require('leaflet')
    if (basemapLayerRef.current) mapRef.current.removeLayer(basemapLayerRef.current)
    basemapLayerRef.current = L.tileLayer(BASEMAPS[basemap].url, { maxZoom: 19, opacity: 0.95 })
    basemapLayerRef.current.addTo(mapRef.current)
  }, [basemap, mapReady])

  // ── Data Layer Rendering ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapReady) return
    const L = require('leaflet')

    if (!layerGroupRef.current) {
      layerGroupRef.current = L.layerGroup().addTo(mapRef.current)
    }
    const lg = layerGroupRef.current
    lg.clearLayers()

    // Generate grid around location
    const range = 4
    const step = 0.5
    const cells: any[] = []
    for (let dlat = -range; dlat <= range; dlat += step) {
      for (let dlon = -range; dlon <= range; dlon += step) {
        const cellLat = location.lat + dlat
        const cellLon = location.lon + dlon
        const p = generatePollutants(cellLat, cellLon, date)
        cells.push({ lat: cellLat, lon: cellLon, ...p })
      }
    }

    // AQI Grid
    if (activeLayers.aqi) {
      cells.forEach(cell => {
        const cat = getCategory(cell.aqi)
        L.rectangle(
          [[cell.lat - step / 2, cell.lon - step / 2], [cell.lat + step / 2, cell.lon + step / 2]],
          { color: 'transparent', fillColor: cat.color, fillOpacity: 0.32, weight: 0 }
        ).bindTooltip(
          `<div style="font-size:11px;line-height:1.6"><b style="color:${cat.color}">AQI: ${cell.aqi}</b> (${cat.label})<br>PM2.5: ${cell.pm25} µg/m³<br>HCHO: ${cell.hcho} µmol/m²</div>`,
          { sticky: true, className: 'leaflet-tooltip-atmos' }
        ).addTo(lg)
      })
    }

    // HCHO Column Overlay
    if (activeLayers.hcho) {
      cells.forEach(cell => {
        if (cell.hcho < 0.00015) return
        const intensity = Math.min(cell.hcho / 0.0005, 1)
        L.rectangle(
          [[cell.lat - step / 2, cell.lon - step / 2], [cell.lat + step / 2, cell.lon + step / 2]],
          { color: 'transparent', fillColor: '#ef4444', fillOpacity: intensity * 0.45, weight: 0 }
        ).addTo(lg)
      })
    }

    // Wind vectors
    if (activeLayers.wind) {
      cells.filter((_, i) => i % 4 === 0).forEach(cell => {
        const uAngle = (cell.lon * 7 + cell.lat * 3) % 360
        const speed = 0.3 + (cell.aqi / 500) * 0.2
        const rad = (uAngle * Math.PI) / 180
        L.polyline(
          [[cell.lat, cell.lon], [cell.lat + Math.cos(rad) * speed, cell.lon + Math.sin(rad) * speed]],
          { color: 'rgba(96,165,250,0.4)', weight: 1.2, dashArray: '3,5' }
        ).addTo(lg)
      })
    }

    // Global Fire Hotspots
    if (activeLayers.fire) {
      GLOBAL_HOTSPOTS.forEach(hs => {
        const c = hs.status === 'Critical' ? '#ef4444' : hs.status === 'High' ? '#f59e0b' : '#34d399'
        L.circle([hs.lat, hs.lon], {
          radius: Math.sqrt(hs.fires) * 5500,
          color: c, fillColor: c, fillOpacity: 0.13, weight: 1.5,
        }).bindPopup(
          `<div style="background:#0f172a;color:#f8fafc;padding:12px;border-radius:10px;font-size:11px;min-width:220px;border:1px solid ${c}40">
            <div style="color:${c};font-weight:800;font-size:13px;margin-bottom:8px">🔥 ${hs.id} — ${hs.region}</div>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="color:#94a3b8;padding:2px 0">Country</td><td style="font-weight:600">${hs.country}</td></tr>
              <tr><td style="color:#94a3b8;padding:2px 0">Max HCHO</td><td style="color:#fbbf24;font-weight:600">${hs.max_hcho} µmol/m²</td></tr>
              <tr><td style="color:#94a3b8;padding:2px 0">Fire Count</td><td style="color:#f87171;font-weight:600">${hs.fires.toLocaleString()}</td></tr>
              <tr><td style="color:#94a3b8;padding:2px 0">Cause</td><td>${hs.cause}</td></tr>
              <tr><td style="color:#94a3b8;padding:2px 0">Pop. Exposed</td><td>${(hs.pop_exposed / 1e6).toFixed(1)}M</td></tr>
              <tr><td style="color:#94a3b8;padding:2px 0">Area</td><td>${hs.area_km2.toLocaleString()} km²</td></tr>
              <tr><td style="color:#94a3b8;padding:2px 0">Status</td><td style="color:${c};font-weight:700">${hs.status}</td></tr>
            </table>
          </div>`,
          { maxWidth: 280 }
        ).on('click', () => setSelectedHotspot(hs)).addTo(lg)

        // Pulse ring for Critical
        if (hs.status === 'Critical') {
          L.circle([hs.lat, hs.lon], {
            radius: Math.sqrt(hs.fires) * 8000,
            color: c, fillColor: 'transparent', fillOpacity: 0, weight: 1, dashArray: '6,8', opacity: 0.5
          }).addTo(lg)
        }
      })
    }

    // Location pin
    const locIcon = L.divIcon({
      html: `<div style="display:flex;flex-direction:column;align-items:center"><div style="width:14px;height:14px;background:#38bdf8;border:2.5px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(56,189,248,0.3)"></div><div style="width:2px;height:8px;background:#38bdf8;margin-top:1px"></div></div>`,
      iconSize: [14, 22], iconAnchor: [7, 22]
    })
    L.marker([location.lat, location.lon], { icon: locIcon })
      .bindPopup(`<b style="color:#38bdf8">${location.label}</b><br>AQI: ${pollutants.aqi}`)
      .addTo(lg)

  }, [location, date, activeLayers, mapReady, pollutants])

  // ── Fly-to when location changes ──────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.flyTo([location.lat, location.lon], 6, { duration: 1.5 })
  }, [location])

  // ── Search Suggestions ────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) { setSearchSuggestions([]); return }
    const q = searchQuery.toLowerCase()
    const matches = WORLD_CITIES.filter(c =>
      c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.key.includes(q)
    ).slice(0, 8)
    setSearchSuggestions(matches)
  }, [searchQuery])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return

    // Coordinate input: "28.6, 77.2"
    const coordMatch = query.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/)
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1])
      const lon = parseFloat(coordMatch[2])
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        setIsSearching(true)
        const label = await reverseGeocode(lat, lon)
        setLocation({ lat, lon, label, country: '' })
        setSearchQuery(label)
        setIsSearching(false)
        setSearchSuggestions([])
        return
      }
    }

    // City from local DB
    const q = query.toLowerCase()
    const city = WORLD_CITIES.find(c => c.name.toLowerCase() === q || c.key === q || c.name.toLowerCase().includes(q))
    if (city) {
      setLocation({ lat: city.lat, lon: city.lon, label: `${city.name}, ${city.country}`, country: city.country })
      setSearchQuery(`${city.name}, ${city.country}`)
      setSearchSuggestions([])
      return
    }

    // Nominatim fallback
    setIsSearching(true)
    const result = await geocodeLocation(query)
    if (result) {
      setLocation(result)
      setSearchQuery(result.label)
    }
    setIsSearching(false)
    setSearchSuggestions([])
  }, [])

  const handleNLP = useCallback(() => {
    if (!nlpQuery.trim()) return
    const q = nlpQuery.toLowerCase()

    // Location detection
    const cityMatch = WORLD_CITIES.find(c => q.includes(c.name.toLowerCase()) || q.includes(c.key))
    const hotspotMatch = GLOBAL_HOTSPOTS.find(h => q.includes(h.region.toLowerCase().split(',')[0].toLowerCase()) || q.includes(h.country.toLowerCase()))

    let loc = cityMatch ? { lat: cityMatch.lat, lon: cityMatch.lon, label: `${cityMatch.name}, ${cityMatch.country}`, country: cityMatch.country } : location
    if (hotspotMatch && !cityMatch) loc = { lat: hotspotMatch.lat, lon: hotspotMatch.lon, label: hotspotMatch.region, country: hotspotMatch.country }
    if (loc !== location) setLocation(loc)

    const p = generatePollutants(loc.lat, loc.lon, date)
    const cat = getCategory(p.aqi)

    let reply = ''
    if (q.includes('hcho') || q.includes('formaldehyde')) {
      const hs = GLOBAL_HOTSPOTS.filter(h => Math.abs(h.lat - loc.lat) < 12 && Math.abs(h.lon - loc.lon) < 12)
      reply = `📡 HCHO Analysis — ${loc.label}: Max column density ~${p.hcho} µmol/m². ${hs.length} active hotspot cluster(s) within 1200 km radius. Nearest: ${hs[0]?.region ?? 'None detected'} (${hs[0]?.max_hcho ?? 'N/A'} µmol/m²).`
    } else if (q.includes('fire')) {
      const hs = GLOBAL_HOTSPOTS.filter(h => Math.abs(h.lat - loc.lat) < 15 && Math.abs(h.lon - loc.lon) < 15)
      reply = `🔥 Fire Intelligence — ${loc.label}: ${hs.reduce((a, h) => a + h.fires, 0).toLocaleString()} cumulative fire counts in region. ${hs.length} hotspot(s) active. Primary cause: ${hs[0]?.cause ?? 'N/A'}.`
    } else if (q.includes('forecast') || q.includes('tomorrow') || q.includes('next')) {
      reply = `📈 Forecast — ${loc.label}: Current AQI ${p.aqi} (${cat.label}). Expected trend: ${p.aqi > 250 ? 'worsening over 48h due to fire season peak' : 'stable with ±15% daily variability'}. 7-day projection available in Analytics tab.`
    } else if (q.includes('compare')) {
      setCompareMode(true)
      reply = `🔄 Compare Mode activated. Click any city in Rankings tab or search a location to add it to comparison.`
    } else if (q.includes('source') || q.includes('driver') || q.includes('cause')) {
      reply = `🔬 Source Attribution — ${loc.label}: Primary driver is ${p.fire > 150 ? 'biomass burning (48%)' : 'vehicular emissions (34%)'}. Secondary: ${p.no2 > 40 ? 'industrial NO₂' : 'dust re-suspension'}. See Analytics → Source Attribution chart.`
    } else if (q.includes('health') || q.includes('risk')) {
      reply = `⚕️ Health Risk — ${loc.label}: AQI ${p.aqi} (${cat.label}). ${p.aqi > 300 ? '🚨 Emergency: Avoid all outdoor exposure. Hospitals on alert.' : p.aqi > 200 ? '⚠️ High risk for cardiovascular/respiratory patients.' : p.aqi > 100 ? '🟡 Moderate risk for sensitive groups.' : '✅ Low risk. Air quality acceptable.'}`
    } else if (q.includes('worst') || q.includes('most polluted')) {
      const top = cityRankings[0]
      reply = `🏆 Most Polluted City Today: ${top?.name}, ${top?.country} — AQI ${top?.aqi} (${getCategory(top?.aqi ?? 0).label}). Rankings are live in the Rankings tab.`
    } else {
      reply = `🌍 AQI Intelligence — ${loc.label} on ${date}: AQI = ${p.aqi} (${cat.label}). PM2.5: ${p.pm25} µg/m³ | NO₂: ${p.no2} µg/m³ | HCHO: ${p.hcho} µmol/m². Map updated. Use analytics tab for detailed breakdown.`
    }
    setNlpResponse(reply)
  }, [nlpQuery, location, date, cityRankings])

  // ── Export Handlers ────────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [
      ['Location', 'Country', 'Date', 'AQI', 'PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3', 'HCHO', 'Fire FRP'],
      [location.label, location.country, date, pollutants.aqi, pollutants.pm25, pollutants.pm10, pollutants.no2, pollutants.so2, pollutants.co, pollutants.o3, pollutants.hcho, pollutants.fire],
      ...historicalData.map(d => [location.label, location.country, d.date, d.aqi, d.pm25, d.pm10, d.no2, d.so2, d.co, d.o3, d.hcho, d.fire])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `ATMOS_WATCH_${location.label.replace(/\W+/g,'_')}_${date}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const exportReport = () => {
    const txt = `
ATMOS-WATCH GLOBAL — AIR QUALITY INTELLIGENCE REPORT
${'═'.repeat(60)}
Location  : ${location.label} (${location.lat.toFixed(4)}°N, ${location.lon.toFixed(4)}°E)
Country   : ${location.country}
Date      : ${date}
Generated : ${new Date().toLocaleString()}

${'─'.repeat(60)}
CURRENT POLLUTION STATUS
${'─'.repeat(60)}
AQI       : ${pollutants.aqi} — ${category.label}
PM2.5     : ${pollutants.pm25} µg/m³
PM10      : ${pollutants.pm10} µg/m³
NO₂       : ${pollutants.no2} µg/m³
SO₂       : ${pollutants.so2} µg/m³
CO        : ${pollutants.co} mg/m³
O₃        : ${pollutants.o3} µg/m³
HCHO      : ${pollutants.hcho} µmol/m²
Fire FRP  : ${pollutants.fire} MW/km²

${'─'.repeat(60)}
SOURCE ATTRIBUTION
${'─'.repeat(60)}
${sourceAttribution.map(s => `${s.name.padEnd(22)}: ${s.value}%`).join('\n')}

${'─'.repeat(60)}
GLOBAL HOTSPOT INTELLIGENCE (Within 2000 km)
${'─'.repeat(60)}
${nearbyHotspots.map(h => `${h.id.padEnd(8)} ${h.region.padEnd(35)} HCHO: ${String(h.max_hcho).padEnd(6)} Fires: ${String(h.fires).padEnd(6)} ${h.status}`).join('\n')}

${'─'.repeat(60)}
7-DAY FORECAST
${'─'.repeat(60)}
${forecastData.map(f => `${f.date.padEnd(10)} AQI: ${String(f.aqi).padEnd(5)} PM2.5: ${String(f.pm25).padEnd(5)} Confidence: ${f.confidence}%`).join('\n')}

${'─'.repeat(60)}
DATA SOURCES
${'─'.repeat(60)}
Sentinel-5P TROPOMI (HCHO, NO₂, SO₂, CO, O₃)
MODIS/VIIRS (Fire Radiative Power, AOD)
ERA5 Reanalysis (Wind, Temperature, BLH)
NASA MERRA-2 (Aerosol Optical Depth)
CAMS Copernicus (AQI Forecast)
OpenAQ Ground Stations (PM2.5, PM10 validation)

Powered by ATMOS-WATCH GLOBAL | Earth Observation Air Intelligence Platform
Model: CNN-LSTM v2.1 | R²=0.87 | RMSE=8.4 µg/m³
`.trim()
    const blob = new Blob([txt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `ATMOS_REPORT_${location.label.replace(/\W+/g,'_')}_${date}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-[#040810] text-slate-100 overflow-hidden">

      {/* ══ HEADER ════════════════════════════════════════════════════════════ */}
      <header className="shrink-0 bg-[#06090F]/95 backdrop-blur-xl border-b border-slate-800/60 px-3 md:px-5 py-2.5 flex items-center gap-3 z-50">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg p-1.5">
            <Globe2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-sm font-extrabold bg-gradient-to-r from-white to-sky-400 bg-clip-text text-transparent leading-none">ATMOS-WATCH</h1>
            <p className="text-[9px] text-slate-500 leading-none mt-0.5">Global Earth Observation Platform</p>
          </div>
          <div className={`text-[9px] px-2 py-0.5 rounded-full border font-bold flex items-center gap-1 ${isLive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
            <span className={`w-1.5 h-1.5 rounded-full bg-current ${isLive ? 'animate-ping' : ''}`}></span>
            {isLive ? 'LIVE' : 'SIM'}
          </div>
        </div>

        {/* GLOBAL SEARCH */}
        <div className="flex-1 max-w-2xl relative">
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-2 focus-within:border-sky-500/60 transition-all">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch(searchQuery)}
              placeholder="Search any country, state, city, landmark, or enter coordinates (lat, lon)…"
              className="bg-transparent text-xs text-slate-100 placeholder-slate-500 outline-none flex-1 min-w-0"
            />
            {(searchQuery || isSearching) && (
              <button onClick={() => { setSearchQuery(''); setSearchSuggestions([]) }} className="text-slate-500 hover:text-slate-300 shrink-0">
                {isSearching ? <RefreshCw className="w-3 h-3 animate-spin text-sky-400" /> : <X className="w-3 h-3" />}
              </button>
            )}
            <button onClick={() => handleSearch(searchQuery)}
              className="bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all shrink-0">
              GO
            </button>
          </div>

          {/* Suggestions dropdown */}
          {searchSuggestions.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-slate-900/98 border border-slate-700 rounded-xl overflow-hidden shadow-2xl z-[9999]">
              {searchSuggestions.map((c, i) => (
                <button key={i} onClick={() => { setLocation({ lat: c.lat, lon: c.lon, label: `${c.name}, ${c.country}`, country: c.country }); setSearchQuery(`${c.name}, ${c.country}`); setSearchSuggestions([]) }}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 border-b border-slate-800/50 last:border-0 transition-colors">
                  <div className="w-6 h-6 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-3 h-3 text-sky-400" />
                  </div>
                  <div>
                    <span className="font-semibold">{c.name}</span>
                    <span className="text-slate-400 ml-1">· {c.country} · {c.continent}</span>
                  </div>
                  <span className="ml-auto text-[10px] text-slate-500">AQI {generateAQI(c.lat, c.lon, date)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-900/70 border border-slate-700/50 px-2.5 py-2 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="bg-transparent outline-none text-xs text-slate-100 [color-scheme:dark] w-28" />
          </div>

          <button onClick={() => setShowLayers(p => !p)}
            className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-[11px] font-semibold border transition-colors ${showLayers ? 'bg-sky-500/15 border-sky-500/40 text-sky-300' : 'bg-slate-900/70 border-slate-700/50 text-slate-300 hover:border-sky-500/30'}`}>
            <Layers className="w-3.5 h-3.5" /><span className="hidden md:inline">Layers</span>
          </button>

          <button onClick={() => setShowExport(p => !p)}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-[11px] font-semibold border border-slate-700/50 bg-slate-900/70 text-slate-300 hover:border-emerald-500/30 transition-colors">
            <Download className="w-3.5 h-3.5" /><span className="hidden md:inline">Export</span>
          </button>

          <button onClick={() => setShowAI(p => !p)}
            className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-[11px] font-semibold border transition-colors ${showAI ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300' : 'bg-slate-900/70 border-slate-700/50 text-slate-300 hover:border-indigo-500/30'}`}>
            <Cpu className="w-3.5 h-3.5" /><span className="hidden md:inline">AI</span>
          </button>
        </div>
      </header>

      {/* ══ DROPDOWN PANELS ═══════════════════════════════════════════════════ */}

      {/* Layer Panel */}
      {showLayers && (
        <div className="shrink-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/60 px-4 py-3 z-40">
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {MAP_LAYERS.map(l => (
              <button key={l.id} onClick={() => setActiveLayers(p => ({ ...p, [l.id]: !p[l.id] }))}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${activeLayers[l.id] ? 'text-slate-950 border-transparent' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'}`}
                style={activeLayers[l.id] ? { backgroundColor: l.color, borderColor: l.color } : {}}>
                {l.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Basemap:</span>
            {(Object.keys(BASEMAPS) as BasemapId[]).map(b => (
              <button key={b} onClick={() => setBasemap(b)}
                className={`text-[10px] px-2 py-1 rounded font-bold transition-colors ${basemap === b ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}>
                {BASEMAPS[b].icon} {BASEMAPS[b].label}
              </button>
            ))}
            <span className="text-[10px] text-slate-500 ml-auto">Click map to inspect any location</span>
          </div>
        </div>
      )}

      {/* Export Panel */}
      {showExport && (
        <div className="shrink-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/60 px-5 py-3 z-40 flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-bold text-slate-200">Export — <span className="text-sky-400">{location.label}</span></p>
            <p className="text-[10px] text-slate-400">Full data package: AQI history, HCHO, fires, forecast, attribution</p>
          </div>
          <div className="flex gap-2 ml-auto">
            <button onClick={exportCSV} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors">
              <Download className="w-3 h-3" /> CSV Data
            </button>
            <button onClick={exportReport} className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors">
              <FileText className="w-3 h-3" /> TXT Report
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors">
              <FileText className="w-3 h-3" /> Print / PDF
            </button>
          </div>
        </div>
      )}

      {/* AI Panel */}
      {showAI && (
        <div className="shrink-0 bg-[#0a0f1e]/95 backdrop-blur-xl border-b border-indigo-800/30 px-5 py-3 z-40">
          <AIInsight location={location} pollutants={pollutants} date={date} />
        </div>
      )}

      {/* ══ NLP QUERY BAR ════════════════════════════════════════════════════ */}
      <div className="shrink-0 bg-slate-900/40 border-b border-slate-800/30 px-4 py-2 flex items-center gap-2 z-30">
        <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <input
          type="text"
          value={nlpQuery}
          onChange={e => setNlpQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleNLP()}
          placeholder='Ask AI: "Show AQI over Delhi" · "HCHO hotspots in Amazon" · "Which city is most polluted?" · "Health risk in Beijing"'
          className="bg-transparent text-[11px] text-slate-300 placeholder-slate-500 outline-none flex-1"
        />
        <button onClick={handleNLP} className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] px-2.5 py-1.5 rounded-lg font-bold transition-colors shrink-0">
          Ask
        </button>
        {nlpResponse && <button onClick={() => setNlpResponse('')} className="text-slate-500 hover:text-slate-300 shrink-0"><X className="w-3 h-3" /></button>}
      </div>
      {nlpResponse && (
        <div className="shrink-0 bg-indigo-950/40 border-b border-indigo-700/30 px-4 py-2 flex items-start gap-2 z-30">
          <Cpu className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-indigo-200 leading-relaxed">{nlpResponse}</p>
        </div>
      )}

      {/* ══ TAB NAV ══════════════════════════════════════════════════════════ */}
      <div className="shrink-0 bg-[#06090F]/80 border-b border-slate-800/50 px-4 flex gap-0.5 z-30">
        {([
          { id:'map',        label:'🌍 Global Map'      },
          { id:'analytics',  label:'📊 Analytics'       },
          { id:'timemachine',label:'⏳ Time Machine'     },
          { id:'rankings',   label:'🏆 Global Rankings'  },
          { id:'command',    label:'🛡️ Command Center'   },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3.5 py-2.5 text-[11px] font-semibold border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? 'border-sky-500 text-sky-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ MAIN CONTENT ══════════════════════════════════════════════════════ */}
      <div className="flex-1 min-h-0 overflow-auto">

        {/* ── GLOBAL MAP TAB ─────────────────────────────────────────────── */}
        {tab === 'map' && (
          <div className="h-full flex gap-0 overflow-hidden">
            {/* MAP */}
            <div className="flex-1 relative">
              <div id="global-map" className="w-full h-full" />

              {/* Geocoding overlay */}
              {geocoding && (
                <div className="absolute inset-0 bg-slate-950/50 flex items-center justify-center z-[500] pointer-events-none">
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2.5 rounded-xl shadow-xl">
                    <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />
                    <span className="text-xs font-semibold text-slate-200">Identifying location…</span>
                  </div>
                </div>
              )}

              {/* Pollutant Switcher Overlay */}
              <div className="absolute top-3 left-3 z-[400] flex flex-col gap-1">
                {POLLUTANTS.map(p => (
                  <button key={p.id} onClick={() => setActivePollutant(p.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border backdrop-blur-sm transition-all ${activePollutant === p.id ? 'text-slate-950 border-transparent shadow-lg' : 'bg-slate-900/70 border-slate-700/50 text-slate-400 hover:text-slate-200'}`}
                    style={activePollutant === p.id ? { backgroundColor: p.color, borderColor: p.color } : {}}>
                    <span>{p.icon}</span><span className="hidden md:inline">{p.label}</span>
                  </button>
                ))}
              </div>

              {/* AQI Legend Overlay */}
              <div className="absolute bottom-16 left-3 z-[400] bg-slate-950/85 border border-slate-800 rounded-xl p-2.5 backdrop-blur-sm">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1.5">AQI Scale</p>
                {AQI_CATEGORIES.map(c => (
                  <div key={c.label} className="flex items-center gap-1.5 mb-0.5">
                    <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: c.color }}></div>
                    <span className="text-[9px] text-slate-400">{c.label} ({c.range[0]}–{c.range[1] === 999 ? '500+' : c.range[1]})</span>
                  </div>
                ))}
              </div>

              {/* Current Location Info Overlay */}
              <div className="absolute top-3 right-3 z-[400] bg-slate-950/85 border border-slate-800 rounded-xl p-3 backdrop-blur-sm min-w-[180px]">
                <p className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-sky-400" /> Selected Location
                </p>
                <p className="text-xs font-bold text-sky-300 leading-tight">{location.label}</p>
                <p className="text-[9px] text-slate-500">{location.lat.toFixed(4)}°, {location.lon.toFixed(4)}°</p>
                <div className="mt-2 pt-2 border-t border-slate-800">
                  <div className="text-center">
                    <span className="text-2xl font-extrabold block" style={{ color: category.color }}>{pollutants.aqi}</span>
                    <span className="text-[9px] font-bold uppercase" style={{ color: category.color }}>{category.label}</span>
                  </div>
                </div>
                <div className="mt-2 space-y-0.5">
                  {[['PM2.5', pollutants.pm25, 'µg/m³'], ['NO₂', pollutants.no2, 'µg/m³'], ['HCHO', pollutants.hcho, 'µmol/m²']].map(([k, v, u]) => (
                    <div key={String(k)} className="flex justify-between text-[9px]">
                      <span className="text-slate-400">{k}</span>
                      <span className="text-slate-200 font-semibold">{String(v)} <span className="text-slate-500">{u}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="w-72 shrink-0 bg-[#06090F]/90 border-l border-slate-800/60 overflow-y-auto flex flex-col">

              {/* Hotspot List */}
              <div className="p-3 border-b border-slate-800/50">
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <Flame className="w-3.5 h-3.5" /> Global HCHO Hotspots
                  <span className="ml-auto text-slate-500">{GLOBAL_HOTSPOTS.length} active</span>
                </p>
                <div className="space-y-1.5">
                  {GLOBAL_HOTSPOTS.slice(0, 8).map(hs => {
                    const c = hs.status === 'Critical' ? '#ef4444' : hs.status === 'High' ? '#f59e0b' : hs.status === 'Active' ? '#fb923c' : '#34d399'
                    return (
                      <button key={hs.id} onClick={() => { setLocation({ lat: hs.lat, lon: hs.lon, label: hs.region, country: hs.country }); setSelectedHotspot(hs) }}
                        className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-red-500/30 transition-all">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-bold text-slate-200 truncate pr-1">{hs.region.split(',')[0]}</span>
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold border shrink-0" style={{ color: c, borderColor: c + '40', backgroundColor: c + '15' }}>{hs.status}</span>
                        </div>
                        <div className="flex gap-2 text-[9px] text-slate-400">
                          <span>{hs.country}</span>
                          <span>HCHO: <span className="text-amber-400 font-bold">{hs.max_hcho}</span></span>
                          <span>🔥 {hs.fires.toLocaleString()}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Selected Hotspot Detail */}
              {selectedHotspot && (
                <div className="p-3 border-b border-slate-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-amber-400 flex items-center gap-1"><Star className="w-3 h-3" /> Hotspot Detail</p>
                    <button onClick={() => setSelectedHotspot(null)} className="text-slate-500 hover:text-slate-300"><X className="w-3 h-3" /></button>
                  </div>
                  <div className="space-y-1 text-[10px]">
                    {[
                      ['ID', selectedHotspot.id],
                      ['Region', selectedHotspot.region],
                      ['Country', selectedHotspot.country],
                      ['Continent', selectedHotspot.continent],
                      ['Cause', selectedHotspot.cause],
                      ['Max HCHO', `${selectedHotspot.max_hcho} µmol/m²`],
                      ['Fire Count', selectedHotspot.fires.toLocaleString()],
                      ['Area', `${selectedHotspot.area_km2.toLocaleString()} km²`],
                      ['Pop. Exposed', `${(selectedHotspot.pop_exposed / 1e6).toFixed(1)}M`],
                    ].map(([k, v]) => (
                      <div key={String(k)} className="flex justify-between border-b border-slate-800/30 pb-0.5">
                        <span className="text-slate-500">{k}</span>
                        <span className="text-slate-200 font-semibold text-right">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data Sources */}
              <div className="p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Database className="w-3 h-3 text-sky-400" /> Active Data Sources
                </p>
                <div className="space-y-1">
                  {DATA_SOURCES.map(s => (
                    <div key={s.id} className="flex items-center gap-2 py-1 border-b border-slate-800/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-slate-200">{s.label}</p>
                        <p className="text-[9px] text-slate-500 truncate">{s.params.slice(0, 3).join(', ')}</p>
                      </div>
                      <span className="text-[9px] text-slate-500 shrink-0">{s.res}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ─────────────────────────────────────────────── */}
        {tab === 'analytics' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-max">

            {/* All Pollutants Card */}
            <div className="glass-panel rounded-2xl p-4 border border-slate-800 md:col-span-2 xl:col-span-1">
              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Current Pollutant Panel — {location.label}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {POLLUTANTS.map(p => {
                  const val = (pollutants as any)[p.id]
                  return (
                    <div key={p.id} className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/40 text-center hover:border-sky-500/30 transition-colors cursor-pointer" onClick={() => setActivePollutant(p.id)}>
                      <div className="text-lg mb-0.5">{p.icon}</div>
                      <div className="text-sm font-extrabold" style={{ color: p.color }}>{typeof val === 'number' && val > 0.001 ? fmt(val, p.id === 'hcho' ? 5 : p.id === 'co' ? 1 : 0) : val}</div>
                      <div className="text-[9px] text-slate-400 font-bold">{p.label}</div>
                      <div className="text-[8px] text-slate-500">{p.unit}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 7-Day Forecast */}
            <div className="glass-panel rounded-2xl p-4 border border-slate-800">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> 7-Day AQI Forecast
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="gForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" stroke="#475569" fontSize={9} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', fontSize: 10, borderRadius: 8 }} />
                  <Area type="monotone" dataKey="aqi" stroke="#38bdf8" strokeWidth={2} fill="url(#gForecast)" name="AQI" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-2 mt-2 text-[9px] text-slate-400">
                {forecastData.map(f => (
                  <div key={f.date} className="flex-1 text-center">
                    <div className="font-bold" style={{ color: getCategory(f.aqi).color }}>{f.aqi}</div>
                    <div className="text-slate-500">{f.confidence}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Attribution */}
            <div className="glass-panel rounded-2xl p-4 border border-slate-800">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" /> PM2.5 Source Attribution
              </h3>
              <div className="relative h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sourceAttribution} cx="50%" cy="50%" innerRadius={40} outerRadius={62} paddingAngle={3} dataKey="value">
                      {sourceAttribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', fontSize: 10, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-base font-extrabold text-slate-100">{sourceAttribution[0]?.value}%</span>
                  <span className="text-[8px] text-slate-400">Top Source</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 mt-1">
                {sourceAttribution.map((s, i) => (
                  <div key={i} className="flex items-center gap-1 text-[9px]">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                    <span className="text-slate-400 truncate">{s.name}</span>
                    <span className="font-bold ml-auto text-slate-200">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fire-HCHO-AQI Causal Chain */}
            <div className="glass-panel rounded-2xl p-4 border border-slate-800 md:col-span-2">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Fire → HCHO → AQI Causal Chain (14-Day)
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <ComposedChart data={historicalData.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" stroke="#475569" fontSize={9} tickLine={false} />
                  <YAxis yAxisId="l" stroke="#475569" fontSize={9} tickLine={false} />
                  <YAxis yAxisId="r" orientation="right" stroke="#f59e0b" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', fontSize: 10, borderRadius: 8 }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  <Bar yAxisId="l" dataKey="fires" fill="rgba(56,189,248,0.3)" name="🔥 Fire Count" radius={[2,2,0,0]} />
                  <Line yAxisId="r" type="monotone" dataKey="aqi" stroke="#ef4444" strokeWidth={2} name="📊 AQI" dot={false} />
                  <Line yAxisId="r" type="monotone" dataKey="pm25" stroke="#f59e0b" strokeWidth={1.5} name="💨 PM2.5" dot={false} strokeDasharray="4 3" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* ML Benchmarks */}
            <div className="glass-panel rounded-2xl p-4 border border-slate-800">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> ML Model Benchmarks
              </h3>
              <div className="space-y-2">
                {[
                  { model: 'CNN-LSTM (ATMOS)', r2: 0.87, rmse: 8.4,  mae: 6.2, highlight: true  },
                  { model: 'Random Forest',      r2: 0.72, rmse: 15.2, mae: 11.8,highlight: false },
                  { model: 'XGBoost',            r2: 0.74, rmse: 14.1, mae: 10.9,highlight: false },
                  { model: 'Kriging',            r2: 0.58, rmse: 22.4, mae: 17.2,highlight: false },
                  { model: 'GEOS-Chem',          r2: 0.65, rmse: 19.8, mae: 15.1,highlight: false },
                ].map((m, i) => (
                  <div key={i} className={`flex items-center gap-3 p-2 rounded-lg border ${m.highlight ? 'border-sky-500/30 bg-sky-500/5' : 'border-slate-800/50 bg-slate-900/30'}`}>
                    <div className="flex-1">
                      <p className={`text-[10px] font-bold ${m.highlight ? 'text-sky-300' : 'text-slate-300'}`}>{m.model} {m.highlight && '✦'}</p>
                      <div className="flex gap-2 text-[9px] text-slate-400 mt-0.5">
                        <span>R²: <b className={m.highlight ? 'text-emerald-400' : 'text-slate-200'}>{m.r2}</b></span>
                        <span>RMSE: <b className={m.highlight ? 'text-emerald-400' : 'text-slate-200'}>{m.rmse}</b></span>
                        <span>MAE: <b className={m.highlight ? 'text-emerald-400' : 'text-slate-200'}>{m.mae}</b></span>
                      </div>
                    </div>
                    <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: pct(m.r2 * 100), backgroundColor: m.highlight ? '#38bdf8' : '#475569' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pollutant Radar */}
            <div className="glass-panel rounded-2xl p-4 border border-slate-800">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Pollution Profile Radar
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={[
                  { param: 'PM2.5',  val: Math.min(pollutants.pm25 / 150 * 100, 100) },
                  { param: 'NO₂',    val: Math.min(pollutants.no2 / 80 * 100, 100)   },
                  { param: 'SO₂',    val: Math.min(pollutants.so2 / 40 * 100, 100)   },
                  { param: 'O₃',     val: Math.min(pollutants.o3 / 100 * 100, 100)   },
                  { param: 'CO',     val: Math.min(pollutants.co / 5 * 100, 100)     },
                  { param: 'HCHO',   val: Math.min(pollutants.hcho / 0.0005 * 100, 100) },
                ]}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="param" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Radar name="Pollution" dataKey="val" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.35} strokeWidth={1.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── TIME MACHINE TAB ──────────────────────────────────────────── */}
        {tab === 'timemachine' && (
          <div className="p-4 space-y-4">
            {/* Controls */}
            <div className="glass-panel rounded-xl p-4 border border-slate-800 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-bold text-slate-200">Time Machine — <span className="text-sky-400">{location.label}</span></span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span>Range:</span>
                {[7, 14, 30, 60, 90, 180].map(d => (
                  <button key={d} onClick={() => setTimeRange(d)}
                    className={`px-2 py-1 rounded-lg font-bold transition-colors ${timeRange === d ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                    {d}d
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 ml-auto text-[11px] text-slate-400">
                <span>From:</span>
                <input type="date" value={dateRange.start} onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-100 [color-scheme:dark] outline-none" />
                <span>To:</span>
                <input type="date" value={dateRange.end} onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-100 [color-scheme:dark] outline-none" />
              </div>
            </div>

            {/* Historical AQI */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-sky-400" /> {timeRange}-Day AQI Evolution — {location.label}
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={historicalData}>
                  <defs>
                    <linearGradient id="gHist" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" stroke="#475569" fontSize={9} tickLine={false} interval={Math.max(1, Math.floor(historicalData.length / 12))} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', fontSize: 10, borderRadius: 8 }} />
                  <Area type="monotone" dataKey="aqi" stroke="#7c3aed" strokeWidth={2} fill="url(#gHist)" name="AQI" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'pm25', label: 'PM2.5 History', color: '#f59e0b', unit: 'µg/m³', id: 'gPM25' },
                { key: 'fires', label: 'Fire Count History', color: '#ef4444', unit: 'Fires/day', id: 'gFire' },
                { key: 'hcho', label: 'HCHO Column Trend', color: '#60a5fa', unit: 'µmol/m²', id: 'gHCHO' },
              ].map(({ key, label, color, unit, id }) => (
                <div key={key} className="glass-panel rounded-2xl p-4 border border-slate-800">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color }}>
                    <TrendingUp className="w-3.5 h-3.5" /> {label}
                  </h3>
                  <ResponsiveContainer width="100%" height={140}>
                    <AreaChart data={historicalData}>
                      <defs>
                        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={color} stopOpacity={0.45} />
                          <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="date" stroke="#475569" fontSize={8} tickLine={false} interval={Math.max(1, Math.floor(historicalData.length / 6))} />
                      <YAxis stroke="#475569" fontSize={8} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', fontSize: 9, borderRadius: 8 }} />
                      <Area type="monotone" dataKey={key} stroke={color} strokeWidth={1.5} fill={`url(#${id})`} name={label} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>

            {/* Climate Comparison */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 mb-4">📅 Monthly Average AQI Profile</h3>
              <ResponsiveContainer width="100%" height={160}>
                <ComposedChart data={Array.from({ length: 12 }, (_, i) => {
                  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                  const d = new Date(2026, i, 15)
                  const ds = d.toISOString().split('T')[0]
                  return { month: months[i], aqi: generateAQI(location.lat, location.lon, ds) }
                })}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', fontSize: 10, borderRadius: 8 }} />
                  <Bar dataKey="aqi" radius={[3,3,0,0]} name="Avg AQI">
                    {Array.from({ length: 12 }, (_, i) => {
                      const d = new Date(2026, i, 15)
                      const aqi = generateAQI(location.lat, location.lon, d.toISOString().split('T')[0])
                      return <Cell key={i} fill={getCategory(aqi).color} />
                    })}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── GLOBAL RANKINGS TAB ─────────────────────────────────────────── */}
        {tab === 'rankings' && (
          <div className="p-4 space-y-4">
            {/* Controls */}
            <div className="glass-panel rounded-xl p-3.5 border border-slate-800 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-slate-200">Global City Rankings</span>
                <span className="text-xs text-slate-400">— {cityRankings.length} cities</span>
              </div>
              <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                <span className="text-[11px] text-slate-400">Continent:</span>
                {CONTINENTS.map(c => (
                  <button key={c} onClick={() => setFilterContinent(c)}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${filterContinent === c ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                    {c}
                  </button>
                ))}
                <span className="text-[11px] text-slate-400 ml-2">Sort:</span>
                {(['aqi','pm25','fire','population'] as const).map(s => (
                  <button key={s} onClick={() => setRankSort(s)}
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${rankSort === s ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                    {s === 'pm25' ? 'PM2.5' : s}
                  </button>
                ))}
              </div>
            </div>

            {/* Rankings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {cityRankings.map((city, i) => {
                const cat = getCategory(city.aqi)
                const pctAQI = Math.min((city.aqi / 500) * 100, 100)
                return (
                  <button key={city.key} onClick={() => { setLocation({ lat: city.lat, lon: city.lon, label: `${city.name}, ${city.country}`, country: city.country }); setTab('map') }}
                    className="glass-panel glass-panel-hover rounded-xl p-3.5 border border-slate-800 text-left transition-all hover:shadow-lg hover:shadow-sky-500/5">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0"
                        style={{ backgroundColor: cat.color + '20', color: cat.color, border: `1px solid ${cat.color}40` }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-100 truncate">{city.name}</p>
                        <p className="text-[9px] text-slate-400">{city.country} · {city.continent}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-extrabold block" style={{ color: cat.color }}>{city.aqi}</span>
                        <span className="text-[8px] font-bold uppercase" style={{ color: cat.color }}>{cat.label}</span>
                      </div>
                    </div>

                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pctAQI}%`, backgroundColor: cat.color }} />
                    </div>

                    <div className="flex gap-2 text-[9px] text-slate-400">
                      <span>PM2.5: <b className="text-slate-200">{city.pm25}</b></span>
                      <span>NO₂: <b className="text-slate-200">{city.no2}</b></span>
                      <span>Pop: <b className="text-slate-200">{(city.population / 1e6).toFixed(1)}M</b></span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Global Hotspot Rankings */}
            <div className="glass-panel rounded-2xl p-4 border border-slate-800">
              <h3 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
                <Flame className="w-4 h-4" /> Global HCHO Hotspot Rankings — {GLOBAL_HOTSPOTS.length} Active Regions
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px] border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-left">
                      <th className="py-2 pr-2 font-bold">#</th>
                      <th className="py-2 pr-3 font-bold">Region</th>
                      <th className="py-2 pr-3 font-bold">Country</th>
                      <th className="py-2 pr-3 font-bold">Continent</th>
                      <th className="py-2 pr-3 font-bold">Max HCHO</th>
                      <th className="py-2 pr-3 font-bold">Fire Count</th>
                      <th className="py-2 pr-3 font-bold">Area (km²)</th>
                      <th className="py-2 pr-3 font-bold">Pop Exposed</th>
                      <th className="py-2 pr-3 font-bold">Cause</th>
                      <th className="py-2 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {GLOBAL_HOTSPOTS.sort((a, b) => b.max_hcho - a.max_hcho).map((hs, i) => {
                      const c = hs.status === 'Critical' ? '#ef4444' : hs.status === 'High' ? '#f59e0b' : hs.status === 'Active' ? '#fb923c' : '#34d399'
                      return (
                        <tr key={hs.id} className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                          onClick={() => { setLocation({ lat: hs.lat, lon: hs.lon, label: hs.region, country: hs.country }); setTab('map') }}>
                          <td className="py-2 pr-2 text-slate-500 font-bold">{i + 1}</td>
                          <td className="py-2 pr-3 text-slate-200 font-semibold">{hs.region}</td>
                          <td className="py-2 pr-3 text-slate-300">{hs.country}</td>
                          <td className="py-2 pr-3 text-slate-400">{hs.continent}</td>
                          <td className="py-2 pr-3 text-amber-400 font-bold">{hs.max_hcho}</td>
                          <td className="py-2 pr-3 text-red-400 font-bold">{hs.fires.toLocaleString()}</td>
                          <td className="py-2 pr-3 text-slate-300">{hs.area_km2.toLocaleString()}</td>
                          <td className="py-2 pr-3 text-purple-400">{(hs.pop_exposed / 1e6).toFixed(1)}M</td>
                          <td className="py-2 pr-3 text-slate-400">{hs.cause}</td>
                          <td className="py-2">
                            <span className="px-1.5 py-0.5 rounded font-bold text-[9px]" style={{ color: c, background: c + '20' }}>{hs.status}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── COMMAND CENTER TAB ──────────────────────────────────────────── */}
        {tab === 'command' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

            {/* Top 10 Most Polluted */}
            <div className="glass-panel rounded-2xl p-4 border border-slate-800">
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5" /> Most Polluted Cities (Top 10)
              </h3>
              <div className="space-y-2">
                {cityRankings.slice(0, 10).map((city, i) => {
                  const cat = getCategory(city.aqi)
                  return (
                    <div key={city.key} className="flex items-center gap-2.5">
                      <span className="text-[10px] text-slate-500 font-bold w-4 text-right shrink-0">{i + 1}</span>
                      <button onClick={() => { setLocation({ lat: city.lat, lon: city.lon, label: `${city.name}, ${city.country}`, country: city.country }); setTab('map') }}
                        className="flex-1 text-left">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-semibold text-slate-200 truncate">{city.name}, {city.country}</span>
                          <span className="text-xs font-extrabold ml-2 shrink-0" style={{ color: cat.color }}>{city.aqi}</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${Math.min((city.aqi / 500) * 100, 100)}%`, backgroundColor: cat.color }} />
                        </div>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Policy Alerts */}
            <div className="glass-panel rounded-2xl p-4 border border-slate-800">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Active Global Policy Alerts
              </h3>
              <div className="space-y-2.5">
                {[
                  { region: 'India — NCR/Punjab', alert: 'GRAP Stage-IV', detail: 'Emergency measures active. Brick kilns/diesel vehicles/construction banned.', color: '#ef4444', flag: '🇮🇳' },
                  { region: 'USA — California', alert: 'Red Flag Warning', detail: 'Critical fire weather. Evacuation orders Sierra Nevada/LA County.', color: '#f59e0b', flag: '🇺🇸' },
                  { region: 'Brazil — Amazon', alert: 'IBAMA Emergency', detail: 'Federal burn ban active. Deforestation fires threatening indigenous territory.', color: '#ef4444', flag: '🇧🇷' },
                  { region: 'China — Beijing', alert: 'Orange AQI Alert', detail: 'Heavy pollution alert. Odd-even vehicle restriction enforced.', color: '#f59e0b', flag: '🇨🇳' },
                  { region: 'Europe — Po Valley', alert: 'Exceeds EU Annual', detail: 'PM2.5 annual limit exceeded. Italy on EC watch list.', color: '#8b5cf6', flag: '🇮🇹' },
                  { region: 'Bangladesh — Dhaka', alert: 'High Industrial Load', detail: 'Brick kilns season active. AQI consistently exceeding 300.', color: '#ef4444', flag: '🇧🇩' },
                ].map((a, i) => (
                  <div key={i} className="p-2.5 rounded-xl border" style={{ borderColor: a.color + '25', backgroundColor: a.color + '08' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-200">{a.flag} {a.region}</span>
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full border animate-pulse" style={{ color: a.color, borderColor: a.color + '40' }}>{a.alert}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-relaxed">{a.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Statistics */}
            <div className="glass-panel rounded-2xl p-4 border border-slate-800">
              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" /> Platform Intelligence Summary
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: 'Cities Monitored', value: WORLD_CITIES.length + '+', color: '#38bdf8' },
                  { label: 'Active Hotspots', value: GLOBAL_HOTSPOTS.length, color: '#ef4444' },
                  { label: 'Data Sources', value: DATA_SOURCES.length, color: '#34d399' },
                  { label: 'Pollutants Tracked', value: POLLUTANTS.length, color: '#a78bfa' },
                  { label: 'People At Risk', value: '2.1B+', color: '#f59e0b' },
                  { label: 'Global Fire Count', value: GLOBAL_HOTSPOTS.reduce((a, h) => a + h.fires, 0).toLocaleString(), color: '#ff5500' },
                ].map((s, i) => (
                  <div key={i} className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/40 text-center">
                    <div className="text-lg font-extrabold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-[9px] text-slate-400">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="p-2.5 rounded-xl border border-slate-700 bg-slate-900/30">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">AI Model Status</p>
                {[
                  { name: 'CNN-LSTM AQI Engine', status: 'Running', r2: 0.87 },
                  { name: 'HCHO Hotspot Detector', status: 'Active', r2: 0.84 },
                  { name: 'Fire-AQI Causal Model', status: 'Active', r2: 0.79 },
                  { name: 'NLP Query Engine', status: 'Live', r2: null },
                ].map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-slate-800/40 last:border-0">
                    <span className="text-[9px] text-slate-300">{m.name}</span>
                    <div className="flex items-center gap-1.5">
                      {m.r2 && <span className="text-[9px] text-slate-400">R²={m.r2}</span>}
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">{m.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Global AQI Distribution Chart */}
            <div className="glass-panel rounded-2xl p-4 border border-slate-800 md:col-span-2">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" /> AQI Distribution Across {cityRankings.length} Global Cities
              </h3>
              <ResponsiveContainer width="100%" height={160}>
                <ComposedChart data={
                  AQI_CATEGORIES.map(c => ({
                    category: c.label,
                    count: cityRankings.filter(city => city.aqi >= c.range[0] && city.aqi <= c.range[1]).length,
                    color: c.color,
                  }))
                }>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="category" stroke="#475569" fontSize={9} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', fontSize: 10, borderRadius: 8 }} />
                  <Bar dataKey="count" radius={[4,4,0,0]} name="Cities">
                    {AQI_CATEGORIES.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Research & API */}
            <div className="glass-panel rounded-2xl p-4 border border-slate-800">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> API & Research Access
              </h3>
              <div className="space-y-2 text-[10px]">
                {[
                  { endpoint: 'GET /api/v1/aqi/global', desc: 'Global AQI for any coordinate' },
                  { endpoint: 'GET /api/v1/hcho/hotspots', desc: 'Active HCHO hotspot list' },
                  { endpoint: 'GET /api/v1/forecast/{loc}', desc: '7-day AQI forecast' },
                  { endpoint: 'GET /api/v1/fire/global', desc: 'NASA FIRMS fire data' },
                  { endpoint: 'GET /api/v1/rankings', desc: 'Global city AQI rankings' },
                  { endpoint: 'GET /api/v1/history/{loc}', desc: 'Historical time series' },
                ].map((api, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <code className="text-sky-400 text-[9px] block font-mono">{api.endpoint}</code>
                    <p className="text-slate-400 mt-0.5 text-[9px]">{api.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ══ STATUS BAR ════════════════════════════════════════════════════════ */}
      <footer className="shrink-0 bg-[#06090F]/90 border-t border-slate-800/50 px-4 py-1.5 flex items-center justify-between text-[9px] text-slate-500">
        <span className="flex items-center gap-2">
          <Globe2 className="w-3 h-3 text-sky-400" />
          <span>ATMOS-WATCH GLOBAL v2.0 — Earth Observation Air Intelligence Platform</span>
          <span className="text-slate-700">|</span>
          <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {location.label}</span>
          <span className="text-slate-700">|</span>
          <span>AQI: <b className="text-slate-300">{pollutants.aqi}</b></span>
        </span>
        <span className="flex items-center gap-3">
          <span>Sentinel-5P · MODIS/VIIRS · ERA5 · MERRA-2 · CAMS · OpenAQ · NASA FIRMS</span>
          <span className="flex items-center gap-1"><Cpu className="w-2.5 h-2.5 text-sky-400" /> CNN-LSTM v2.1 · R²=0.87</span>
        </span>
      </footer>
    </div>
  )
}
