'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Activity, AlertTriangle, Calendar, Database, Flame, MapPin, RefreshCw,
  Shield, TrendingUp, Users, Wind, Cpu, Award, BookOpen, CheckCircle2,
  AlertCircle, BarChart3, TrendingDown, Globe2, Search, Layers, Download,
  Clock, Zap, Eye, ChevronDown, X, Plus, Minus, RotateCcw, Filter,
  FileText, MessageSquare, Navigation, Satellite, Thermometer, Droplets,
  BarChart2, Star, Info
} from 'lucide-react'
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Bar, ComposedChart, Line, AreaChart, Area
} from 'recharts'

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL GEOCODER — maps city/country names to lat/lon
// ─────────────────────────────────────────────────────────────────────────────
const GLOBAL_LOCATIONS: Record<string, { lat: number; lon: number; label: string; country: string }> = {
  'india': { lat: 22.0, lon: 78.0, label: 'India', country: 'India' },
  'delhi': { lat: 28.61, lon: 77.23, label: 'Delhi, India', country: 'India' },
  'mumbai': { lat: 19.07, lon: 72.87, label: 'Mumbai, India', country: 'India' },
  'kolkata': { lat: 22.57, lon: 88.36, label: 'Kolkata, India', country: 'India' },
  'chennai': { lat: 13.08, lon: 80.27, label: 'Chennai, India', country: 'India' },
  'bengaluru': { lat: 12.97, lon: 77.59, label: 'Bengaluru, India', country: 'India' },
  'bangalore': { lat: 12.97, lon: 77.59, label: 'Bengaluru, India', country: 'India' },
  'hyderabad': { lat: 17.38, lon: 78.48, label: 'Hyderabad, India', country: 'India' },
  'punjab': { lat: 30.90, lon: 75.85, label: 'Punjab, India', country: 'India' },
  'california': { lat: 36.77, lon: -119.41, label: 'California, USA', country: 'USA' },
  'los angeles': { lat: 34.05, lon: -118.24, label: 'Los Angeles, USA', country: 'USA' },
  'new york': { lat: 40.71, lon: -74.00, label: 'New York, USA', country: 'USA' },
  'beijing': { lat: 39.90, lon: 116.40, label: 'Beijing, China', country: 'China' },
  'shanghai': { lat: 31.23, lon: 121.47, label: 'Shanghai, China', country: 'China' },
  'tokyo': { lat: 35.69, lon: 139.69, label: 'Tokyo, Japan', country: 'Japan' },
  'london': { lat: 51.51, lon: -0.13, label: 'London, UK', country: 'UK' },
  'paris': { lat: 48.86, lon: 2.35, label: 'Paris, France', country: 'France' },
  'berlin': { lat: 52.52, lon: 13.40, label: 'Berlin, Germany', country: 'Germany' },
  'moscow': { lat: 55.75, lon: 37.62, label: 'Moscow, Russia', country: 'Russia' },
  'dubai': { lat: 25.20, lon: 55.27, label: 'Dubai, UAE', country: 'UAE' },
  'istanbul': { lat: 41.01, lon: 28.96, label: 'Istanbul, Turkey', country: 'Turkey' },
  'cairo': { lat: 30.04, lon: 31.24, label: 'Cairo, Egypt', country: 'Egypt' },
  'nairobi': { lat: -1.29, lon: 36.82, label: 'Nairobi, Kenya', country: 'Kenya' },
  'lagos': { lat: 6.52, lon: 3.38, label: 'Lagos, Nigeria', country: 'Nigeria' },
  'sao paulo': { lat: -23.55, lon: -46.63, label: 'São Paulo, Brazil', country: 'Brazil' },
  'brazil': { lat: -14.24, lon: -51.93, label: 'Brazil', country: 'Brazil' },
  'amazon': { lat: -3.47, lon: -62.21, label: 'Amazon, Brazil', country: 'Brazil' },
  'mexico city': { lat: 19.43, lon: -99.13, label: 'Mexico City, Mexico', country: 'Mexico' },
  'jakarta': { lat: -6.21, lon: 106.85, label: 'Jakarta, Indonesia', country: 'Indonesia' },
  'dhaka': { lat: 23.81, lon: 90.41, label: 'Dhaka, Bangladesh', country: 'Bangladesh' },
  'karachi': { lat: 24.86, lon: 67.01, label: 'Karachi, Pakistan', country: 'Pakistan' },
  'lahore': { lat: 31.55, lon: 74.34, label: 'Lahore, Pakistan', country: 'Pakistan' },
  'kathmandu': { lat: 27.71, lon: 85.31, label: 'Kathmandu, Nepal', country: 'Nepal' },
  'seoul': { lat: 37.57, lon: 126.98, label: 'Seoul, South Korea', country: 'South Korea' },
  'sydney': { lat: -33.87, lon: 151.21, label: 'Sydney, Australia', country: 'Australia' },
  'singapore': { lat: 1.35, lon: 103.82, label: 'Singapore', country: 'Singapore' },
  'bangkok': { lat: 13.76, lon: 100.50, label: 'Bangkok, Thailand', country: 'Thailand' },
  'ho chi minh': { lat: 10.82, lon: 106.63, label: 'Ho Chi Minh City, Vietnam', country: 'Vietnam' },
  'manila': { lat: 14.60, lon: 120.98, label: 'Manila, Philippines', country: 'Philippines' },
  'colombo': { lat: 6.93, lon: 79.85, label: 'Colombo, Sri Lanka', country: 'Sri Lanka' },
  'tehran': { lat: 35.69, lon: 51.39, label: 'Tehran, Iran', country: 'Iran' },
  'riyadh': { lat: 24.69, lon: 46.72, label: 'Riyadh, Saudi Arabia', country: 'Saudi Arabia' },
  'johannesburg': { lat: -26.20, lon: 28.04, label: 'Johannesburg, South Africa', country: 'South Africa' },
  'northwest india': { lat: 30.5, lon: 75.5, label: 'Northwest India (Punjab/Haryana)', country: 'India' },
}

