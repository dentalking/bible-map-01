'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Initialize Mapbox token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

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

interface PersonMapProps {
  mapData: {
    person: {
      id: string;
      name: string;
      birthYear?: number;
      deathYear?: number;
    };
    locations: {
      birth: Location | null;
      death: Location | null;
    };
    events: Array<{
      id: string;
      title: string;
      year?: number;
      location: Location | null;
    }>;
    journeys: Journey[];
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  };
}

export default function PersonMap({ mapData }: PersonMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Check if token is available
    if (!mapboxgl.accessToken) {
      console.error('Mapbox token is not configured');
      return;
    }

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [(mapData.bounds.west + mapData.bounds.east) / 2,
                (mapData.bounds.north + mapData.bounds.south) / 2],
      zoom: 6,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Fit to bounds with padding
    map.current.fitBounds(
      [
        [mapData.bounds.west, mapData.bounds.south],
        [mapData.bounds.east, mapData.bounds.north],
      ],
      { padding: 50 }
    );

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapData.bounds]);

  // Add markers and paths when map is loaded
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Add birth marker
    if (mapData.locations.birth) {
      const el = createMarkerElement('birth', mapData.locations.birth.name);
      new mapboxgl.Marker(el, { anchor: 'bottom' })
        .setLngLat([mapData.locations.birth.longitude, mapData.locations.birth.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="p-2">
              <h3 class="font-bold">${mapData.locations.birth.name}</h3>
              <p class="text-sm">Birth Place</p>
              ${mapData.locations.birth.year ? `<p class="text-xs">${formatYear(mapData.locations.birth.year)}</p>` : ''}
              ${mapData.locations.birth.modernName ? `<p class="text-xs text-gray-500">${mapData.locations.birth.modernName}</p>` : ''}
            </div>`
          )
        )
        .addTo(map.current);
    }

    // Add death marker
    if (mapData.locations.death) {
      const el = createMarkerElement('death', mapData.locations.death.name);
      new mapboxgl.Marker(el, { anchor: 'bottom' })
        .setLngLat([mapData.locations.death.longitude, mapData.locations.death.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="p-2">
              <h3 class="font-bold">${mapData.locations.death.name}</h3>
              <p class="text-sm">Death Place</p>
              ${mapData.locations.death.year ? `<p class="text-xs">${formatYear(mapData.locations.death.year)}</p>` : ''}
              ${mapData.locations.death.modernName ? `<p class="text-xs text-gray-500">${mapData.locations.death.modernName}</p>` : ''}
            </div>`
          )
        )
        .addTo(map.current);
    }

    // Add event markers
    mapData.events.forEach((event) => {
      if (event.location) {
        const el = createMarkerElement('event', event.title);
        new mapboxgl.Marker(el, { anchor: 'bottom' })
          .setLngLat([event.location.longitude, event.location.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div class="p-2">
                <h3 class="font-bold">${event.title}</h3>
                <p class="text-sm">${event.location.name}</p>
                ${event.year ? `<p class="text-xs">${formatYear(event.year)}</p>` : ''}
                ${event.location.modernName ? `<p class="text-xs text-gray-500">${event.location.modernName}</p>` : ''}
              </div>`
            )
          )
          .addTo(map.current);
      }
    });

    // Add journey paths
    mapData.journeys.forEach((journey, index) => {
      if (!map.current) return;

      // Add source for journey path
      const sourceId = `journey-${journey.id}`;
      if (!map.current.getSource(sourceId)) {
        map.current.addSource(sourceId, {
          type: 'geojson',
          data: journey.path as any,
        });

        // Add line layer for journey path
        map.current.addLayer({
          id: `${sourceId}-line`,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': getJourneyColor(index),
            'line-width': 3,
            'line-opacity': 0.8,
          },
        });
      }

      // Add markers for journey stops
      journey.stops.forEach((stop, stopIndex) => {
        const el = createMarkerElement('journey-stop', `Stop ${stopIndex + 1}`);
        new mapboxgl.Marker(el, { anchor: 'bottom' })
          .setLngLat([stop.location.longitude, stop.location.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div class="p-2">
                <h3 class="font-bold">${stop.location.name}</h3>
                <p class="text-sm">${journey.title}</p>
                <p class="text-xs">Stop ${stopIndex + 1}</p>
                ${stop.location.modernName ? `<p class="text-xs text-gray-500">${stop.location.modernName}</p>` : ''}
              </div>`
            )
          )
          .addTo(map.current!);
      });
    });

  }, [mapLoaded, mapData]);

  // Helper function to create marker elements
  const createMarkerElement = (type: string, label: string) => {
    const el = document.createElement('div');
    el.className = 'custom-marker';

    const colors = {
      birth: 'bg-green-500',
      death: 'bg-red-500',
      event: 'bg-blue-500',
      'journey-stop': 'bg-yellow-500',
    };

    const icons = {
      birth: '👶',
      death: '✝️',
      event: '📍',
      'journey-stop': '🚩',
    };

    el.innerHTML = `
      <div class="flex flex-col items-center">
        <div class="${colors[type as keyof typeof colors] || 'bg-gray-500'}
                    rounded-full p-2 shadow-lg border-2 border-white">
          <span class="text-lg">${icons[type as keyof typeof icons] || '📍'}</span>
        </div>
        <div class="text-xs mt-1 px-2 py-1 bg-white rounded shadow max-w-[100px] truncate">
          ${label}
        </div>
      </div>
    `;

    return el;
  };

  // Helper function to format years
  const formatYear = (year: number) => {
    return year < 0 ? `${Math.abs(year)} BC` : `${year} AD`;
  };

  // Helper function to get journey colors
  const getJourneyColor = (index: number) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    return colors[index % colors.length];
  };

  // Show loading or error state if no token
  if (!mapboxgl.accessToken) {
    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Map not configured</p>
          <p className="text-sm text-gray-500">Please set NEXT_PUBLIC_MAPBOX_TOKEN in environment variables</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
        <h4 className="font-semibold text-sm mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">👶</span>
            <span>Birth Place</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">✝️</span>
            <span>Death Place</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📍</span>
            <span>Event</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🚩</span>
            <span>Journey Stop</span>
          </div>
        </div>
      </div>
    </div>
  );
}