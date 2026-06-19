/**
 * ATMOS-WATCH GLOBAL
 * Global constants: pollutants, AQI categories, data sources, hotspot DB, world cities
 */

export const AQI_CATEGORIES = [
  { label: 'Good',        range: [0,   50],  color: '#059669', bg: 'rgba(5,150,105,0.12)',   text: '#34d399' },
  { label: 'Satisfactory',range: [51,  100], color: '#10b981', bg: 'rgba(16,185,129,0.12)',  text: '#6ee7b7' },
  { label: 'Moderate',    range: [101, 200], color: '#d97706', bg: 'rgba(217,119,6,0.12)',   text: '#fbbf24' },
  { label: 'Poor',        range: [201, 300], color: '#ea580c', bg: 'rgba(234,88,12,0.12)',   text: '#fb923c' },
  { label: 'Very Poor',   range: [301, 400], color: '#dc2626', bg: 'rgba(220,38,38,0.12)',   text: '#f87171' },
  { label: 'Severe',      range: [401, 999], color: '#7c3aed', bg: 'rgba(124,58,237,0.12)',  text: '#a78bfa' },
]

export const POLLUTANTS = [
  { id: 'aqi',   label: 'AQI',    unit: '',          color: '#38bdf8', icon: '🌡️' },
  { id: 'pm25',  label: 'PM2.5',  unit: 'µg/m³',    color: '#f59e0b', icon: '💨' },
  { id: 'pm10',  label: 'PM10',   unit: 'µg/m³',    color: '#fb923c', icon: '🌫️' },
  { id: 'no2',   label: 'NO₂',    unit: 'µg/m³',    color: '#a78bfa', icon: '🏭' },
  { id: 'so2',   label: 'SO₂',    unit: 'µg/m³',    color: '#fcd34d', icon: '⚗️'  },
  { id: 'co',    label: 'CO',     unit: 'mg/m³',    color: '#6ee7b7', icon: '🚗' },
  { id: 'o3',    label: 'O₃',     unit: 'µg/m³',    color: '#67e8f9', icon: '☀️' },
  { id: 'hcho',  label: 'HCHO',   unit: 'µmol/m²',  color: '#ef4444', icon: '🔬' },
  { id: 'fire',  label: 'Fire',   unit: 'MW/km²',   color: '#ff5500', icon: '🔥' },
]

export const MAP_LAYERS = [
  { id: 'aqi',        label: 'AQI Grid',         color: '#38bdf8', defaultOn: true  },
  { id: 'hcho',       label: 'HCHO Column',       color: '#ef4444', defaultOn: false },
  { id: 'fire',       label: 'Fire Points',       color: '#ff5500', defaultOn: true  },
  { id: 'pm25',       label: 'PM2.5',             color: '#f59e0b', defaultOn: false },
  { id: 'no2',        label: 'NO₂',               color: '#a78bfa', defaultOn: false },
  { id: 'wind',       label: 'Wind Vectors',      color: '#60a5fa', defaultOn: true  },
  { id: 'satellite',  label: 'Satellite Imagery', color: '#34d399', defaultOn: false },
  { id: 'population', label: 'Population',        color: '#8b5cf6', defaultOn: false },
  { id: 'admin',      label: 'Admin Boundaries',  color: '#94a3b8', defaultOn: true  },
]

