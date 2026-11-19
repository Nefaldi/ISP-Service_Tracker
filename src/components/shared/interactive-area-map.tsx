"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Maximize2, Minimize2, RotateCcw, X, Activity } from "lucide-react";

interface NetworkNode {
  id: string;
  name: string;
  category: string;
  coords: [number, number];
  status: "NORMAL" | "WARNING" | "CRITICAL";
  details: {
    uplink: string;
    devices: string;
    lastPing: string;
  };
}

// Representative coordinates for Faculty of Engineering Campus Area
const CAMPUS_CENTER: [number, number] = [-6.3624, 106.8248];

// Network distribution nodes in Fakultas Teknik
const NETWORK_NODES: NetworkNode[] = [
  {
    id: "noc-ft",
    name: "NOC & Pusat Data FT",
    category: "Pusat Distribusi Utama FO",
    coords: [-6.3618, 106.8242],
    status: "NORMAL",
    details: {
      uplink: "10 Gbps FO Core",
      devices: "Core Switch & Server NOC",
      lastPing: "99.98% (1 ms)",
    },
  },
  {
    id: "gkb-ft",
    name: "Gedung Kuliah Bersama (GKB)",
    category: "Distribution Switch FT-A",
    coords: [-6.3629, 106.8239],
    status: "NORMAL",
    details: {
      uplink: "1 Gbps FO Direct",
      devices: "48 Port Switch + 16 AP WiFi 6",
      lastPing: "100% (2 ms)",
    },
  },
  {
    id: "lab-ft",
    name: "Laboratorium Komputer FT",
    category: "Distribution Switch FT-B",
    coords: [-6.3621, 106.8259],
    status: "NORMAL",
    details: {
      uplink: "10 Gbps FO Trunk",
      devices: "Rack Switch + Server Lab",
      lastPing: "100% (1 ms)",
    },
  },
  {
    id: "riset-ft",
    name: "Gedung Riset & Studio Elektro",
    category: "Sub-Distribution FT-C",
    coords: [-6.3633, 106.8253],
    status: "WARNING",
    details: {
      uplink: "1 Gbps FO Backup Link",
      devices: "24 Port ODP Distribusi",
      lastPing: "Dalam Pemantauan",
    },
  },
];

// Campus supervision boundary polygon
const SUPERVISION_BOUNDARY: [number, number][] = [
  [-6.3612, 106.8236],
  [-6.3614, 106.8265],
  [-6.3638, 106.8262],
  [-6.3637, 106.8233],
];

// Fiber optic links between nodes
const FIBER_BACKBONE_ROUTES: [number, number][][] = [
  [
    [-6.3618, 106.8242], // NOC
    [-6.3629, 106.8239], // GKB
  ],
  [
    [-6.3618, 106.8242], // NOC
    [-6.3621, 106.8259], // Lab
  ],
  [
    [-6.3621, 106.8259], // Lab
    [-6.3633, 106.8253], // Riset
  ],
  [
    [-6.3629, 106.8239], // GKB
    [-6.3633, 106.8253], // Riset (redundant ring)
  ],
];

