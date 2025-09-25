'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@/styles/map-touch.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface MapItem {
  type: 'location' | 'event' | 'journey';
  id: string;
  name: string;
  coordinates: [number, number];
  data: Record<string, unknown>;
}

interface SearchMapProps {
  items: MapItem[];
  selectedItem?: Record<string, unknown>;
  hoveredItem?: Record<string, unknown>;
  onItemClick?: (item: MapItem) => void;
}

export default function SearchMap({ items, selectedItem, hoveredItem, onItemClick }: SearchMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);
  const [showGestureHint, setShowGestureHint] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [35, 31.5], // Center on Holy Land
      zoom: 6,
      pitch: 0,
      bearing: 0,
    });

    map.current.addControl(new mapboxgl.NavigationControl({
      showCompass: true,
      showZoom: true,
      visualizePitch: true
    }), 'top-right');
    map.current.addControl(new mapboxgl.ScaleControl({
      maxWidth: 100,
      unit: 'metric'
    }), 'bottom-right');

    // Add fullscreen control for better mobile experience
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Add geolocation control for mobile
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: false,
        showUserHeading: false,
        showAccuracyCircle: false
      }),
      'top-right'
    );

    // Enable touch gestures
    map.current.touchZoomRotate.enable();
    map.current.touchPitch.enable();

    map.current.on('load', () => {
      setIsLoaded(true);

      // Show gesture hint on mobile
      if ('ontouchstart' in window) {
        setShowGestureHint(true);
        setTimeout(() => setShowGestureHint(false), 3000);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add markers for search results
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current.clear();

    // Add new markers
    items.forEach(item => {
      if (!item.coordinates) return;

      // Create marker element
      const el = document.createElement('div');
      el.className = 'search-marker';

      // Style based on type
      if (item.type === 'location') {
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#10B981'; // green
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';
      } else if (item.type === 'event') {
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#EF4444'; // red
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';
      } else if (item.type === 'journey') {
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '4px';
        el.style.backgroundColor = '#8B5CF6'; // purple
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';
      }

      el.addEventListener('click', () => {
        if (onItemClick) {
          onItemClick(item);
        }
      });

      // Create popup with touch-friendly options
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '300px',
        className: 'touch-popup'
      }).setHTML(`
        <div class="p-3 max-w-xs">
          <p class="text-xs text-gray-500 mb-1">
            ${item.type === 'location' ? '📍 장소' :
              item.type === 'event' ? '📅 사건' : '🚶 여정'}
          </p>
          <h3 class="font-semibold text-base mb-2">${item.name}</h3>
          <button onclick="window.dispatchEvent(new CustomEvent('map-item-detail', { detail: '${item.id}' }))"
            class="text-xs text-blue-600 hover:text-blue-800 font-medium py-1 px-2 bg-blue-50 rounded">
            자세히 보기 →
          </button>
        </div>
      `);

      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat(item.coordinates)
        .setPopup(popup)
        .addTo(map.current!);

      markers.current.set(item.id, marker);
    });

    // Fit bounds to show all markers
    if (items.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      items.forEach(item => {
        if (item.coordinates) {
          bounds.extend(item.coordinates);
        }
      });

      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 10,
        duration: 1000,
      });
    }
  }, [items, isLoaded, onItemClick]);

  // Highlight selected item
  useEffect(() => {
    if (!map.current || !isLoaded || !selectedItem) return;

    // Find the marker for selected item
    const markerId = items.find(item =>
      item.data.id === selectedItem.id
    )?.id;

    if (markerId) {
      const marker = markers.current.get(markerId);
      if (marker) {
        const element = marker.getElement();

        // Update all markers styling
        markers.current.forEach((m, id) => {
          const el = m.getElement();
          if (id === markerId) {
            // Highlight selected marker
            el.style.transform = 'scale(1.3)';
            el.style.zIndex = '1000';
            el.style.filter = 'brightness(1.2)';
          } else {
            // Dim other markers
            el.style.transform = 'scale(1)';
            el.style.zIndex = '1';
            el.style.filter = 'brightness(0.7)';
          }
        });

        // Pan to selected marker
        const lngLat = marker.getLngLat();
        map.current.panTo([lngLat.lng, lngLat.lat], {
          duration: 500,
        });
      }
    }
  }, [selectedItem, items, isLoaded]);

  // Highlight hovered item
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Find the marker for hovered item
    const markerId = items.find(item =>
      item.data.id === hoveredItem?.id
    )?.id;

    if (markerId) {
      const marker = markers.current.get(markerId);
      if (marker && !selectedItem) {
        marker.getElement().style.transform = 'scale(1.2)';
      }
    }

    // Reset on hover out
    return () => {
      if (!selectedItem) {
        markers.current.forEach(marker => {
          const element = marker.getElement();
          element.style.transform = 'scale(1)';
        });
      }
    };
  }, [hoveredItem, selectedItem, items, isLoaded]);

  // Draw lines for journeys
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Remove existing journey lines
    if (map.current.getLayer('journey-lines')) {
      map.current.removeLayer('journey-lines');
    }
    if (map.current.getSource('journey-lines')) {
      map.current.removeSource('journey-lines');
    }

    // Group journey waypoints by journey ID
    const journeys = new Map<string, MapItem[]>();
    items.forEach(item => {
      if (item.type === 'journey') {
        const journeyId = item.id.split('-')[0];
        if (!journeys.has(journeyId)) {
          journeys.set(journeyId, []);
        }
        journeys.get(journeyId)!.push(item);
      }
    });

    // Create LineString features for each journey
    const features: GeoJSON.Feature[] = [];
    journeys.forEach((waypoints, journeyId) => {
      if (waypoints.length > 1) {
        // Sort waypoints by order
        waypoints.sort((a, b) => {
          const orderA = parseInt(a.id.split('-')[1]);
          const orderB = parseInt(b.id.split('-')[1]);
          return orderA - orderB;
        });

        features.push({
          type: 'Feature',
          properties: {
            journeyId,
            name: waypoints[0].name,
          },
          geometry: {
            type: 'LineString',
            coordinates: waypoints.map(wp => wp.coordinates),
          },
        });
      }
    });

    if (features.length > 0) {
      // Add journey lines
      map.current.addSource('journey-lines', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features,
        },
      });

      map.current.addLayer({
        id: 'journey-lines',
        type: 'line',
        source: 'journey-lines',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#8B5CF6',
          'line-width': 3,
          'line-opacity': 0.6,
          'line-dasharray': [2, 2],
        },
      });
    }
  }, [items, isLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">지도 로딩 중...</p>
          </div>
        </div>
      )}

      {/* Gesture Hint */}
      {showGestureHint && (
        <div className="gesture-hint">
          두 손가락으로 확대/축소, 회전 가능
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg">
        <h3 className="text-xs font-semibold mb-2 text-gray-700">검색 결과</h3>
        <div className="space-y-1">
          {items.some(i => i.type === 'location') && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600">장소</span>
            </div>
          )}
          {items.some(i => i.type === 'event') && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-600">사건</span>
            </div>
          )}
          {items.some(i => i.type === 'journey') && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500"></div>
              <span className="text-xs text-gray-600">여정</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}