export const DATA_SOURCES = [
  { id: 'sentinel5p', label: 'Sentinel-5P',  params: ['HCHO','NO₂','SO₂','CO','O₃'],  coverage: 'Global',       res: '3.5×7 km'  },
  { id: 'modis',      label: 'MODIS Terra',  params: ['AOD','Fire','LST'],             coverage: 'Global',       res: '250–1000m' },
  { id: 'viirs',      label: 'VIIRS',        params: ['Fire','NTL'],                   coverage: 'Global',       res: '375m'      },
  { id: 'era5',       label: 'ERA5',         params: ['Wind','Temp','BLH','RH'],       coverage: 'Global',       res: '0.25°'     },
  { id: 'merra2',     label: 'MERRA-2',      params: ['AOD','Dust','Sea Salt'],        coverage: 'Global',       res: '0.5°×0.625°'},
  { id: 'openaq',     label: 'OpenAQ',       params: ['PM2.5','PM10','NO₂','O₃'],     coverage: '100+ nations', res: 'Station'   },
  { id: 'firms',      label: 'NASA FIRMS',   params: ['Active Fire','FRP'],            coverage: 'Global',       res: '375m'      },
  { id: 'cams',       label: 'CAMS Copernicus',params: ['AQI Forecast','O₃','PM'],    coverage: 'Global',       res: '0.1°'      },
  { id: 'goes',       label: 'GOES-16/18',   params: ['Fire','Smoke','AOD'],           coverage: 'Americas',     res: '0.5–2km'   },
  { id: 'himawari',   label: 'Himawari-9',   params: ['Fire','AOD'],                   coverage: 'Asia-Pacific', res: '0.5–2km'   },
]

export interface Hotspot {
  id: string
  region: string
  country: string
  continent: string
  lat: number
  lon: number
  max_hcho: number
  fires: number
  status: 'Critical' | 'High' | 'Active' | 'Moderate' | 'Resolving'
  cause: string
  area_km2: number
  pop_exposed: number
}

export const GLOBAL_HOTSPOTS: Hotspot[] = [
  { id:'HS-001', region:'Indo-Gangetic Plain',           country:'India',      continent:'Asia',         lat:30.35, lon:75.30,  max_hcho:32.5, fires:2450, status:'Critical',  cause:'Crop residue burning', area_km2:280000, pop_exposed:150000000 },
  { id:'HS-002', region:'Amazon Basin (Para/Mato Grosso)',country:'Brazil',    continent:'S. America',   lat:-4.50, lon:-55.20, max_hcho:41.8, fires:6200, status:'Critical',  cause:'Deforestation fires',  area_km2:450000, pop_exposed:12000000  },
  { id:'HS-003', region:'Congo Basin DRC',               country:'DRC',        continent:'Africa',       lat:-2.50, lon:23.50,  max_hcho:36.4, fires:8900, status:'Active',    cause:'Savanna burning',      area_km2:380000, pop_exposed:35000000  },
  { id:'HS-004', region:'California Wildfire Corridor',  country:'USA',        continent:'N. America',   lat:37.50, lon:-119.8, max_hcho:28.1, fires:1800, status:'High',      cause:'Climate-driven wildfire',area_km2:120000,pop_exposed:8000000   },
  { id:'HS-005', region:'Siberian Taiga (Sakha)',        country:'Russia',     continent:'Asia',         lat:62.00, lon:115.00, max_hcho:18.2, fires:9500, status:'Active',    cause:'Permafrost peat fires',area_km2:950000, pop_exposed:500000    },
  { id:'HS-006', region:'Borneo Peatland',               country:'Indonesia',  continent:'Asia',         lat: 1.50, lon:113.50, max_hcho:22.8, fires:1450, status:'Moderate',  cause:'Peatland burning',     area_km2:85000,  pop_exposed:9000000   },
  { id:'HS-007', region:'Sahel Belt (Niger-Chad)',       country:'Niger/Chad', continent:'Africa',       lat:13.00, lon: 2.00,  max_hcho:19.4, fires:3200, status:'Active',    cause:'Land-clearing fires',  area_km2:200000, pop_exposed:20000000  },
  { id:'HS-008', region:'North China Plain',             country:'China',      continent:'Asia',         lat:36.00, lon:115.00, max_hcho:25.3, fires: 890, status:'High',      cause:'Industrial + coal',    area_km2:180000, pop_exposed:200000000 },
  { id:'HS-009', region:'Southeast Australia',           country:'Australia',  continent:'Oceania',      lat:-34.00,lon:150.00, max_hcho:15.8, fires: 620, status:'Moderate',  cause:'Eucalyptus wildfires', area_km2:95000,  pop_exposed:4000000   },
  { id:'HS-010', region:'Po Valley, Italy',              country:'Italy',      continent:'Europe',       lat:45.20, lon:11.00,  max_hcho:12.4, fires: 120, status:'Moderate',  cause:'Industrial+transport', area_km2:46000,  pop_exposed:18000000  },
  { id:'HS-011', region:'Mekong Delta, Vietnam',         country:'Vietnam',    continent:'Asia',         lat:10.50, lon:105.50, max_hcho:17.6, fires: 780, status:'Active',    cause:'Rice straw burning',   area_km2:40000,  pop_exposed:17000000  },
  { id:'HS-012', region:'Cerrado Savanna, Brazil',       country:'Brazil',     continent:'S. America',   lat:-15.00,lon:-47.00, max_hcho:29.7, fires:4100, status:'High',      cause:'Agricultural fires',   area_km2:290000, pop_exposed:5000000   },
  { id:'HS-013', region:'Punjab-Haryana, India',         country:'India',      continent:'Asia',         lat:30.90, lon:75.85,  max_hcho:38.2, fires:1900, status:'Critical',  cause:'Paddy straw burning',  area_km2:35000,  pop_exposed:50000000  },
  { id:'HS-014', region:'Dhaka Industrial Belt',         country:'Bangladesh', continent:'Asia',         lat:23.81, lon:90.41,  max_hcho:14.2, fires: 230, status:'High',      cause:'Industrial emissions',  area_km2:8000,   pop_exposed:30000000  },
  { id:'HS-015', region:'West African Harmattan Zone',   country:'Ghana/Côte d\'Ivoire',continent:'Africa',lat:7.00,lon:-2.00, max_hcho:21.5, fires:5600, status:'Active',    cause:'Seasonal biomass burn',area_km2:185000, pop_exposed:25000000  },
]