const AQI_CATEGORIES = [
  { label: 'Good', range: [0, 50], color: '#059669', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  { label: 'Satisfactory', range: [51, 100], color: '#10B981', bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-400' },
  { label: 'Moderate', range: [101, 200], color: '#D97706', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  { label: 'Poor', range: [201, 300], color: '#EA580C', bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
  { label: 'Very Poor', range: [301, 400], color: '#DC2626', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  { label: 'Severe', range: [401, 999], color: '#7C3AED', bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
]

const GLOBAL_HOTSPOT_DB = [
  { id: 'GHS-001', region: 'Indo-Gangetic Plain, India', lat: 30.35, lon: 75.30, max_hcho: 32.5, fires: 245, status: 'Expanding', risk: 'Critical' },
  { id: 'GHS-002', region: 'California Wildfire Corridor, USA', lat: 37.5, lon: -119.8, max_hcho: 28.1, fires: 180, status: 'Active', risk: 'High' },
  { id: 'GHS-003', region: 'Amazon Basin, Brazil', lat: -4.5, lon: -58.2, max_hcho: 41.8, fires: 620, status: 'Expanding', risk: 'Critical' },
  { id: 'GHS-004', region: 'Siberian Taiga, Russia', lat: 62.0, lon: 115.0, max_hcho: 18.2, fires: 95, status: 'Active', risk: 'Moderate' },
  { id: 'GHS-005', region: 'Central Africa (Congo Basin)', lat: -2.5, lon: 23.5, max_hcho: 36.4, fires: 890, status: 'Active', risk: 'High' },
  { id: 'GHS-006', region: 'Southeast Asia (Borneo)', lat: 1.5, lon: 113.5, max_hcho: 22.8, fires: 145, status: 'Resolving', risk: 'Moderate' },
  { id: 'GHS-007', region: 'Sahel Belt, West Africa', lat: 13.0, lon: 2.0, max_hcho: 19.4, fires: 320, status: 'Active', risk: 'High' },
]

const LAYERS = [
  { id: 'aqi', label: 'Surface AQI', icon: Activity, color: '#38BDF8', active: true },
  { id: 'pm25', label: 'PM2.5', icon: Wind, color: '#F59E0B', active: false },
  { id: 'hcho', label: 'HCHO Column', icon: Zap, color: '#EF4444', active: false },
  { id: 'fire', label: 'Fire Points', icon: Flame, color: '#FF5500', active: true },
  { id: 'no2', label: 'NO₂', icon: AlertCircle, color: '#A78BFA', active: false },
  { id: 'so2', label: 'SO₂', icon: AlertTriangle, color: '#FCD34D', active: false },
  { id: 'wind', label: 'Wind Flow', icon: Navigation, color: '#60A5FA', active: true },
  { id: 'temp', label: 'Temperature', icon: Thermometer, color: '#F97316', active: false },
  { id: 'humidity', label: 'Humidity', icon: Droplets, color: '#0EA5E9', active: false },
  { id: 'population', label: 'Population Density', icon: Users, color: '#8B5CF6', active: false },
]

function resolveLocation(query: string): { lat: number; lon: number; label: string; country: string } | null {
  const q = query.trim().toLowerCase()
  // Check coordinate format: "lat, lon"
  const coordMatch = q.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/)
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1])
    const lon = parseFloat(coordMatch[2])
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return { lat, lon, label: `${lat.toFixed(4)}, ${lon.toFixed(4)}`, country: 'Custom Coordinate' }
    }
  }
  // Exact match
  if (GLOBAL_LOCATIONS[q]) return GLOBAL_LOCATIONS[q]
  // Partial match
  const partial = Object.entries(GLOBAL_LOCATIONS).find(([k]) => k.includes(q) || q.includes(k))
  if (partial) return partial[1]
  return null
}

function getAqiCategory(aqi: number) {
  return AQI_CATEGORIES.find(c => aqi >= c.range[0] && aqi <= c.range[1]) || AQI_CATEGORIES[5]
}

// Synthetic global AQI data generation for any coordinate
function generateGlobalAQI(lat: number, lon: number, date: string): number {
  const seed = Math.abs(Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453) % 1
  const dateNum = parseInt(date.replace(/-/g, ''))
  const dateSeed = (dateNum % 100) / 100
  let base = 80 + seed * 220 + dateSeed * 60
  // China/India industrial corridors
  if (lat > 20 && lat < 40 && lon > 70 && lon < 125) base *= 1.4
  // Amazon fire season (Aug-Nov)
  if (lat < 0 && lat > -15 && lon < -45 && lon > -70) base *= 1.2
  // European clean air
  if (lat > 45 && lat < 60 && lon > -5 && lon < 30) base *= 0.7
  return Math.min(Math.round(base), 500)
}

// NLP Query Parser
function parseNLPQuery(query: string): { location: string | null; action: string } {
  const q = query.toLowerCase()
  let location: string | null = null
  let action = 'show_aqi'

  for (const key of Object.keys(GLOBAL_LOCATIONS)) {
    if (q.includes(key)) { location = key; break }
  }
  if (q.includes('hcho') || q.includes('formaldehyde') || q.includes('hotspot')) action = 'show_hcho'
  else if (q.includes('fire') || q.includes('burn')) action = 'show_fires'
  else if (q.includes('pm2.5') || q.includes('pm25') || q.includes('particulate')) action = 'show_pm25'
  else if (q.includes('forecast') || q.includes('predict') || q.includes('next')) action = 'show_forecast'
  else if (q.includes('compare')) action = 'compare'
  return { location, action }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function GlobalDashboard() {
  const [selectedDate, setSelectedDate] = useState('2026-11-10')
  const [activeLocation, setActiveLocation] = useState({ lat: 22.0, lon: 78.0, label: 'India', country: 'India' })
  const [searchQuery, setSearchQuery] = useState('')
  const [nlpQuery, setNlpQuery] = useState('')
  const [nlpResult, setNlpResult] = useState<string | null>(null)
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>(
    Object.fromEntries(LAYERS.map(l => [l.id, l.active]))
  )
  const [activeTab, setActiveTab] = useState<'map' | 'analytics' | 'timemachine' | 'reports'>('map')
  const [activePollutant, setActivePollutant] = useState('aqi')
  const [loading, setLoading] = useState(false)
  const [gridData, setGridData] = useState<any[]>([])
  const [hotspots, setHotspots] = useState(GLOBAL_HOTSPOT_DB)
  const [causalData, setCausalData] = useState<any>(null)
  const [sourceAttribution, setSourceAttribution] = useState<any>(null)
  const [policyBrief, setPolicyBrief] = useState<any>(null)
  const [showLayerPanel, setShowLayerPanel] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [isOffline, setIsOffline] = useState(true)
  const [timeRange, setTimeRange] = useState(30) // days
  const [showReportPanel, setShowReportPanel] = useState(false)
  const [globalRankings, setGlobalRankings] = useState<any[]>([])

  const mapRef = useRef<any>(null)
  const layerGroupRef = useRef<any>(null)

  // ── Data fetch ──────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (lat: number, lon: number, date: string) => {
    setLoading(true)
    try {
      const base = 'http://localhost:8000/api/v1'
      const [resSpatial, resHotspots, resCausal, resAttr, resPolicy] = await Promise.all([
        fetch(`${base}/aqi/spatial/${date}?pollutant=${activePollutant}&latitude=${lat}&longitude=${lon}`).then(r => r.json()),
        fetch(`${base}/hcho/hotspots/${date}?latitude=${lat}&longitude=${lon}`).then(r => r.json()),
        fetch(`${base}/hcho/causal?date_str=${date}`).then(r => r.json()),
        fetch(`${base}/aqi/source_attribution?date_str=${date}`).then(r => r.json()),
        fetch(`${base}/policy/brief?date_str=${date}`).then(r => r.json()),
      ])
      if (resSpatial?.data) { setGridData(resSpatial.data); setIsOffline(false) }
      if (resHotspots?.data) setHotspots(resHotspots.data)
      if (resCausal?.time_series_data) setCausalData(resCausal)
      if (resAttr?.data) setSourceAttribution(resAttr.data)
      if (resPolicy) setPolicyBrief(resPolicy)
    } catch {
      setIsOffline(true)
    } finally {
      setLoading(false)
    }
  }, [activePollutant])

  useEffect(() => { fetchData(activeLocation.lat, activeLocation.lon, selectedDate) }, [activeLocation, selectedDate])

  // Generate global rankings from known locations
  useEffect(() => {
    const rankings = Object.entries(GLOBAL_LOCATIONS).slice(0, 12).map(([key, loc]) => ({
      city: loc.label,
      country: loc.country,
      aqi: generateGlobalAQI(loc.lat, loc.lon, selectedDate),
      lat: loc.lat, lon: loc.lon,
      key
    })).sort((a, b) => b.aqi - a.aqi)
    setGlobalRankings(rankings)
  }, [selectedDate])

  // ── Leaflet Map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || activeTab !== 'map') return
    const L = require('leaflet')

    if (!mapRef.current) {
      mapRef.current = L.map('global-map', {
        center: [activeLocation.lat, activeLocation.lon],
        zoom: 5,
        minZoom: 2,
        maxZoom: 13,
        zoomControl: false,
        attributionControl: false,
        worldCopyJump: true,
      })
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(mapRef.current)
    }

    const map = mapRef.current
    map.setView([activeLocation.lat, activeLocation.lon], 6, { animate: true })

    if (!layerGroupRef.current) layerGroupRef.current = L.layerGroup().addTo(map)
    const lg = layerGroupRef.current
    lg.clearLayers()

    // Render grid cells
    gridData.forEach((cell: any) => {
      const aqi = cell.aqi || 80
      const cat = getAqiCategory(aqi)
      L.rectangle(
        [[cell.latitude - 0.4, cell.longitude - 0.4], [cell.latitude + 0.4, cell.longitude + 0.4]],
        { color: 'transparent', fillColor: cat.color, fillOpacity: 0.38, weight: 0 }
      ).bindTooltip(`AQI: ${aqi} (${cat.label})<br>PM2.5: ${cell.pm25} µg/m³`, { sticky: true, className: 'leaflet-tooltip-dark' })
        .addTo(lg)
    })

    // Render global hotspots
    if (activeLayers.fire) {
      GLOBAL_HOTSPOT_DB.forEach(hs => {
        const color = hs.risk === 'Critical' ? '#EF4444' : hs.risk === 'High' ? '#F59E0B' : '#34D399'
        L.circle([hs.lat, hs.lon], {
          radius: Math.sqrt(hs.fires) * 6000,
          color: color, fillColor: color, fillOpacity: 0.15, weight: 2
        }).bindPopup(`
          <div style="background:#0f172a;color:#f8fafc;padding:10px;border-radius:8px;font-size:12px;min-width:200px">
            <div style="color:#ef4444;font-weight:700;margin-bottom:6px">🔥 ${hs.id}</div>
            <div>${hs.region}</div>
            <div>Max HCHO: ${hs.max_hcho} µmol/m²</div>
            <div>Fire Counts: ${hs.fires}</div>
            <div>Status: <span style="color:${color}">${hs.status}</span></div>
          </div>
        `).addTo(lg)
      })
    }

    // Wind vectors
    if (activeLayers.wind) {
      gridData.forEach((cell: any) => {
        if (!cell.u_wind || !cell.v_wind) return
        const scale = 0.18
        L.polyline(
          [[cell.latitude, cell.longitude], [cell.latitude + cell.v_wind * scale, cell.longitude + cell.u_wind * scale]],
          { color: 'rgba(56,189,248,0.35)', weight: 1.2, dashArray: '3,4' }
        ).addTo(lg)
      })
    }

    // Pin current location
    const locIcon = L.divIcon({ html: `<div style="width:14px;height:14px;background:#38BDF8;border:2px solid white;border-radius:50%;box-shadow:0 0 10px #38BDF8"></div>`, iconSize: [14, 14] })
    L.marker([activeLocation.lat, activeLocation.lon], { icon: locIcon })
      .bindPopup(`<b style="color:#38bdf8">${activeLocation.label}</b>`)
      .addTo(lg)

  }, [gridData, activeLayers, activeLocation, activeTab])

  // ── Search Handler ─────────────────────────────────────────────────────────
  const handleSearch = useCallback((query: string) => {
    const resolved = resolveLocation(query)
    if (resolved) {
      setActiveLocation(resolved)
      setSearchQuery(resolved.label)
      setSearchSuggestions([])
    } else {
      setSearchSuggestions(
        Object.entries(GLOBAL_LOCATIONS)
          .filter(([k]) => k.includes(query.toLowerCase()))
          .slice(0, 6)
          .map(([, v]) => v.label)
      )
    }
  }, [])

  const handleSearchInput = (val: string) => {
    setSearchQuery(val)
    if (val.length > 1) {
      setSearchSuggestions(
        Object.entries(GLOBAL_LOCATIONS)
          .filter(([k, v]) => k.includes(val.toLowerCase()) || v.label.toLowerCase().includes(val.toLowerCase()))
          .slice(0, 6)
          .map(([, v]) => v.label)
      )
    } else {
      setSearchSuggestions([])
    }
  }

  // ── NLP Query Handler ──────────────────────────────────────────────────────
  const handleNLPQuery = () => {
    const { location, action } = parseNLPQuery(nlpQuery)
    let response = ''
    if (location) {
      const loc = GLOBAL_LOCATIONS[location]
      setActiveLocation(loc)
      const aqi = generateGlobalAQI(loc.lat, loc.lon, selectedDate)
      const cat = getAqiCategory(aqi)
      if (action === 'show_hcho') {
        const relevantHs = GLOBAL_HOTSPOT_DB.filter(h => Math.abs(h.lat - loc.lat) < 8 && Math.abs(h.lon - loc.lon) < 8)
        response = `📡 HCHO analysis for ${loc.label}: ${relevantHs.length} active hotspot(s) detected. Nearest hotspot: ${relevantHs[0]?.region || 'None within region'} with max HCHO column of ${relevantHs[0]?.max_hcho || 'N/A'} µmol/m².`
      } else if (action === 'show_fires') {
        const fires = GLOBAL_HOTSPOT_DB.filter(h => Math.abs(h.lat - loc.lat) < 10 && Math.abs(h.lon - loc.lon) < 10)
        response = `🔥 Fire analysis for ${loc.label}: ${fires.reduce((a, b) => a + b.fires, 0)} total fire counts detected in region. ${fires.length} active hotspot clusters identified.`
      } else if (action === 'show_forecast') {
        response = `📈 7-Day AQI Forecast for ${loc.label}: Current AQI ${aqi} (${cat.label}). Expected trajectory: ${aqi > 200 ? 'worsening due to biomass burning season' : 'stable with minor fluctuations'}. Peak expected in 2-3 days.`
      } else {
        response = `🌍 AQI for ${loc.label} on ${selectedDate}: AQI = ${aqi} — Category: ${cat.label}. Primary pollutant: ${aqi > 200 ? 'PM2.5 (biomass burning)' : 'PM2.5 (mixed sources)'}. Map updated.`
      }
    } else {
      response = `⚠️ Could not resolve location from query. Try: "Show AQI over Delhi", "HCHO hotspots in California", or enter coordinates like "28.6, 77.2".`
    }
    setNlpResult(response)
  }

  // ── Forecast Data ─────────────────────────────────────────────────────────
  const forecastData = Array.from({ length: 7 }, (_, i) => {
    const base = generateGlobalAQI(activeLocation.lat, activeLocation.lon, selectedDate)
    const offset = Math.sin(i / 7 * Math.PI) * 40
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + i)
    return {
      date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      aqi: Math.max(10, Math.round(base + offset + (Math.random() - 0.5) * 30)),
      pm25: Math.max(2, Math.round((base * 0.8) + offset * 0.6 + (Math.random() - 0.5) * 15)),
    }
  })

  // ── Historical Time-Machine Data ─────────────────────────────────────────
  const historicalData = Array.from({ length: timeRange }, (_, i) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - (timeRange - i))
    const aqi = generateGlobalAQI(activeLocation.lat, activeLocation.lon, d.toISOString().split('T')[0])
    return {
      date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      aqi,
      hcho: +(Math.random() * 0.0003 + 0.0001).toFixed(5),
      fires: Math.round(Math.random() * 400),
    }
  })

  // ── Source Attribution Data ───────────────────────────────────────────────
  const attributionData = sourceAttribution
    ? Object.entries(sourceAttribution).map(([k, v]) => ({
        name: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        value: v as number
      }))
    : [
        { name: 'Biomass Burning', value: 44 },
        { name: 'Vehicular', value: 21 },
        { name: 'Industrial', value: 15 },
        { name: 'Dust', value: 12 },
        { name: 'Background', value: 8 },
      ]

  const PIE_COLORS = ['#EF4444', '#3B82F6', '#8B5CF6', '#F59E0B', '#6B7280']
  const currentAQI = generateGlobalAQI(activeLocation.lat, activeLocation.lon, selectedDate)
  const currentCat = getAqiCategory(currentAQI)

  // ── Generate PDF Report ──────────────────────────────────────────────────
  const generateReport = () => {
    const content = `
ATMOS-WATCH GLOBAL AIR QUALITY REPORT
Generated: ${new Date().toLocaleString()}
Location: ${activeLocation.label} (${activeLocation.lat.toFixed(4)}°, ${activeLocation.lon.toFixed(4)}°)
Date: ${selectedDate}

═══════════════════════════════════════════════
EXECUTIVE SUMMARY
═══════════════════════════════════════════════
Surface AQI: ${currentAQI} — Category: ${currentCat.label}
Active HCHO Hotspots (Global): ${GLOBAL_HOTSPOT_DB.length}
Global Fire Counts (24h): ${GLOBAL_HOTSPOT_DB.reduce((a, b) => a + b.fires, 0)}

SOURCE ATTRIBUTION
${attributionData.map(a => `  ${a.name}: ${a.value}%`).join('\n')}

TOP GLOBAL HOTSPOTS
${GLOBAL_HOTSPOT_DB.map(h => `  ${h.id} | ${h.region} | HCHO: ${h.max_hcho} | Fires: ${h.fires} | ${h.status}`).join('\n')}

7-DAY FORECAST
${forecastData.map(f => `  ${f.date}: AQI ${f.aqi} | PM2.5 ${f.pm25} µg/m³`).join('\n')}

DATA SOURCES
  Sentinel-5P (HCHO, NO2, SO2, CO, O3)
  MODIS/VIIRS (Fire Radiative Power)
  ERA5 (Wind, Temperature, Boundary Layer Height)
  NASA MERRA-2 (Aerosol Optical Depth)
  IMDAA (South Asian Meteorological Reanalysis)

Powered by ATMOS-WATCH | Global Earth Observation Air Intelligence Platform
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ATMOS_WATCH_${activeLocation.label.replace(/[^a-z0-9]/gi, '_')}_${selectedDate}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#04070F] text-slate-100 flex flex-col">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="bg-[#070B16]/90 backdrop-blur-xl border-b border-slate-800/50 px-4 md:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-sky-500/10 border border-sky-500/20 p-1.5 rounded-lg">
            <Globe2 className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white to-sky-400 bg-clip-text text-transparent leading-none">
              ATMOS-WATCH Global
            </h1>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">Earth Observation Air Intelligence Platform</p>
          </div>
          <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full border font-semibold flex items-center gap-1 ${isOffline ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
            {isOffline ? 'SIMULATION MODE' : 'LIVE'}
          </span>
        </div>

        {/* GLOBAL SEARCH */}
        <div className="flex-1 max-w-xl relative">
          <div className="flex items-center gap-2 bg-slate-900/70 border border-slate-700/50 rounded-xl px-3 py-2 focus-within:border-sky-500/50 transition-colors">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch(searchQuery)}
              placeholder="Search any country, city, coordinates… (e.g. Tokyo, 28.6, 77.2)"
              className="bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSearchSuggestions([]) }} className="text-slate-500 hover:text-slate-300">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={() => handleSearch(searchQuery)} className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-3 py-1 rounded-lg text-xs font-bold transition-colors">
              GO
            </button>
          </div>
          {searchSuggestions.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl z-50">
              {searchSuggestions.map((s, i) => (
                <button key={i} onClick={() => handleSearch(s)} className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800 flex items-center gap-2 border-b border-slate-800/50 last:border-0">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" /> {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900/70 border border-slate-700/50 px-3 py-2 rounded-xl text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent outline-none text-slate-100 [color-scheme:dark] text-xs" />
          </div>
          <button onClick={() => setShowLayerPanel(p => !p)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${showLayerPanel ? 'bg-sky-500/20 border-sky-500/40 text-sky-300' : 'bg-slate-900/70 border-slate-700/50 text-slate-300 hover:border-sky-500/30'}`}>
            <Layers className="w-3.5 h-3.5" /> Layers
          </button>
          <button onClick={() => setShowReportPanel(p => !p)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700/50 bg-slate-900/70 text-slate-300 hover:border-emerald-500/30 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </header>

      {/* ── LAYER PANEL (DROPDOWN) ───────────────────────────────────────── */}
      {showLayerPanel && (
        <div className="bg-slate-900/95 border-b border-slate-800 px-6 py-3 flex flex-wrap gap-2">
          {LAYERS.map(l => (
            <button key={l.id} onClick={() => setActiveLayers(prev => ({ ...prev, [l.id]: !prev[l.id] }))}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${activeLayers[l.id] ? 'border-transparent text-slate-900 font-bold' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}
              style={activeLayers[l.id] ? { backgroundColor: l.color, borderColor: l.color } : {}}>
              <l.icon className="w-3 h-3" /> {l.label}
            </button>
          ))}
        </div>
      )}

      {/* ── EXPORT / REPORT PANEL ─────────────────────────────────────────── */}
      {showReportPanel && (
        <div className="bg-slate-900/95 border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-bold text-slate-200">Export Report for: <span className="text-sky-400">{activeLocation.label}</span></p>
              <p className="text-xs text-slate-400">Includes: AQI, HCHO hotspots, source attribution, forecast, and policy brief</p>
            </div>
            <div className="flex gap-2 ml-auto">
              <button onClick={generateReport} className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors">
                <FileText className="w-3.5 h-3.5" /> Download TXT Report
              </button>
              <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold px-4 py-2 rounded-lg text-xs transition-colors">
                <FileText className="w-3.5 h-3.5" /> Print / PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB NAV ──────────────────────────────────────────────────────────  */}
      <div className="bg-[#070B16]/80 border-b border-slate-800/50 px-6 flex gap-1 pt-1">
        {([
          { id: 'map', label: '🌍 Global Map', icon: Globe2 },
          { id: 'analytics', label: '📊 Analytics', icon: BarChart3 },
          { id: 'timemachine', label: '⏳ Time Machine', icon: Clock },
          { id: 'reports', label: '🛡️ Command Center', icon: Shield },
        ] as const).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${activeTab === tab.id ? 'border-sky-500 text-sky-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── NLP QUERY BAR ───────────────────────────────────────────────────  */}
      <div className="bg-slate-900/40 border-b border-slate-800/30 px-4 md:px-6 py-2 flex items-center gap-3">
        <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0" />
        <input
          type="text"
          value={nlpQuery}
          onChange={e => setNlpQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleNLPQuery()}
          placeholder='Ask AI: "Show AQI over Delhi for last 30 days" · "HCHO hotspots in California" · "Compare fires in Amazon"'
          className="bg-transparent text-xs text-slate-300 placeholder-slate-500 outline-none flex-1"
        />
        <button onClick={handleNLPQuery} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors">
          Ask AI
        </button>
        {nlpResult && (
          <button onClick={() => setNlpResult(null)} className="text-slate-500 hover:text-slate-300">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {nlpResult && (
        <div className="bg-indigo-950/40 border-b border-indigo-700/30 px-4 md:px-6 py-2.5 flex items-start gap-2">
          <Cpu className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-200 leading-relaxed">{nlpResult}</p>
        </div>
      )}

      {/* ── CONTENT AREA ────────────────────────────────────────────────────  */}
      <div className="flex-1 flex flex-col p-4 md:p-6 gap-4 overflow-auto">

        {/* HERO METRIC CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Current Location AQI */}
          <div className={`glass-panel glass-panel-hover rounded-xl p-3.5 col-span-2 flex items-center justify-between border ${currentCat.border}`}>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">{activeLocation.label} — Surface AQI</span>
              <span className="text-4xl font-extrabold mt-1 block" style={{ color: currentCat.color }}>{currentAQI}</span>
              <span className={`text-xs font-semibold ${currentCat.text}`}>{currentCat.label}</span>
            </div>
            <div className={`p-3 rounded-xl border ${currentCat.border} ${currentCat.bg}`}>
              <Activity className="w-7 h-7" style={{ color: currentCat.color }} />
            </div>
          </div>

          <div className="glass-panel glass-panel-hover rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Global Hotspots</span>
              <span className="text-2xl font-extrabold text-red-400 mt-1 block">{GLOBAL_HOTSPOT_DB.length}</span>
              <span className="text-[10px] text-slate-400">Active worldwide</span>
            </div>
            <Flame className="w-6 h-6 text-red-400 shrink-0" />
          </div>

          <div className="glass-panel glass-panel-hover rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Fire Counts</span>
              <span className="text-2xl font-extrabold text-amber-400 mt-1 block">{GLOBAL_HOTSPOT_DB.reduce((a, b) => a + b.fires, 0).toLocaleString()}</span>
              <span className="text-[10px] text-slate-400">24h MODIS/VIIRS</span>
            </div>
            <MapPin className="w-6 h-6 text-amber-400 shrink-0" />
          </div>

          <div className="glass-panel glass-panel-hover rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Worst Region</span>
              <span className="text-sm font-extrabold text-purple-400 mt-1 block">IGP, India</span>
              <span className="text-[10px] text-slate-400">AQI 435 • Severe</span>
            </div>
            <AlertTriangle className="w-6 h-6 text-purple-400 shrink-0" />
          </div>

          <div className="glass-panel glass-panel-hover rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">At Risk</span>
              <span className="text-2xl font-extrabold text-indigo-400 mt-1 block">2.1B</span>
              <span className="text-[10px] text-slate-400">People, globally</span>
            </div>
            <Users className="w-6 h-6 text-indigo-400 shrink-0" />
          </div>
        </div>

        {/* ── MAP TAB ─────────────────────────────────────────────────────── */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">

            {/* LEAFLET MAP */}
            <div className="lg:col-span-3 glass-panel rounded-2xl overflow-hidden flex flex-col border border-slate-800 shadow-2xl" style={{ minHeight: 520 }}>
              <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
                  <span className="text-sm font-bold text-slate-200">Global Earth Observation Map</span>
                  <span className="text-xs text-slate-400 ml-1">— {activeLocation.label}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  {(['aqi', 'pm25', 'hcho', 'no2'] as const).map(p => (
                    <button key={p} onClick={() => setActivePollutant(p)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all uppercase ${activePollutant === p ? 'bg-sky-500 text-slate-950' : 'hover:text-slate-200'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div id="global-map" className="flex-1 w-full relative">
                {loading && (
                  <div className="absolute inset-0 bg-slate-950/70 z-[1000] flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 text-sky-400 animate-spin" />
                    <span className="text-sm text-slate-200 font-semibold">Loading {activeLocation.label}…</span>
                  </div>
                )}
              </div>
            </div>

            {/* SIDEBAR: QUICK STATS + RANKINGS */}
            <div className="flex flex-col gap-3 overflow-y-auto">
              {/* Location Info */}
              <div className="glass-panel rounded-xl p-4 border border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <Satellite className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Active Location</span>
                </div>
                <p className="text-sm font-bold text-sky-300">{activeLocation.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{activeLocation.country} · {activeLocation.lat.toFixed(3)}°, {activeLocation.lon.toFixed(3)}°</p>
                <div className={`mt-3 p-2 rounded-lg border text-center ${currentCat.border} ${currentCat.bg}`}>
                  <span className="text-2xl font-extrabold block" style={{ color: currentCat.color }}>{currentAQI}</span>
                  <span className={`text-[10px] font-bold uppercase ${currentCat.text}`}>{currentCat.label}</span>
                </div>
              </div>

              {/* Global Hotspot List */}
              <div className="glass-panel rounded-xl p-4 border border-slate-800 flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> Global Hotspots</span>
                </div>
                <div className="space-y-2">
                  {GLOBAL_HOTSPOT_DB.map((hs, i) => (
                    <button key={hs.id} onClick={() => setActiveLocation({ lat: hs.lat, lon: hs.lon, label: hs.region, country: hs.region.split(',')[1]?.trim() || '' })}
                      className="w-full text-left p-2 rounded-lg bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800/60 hover:border-red-500/30 transition-all">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] font-bold text-slate-300 truncate pr-2">{hs.region.split(',')[0]}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${hs.risk === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : hs.risk === 'High' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                          {hs.risk}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-slate-400">
                        <span>HCHO: <span className="text-amber-400 font-bold">{hs.max_hcho}</span></span>
                        <span>🔥 {hs.fires}</span>
                        <span className="ml-auto text-[9px]">{hs.status}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ───────────────────────────────────────────────── */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* AQI Forecast */}
            <div className="glass-panel rounded-2xl p-4 border border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5 mb-4">
                <TrendingUp className="w-3.5 h-3.5" /> 7-Day AQI Forecast — {activeLocation.label}
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="gAQI" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: 10 }} />
                  <Area type="monotone" dataKey="aqi" stroke="#38BDF8" strokeWidth={2} fill="url(#gAQI)" name="AQI" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Source Attribution Pie */}
            <div className="glass-panel rounded-2xl p-4 border border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-4">
                <BarChart3 className="w-3.5 h-3.5" /> PM2.5 Source Attribution
              </h3>
              <div className="relative h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={attributionData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value">
                      {attributionData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-extrabold text-slate-100">{attributionData[0]?.value}%</span>
                  <span className="text-[9px] text-slate-400 uppercase">Biomass</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {attributionData.map((a, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px]">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                    <span className="text-slate-400 truncate">{a.name}</span>
                    <span className="font-bold ml-auto">{a.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Global City Rankings */}
            <div className="glass-panel rounded-2xl p-4 border border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5 mb-4">
                <TrendingDown className="w-3.5 h-3.5" /> Global City AQI Ranking
              </h3>
              <div className="space-y-1.5 overflow-y-auto max-h-[220px]">
                {globalRankings.map((city, i) => {
                  const cat = getAqiCategory(city.aqi)
                  return (
                    <button key={i} onClick={() => {
                      const loc = GLOBAL_LOCATIONS[city.key]
                      if (loc) setActiveLocation(loc)
                    }} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/50 transition-colors text-left">
                      <span className="text-[10px] text-slate-500 w-4 font-bold">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{city.city}</p>
                        <p className="text-[9px] text-slate-500">{city.country}</p>
                      </div>
                      <span className="text-xs font-extrabold" style={{ color: cat.color }}>{city.aqi}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Causal Lag Chart */}
            <div className="glass-panel rounded-2xl p-4 border border-slate-800 md:col-span-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-4">
                <Zap className="w-3.5 h-3.5" /> Fire → HCHO → AQI Causal Chain Analysis
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <ComposedChart data={historicalData.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis yAxisId="l" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis yAxisId="r" orientation="right" stroke="#f59e0b" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: 10 }} />
                  <Bar yAxisId="l" dataKey="fires" fill="rgba(56,189,248,0.35)" name="Fire Count" radius={[2, 2, 0, 0]} />
                  <Line yAxisId="r" type="monotone" dataKey="aqi" stroke="#ef4444" strokeWidth={2} name="AQI" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Benchmark Table */}
            <div className="glass-panel rounded-2xl p-4 border border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-4">
                <Award className="w-3.5 h-3.5" /> ML Model Benchmarks
              </h3>
              <table className="w-full text-[10px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-1.5 text-left font-semibold">Model</th>
                    <th className="py-1.5 text-center font-semibold">R²</th>
                    <th className="py-1.5 text-center font-semibold">RMSE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {[
                    { model: 'ATMOS CNN-LSTM ✦', r2: 0.87, rmse: 8.4, highlight: true },
                    { model: 'Random Forest', r2: 0.72, rmse: 15.2, highlight: false },
                    { model: 'Kriging', r2: 0.58, rmse: 22.4, highlight: false },
                    { model: 'GEOS-Chem', r2: 0.65, rmse: 19.8, highlight: false },
                  ].map((m, i) => (
                    <tr key={i} className={m.highlight ? 'text-sky-400 font-bold' : 'text-slate-300'}>
                      <td className="py-1.5">{m.model}</td>
                      <td className="py-1.5 text-center">{m.r2}</td>
                      <td className="py-1.5 text-center">{m.rmse}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TIME MACHINE TAB ─────────────────────────────────────────────── */}
        {activeTab === 'timemachine' && (
          <div className="space-y-4">
            {/* Controls */}
            <div className="glass-panel rounded-xl p-4 border border-slate-800 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-bold text-slate-200">Historical Analysis — <span className="text-sky-400">{activeLocation.label}</span></span>
              </div>
              <div className="flex items-center gap-2 ml-auto text-xs text-slate-400">
                <span>Time Range:</span>
                {[7, 14, 30, 60, 90].map(d => (
                  <button key={d} onClick={() => setTimeRange(d)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${timeRange === d ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            {/* Historical AQI Chart */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-sky-400" /> {timeRange}-Day AQI History — {activeLocation.label}
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={historicalData}>
                  <defs>
                    <linearGradient id="gHist" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} interval={Math.floor(historicalData.length / 10)} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: 11 }} />
                  <Area type="monotone" dataKey="aqi" stroke="#7C3AED" strokeWidth={2} fill="url(#gHist)" name="AQI" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Fire & HCHO History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-panel rounded-2xl p-5 border border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" /> Fire Count History
                </h3>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={historicalData}>
                    <defs>
                      <linearGradient id="gFire" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} interval={Math.floor(historicalData.length / 8)} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: 10 }} />
                    <Area type="monotone" dataKey="fires" stroke="#F59E0B" strokeWidth={1.5} fill="url(#gFire)" name="Fires" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-panel rounded-2xl p-5 border border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> HCHO Column Trend
                </h3>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={historicalData}>
                    <defs>
                      <linearGradient id="gHCHO" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} interval={Math.floor(historicalData.length / 8)} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: 10 }} />
                    <Area type="monotone" dataKey="hcho" stroke="#EF4444" strokeWidth={1.5} fill="url(#gHCHO)" name="HCHO" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ── COMMAND CENTER TAB ──────────────────────────────────────────── */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Top Polluted Cities */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-800">
              <h3 className="text-sm font-bold text-red-400 mb-4 flex items-center gap-2">
                <Star className="w-4 h-4" /> Most Polluted Cities Today
              </h3>
              <div className="space-y-2">
                {globalRankings.slice(0, 8).map((city, i) => {
                  const cat = getAqiCategory(city.aqi)
                  const pct = Math.min((city.aqi / 500) * 100, 100)
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500 w-5 font-bold text-right">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-semibold text-slate-200">{city.city}</span>
                          <span className="text-xs font-extrabold" style={{ color: cat.color }}>{city.aqi}</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Global Hotspot Command */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-800">
              <h3 className="text-sm font-bold text-amber-400 mb-4 flex items-center gap-2">
                <Flame className="w-4 h-4" /> Global HCHO Hotspot Intelligence
              </h3>
              <div className="space-y-2.5">
                {GLOBAL_HOTSPOT_DB.map((hs, i) => (
                  <button key={i} onClick={() => setActiveLocation({ lat: hs.lat, lon: hs.lon, label: hs.region, country: '' })}
                    className="w-full text-left p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/70 border border-slate-800 hover:border-amber-500/30 transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-200">{hs.id}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold border ${hs.risk === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : hs.risk === 'High' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                        {hs.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mb-1">{hs.region}</p>
                    <div className="flex gap-3 text-[10px] text-slate-400">
                      <span>Max HCHO: <span className="text-amber-400 font-bold">{hs.max_hcho} µmol/m²</span></span>
                      <span>Fires: <span className="text-red-400 font-bold">{hs.fires}</span></span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Policy Alerts */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 md:col-span-2">
              <h3 className="text-sm font-bold text-indigo-400 mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Global Regulatory Alerts & Interventions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { region: 'India (IGP)', alert: 'GRAP Stage-IV Active', detail: 'Emergency restrictions in NCR. Diesel vehicles banned. Fire suppression deployed.', color: 'red' },
                  { region: 'USA (California)', alert: 'Red Flag Warning', detail: 'Extreme fire danger. Evacuation orders issued in Sierra Nevada corridor.', color: 'amber' },
                  { region: 'Brazil (Amazon)', alert: 'IBAMA Emergency', detail: 'Critical deforestation-linked fire clusters detected. Federal intervention ongoing.', color: 'red' },
                ].map((a, i) => (
                  <div key={i} className={`p-3.5 rounded-xl border ${a.color === 'red' ? 'border-red-500/20 bg-red-500/5' : 'border-amber-500/20 bg-amber-500/5'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-200">{a.region}</span>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border animate-pulse ${a.color === 'red' ? 'text-red-400 border-red-500/30' : 'text-amber-400 border-amber-500/30'}`}>
                        {a.alert}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{a.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <footer className="bg-[#070B16]/80 border-t border-slate-800/50 px-6 py-2 flex items-center justify-between text-[10px] text-slate-500">
        <span>ATMOS-WATCH Global © 2026 — Earth Observation Air Intelligence Platform</span>
        <span className="flex items-center gap-3">
          <span>Sentinel-5P • MODIS/VIIRS • ERA5 • MERRA-2 • IMDAA</span>
          <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-sky-400" /> CNN-LSTM v2.1</span>
        </span>
      </footer>

    </main>
  )
}