export default function InteractiveAreaMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: CAMPUS_CENTER,
      zoom: 16,
      minZoom: 14,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Add zoom control to top-right
    L.control
      .zoom({
        position: "topright",
      })
      .addTo(map);

    // Add minimal Voyager tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    // Add supervision boundary polygon
    L.polygon(SUPERVISION_BOUNDARY, {
      color: "#059669",
      weight: 1.5,
      dashArray: "5, 5",
      fillColor: "#10B981",
      fillOpacity: 0.08,
    }).addTo(map);

    // Add Fiber Optic Backbone connection lines
    FIBER_BACKBONE_ROUTES.forEach((route) => {
      // Glow line
      L.polyline(route, {
        color: "#34D399",
        weight: 5,
        opacity: 0.4,
      }).addTo(map);

      // Core line
      L.polyline(route, {
        color: "#059669",
        weight: 2.5,
        opacity: 0.9,
      }).addTo(map);
    });

    // Add Custom Marker Pins for each node
    NETWORK_NODES.forEach((node) => {
      const isNormal = node.status === "NORMAL";
      const markerColor = isNormal ? "#059669" : "#D97706";
      const bgColor = isNormal ? "#ECFDF5" : "#FFFBEB";
      const ringColor = isNormal ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)";

      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
            <span style="position: absolute; width: 28px; height: 28px; border-radius: 9999px; background-color: ${ringColor}; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></span>
            <div style="position: relative; width: 22px; height: 22px; border-radius: 9999px; background-color: ${bgColor}; border: 2px solid ${markerColor}; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">
              <div style="width: 8px; height: 8px; border-radius: 9999px; background-color: ${markerColor};"></div>
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18],
      });

      const marker = L.marker(node.coords, { icon: customIcon }).addTo(map);

      // Clean HTML Popup
      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; color: #0F172A; min-width: 190px; padding: 2px 0;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: ${markerColor}; background: ${bgColor}; padding: 2px 6px; border-radius: 4px;">
              ${isNormal ? "Normal / Aktif" : "Dalam Pengawasan"}
            </span>
          </div>
          <div style="font-weight: 700; font-size: 13px; color: #064E3B; margin-bottom: 2px;">
            ${node.name}
          </div>
          <div style="font-size: 11px; color: #64748B; margin-bottom: 8px;">
            ${node.category}
          </div>
          <div style="border-top: 1px solid #E2E8F0; padding-top: 6px; display: grid; gap: 3px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748B;">Uplink:</span>
              <span style="font-weight: 600; color: #0F172A;">${node.details.uplink}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748B;">Perangkat:</span>
              <span style="font-weight: 500; color: #0F172A;">${node.details.devices}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748B;">Status Ping:</span>
              <span style="font-weight: 600; color: ${markerColor};">${node.details.lastPing}</span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        className: "custom-leaflet-popup",
      });

      marker.on("click", () => {
        setSelectedNode(node);
      });
    });

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(CAMPUS_CENTER, 16, {
        duration: 0.8,
      });
    }
  };

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
          : "h-[260px] rounded-b-[12px]"
      }`}
    >
      {/* Map Container Element */}
      <div
        ref={mapContainerRef}
        className="w-full flex-1 relative z-0 bg-[#F1F5F9]"
      />

      {/* Top Floating Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-[6px] shadow-xs border border-[#E2E8F0] flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669]"></span>
          </span>
          <span className="text-[11px] font-semibold text-[#064E3B]">
            Live FO Network
          </span>
        </div>
      </div>

      {/* Floating Action Controls */}
      <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleRecenter}
          title="Pusatkan Peta"
          aria-label="Pusatkan Peta"
          className="h-[30px] w-[30px] rounded-[6px] bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#475569] hover:text-[#0F172A] shadow-xs flex items-center justify-center transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Perkecil Tampilan" : "Perbesar Peta"}
          aria-label={isFullscreen ? "Perkecil Tampilan" : "Perbesar Peta"}
          className="h-[30px] w-[30px] rounded-[6px] bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#475569] hover:text-[#0F172A] shadow-xs flex items-center justify-center transition-colors cursor-pointer"
        >
          {isFullscreen ? (
            <Minimize2 className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none hidden sm:flex items-center gap-2">
        <div className="bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-[4px] border border-[#E2E8F0] text-[10px] text-[#475569] flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#059669]"></span>
          <span>4 Titik Distribusi Aktif</span>
        </div>
      </div>

      {/* Selected Node Drawer / Info Banner */}
      {selectedNode && (
        <div className="bg-white px-3 py-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] shrink-0 z-10">
          <div className="flex items-center gap-2 min-w-0">
            <Activity className="h-3.5 w-3.5 text-[#059669] shrink-0" />
            <span className="font-semibold text-[#0F172A] truncate">
              {selectedNode.name}
            </span>
            <span className="text-[#64748B] hidden md:inline truncate">
              ({selectedNode.details.uplink})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedNode(null)}
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
