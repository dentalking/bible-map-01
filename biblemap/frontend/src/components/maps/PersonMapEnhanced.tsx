'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Initialize Mapbox token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

// Available Mapbox styles with custom label-free versions
const MAP_STYLES = [
  { id: 'streets-v12', name: '거리', icon: '🛣️', style: 'mapbox://styles/mapbox/streets-v12' },
  { id: 'satellite-streets-v12', name: '위성', icon: '🛰️', style: 'mapbox://styles/mapbox/satellite-streets-v12' },
  { id: 'light-v11', name: '라이트', icon: '☀️', style: 'mapbox://styles/mapbox/light-v11' },
  { id: 'dark-v11', name: '다크', icon: '🌙', style: 'mapbox://styles/mapbox/dark-v11' },
  { id: 'outdoors-v12', name: '아웃도어', icon: '🏔️', style: 'mapbox://styles/mapbox/outdoors-v12' },
  { id: 'satellite-v9', name: '위성(순수)', icon: '🌍', style: 'mapbox://styles/mapbox/satellite-v9' },
  { id: 'no-labels', name: '깔끔', icon: '🎯', style: null }, // Custom label-free style
];

interface Location {
  id: string;
  name: string;
  modernName?: string;
  latitude: number;
  longitude: number;
  type?: string;
  year?: number;
}

interface Journey {
  id: string;
  title: string;
  path: {
    type: string;
    geometry: {
      type: string;
      coordinates: number[][];
    };
  };
  stops: Array<{
    orderIndex: number;
    location: Location;
  }>;
}

interface TimelineEvent {
  type: string;
  year: number;
  title: string;
  description: string;
  verse?: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
    modernName?: string;
  };
}

interface PersonMapEnhancedProps {
  mapData: {
    person: {
      id: string;
      name: string;
      nameHebrew?: string;
      birthYear?: number;
      deathYear?: number;
    };
    timeline: TimelineEvent[];
    stats: {
      totalEvents: number;
      biblicalEvents: number;
      databaseEvents: number;
      yearSpan?: {
        start: number;
        end: number;
      };
    };
  };
}