export interface WorldCity {
  name: string
  country: string
  continent: string
  lat: number
  lon: number
  population: number
  key: string
}

export const WORLD_CITIES: WorldCity[] = [
  // India
  { name:'Delhi',key:'delhi',country:'India',continent:'Asia',lat:28.61,lon:77.23,population:32900000 },
  { name:'Mumbai',key:'mumbai',country:'India',continent:'Asia',lat:19.07,lon:72.87,population:20700000 },
  { name:'Kolkata',key:'kolkata',country:'India',continent:'Asia',lat:22.57,lon:88.36,population:14900000 },
  { name:'Chennai',key:'chennai',country:'India',continent:'Asia',lat:13.08,lon:80.27,population:10900000 },
  { name:'Bengaluru',key:'bengaluru',country:'India',continent:'Asia',lat:12.97,lon:77.59,population:12700000 },
  { name:'Hyderabad',key:'hyderabad',country:'India',continent:'Asia',lat:17.38,lon:78.48,population:10100000 },
  { name:'Pune',key:'pune',country:'India',continent:'Asia',lat:18.52,lon:73.85,population:7400000 },
  { name:'Ahmedabad',key:'ahmedabad',country:'India',continent:'Asia',lat:23.03,lon:72.57,population:8400000 },
  { name:'Kanpur',key:'kanpur',country:'India',continent:'Asia',lat:26.46,lon:80.33,population:3100000 },
  { name:'Lucknow',key:'lucknow',country:'India',continent:'Asia',lat:26.85,lon:80.95,population:3700000 },
  { name:'Patna',key:'patna',country:'India',continent:'Asia',lat:25.60,lon:85.10,population:2100000 },
  { name:'Varanasi',key:'varanasi',country:'India',continent:'Asia',lat:25.32,lon:83.00,population:1500000 },
  // China
  { name:'Beijing',key:'beijing',country:'China',continent:'Asia',lat:39.90,lon:116.40,population:21900000 },
  { name:'Shanghai',key:'shanghai',country:'China',continent:'Asia',lat:31.23,lon:121.47,population:24900000 },
  { name:'Guangzhou',key:'guangzhou',country:'China',continent:'Asia',lat:23.13,lon:113.26,population:16900000 },
  { name:'Chengdu',key:'chengdu',country:'China',continent:'Asia',lat:30.66,lon:104.07,population:16300000 },
  { name:'Wuhan',key:'wuhan',country:'China',continent:'Asia',lat:30.59,lon:114.30,population:11200000 },
  // East Asia
  { name:'Tokyo',key:'tokyo',country:'Japan',continent:'Asia',lat:35.69,lon:139.69,population:37400000 },
  { name:'Seoul',key:'seoul',country:'South Korea',continent:'Asia',lat:37.57,lon:126.98,population:9900000 },
  { name:'Osaka',key:'osaka',country:'Japan',continent:'Asia',lat:34.69,lon:135.50,population:19000000 },
  // SE Asia
  { name:'Jakarta',key:'jakarta',country:'Indonesia',continent:'Asia',lat:-6.21,lon:106.85,population:10600000 },
  { name:'Manila',key:'manila',country:'Philippines',continent:'Asia',lat:14.60,lon:120.98,population:13900000 },
  { name:'Bangkok',key:'bangkok',country:'Thailand',continent:'Asia',lat:13.76,lon:100.50,population:10700000 },
  { name:'Ho Chi Minh City',key:'hochiminh',country:'Vietnam',continent:'Asia',lat:10.82,lon:106.63,population:9000000 },
  { name:'Singapore',key:'singapore',country:'Singapore',continent:'Asia',lat:1.35,lon:103.82,population:5800000 },
  // South Asia
  { name:'Karachi',key:'karachi',country:'Pakistan',continent:'Asia',lat:24.86,lon:67.01,population:16100000 },
  { name:'Lahore',key:'lahore',country:'Pakistan',continent:'Asia',lat:31.55,lon:74.34,population:13100000 },
  { name:'Dhaka',key:'dhaka',country:'Bangladesh',continent:'Asia',lat:23.81,lon:90.41,population:22000000 },
  { name:'Kathmandu',key:'kathmandu',country:'Nepal',continent:'Asia',lat:27.71,lon:85.31,population:1500000 },
  { name:'Colombo',key:'colombo',country:'Sri Lanka',continent:'Asia',lat:6.93,lon:79.85,population:760000 },
  // Middle East
  { name:'Dubai',key:'dubai',country:'UAE',continent:'Asia',lat:25.20,lon:55.27,population:3600000 },
  { name:'Riyadh',key:'riyadh',country:'Saudi Arabia',continent:'Asia',lat:24.69,lon:46.72,population:7700000 },
  { name:'Tehran',key:'tehran',country:'Iran',continent:'Asia',lat:35.69,lon:51.39,population:9300000 },
  { name:'Istanbul',key:'istanbul',country:'Turkey',continent:'Europe',lat:41.01,lon:28.96,population:15500000 },
  // Europe
  { name:'London',key:'london',country:'UK',continent:'Europe',lat:51.51,lon:-0.13,population:9500000 },
  { name:'Paris',key:'paris',country:'France',continent:'Europe',lat:48.86,lon:2.35,population:11100000 },
  { name:'Berlin',key:'berlin',country:'Germany',continent:'Europe',lat:52.52,lon:13.40,population:3800000 },
  { name:'Madrid',key:'madrid',country:'Spain',continent:'Europe',lat:40.42,lon:-3.70,population:6800000 },
  { name:'Rome',key:'rome',country:'Italy',continent:'Europe',lat:41.90,lon:12.50,population:4300000 },
  { name:'Moscow',key:'moscow',country:'Russia',continent:'Europe',lat:55.75,lon:37.62,population:12700000 },
  { name:'Warsaw',key:'warsaw',country:'Poland',continent:'Europe',lat:52.23,lon:21.01,population:1900000 },
  // Africa
  { name:'Cairo',key:'cairo',country:'Egypt',continent:'Africa',lat:30.04,lon:31.24,population:21300000 },
  { name:'Lagos',key:'lagos',country:'Nigeria',continent:'Africa',lat:6.52,lon:3.38,population:15400000 },
  { name:'Kinshasa',key:'kinshasa',country:'DRC',continent:'Africa',lat:-4.32,lon:15.32,population:15600000 },
  { name:'Nairobi',key:'nairobi',country:'Kenya',continent:'Africa',lat:-1.29,lon:36.82,population:4900000 },
  { name:'Johannesburg',key:'johannesburg',country:'South Africa',continent:'Africa',lat:-26.20,lon:28.04,population:6100000 },
  { name:'Addis Ababa',key:'addisababa',country:'Ethiopia',continent:'Africa',lat:9.03,lon:38.74,population:5000000 },
  // Americas
  { name:'New York',key:'newyork',country:'USA',continent:'N. America',lat:40.71,lon:-74.00,population:19000000 },
  { name:'Los Angeles',key:'losangeles',country:'USA',continent:'N. America',lat:34.05,lon:-118.24,population:13200000 },
  { name:'Chicago',key:'chicago',country:'USA',continent:'N. America',lat:41.88,lon:-87.63,population:9500000 },
  { name:'Mexico City',key:'mexicocity',country:'Mexico',continent:'N. America',lat:19.43,lon:-99.13,population:21600000 },
  { name:'São Paulo',key:'saopaulo',country:'Brazil',continent:'S. America',lat:-23.55,lon:-46.63,population:22400000 },
  { name:'Rio de Janeiro',key:'rio',country:'Brazil',continent:'S. America',lat:-22.91,lon:-43.17,population:13600000 },
  { name:'Buenos Aires',key:'buenosaires',country:'Argentina',continent:'S. America',lat:-34.61,lon:-58.38,population:15400000 },
  { name:'Lima',key:'lima',country:'Peru',continent:'S. America',lat:-12.05,lon:-77.05,population:11000000 },
  { name:'Bogotá',key:'bogota',country:'Colombia',continent:'S. America',lat:4.71,lon:-74.07,population:11300000 },
  // Oceania
  { name:'Sydney',key:'sydney',country:'Australia',continent:'Oceania',lat:-33.87,lon:151.21,population:5400000 },
  { name:'Melbourne',key:'melbourne',country:'Australia',continent:'Oceania',lat:-37.81,lon:144.96,population:5200000 },
]

