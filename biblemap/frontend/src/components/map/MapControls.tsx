'use client';

import { useState } from 'react';
import useAppStore from '@/store/useAppStore';

const MAP_STYLES = [
  { id: 'outdoors-v12', name: '🌍 지형 지도 (기본)', style: 'mapbox://styles/mapbox/outdoors-v12' },
  { id: 'light-v11', name: '☀️ 밝은 지도', style: 'mapbox://styles/mapbox/light-v11' },
  { id: 'dark-v11', name: '🌙 어두운 지도', style: 'mapbox://styles/mapbox/dark-v11' },
  { id: 'satellite-v9', name: '🛰️ 위성 지도', style: 'mapbox://styles/mapbox/satellite-v9' },
  { id: 'satellite-streets-v12', name: '🛰️ 위성 + 도로', style: 'mapbox://styles/mapbox/satellite-streets-v12' }
];

interface MapControlsProps {
  mapStyle: string;
  setMapStyle: (style: string) => void;
  is3D: boolean;
  setIs3D: (is3D: boolean) => void;
  isAnimating: boolean;
  setIsAnimating: (isAnimating: boolean) => void;
}

export default function MapControls({
  mapStyle,
  setMapStyle,
  is3D,
  setIs3D,
  isAnimating,
  setIsAnimating
}: MapControlsProps) {
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const { mapView, setMapView } = useAppStore();

  return (
    <div className="absolute top-4 right-4 z-10 space-y-2">
      {/* Map Style Selector */}
      <div className="relative">
        <button
          onClick={() => setShowStyleMenu(!showStyleMenu)}
          className="bg-white px-3 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center space-x-2"
        >
          <span className="text-sm font-medium">지도 스타일</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showStyleMenu && (
          <div className="absolute top-full mt-1 right-0 bg-white rounded-lg shadow-lg py-1 w-48">
            {MAP_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => {
                  setMapStyle(style.style);
                  setShowStyleMenu(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  mapStyle === style.style ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                {style.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3D Terrain Toggle */}
      <button
        onClick={() => setIs3D(!is3D)}
        className={`bg-white px-3 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2 ${
          is3D ? 'bg-blue-50 text-blue-600' : ''
        }`}
      >
        <span className="text-lg">🏔️</span>
        <span className="text-sm font-medium">3D 지형</span>
      </button>

      {/* Journey Animation Toggle */}
      {mapView.showJourneys && (
        <button
          onClick={() => setIsAnimating(!isAnimating)}
          className={`bg-white px-3 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2 ${
            isAnimating ? 'bg-green-50 text-green-600' : ''
          }`}
        >
          <span className="text-lg">▶️</span>
          <span className="text-sm font-medium">
            {isAnimating ? '애니메이션 중지' : '여정 애니메이션'}
          </span>
        </button>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-2 space-y-1">
        <button
          onClick={() => {
            // Return to default view (Jerusalem)
            setMapView({
              center: [35.2137, 31.7683],
              zoom: 7
            });
          }}
          className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
        >
          📍 예루살렘으로
        </button>
        <button
          onClick={() => {
            // Toggle all layers
            const allOn = mapView.showPersons && mapView.showEvents && mapView.showJourneys;
            setMapView({
              showPersons: !allOn,
              showEvents: !allOn,
              showJourneys: !allOn
            });
          }}
          className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
        >
          👁️ 모든 레이어 토글
        </button>
      </div>
    </div>
  );
}