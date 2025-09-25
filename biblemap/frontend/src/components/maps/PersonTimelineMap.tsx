'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const MAP_STYLES = [
  { id: 'satellite-streets-v12', name: '위성', icon: '🛰️', style: 'mapbox://styles/mapbox/satellite-streets-v12' },
  { id: 'light-v11', name: '라이트', icon: '☀️', style: 'mapbox://styles/mapbox/light-v11' },
  { id: 'dark-v11', name: '다크', icon: '🌙', style: 'mapbox://styles/mapbox/dark-v11' },
];

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

interface PersonTimelineMapProps {
  personId: string;
  personName: string;
}

export default function PersonTimelineMap({ personId, personName }: PersonTimelineMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(MAP_STYLES[0]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const pathSourceRef = useRef<string | null>(null);
  const animationRef = useRef<number | null>(null);

  // Load timeline data
  useEffect(() => {
    loadTimelineData();
  }, [personId]);

  const loadTimelineData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/persons/${personId}/timeline/detailed`
      );
      setTimeline(response.data.timeline || []);
      setStats(response.data.stats);
      setCurrentEventIndex(0);
    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: selectedStyle.style,
      center: [35.2137, 31.7683], // Jerusalem center
      zoom: 7,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-right');

    map.current.on('load', () => {
      setMapLoaded(true);

      // Continuous aggressive label hiding for timeline
      const continuousHiding = () => {
        hideDefaultLabels();
        setTimeout(() => hideDefaultLabels(), 1000);
        setTimeout(() => hideDefaultLabels(), 3000);
        setTimeout(() => hideDefaultLabels(), 7000);
        setTimeout(() => hideDefaultLabels(), 15000);
      };

      continuousHiding();

      // Event-based hiding
      const eventHiding = () => {
        setTimeout(() => hideDefaultLabels(), 100);
      };

      map.current.on('data', eventHiding);
      map.current.on('sourcedata', eventHiding);
      map.current.on('styledata', eventHiding);

      // Ultra-frequent monitoring for timeline (every 10 seconds)
      const hyperInterval = setInterval(() => {
        hideDefaultLabels();
      }, 10000);

      // Cleanup
      const cleanup = () => {
        clearInterval(hyperInterval);
        map.current?.off('data', eventHiding);
        map.current?.off('sourcedata', eventHiding);
        map.current?.off('styledata', eventHiding);
      };

      map.current.on('remove', cleanup);
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Handle style changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const center = map.current.getCenter();
    const zoom = map.current.getZoom();

    map.current.setStyle(selectedStyle.style);

    map.current.once('styledata', () => {
      map.current!.setCenter(center);
      map.current!.setZoom(zoom);
      hideDefaultLabels();
      updateMapForCurrentEvent();
    });
  }, [selectedStyle, mapLoaded]);

  // Update map when event index changes
  useEffect(() => {
    if (mapLoaded && timeline.length > 0) {
      updateMapForCurrentEvent();
    }
  }, [currentEventIndex, timeline, mapLoaded]);

  // Ultra aggressive label hiding for timeline map
  const hideDefaultLabels = () => {
    if (!map.current) return;

    const hideLabelsAggressively = (retryCount = 0) => {
      const style = map.current?.getStyle();
      if (!style || !style.layers) {
        if (retryCount < 5) {
          setTimeout(() => hideLabelsAggressively(retryCount + 1), 1000);
        }
        return;
      }

      let hiddenCount = 0;

      style.layers.forEach(layer => {
        // MAXIMUM AGGRESSION: Hide everything that could possibly be a label
        const shouldHide =
          layer.type === 'symbol' ||
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
          layer.id.includes('name') ||
          layer.id.includes('number') ||
          (layer.layout && 'text-field' in layer.layout) ||
          (layer.layout && 'icon-image' in layer.layout);

        if (shouldHide) {
          try {
            map.current!.setLayoutProperty(layer.id, 'visibility', 'none');
            hiddenCount++;
          } catch (e) {
            try {
              // Alternative hiding methods
              map.current!.setPaintProperty(layer.id, 'text-opacity', 0);
              map.current!.setPaintProperty(layer.id, 'icon-opacity', 0);
            } catch (e2) {
              // Silent fail for stubborn layers
            }
          }
        }
      });

      console.log(`🗺️ [TIMELINE-${personName}] Aggressively hidden ${hiddenCount} layers (retry: ${retryCount})`);

      if (retryCount < 3) {
        setTimeout(() => hideLabelsAggressively(retryCount + 1), 3000);
      }
    };

    hideLabelsAggressively();
  };

  // Update map for current event
  const updateMapForCurrentEvent = () => {
    if (!map.current || timeline.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Remove existing path
    if (pathSourceRef.current) {
      if (map.current.getLayer(`${pathSourceRef.current}-line`)) {
        map.current.removeLayer(`${pathSourceRef.current}-line`);
      }
      if (map.current.getSource(pathSourceRef.current)) {
        map.current.removeSource(pathSourceRef.current);
      }
    }

    // Get events up to current index
    const visibleEvents = timeline.slice(0, currentEventIndex + 1);

    // Group events by location to handle overlapping markers
    const locationGroups: Record<string, { events: typeof visibleEvents, indices: number[] }> = {};

    visibleEvents.forEach((event, index) => {
      const locationKey = `${event.location.latitude.toFixed(4)},${event.location.longitude.toFixed(4)}`;
      if (!locationGroups[locationKey]) {
        locationGroups[locationKey] = { events: [], indices: [] };
      }
      locationGroups[locationKey].events.push(event);
      locationGroups[locationKey].indices.push(index);
    });

    // Add markers for visible events
    visibleEvents.forEach((event, index) => {
      const isCurrentEvent = index === currentEventIndex;
      const eventNumber = index + 1; // 1-based numbering

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

      const el = createEventMarker(event, eventNumber, isCurrentEvent);

      const popup = new mapboxgl.Popup({
        offset: 25,
        className: 'timeline-popup'
      }).setHTML(
        `<div class="p-3">
          <h3 class="font-bold text-sm mb-1">
            <span class="inline-block bg-blue-500 text-white rounded-full w-5 h-5 text-center mr-2 text-xs leading-5">${eventNumber}</span>
            ${event.title}
          </h3>
          <p class="text-xs text-gray-600 mb-1">${event.description}</p>
          ${event.verse ? `<p class="text-xs text-blue-600 font-medium">${event.verse}</p>` : ''}
          <p class="text-xs text-gray-500 mt-1">${formatYear(event.year)}</p>
          ${event.location.modernName ? `<p class="text-xs text-gray-400">현대: ${event.location.modernName}</p>` : ''}
        </div>`
      );

      const marker = new mapboxgl.Marker(el, { anchor: 'bottom' })
        .setLngLat([event.location.longitude + offsetLng, event.location.latitude + offsetLat])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);

      // Open popup for current event
      if (isCurrentEvent) {
        marker.togglePopup();
      }
    });

    // Draw path between events
    if (visibleEvents.length > 1) {
      const coordinates = visibleEvents.map(event => [
        event.location.longitude,
        event.location.latitude,
      ]);

      const sourceId = `timeline-path-${Date.now()}`;
      pathSourceRef.current = sourceId;

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
        },
      });
    }

    // Center on current event
    const currentEvent = timeline[currentEventIndex];
    if (currentEvent) {
      map.current.flyTo({
        center: [currentEvent.location.longitude, currentEvent.location.latitude],
        zoom: 10,
        duration: 1500,
      });
    }
  };

  // Create enhanced event marker with better visibility
  const createEventMarker = (event: TimelineEvent, eventNumber: number, isCurrent: boolean) => {
    const el = document.createElement('div');
    el.className = 'timeline-marker';

    const color = isCurrent ? 'bg-red-500 border-red-400' : 'bg-blue-500 border-blue-400';
    const size = isCurrent ? 'w-10 h-10' : 'w-8 h-8';
    const textSize = isCurrent ? 'text-base font-bold' : 'text-sm font-bold';
    const pulseClass = isCurrent ? 'animate-pulse ring-4 ring-red-300' : '';

    el.innerHTML = `
      <div class="flex flex-col items-center relative">
        <div class="${color} ${size} rounded-full shadow-xl border-2 ${pulseClass}
                    hover:scale-110 transition-transform duration-200
                    flex items-center justify-center">
          <span class="text-white ${textSize}">${eventNumber}</span>
        </div>
        <div class="mt-2 px-3 py-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 max-w-[140px]">
          <p class="${isCurrent ? 'text-sm font-bold' : 'text-xs font-semibold'} text-gray-900 text-center truncate">${event.location.name}</p>
          <p class="text-[10px] text-gray-600 text-center font-medium">${formatYear(event.year)}</p>
          ${event.location.modernName && event.location.modernName !== event.location.name ?
            `<p class="text-[9px] text-gray-400 text-center truncate">${event.location.modernName}</p>` : ''}
        </div>
        ${isCurrent ? '<div class="absolute top-10 w-0.5 h-3 bg-red-400 opacity-60"></div>' : '<div class="absolute top-10 w-0.5 h-2 bg-gray-400 opacity-40"></div>'}
      </div>
    `;

    el.style.cursor = 'pointer';
    el.style.zIndex = isCurrent ? '2000' : `${1000 - eventNumber}`;
    return el;
  };

  // Play/pause animation
  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      setIsPlaying(true);
      animateTimeline();
    }
  };

  // Animate through timeline
  const animateTimeline = () => {
    if (currentEventIndex < timeline.length - 1) {
      animationRef.current = window.setTimeout(() => {
        setCurrentEventIndex(prev => prev + 1);
        animateTimeline();
      }, 3000); // 3 seconds per event
    } else {
      setIsPlaying(false);
    }
  };

  // Stop animation when component unmounts
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  // Format year
  const formatYear = (year: number) => {
    return year < 0 ? `${Math.abs(year)} BC` : `${year} AD`;
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">타임라인 데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-50">
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Map Style Selector */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 z-10">
        <div className="flex gap-1">
          {MAP_STYLES.map(style => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style)}
              className={`
                px-3 py-2 text-xs rounded transition-all
                ${selectedStyle.id === style.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <span className="text-base">{style.icon}</span>
              <span className="ml-1">{style.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Control Panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur shadow-lg z-10">
        {/* Event Info */}
        {timeline.length > 0 && timeline[currentEventIndex] && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {timeline[currentEventIndex].title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {timeline[currentEventIndex].description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  {timeline[currentEventIndex].verse && (
                    <span className="text-blue-600 font-medium">
                      📖 {timeline[currentEventIndex].verse}
                    </span>
                  )}
                  <span className="text-gray-500">
                    📅 {formatYear(timeline[currentEventIndex].year)}
                  </span>
                  <span className="text-gray-500">
                    📍 {timeline[currentEventIndex].location.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Slider */}
        <div className="p-4">
          <div className="flex items-center gap-4">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayback}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              {isPlaying ? (
                <>
                  <span>⏸️</span>
                  <span>일시정지</span>
                </>
              ) : (
                <>
                  <span>▶️</span>
                  <span>재생</span>
                </>
              )}
            </button>

            {/* Slider */}
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max={timeline.length - 1}
                value={currentEventIndex}
                onChange={(e) => {
                  setCurrentEventIndex(Number(e.target.value));
                  setIsPlaying(false);
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${
                    (currentEventIndex / (timeline.length - 1)) * 100
                  }%, #E5E7EB ${
                    (currentEventIndex / (timeline.length - 1)) * 100
                  }%, #E5E7EB 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{timeline[0] && formatYear(timeline[0].year)}</span>
                <span className="font-bold">
                  {currentEventIndex + 1} / {timeline.length} 이벤트
                </span>
                <span>{timeline[timeline.length - 1] && formatYear(timeline[timeline.length - 1].year)}</span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentEventIndex(Math.max(0, currentEventIndex - 1))}
                disabled={currentEventIndex === 0}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ◀️ 이전
              </button>
              <button
                onClick={() => setCurrentEventIndex(Math.min(timeline.length - 1, currentEventIndex + 1))}
                disabled={currentEventIndex === timeline.length - 1}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음 ▶️
              </button>
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
              <div className="flex justify-around">
                <span>총 {stats.totalEvents}개 행보</span>
                <span>성경 기록: {stats.biblicalEvents}개</span>
                <span>
                  기간: {stats.yearSpan && `${formatYear(stats.yearSpan.start)} ~ ${formatYear(stats.yearSpan.end)}`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}