export const CONTINENTS = ['All','Asia','Europe','Africa','N. America','S. America','Oceania']

// Deterministic synthetic AQI based on lat/lon/date
export function generateAQI(lat: number, lon: number, dateStr: string): number {
  const seed = Math.abs(Math.sin(lat * 12.9898 + lon * 78.233 + 0.1) * 43758.5453) % 1
  const dateSeed = dateStr ? (parseInt(dateStr.replace(/-/g,'')) % 1000) / 1000 : 0.5
  let base = 60 + seed * 280 + dateSeed * 80

  // Regional adjustments
  if (lat > 20 && lat < 40 && lon > 65 && lon < 100) base *= 1.55  // Indo-Gangetic Plain
  if (lat > 25 && lat < 45 && lon > 100 && lon < 125) base *= 1.35 // North China
  if (lat > 5 && lat < 20 && lon > 100 && lon < 110) base *= 1.15  // SE Asia
  if (lat > 45 && lat < 65 && lon > -10 && lon < 25) base *= 0.55  // Western Europe
  if (lat < -20 && lat > -40 && lon > 140 && lon < 155) base *= 0.80 // Australia coast
  if (lat > 25 && lat < 50 && lon > -130 && lon < -65) base *= 0.75 // USA
  if (lat < -5 && lat > -20 && lon < -45 && lon > -75) base *= 1.20 // Amazon fires

  return Math.min(Math.round(base), 500)
}

