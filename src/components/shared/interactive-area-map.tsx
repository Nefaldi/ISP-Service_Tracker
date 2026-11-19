"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  X,
  Activity,
  MapPin,
  Users,
  Map as MapIcon,
} from "lucide-react";
import kmzNetworkData from "@/data/kmz-network.json";

interface SelectedItem {
  name: string;
  category: string;
  coords: [number, number];
  details?: string;
}

type BasemapKey = "streets" | "satellite" | "esri";

const BASEMAP_CONFIGS: Record<
  BasemapKey,
  { name: string; url: string; maxZoom: number; subdomains?: string }
> = {
  streets: {
    name: "Peta Jalan",
    url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    maxZoom: 20,
  },
  satellite: {
    name: "Citra Satelit",
    url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    maxZoom: 20,
  },
  esri: {
    name: "Esri Topo",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 19,
  },
};

// Static Center & bounds from KMZ data
const INITIAL_CENTER: [number, number] = [
  kmzNetworkData.meta.center[0],
  kmzNetworkData.meta.center[1],
];
const INITIAL_BOUNDS: L.LatLngBoundsExpression = [
  [kmzNetworkData.meta.bounds[0][0], kmzNetworkData.meta.bounds[0][1]],
  [kmzNetworkData.meta.bounds[1][0], kmzNetworkData.meta.bounds[1][1]],
];