export default function PersonMapEnhanced({ mapData }: PersonMapEnhancedProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(MAP_STYLES[6]); // Default to no-labels (깔끔)
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const sourcesRef = useRef<string[]>([]);

  // Calculate bounds from timeline events
  const calculateBounds = () => {
    if (!mapData.timeline || mapData.timeline.length === 0) {
      // Default bounds (Middle East region)
      return {
        north: 42.0,
        south: 25.0,
        east: 50.0,
        west: 30.0,
      };
    }

    const latitudes = mapData.timeline.map(event => event.location.latitude);
    const longitudes = mapData.timeline.map(event => event.location.longitude);

    return {
      north: Math.max(...latitudes),
      south: Math.min(...latitudes),
      east: Math.max(...longitudes),
      west: Math.min(...longitudes),
    };
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (!mapboxgl.accessToken) {
      console.error('Mapbox token is not configured');
      return;
    }

    const bounds = calculateBounds();

    const initialStyle = selectedStyle.style || 'mapbox://styles/mapbox/light-v11';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: initialStyle,
      center: [
        (bounds.west + bounds.east) / 2,
        (bounds.north + bounds.south) / 2,
      ],
      zoom: 6,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-right');

    map.current.fitBounds(
      [
        [bounds.west, bounds.south],
        [bounds.east, bounds.north],
      ],
      { padding: 50 }
    );

    map.current.on('load', async () => {
      // Apply initial style if it's the custom no-labels style
      if (selectedStyle.id === 'no-labels') {
        const customStyle = await createLabelFreeStyle('mapbox://styles/mapbox/light-v11');
        if (customStyle) {
          map.current!.setStyle(customStyle);
          map.current!.once('styledata', () => {
            setMapLoaded(true);
          });
          return;
        }
      }

      setMapLoaded(true);

      // For regular styles, apply aggressive label hiding
      if (selectedStyle.id !== 'no-labels') {
        setTimeout(() => hideDefaultLabels(), 100);
        setTimeout(() => hideDefaultLabels(), 1000);
        setTimeout(() => hideDefaultLabels(), 3000);
        setTimeout(() => hideDefaultLabels(), 8000);

        // Set up event-driven label hiding
        const setupLabelHiding = () => {
          const hideLabelsFn = () => {
            setTimeout(() => hideDefaultLabels(), 100);
          };

          map.current?.on('data', hideLabelsFn);
          map.current?.on('sourcedata', hideLabelsFn);
          map.current?.on('styledata', hideLabelsFn);
          map.current?.on('render', hideLabelsFn);
        };

        setupLabelHiding();

        // Continuous monitoring (every 15 seconds)
        const labelHideInterval = setInterval(() => {
          hideDefaultLabels();
        }, 15000);

        // Cleanup
        map.current?.on('remove', () => {
          clearInterval(labelHideInterval);
        });
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []); // Only initialize once

  // Create custom label-free style based on existing style
  const createLabelFreeStyle = async (baseStyle: string) => {
    try {
      const response = await fetch(`https://api.mapbox.com/styles/v1/${baseStyle.replace('mapbox://styles/', '')}?access_token=${mapboxgl.accessToken}`);
      const style = await response.json();

      // Remove all symbol layers and text-based layers
      style.layers = style.layers.filter((layer: any) => {
        const shouldKeep =
          layer.type !== 'symbol' &&
          !layer.id.includes('label') &&
          !layer.id.includes('text') &&
          !layer.id.includes('place') &&
          !layer.id.includes('poi') &&
          !layer.id.includes('settlement') &&
          !(layer.layout && layer.layout['text-field']);

        return shouldKeep;
      });

      return style;
    } catch (error) {
      console.error('Failed to create label-free style:', error);
      return null;
    }
  };

  // Handle style changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Store current center and zoom
    const center = map.current.getCenter();
    const zoom = map.current.getZoom();

    const applyStyle = async () => {
      if (selectedStyle.id === 'no-labels') {
        // Create custom label-free style based on light theme
        const customStyle = await createLabelFreeStyle('mapbox://styles/mapbox/light-v11');
        if (customStyle) {
          map.current!.setStyle(customStyle);
        } else {
          // Fallback to satellite if custom style fails
          map.current!.setStyle('mapbox://styles/mapbox/satellite-v9');
        }
      } else {
        // Use regular style
        map.current!.setStyle(selectedStyle.style!);
      }

      // Wait for style to load
      map.current!.once('styledata', () => {
        // Restore view
        map.current!.setCenter(center);
        map.current!.setZoom(zoom);

        // Hide default labels for regular styles
        if (selectedStyle.id !== 'no-labels') {
          hideDefaultLabels();
        }

        // Re-add markers and paths
        clearMapElements();
        addMapElements();
      });
    };

    applyStyle();
  }, [selectedStyle, mapLoaded]);

  // Hide all default map labels and text to show only selected person's locations
  // Aggressive label hiding - hide ALL text/symbol layers
  const hideDefaultLabels = () => {
    if (!map.current) return;

    const hideLabelsWithRetry = (retryCount = 0) => {
      const style = map.current?.getStyle();
      if (!style || !style.layers) {
        if (retryCount < 5) {
          setTimeout(() => hideLabelsWithRetry(retryCount + 1), 1000);
        }
        return;
      }

      let hiddenCount = 0;
      const totalLayers = style.layers.length;
      const layersByType = {};
      const layersBySource = {};
      const visibleLayers = [];

      // Analyze all layers
      style.layers.forEach((layer, index) => {
        // Count by type
        layersByType[layer.type] = (layersByType[layer.type] || 0) + 1;

        // Count by source
        const source = layer.source || 'no-source';
        layersBySource[source] = (layersBySource[source] || 0) + 1;

        // Check visibility
        const isVisible = map.current!.getLayoutProperty(layer.id, 'visibility') !== 'none';

        // ULTRA AGGRESSIVE: Hide almost everything that could be a label
        const shouldHide =
          // Type-based filtering
          layer.type === 'symbol' ||
          // ID-based filtering (comprehensive list)
          layer.id.includes('label') ||
          layer.id.includes('text') ||
          layer.id.includes('symbol') ||
          layer.id.includes('place') ||
          layer.id.includes('poi') ||
          layer.id.includes('settlement') ||
          layer.id.includes('country') ||
          layer.id.includes('state') ||
          layer.id.includes('city') ||
          layer.id.includes('town') ||
          layer.id.includes('village') ||
          layer.id.includes('road') ||
          layer.id.includes('waterway') ||
          layer.id.includes('airport') ||
          layer.id.includes('transit') ||
          layer.id.includes('marine') ||
          layer.id.includes('natural') ||
          layer.id.includes('admin') ||
          layer.id.includes('boundary') ||
          layer.id.includes('number') ||
          layer.id.includes('street') ||
          layer.id.includes('highway') ||
          layer.id.includes('route') ||
          layer.id.includes('name') ||
          // Layout-based filtering
          (layer.layout && 'text-field' in layer.layout) ||
          (layer.layout && 'icon-image' in layer.layout && !layer.id.includes('custom'));

        if (shouldHide) {
          try {
            map.current!.setLayoutProperty(layer.id, 'visibility', 'none');
            hiddenCount++;
          } catch (e) {
            // Try alternative approach for stubborn layers
            try {
              map.current!.setPaintProperty(layer.id, 'text-opacity', 0);
              map.current!.setPaintProperty(layer.id, 'icon-opacity', 0);
            } catch (e2) {
              console.warn(`Failed to hide layer: ${layer.id}`);
            }
          }
        } else if (isVisible && (layer.type === 'symbol' || layer.id.toLowerCase().includes('label'))) {
          // Track potentially problematic visible layers
          visibleLayers.push({
            id: layer.id,
            type: layer.type,
            source: layer.source,
            'source-layer': layer['source-layer'],
            layout: layer.layout,
            paint: layer.paint
          });
        }
      });

      // Log detailed analysis
      if (retryCount === 0) {
        console.log('=== MAPBOX LAYER ANALYSIS ===');
        console.log(`Current style: ${selectedStyle.name} (${selectedStyle.id})`);
        console.log(`Total layers: ${totalLayers}`);
        console.log('Layers by type:', layersByType);
        console.log('Layers by source:', layersBySource);
        console.log(`Hidden ${hiddenCount}/${totalLayers} layers`);

        if (visibleLayers.length > 0) {
          console.warn('⚠️ POTENTIALLY PROBLEMATIC VISIBLE LAYERS:');
          visibleLayers.forEach(layer => {
            console.log(`  - ${layer.id} (${layer.type}) from ${layer.source}`);
            if (layer.layout && layer.layout['text-field']) {
              console.log(`    Text field: ${JSON.stringify(layer.layout['text-field'])}`);
            }
          });
        }
        console.log('=== END ANALYSIS ===');
      }

      console.log(`🗺️ [${mapData.person.name}] Hidden ${hiddenCount}/${totalLayers} layers (retry: ${retryCount})`);

      // Multiple retries to catch dynamically loaded layers
      if (retryCount < 3) {
        setTimeout(() => hideLabelsWithRetry(retryCount + 1), 2000);
      }
    };

    hideLabelsWithRetry();
  };

  // Clear all map elements
  const clearMapElements = () => {
    // Remove all markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Remove all sources and layers
    sourcesRef.current.forEach(sourceId => {
      if (map.current?.getLayer(`${sourceId}-line`)) {
        map.current.removeLayer(`${sourceId}-line`);
      }
      if (map.current?.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }
    });
    sourcesRef.current = [];
  };

  // Add markers from timeline events
  const addMapElements = () => {
    if (!map.current || !mapData.timeline) return;

    // Group events by location to handle overlapping markers
    const locationGroups: Record<string, { events: typeof mapData.timeline, indices: number[] }> = {};

    mapData.timeline.forEach((event, index) => {
      const locationKey = `${event.location.latitude.toFixed(4)},${event.location.longitude.toFixed(4)}`;
      if (!locationGroups[locationKey]) {
        locationGroups[locationKey] = { events: [], indices: [] };
      }
      locationGroups[locationKey].events.push(event);
      locationGroups[locationKey].indices.push(index);
    });

    // Log duplicate locations for debugging
    Object.entries(locationGroups).forEach(([key, group]) => {
      if (group.events.length > 1) {
        console.log(`📍 Duplicate location found: ${group.events[0].location.name}`);
        console.log(`   Events at this location: ${group.indices.map(i => i + 1).join(', ')}`);
      }
    });

    // Add markers for each timeline event with offset for duplicates
    mapData.timeline.forEach((event, index) => {
      const eventType = getEventType(event, index);
      const eventNumber = index + 1; // 1-based numbering for display

      // Calculate offset for duplicate locations
      const locationKey = `${event.location.latitude.toFixed(4)},${event.location.longitude.toFixed(4)}`;
      const group = locationGroups[locationKey];
      let offsetLat = 0;
      let offsetLng = 0;

      if (group.events.length > 1) {
        const positionInGroup = group.indices.indexOf(index);
        const totalInGroup = group.events.length;

        // Arrange markers in a circle around the original position
        const angle = (positionInGroup * 2 * Math.PI) / totalInGroup;
        const radius = 0.01; // Increased spacing for better visibility (in degrees)
        offsetLat = radius * Math.sin(angle);
        offsetLng = radius * Math.cos(angle);
      }

      const marker = createLocationMarker(
        {
          id: `timeline-${index}`,
          name: event.location.name,
          modernName: event.location.modernName,
          latitude: event.location.latitude + offsetLat,
          longitude: event.location.longitude + offsetLng,
        },
        eventType,
        eventNumber,
        event.title,
        `${eventNumber}. ${event.location.name} • ${formatYear(event.year)}${event.verse ? ` • ${event.verse}` : ''}`
      );
      markersRef.current.push(marker);
    });

    // Draw path connecting all events
    if (mapData.timeline.length > 1) {
      const coordinates = mapData.timeline.map(event => [
        event.location.longitude,
        event.location.latitude,
      ]);

      const sourceId = `timeline-path`;
      sourcesRef.current.push(sourceId);

      if (!map.current.getSource(sourceId)) {
        map.current.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates,
            },
          },
        });

        map.current.addLayer({
          id: `${sourceId}-line`,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#FF6B6B',
            'line-width': 3,
            'line-opacity': 0.7,
            'line-dasharray': [2, 1],
          },
        });
      }
    }
  };

  // Determine event type for marker styling
  const getEventType = (event: TimelineEvent, index: number) => {
    if (index === 0) return 'birth';
    if (index === mapData.timeline.length - 1) return 'death';
    return 'event';
  };

  // Add map elements when loaded
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    clearMapElements();
    addMapElements();
  }, [mapLoaded, mapData]);

  // Create custom marker with label
  const createLocationMarker = (
    location: Location,
    type: string,
    eventNumber: number,
    title: string,
    subtitle?: string
  ) => {
    const el = createMarkerElement(type, eventNumber, location.name);

    const popup = new mapboxgl.Popup({
      offset: 25,
      className: 'custom-popup'
    }).setHTML(
      `<div class="p-2">
        <h3 class="font-bold text-sm">
          <span class="inline-block bg-blue-500 text-white rounded-full w-6 h-6 text-center mr-2 text-xs leading-6">${eventNumber}</span>
          ${title}
        </h3>
        ${subtitle ? `<p class="text-xs text-gray-600">${subtitle}</p>` : ''}
        ${location.modernName ? `<p class="text-xs text-gray-500">현대: ${location.modernName}</p>` : ''}
      </div>`
    );

    return new mapboxgl.Marker(el, { anchor: 'bottom' })
      .setLngLat([location.longitude, location.latitude])
      .setPopup(popup)
      .addTo(map.current!);
  };

  // Create marker element with enhanced visibility
  const createMarkerElement = (type: string, eventNumber: number, label: string) => {
    const el = document.createElement('div');
    el.className = 'custom-marker-container';

    // Different colors for first, last, and middle events
    const colors = {
      birth: 'bg-green-500 border-green-400',
      death: 'bg-red-500 border-red-400',
      event: 'bg-blue-500 border-blue-400',
    };

    const textColors = {
      birth: 'text-white',
      death: 'text-white',
      event: 'text-white',
    };

    // Enhanced number-based marker with stronger visibility
    el.innerHTML = `
      <div class="flex flex-col items-center relative">
        <div class="${colors[type as keyof typeof colors] || 'bg-blue-500 border-blue-400'}
                    rounded-full w-10 h-10 shadow-xl border-2
                    hover:scale-110 transition-transform duration-200
                    ring-2 ring-white/50 flex items-center justify-center">
          <span class="text-base font-bold ${textColors[type as keyof typeof textColors] || 'text-white'}">${eventNumber}</span>
        </div>
        <div class="mt-2 px-3 py-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200">
          <span class="text-sm font-semibold text-gray-900 whitespace-nowrap">${label}</span>
        </div>
        <!-- Connection line to marker -->
        <div class="absolute top-10 w-0.5 h-2 bg-gray-400 opacity-60"></div>
      </div>
    `;

    el.style.cursor = 'pointer';
    el.style.zIndex = `${1000 - eventNumber}`; // Higher numbers have lower z-index to prevent overlap
    return el;
  };

  const formatYear = (year?: number) => {
    if (!year) return '';
    return year < 0 ? `${Math.abs(year)} BC` : `${year} AD`;
  };

  // Color scheme for timeline events
  const getEventColor = (type: string) => {
    const colors = {
      birth: '#4ECDC4',
      death: '#FF6B6B',
      event: '#45B7D1',
    };
    return colors[type as keyof typeof colors] || '#45B7D1';
  };

  if (!mapboxgl.accessToken) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Map not configured</p>
          <p className="text-sm text-gray-500">Please set NEXT_PUBLIC_MAPBOX_TOKEN</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Map Style Selector */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-gray-700">지도 스타일</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {MAP_STYLES.map(style => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style)}
              className={`
                px-2 py-1 text-xs rounded transition-all
                ${selectedStyle.id === style.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              title={style.name}
            >
              <div className="flex flex-col items-center">
                <span className="text-base mb-0.5">{style.icon}</span>
                <span className="text-[10px]">{style.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-gray-200">
        <h4 className="font-bold text-sm mb-3 text-gray-800">{mapData.person.name}의 행보</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">1</div>
            <span className="text-gray-700 font-medium">여정 시작 (시간순)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">2</div>
            <span className="text-gray-700 font-medium">중간 경유지</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">n</div>
            <span className="text-gray-700 font-medium">여정 종료</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-0.5 bg-red-400 opacity-70" style={{borderTop: '2px dashed #FF6B6B'}}></div>
            <span className="text-gray-700 font-medium">시간순 이동 경로</span>
          </div>
        </div>

        {mapData.stats && (
          <div className="mt-4 pt-3 border-t border-gray-300">
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-900">
              <div className="font-semibold mb-1">📊 통계 정보</div>
              <div className="space-y-1 text-blue-800">
                <div>• 총 {mapData.stats.totalEvents}개 사건</div>
                <div>• 성경 기록: {mapData.stats.biblicalEvents}개</div>
                <div>• 데이터베이스: {mapData.stats.databaseEvents}개</div>
                {mapData.stats.yearSpan && (
                  <div>• 활동 기간: {formatYear(mapData.stats.yearSpan.start)} ~ {formatYear(mapData.stats.yearSpan.end)}</div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500">
          💡 지도에는 선택된 인물과 관련된 지명만 표시됩니다
        </div>
      </div>
    </div>
  );
}