export function getCategory(aqi: number) {
  return AQI_CATEGORIES.find(c => aqi >= c.range[0] && aqi <= c.range[1]) ?? AQI_CATEGORIES[5]
}

// Deterministic pseudo-random number generator between 0 and 1
export function seededRandom(lat: number, lon: number, dateStr: string, salt: string = ''): number {
  const str = `${lat.toFixed(4)}_${lon.toFixed(4)}_${dateStr}_${salt}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // Convert to 32bit integer
  }
  // Generate pseudo-random value in [0, 1)
  const val = Math.abs(Math.sin(hash) * 10000)
  return val - Math.floor(val)
}

// Deterministic date offset generator returning ISO string (YYYY-MM-DD)
export function getOffsetDateISO(dateStr: string, offsetDays: number): string {
  const parts = dateStr.split('-').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) {
    return dateStr
  }
  const d = new Date(parts[0], parts[1] - 1, parts[2])
  d.setDate(d.getDate() + offsetDays)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// Deterministic date offset generator returning short string (e.g. Nov 10)
export function formatOffsetDateShort(dateStr: string, offsetDays: number): string {
  const parts = dateStr.split('-').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) {
    return dateStr
  }
  const d = new Date(parts[0], parts[1] - 1, parts[2])
  d.setDate(d.getDate() + offsetDays)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getDate()}`
}