export default function InteractiveAreaMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  // Layer groups references
  const popGroupRef = useRef<L.LayerGroup | null>(null);
  const odcGroupRef = useRef<L.LayerGroup | null>(null);
  const odpGroupRef = useRef<L.LayerGroup | null>(null);
  const cablesGroupRef = useRef<L.LayerGroup | null>(null);
  const customersGroupRef = useRef<L.LayerGroup | null>(null);
  const boundaryGroupRef = useRef<L.LayerGroup | null>(null);

  // States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [showCustomers, setShowCustomers] = useState(false);
  const [showODP, setShowODP] = useState(true);
  const [basemapType, setBasemapType] = useState<BasemapKey>("streets");
  const [showBasemapMenu, setShowBasemapMenu] = useState(false);

  // Total summary counts
  const counts = useMemo(() => kmzNetworkData.meta.counts, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: INITIAL_CENTER,
      zoom: kmzNetworkData.meta.defaultZoom,
      minZoom: 10,
      maxZoom: 20,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Add Primary Basemap Tile Layer (Google Roadmap default)
    const baseTile = L.tileLayer(BASEMAP_CONFIGS.streets.url, {
      maxZoom: BASEMAP_CONFIGS.streets.maxZoom,
      keepBuffer: 4,
    }).addTo(map);
    currentTileLayerRef.current = baseTile;

    // Fit map to full KMZ network bounds
    map.fitBounds(INITIAL_BOUNDS, { padding: [25, 25] });

    // Zoom control
    L.control.zoom({ position: "topright" }).addTo(map);

    // 1. Boundary Polygon Group (Area Pengawasan KMZ)
    const boundaryCoords = kmzNetworkData.boundary as [number, number][];
    const boundaryLayer = L.polygon(boundaryCoords, {
      color: "#2563EB",
      weight: 2.5,
      dashArray: "6, 6",
      fillColor: "#3B82F6",
      fillOpacity: 0.08,
    });
    boundaryLayer.bindTooltip("Area Pengawasan Jaringan FO (KMZ 15 Jan 2026)", {
      direction: "center",
      className:
        "bg-white/95 text-[#0B2A6F] font-semibold text-xs px-2.5 py-1 rounded shadow-xs border border-[#E2E8F0]",
    });
    const boundaryGroup = L.layerGroup([boundaryLayer]).addTo(map);
    boundaryGroupRef.current = boundaryGroup;

    // 2. Cables Group (LineStrings)
    const cablesLayerList: L.Polyline[] = [];
    kmzNetworkData.cables.forEach((cable) => {
      const coords = cable.coords as [number, number][];

      // Glow effect
      const glow = L.polyline(coords, {
        color: "#60A5FA",
        weight: 6,
        opacity: 0.4,
      });

      // Core line
      const line = L.polyline(coords, {
        color: "#2563EB",
        weight: 3,
        opacity: 0.95,
      });

      line.bindPopup(
        `
        <div style="font-family: inherit; font-size: 12px; color: #0F172A; min-width: 170px;">
          <span style="font-size: 10px; font-weight: 700; color: #2563EB; text-transform: uppercase;">Kabel FO Distribusi</span>
          <div style="font-weight: 700; font-size: 13px; color: #0B2A6F; margin-top: 2px;">${cable.name}</div>
          <div style="font-size: 11px; color: #64748B; margin-top: 4px;">Panjang rute: ${coords.length} titik koordinat</div>
        </div>
      `,
        { className: "custom-leaflet-popup" }
      );

      line.on("click", () => {
        setSelectedItem({
          name: cable.name,
          category: "Kabel FO Distribusi",
          coords: coords[0],
          details: `Jalur distribusi dengan ${coords.length} segmen koordinat`,
        });
      });

      cablesLayerList.push(glow, line);
    });
    const cablesGroup = L.layerGroup(cablesLayerList).addTo(map);
    cablesGroupRef.current = cablesGroup;

    // 3. POP Sites Group (2 Sites: Indosat & XL)
    const popMarkers: L.Marker[] = [];
    kmzNetworkData.popSites.forEach((pop) => {
      const coords: [number, number] = [pop.lat, pop.lng];
      const popIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
            <span style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background-color: rgba(99, 102, 241, 0.35); animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></span>
            <div style="position: relative; width: 24px; height: 24px; border-radius: 9999px; background-color: #EEF2FF; border: 2.5px solid #4F46E5; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.25);">
              <div style="width: 8px; height: 8px; border-radius: 9999px; background-color: #4F46E5;"></div>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      });

      const marker = L.marker(coords, { icon: popIcon });
      marker.bindPopup(
        `
        <div style="font-family: inherit; font-size: 12px; color: #0F172A; min-width: 190px;">
          <span style="font-size: 10px; font-weight: 700; color: #4F46E5; background: #EEF2FF; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">POP Gateway Core</span>
          <div style="font-weight: 700; font-size: 14px; color: #312E81; margin: 4px 0 2px;">${pop.name}</div>
          <div style="font-size: 11px; color: #64748B;">Titik Pusat Gateway FO Jaringan</div>
          <div style="border-top: 1px solid #E2E8F0; margin-top: 6px; padding-top: 6px; font-size: 11px;">
            <span style="color: #64748B;">Koordinat:</span> <span style="font-mono; font-weight: 600;">${pop.lat}, ${pop.lng}</span>
          </div>
        </div>
      `,
        { className: "custom-leaflet-popup" }
      );

      marker.on("click", () => {
        setSelectedItem({
          name: pop.name,
          category: "POP Gateway Core",
          coords,
          details: `Titik Pusat Gateway Induk Distribusi Jaringan`,
        });
      });

      popMarkers.push(marker);
    });
    const popGroup = L.layerGroup(popMarkers).addTo(map);
    popGroupRef.current = popGroup;

    // 4. ODC Group (11 Cabinets)
    const odcMarkers: L.Marker[] = [];
    kmzNetworkData.odcList.forEach((odc) => {
      const coords: [number, number] = [odc.lat, odc.lng];
      const odcIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 30px; height: 30px;">
            <span style="position: absolute; width: 24px; height: 24px; border-radius: 9999px; background-color: rgba(234, 88, 12, 0.25); animation: pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></span>
            <div style="position: relative; width: 20px; height: 20px; border-radius: 6px; background-color: #FFF7ED; border: 2px solid #EA580C; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              <div style="width: 7px; height: 7px; border-radius: 2px; background-color: #EA580C;"></div>
            </div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15],
      });

      const marker = L.marker(coords, { icon: odcIcon });
      marker.bindPopup(
        `
        <div style="font-family: inherit; font-size: 12px; color: #0F172A; min-width: 180px;">
          <span style="font-size: 10px; font-weight: 700; color: #EA580C; background: #FFF7ED; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">ODC (Distribution Cabinet)</span>
          <div style="font-weight: 700; font-size: 13px; color: #9A3412; margin: 4px 0 2px;">${odc.name}</div>
          <div style="font-size: 11px; color: #64748B;">Kabinet Distribusi Fiber Optic</div>
          <div style="border-top: 1px solid #E2E8F0; margin-top: 6px; padding-top: 6px; font-size: 11px;">
            <span style="color: #64748B;">Koordinat:</span> <span style="font-mono; font-weight: 600;">${odc.lat}, ${odc.lng}</span>
          </div>
        </div>
      `,
        { className: "custom-leaflet-popup" }
      );

      marker.on("click", () => {
        setSelectedItem({
          name: odc.name,
          category: "Optical Distribution Cabinet (ODC)",
          coords,
          details: `Kabinet Distribusi Primer`,
        });
      });

      odcMarkers.push(marker);
    });
    const odcGroup = L.layerGroup(odcMarkers).addTo(map);
    odcGroupRef.current = odcGroup;

    // 5. ODP Group (35 Points)
    const odpMarkers: L.Marker[] = [];
    kmzNetworkData.odpList.forEach((odp) => {
      const coords: [number, number] = [odp.lat, odp.lng];
      const isKantor = odp.name.toUpperCase().includes("KANTOR");
      const markerColor = isKantor ? "#0284C7" : "#2563EB";
      const bgColor = isKantor ? "#F0F9FF" : "#EFF6FF";

      const odpIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;">
            <div style="width: 15px; height: 15px; border-radius: 9999px; background-color: ${bgColor}; border: 2px solid ${markerColor}; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.18);">
              <div style="width: 5px; height: 5px; border-radius: 9999px; background-color: ${markerColor};"></div>
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      });

      const marker = L.marker(coords, { icon: odpIcon });
      marker.bindPopup(
        `
        <div style="font-family: inherit; font-size: 12px; color: #0F172A; min-width: 170px;">
          <span style="font-size: 10px; font-weight: 700; color: ${markerColor}; background: ${bgColor}; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
            ${isKantor ? "Kantor Operasional" : "ODP (Distribution Point)"}
          </span>
          <div style="font-weight: 700; font-size: 13px; color: #0B2A6F; margin: 4px 0 2px;">${odp.name}</div>
          <div style="border-top: 1px solid #E2E8F0; margin-top: 6px; padding-top: 6px; font-size: 11px;">
            <span style="color: #64748B;">Koordinat:</span> <span style="font-mono; font-weight: 600;">${odp.lat}, ${odp.lng}</span>
          </div>
        </div>
      `,
        { className: "custom-leaflet-popup" }
      );

      marker.on("click", () => {
        setSelectedItem({
          name: odp.name,
          category: isKantor ? "Kantor Operasional" : "Optical Distribution Point (ODP)",
          coords,
          details: `Titik sambung akhir ke pelanggan`,
        });
      });

      odpMarkers.push(marker);
    });
    const odpGroup = L.layerGroup(odpMarkers).addTo(map);
    odpGroupRef.current = odpGroup;

    // 6. Customers Group (193 Points)
    const custMarkers: L.Marker[] = [];
    kmzNetworkData.customers.forEach((cust) => {
      const coords: [number, number] = [cust.lat, cust.lng];
      const custIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 14px; height: 14px;">
            <div style="width: 8px; height: 8px; border-radius: 9999px; background-color: #2563EB; border: 1.5px solid #FFFFFF; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        popupAnchor: [0, -8],
      });

      const marker = L.marker(coords, { icon: custIcon });
      marker.bindPopup(
        `
        <div style="font-family: inherit; font-size: 12px; color: #0F172A; min-width: 170px;">
          <span style="font-size: 10px; font-weight: 700; color: #2563EB; background: #EFF6FF; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">Titik Pelanggan (FTTH)</span>
          <div style="font-weight: 700; font-size: 13px; color: #1E3A8A; margin: 4px 0 2px;">${cust.name}</div>
          <div style="font-size: 11px; color: #64748B;">Kluster: ${cust.cluster || "Pelanggan Aktif"}</div>
          <div style="border-top: 1px solid #E2E8F0; margin-top: 6px; padding-top: 6px; font-size: 11px;">
            <span style="color: #64748B;">Koordinat:</span> <span style="font-mono; font-weight: 600;">${cust.lat}, ${cust.lng}</span>
          </div>
        </div>
      `,
        { className: "custom-leaflet-popup" }
      );

      marker.on("click", () => {
        setSelectedItem({
          name: cust.name,
          category: "Pelanggan Aktif (FTTH)",
          coords,
          details: `Kluster: ${cust.cluster || "Pelanggan"}`,
        });
      });

      custMarkers.push(marker);
    });
    const customersGroup = L.layerGroup(custMarkers);
    customersGroupRef.current = customersGroup;

    // Responsive Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    // Timer triggers to ensure tiles load immediately after DOM layout
    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 250);
    const t3 = setTimeout(() => map.invalidateSize(), 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle switching basemaps
  const handleBasemapChange = (type: BasemapKey) => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove old basemap
    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    // Add new basemap
    const config = BASEMAP_CONFIGS[type];
    const newTile = L.tileLayer(config.url, {
      maxZoom: config.maxZoom,
      keepBuffer: 4,
    }).addTo(map);

    // Ensure basemap sits behind vector and marker layers
    newTile.bringToBack();
    currentTileLayerRef.current = newTile;
    setBasemapType(type);
    setShowBasemapMenu(false);
  };

  // Toggle ODP visibility
  useEffect(() => {
    if (!mapInstanceRef.current || !odpGroupRef.current) return;
    if (showODP) {
      mapInstanceRef.current.addLayer(odpGroupRef.current);
    } else {
      mapInstanceRef.current.removeLayer(odpGroupRef.current);
    }
  }, [showODP]);

  // Toggle Customers visibility
  useEffect(() => {
    if (!mapInstanceRef.current || !customersGroupRef.current) return;
    if (showCustomers) {
      mapInstanceRef.current.addLayer(customersGroupRef.current);
    } else {
      mapInstanceRef.current.removeLayer(customersGroupRef.current);
    }
  }, [showCustomers]);

  // Recenter to full KMZ network bounds
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(INITIAL_BOUNDS, {
        padding: [25, 25],
        duration: 0.8,
      });
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);
  };

  return (
    <div
      className={`relative w-full transition-all duration-300 flex flex-col ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-white h-screen w-screen p-4 sm:p-6"
          : "h-[340px] rounded-b-[12px]"
      }`}
    >
      {/* Map Container with explicit inline style */}
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "100%",
          minHeight: isFullscreen ? "100%" : "300px",
        }}
        className="relative z-0 bg-[#E2E8F0]"
      />

      {/* Top Left Floating Badge */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap items-center gap-1.5 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-[6px] shadow-xs border border-[#E2E8F0] flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B82F6] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2563EB]"></span>
          </span>
          <span className="text-[11px] font-semibold text-[#0B2A6F]">
            KMZ FO Network (15 Jan 2026)
          </span>
        </div>
      </div>

      {/* Bottom Left Controls: Basemap Selector above Layer Toggles */}
      <div className="absolute bottom-2.5 left-2.5 z-10 flex flex-col items-start gap-1.5">
        {/* Basemap Selector Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowBasemapMenu(!showBasemapMenu)}
            title="Pilih Jenis Basemap"
            className="h-[28px] px-2.5 rounded-[6px] bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] text-[11px] font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <MapIcon className="h-3.5 w-3.5 text-[#2563EB]" />
            <span>{BASEMAP_CONFIGS[basemapType].name}</span>
          </button>

          {showBasemapMenu && (
            <div className="absolute left-0 bottom-full mb-1.5 w-40 rounded-[8px] bg-white border border-[#E2E8F0] shadow-lg py-1 z-20 text-[12px]">
              <button
                type="button"
                onClick={() => handleBasemapChange("streets")}
                className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#F1F5F9] transition-colors cursor-pointer ${
                  basemapType === "streets"
                    ? "font-bold text-[#2563EB] bg-[#EFF6FF]"
                    : "text-[#475569]"
                }`}
              >
                <span>Peta Jalan (Google)</span>
                {basemapType === "streets" && <span>✓</span>}
              </button>
              <button
                type="button"
                onClick={() => handleBasemapChange("satellite")}
                className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#F1F5F9] transition-colors cursor-pointer ${
                  basemapType === "satellite"
                    ? "font-bold text-[#2563EB] bg-[#EFF6FF]"
                    : "text-[#475569]"
                }`}
              >
                <span>Citra Satelit</span>
                {basemapType === "satellite" && <span>✓</span>}
              </button>
              <button
                type="button"
                onClick={() => handleBasemapChange("esri")}
                className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#F1F5F9] transition-colors cursor-pointer ${
                  basemapType === "esri"
                    ? "font-bold text-[#2563EB] bg-[#EFF6FF]"
                    : "text-[#475569]"
                }`}
              >
                <span>Esri Topografi</span>
                {basemapType === "esri" && <span>✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* Layer Toggles (ODP & Cust) */}
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-xs p-1 rounded-[8px] border border-[#CBD5E1] shadow-xs">
          <button
            type="button"
            onClick={() => setShowODP(!showODP)}
            title="Tampilkan/Sembunyikan Titik ODP"
            className={`h-[26px] px-2 rounded-[5px] text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              showODP
                ? "bg-[#1D4ED8] text-white"
                : "bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <MapPin className="h-3 w-3" />
            <span>ODP ({counts.odp})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCustomers(!showCustomers)}
            title="Tampilkan/Sembunyikan Titik Pelanggan"
            className={`h-[26px] px-2 rounded-[5px] text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              showCustomers
                ? "bg-[#2563EB] text-white"
                : "bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <Users className="h-3 w-3" />
            <span>Cust ({counts.customers})</span>
          </button>
        </div>
      </div>

      {/* Floating Action Buttons (Bottom Right) */}
      <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleRecenter}
          title="Pusatkan Peta ke Seluruh Area Jaringan"
          aria-label="Pusatkan Peta"
          className="h-[30px] w-[30px] rounded-[6px] bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#475569] hover:text-[#0F172A] shadow-xs flex items-center justify-center transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Perkecil Tampilan" : "Perbesar Layar Penuh"}
          aria-label={isFullscreen ? "Perkecil Tampilan" : "Perbesar Layar Penuh"}
          className="h-[30px] w-[30px] rounded-[6px] bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#475569] hover:text-[#0F172A] shadow-xs flex items-center justify-center transition-colors cursor-pointer"
        >
          {isFullscreen ? (
            <Minimize2 className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Selected Item Drawer / Info Banner */}
      {selectedItem && (
        <div className="bg-white px-3.5 py-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] shrink-0 z-10">
          <div className="flex items-center gap-2 min-w-0">
            <Activity className="h-3.5 w-3.5 text-[#2563EB] shrink-0" />
            <span className="font-bold text-[#0F172A] truncate">
              {selectedItem.name}
            </span>
            <span className="text-[#64748B] hidden sm:inline truncate">
              &bull; {selectedItem.category}
            </span>
            {selectedItem.details && (
              <span className="text-[#2563EB] font-medium hidden md:inline truncate">
                ({selectedItem.details})
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSelectedItem(null)}
            className="text-[#64748B] hover:text-[#0F172A] p-0.5 rounded-full hover:bg-[#F1F5F9] cursor-pointer"
            aria-label="Tutup info titik"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