export function generatePollutants(lat: number, lon: number, dateStr: string) {
  const aqi = generateAQI(lat, lon, dateStr)
  const factor = aqi / 200

  const rPm25 = seededRandom(lat, lon, dateStr, 'pm25')
  const rPm10 = seededRandom(lat, lon, dateStr, 'pm10')
  const rNo2 = seededRandom(lat, lon, dateStr, 'no2')
  const rSo2 = seededRandom(lat, lon, dateStr, 'so2')
  const rCo = seededRandom(lat, lon, dateStr, 'co')
  const rO3 = seededRandom(lat, lon, dateStr, 'o3')
  const rHcho = seededRandom(lat, lon, dateStr, 'hcho')
  const rFire = seededRandom(lat, lon, dateStr, 'fire')

  return {
    aqi,
    pm25:  Math.round(factor * 80 + rPm25 * 10),
    pm10:  Math.round(factor * 130 + rPm10 * 20),
    no2:   Math.round(factor * 45 + rNo2 * 8),
    so2:   Math.round(factor * 20 + rSo2 * 5),
    co:    +(factor * 2.5 + rCo * 0.3).toFixed(1),
    o3:    Math.round(factor * 60 + rO3 * 12),
    hcho:  +(factor * 0.00025 + rHcho * 0.00003).toFixed(5),
    fire:  Math.round(factor * 180 + rFire * 50),
  }
}

// Nominatim geocoding helper (no API key needed)
export async function geocodeLocation(query: string): Promise<{ lat: number; lon: number; label: string; country: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`
    const res = await fetch(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'ATMOS-WATCH-Global/2.0' } })
    const data = await res.json()
    if (data && data.length > 0) {
      const r = data[0]
      const country = r.address?.country || r.display_name.split(',').pop()?.trim() || ''
      return { lat: parseFloat(r.lat), lon: parseFloat(r.lon), label: r.display_name.split(',').slice(0,2).join(', '), country }
    }
  } catch {}
  return null
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    const res = await fetch(url, { headers: { 'User-Agent': 'ATMOS-WATCH-Global/2.0' } })
    const data = await res.json()
    return data.display_name?.split(',').slice(0,3).join(', ') || `${lat.toFixed(3)}, ${lon.toFixed(3)}`
  } catch { return `${lat.toFixed(3)}, ${lon.toFixed(3)}` }
}
