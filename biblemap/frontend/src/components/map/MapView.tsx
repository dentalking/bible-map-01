'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import useAppStore from '@/store/useAppStore';
import { apiService } from '@/lib/api';
import MapControls from './MapControls';
import DetailModal from '@/components/modals/DetailModal';
import { MapErrorBoundary } from './MapErrorBoundary';
import { validateMapboxToken, DEFAULT_MAP_CONFIG, translateMapboxError } from '@/utils/mapbox';
import type { Event, Journey, Location, Person } from '@/types';

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/outdoors-v12');
  const [is3D, setIs3D] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const animationRef = useRef<number | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<Location | Person | Event | Journey | null>(null);
  const [modalType, setModalType] = useState<'location' | 'person' | 'event' | 'journey'>('location');

  const {
    mapView,
    setMapView,
    selectedPerson,
  } = useAppStore();

  // Validate Mapbox token before initializing
  const mapboxConfig = validateMapboxToken();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Check token validity first
    if (!mapboxConfig.isValid) {
      setMapError(mapboxConfig.errorMessage || '지도 서비스를 이용할 수 없습니다.');
      console.error('Mapbox token validation failed:', mapboxConfig.errorMessage);
      return;
    }

    // Set the valid token
    mapboxgl.accessToken = mapboxConfig.token!;

    console.log('Initializing map...');
    console.log('Container dimensions:', {
      width: mapContainer.current.offsetWidth,
      height: mapContainer.current.offsetHeight
    });

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: mapView.center || DEFAULT_MAP_CONFIG.center,
        zoom: mapView.zoom || DEFAULT_MAP_CONFIG.zoom,
        pitch: DEFAULT_MAP_CONFIG.pitch,
        bearing: DEFAULT_MAP_CONFIG.bearing,
        minZoom: DEFAULT_MAP_CONFIG.minZoom,
        maxZoom: DEFAULT_MAP_CONFIG.maxZoom,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-left');
      map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-left');

      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setIsLoaded(true);
        // Hide default map labels to show only biblical locations
        hideDefaultLabels();
        // Wait a moment for labels to be hidden, then load data
        setTimeout(() => {
          loadMapData();
        }, 100);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        const translatedError = translateMapboxError(e.error || e);
        setMapError(translatedError);
      });
    } catch (error) {
      console.error('Failed to initialize map:', error);
      const translatedError = translateMapboxError(error as Error);
      setMapError(translatedError);
    }

    map.current.on('move', () => {
      if (map.current) {
        const center = map.current.getCenter();
        const zoom = map.current.getZoom();
        setMapView({
          center: [center.lng, center.lat],
          zoom: zoom,
        });
      }
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update map style
  useEffect(() => {
    if (map.current && isLoaded) {
      map.current.setStyle(mapStyle);
      // Re-add layers after style change
      map.current.once('style.load', () => {
        // Hide default labels again after style change
        setTimeout(() => {
          hideDefaultLabels();
          // Wait for labels to be hidden before loading data
          setTimeout(() => {
            loadMapData();
          }, 200);
        }, 100);
        if (is3D) {
          enable3DTerrain();
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapStyle]);

  // Toggle 3D terrain
  useEffect(() => {
    if (map.current && isLoaded) {
      if (is3D) {
        enable3DTerrain();
      } else {
        disable3DTerrain();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [is3D]);

  const enable3DTerrain = () => {
    if (!map.current) return;

    map.current.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512,
      maxzoom: 14
    });

    map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

    map.current.addLayer({
      id: 'sky',
      type: 'sky',
      paint: {
        'sky-type': 'atmosphere',
        'sky-atmosphere-sun': [0.0, 0.0],
        'sky-atmosphere-sun-intensity': 15
      }
    });

    // Animate to 3D view
    map.current.easeTo({
      pitch: 60,
      bearing: -20,
      duration: 1000
    });
  };

  const disable3DTerrain = () => {
    if (!map.current) return;

    if (map.current.getLayer('sky')) {
      map.current.removeLayer('sky');
    }

    // @ts-expect-error - setTerrain with null is valid
    map.current.setTerrain(null);

    // Reset camera
    map.current.easeTo({
      pitch: 0,
      bearing: 0,
      duration: 1000
    });
  };

  // Hide default map labels to show only biblical locations
  const hideDefaultLabels = () => {
    if (!map.current) return;

    try {
      // Wait for style to load completely
      setTimeout(() => {
        if (!map.current) return;

        const style = map.current.getStyle();
        if (!style || !style.layers) return;

        // Hide various label layers commonly found in Mapbox styles
        const labelLayersToHide = [
          // Country labels
          'country-label',
          'country-label-lg',
          'country-label-md',
          'country-label-sm',
          // State/province labels
          'state-label',
          'state-label-lg',
          'state-label-md',
          'state-label-sm',
          // City labels
          'settlement-label',
          'settlement-major-label',
          'settlement-minor-label',
          'place-city-lg-n',
          'place-city-lg-s',
          'place-city-md-n',
          'place-city-md-s',
          'place-city-sm',
          'place-town',
          'place-village',
          'place-suburb',
          'place-neighbourhood',
          'place-hamlet',
          // POI labels
          'poi-label',
          'poi-scalerank1',
          'poi-scalerank2',
          'poi-scalerank3',
          'poi-parks',
          'poi-parks-scalerank1',
          'poi-parks-scalerank2',
          'poi-parks-scalerank3',
          // Water labels
          'water-label',
          'waterway-label',
          // Road labels
          'road-label',
          'road-number-shield',
          'road-exit-shield',
          // Airport labels
          'airport-label',
          // Transit labels
          'transit-label',
          // Marine labels
          'marine-label-sm',
          'marine-label-md-n',
          'marine-label-md-s',
          'marine-label-lg-n',
          'marine-label-lg-s',
          // Natural feature labels
          'natural-point-label',
          'natural-line-label',
          // Other common labels
          'place-other',
          'road-label-small',
          'road-label-medium',
          'road-label-large'
        ];

        // Hide each label layer if it exists
        labelLayersToHide.forEach(layerId => {
          try {
            if (map.current!.getLayer(layerId)) {
              map.current!.setLayoutProperty(layerId, 'visibility', 'none');
              console.log(`Hidden layer: ${layerId}`);
            }
          } catch (error) {
            // Silently continue if layer doesn't exist or can't be hidden
          }
        });

        // AGGRESSIVE: Hide ALL symbol layers that might be labels
        style.layers.forEach(layer => {
          try {
            if (layer.type === 'symbol') {
              // Don't hide our own biblical location labels
              if (!layer.id.includes('location-labels') &&
                  !layer.id.includes('biblical') &&
                  !layer.id.includes('cluster-count') &&
                  !layer.id.includes('event-') &&
                  !layer.id.includes('journey-')) {
                map.current!.setLayoutProperty(layer.id, 'visibility', 'none');
                console.log(`Hidden symbol layer: ${layer.id}`);
              }
            }
          } catch (error) {
            // Silently continue
          }
        });

        console.log('All default map labels hidden aggressively - showing only biblical locations');
      }, 500); // Small delay to ensure style is fully loaded

    } catch (error) {
      console.warn('Could not hide default labels:', error);
    }
  };

  // Load map data based on selected person
  const loadMapData = async () => {
    if (!map.current || !isLoaded) return;

    // Clear all existing map elements first
    clearAllMapElements();

    // If no person is selected, show empty map
    if (!selectedPerson) {
      console.log('No person selected - showing empty map');
      return;
    }

    console.log(`Loading data for selected person: ${selectedPerson.name}`);
    await loadPersonData(selectedPerson);
  };

  // Helper function to clear all map elements
  const clearAllMapElements = () => {
    if (!map.current) return;

    // Remove all location layers and sources
    const locationLayers = ['clusters', 'cluster-count', 'unclustered-point', 'location-labels', 'location-context-labels', 'highlighted-locations', 'highlighted-locations-pulse'];
    locationLayers.forEach(layerId => {
      if (map.current!.getLayer(layerId)) {
        map.current!.removeLayer(layerId);
      }
    });
    if (map.current.getSource('locations')) {
      map.current.removeSource('locations');
    }

    // Remove existing event markers
    document.querySelectorAll('.event-marker').forEach(el => el.remove());

    // Remove existing journey layers and sources
    const style = map.current.getStyle();
    if (style && style.layers) {
      style.layers.forEach(layer => {
        if (layer.id.startsWith('journey-line-') || layer.id.startsWith('journey-animated-')) {
          if (map.current!.getLayer(layer.id)) {
            map.current!.removeLayer(layer.id);
          }
        }
      });

      if (style.sources) {
        Object.keys(style.sources).forEach(sourceId => {
          if (sourceId.startsWith('journey-') && map.current!.getSource(sourceId)) {
            map.current!.removeSource(sourceId);
          }
        });
      }
    }

    // Remove journey markers
    document.querySelectorAll('.journey-stop-marker').forEach(el => el.remove());
  };

  // Load all data related to the selected person
  const loadPersonData = async (person: Person) => {
    if (!map.current) return;

    try {
      // 1. Load person's related locations (birth, death, and journey locations)
      await loadPersonLocations(person);

      // 2. Load person's events
      await loadPersonEvents(person);

      // 3. Load person's journeys
      await loadPersonJourneys(person);

      console.log(`Successfully loaded all data for ${person.name}`);
    } catch (error) {
      console.error(`Failed to load data for ${person.name}:`, error);
    }
  };

  // Load locations related to the person
  const loadPersonLocations = async (person: Person) => {
    if (!map.current) return;

    try {
      // Get all locations
      const locationsResponse = await apiService.locations.getAll();
      const allLocations = locationsResponse.data;

      // Find person-related location IDs
      const personLocationIds = new Set<number>();

      // Add birth and death locations
      if (person.birthPlaceId) personLocationIds.add(person.birthPlaceId);
      if (person.deathPlaceId) personLocationIds.add(person.deathPlaceId);

      // Get journeys to find additional locations
      const journeysResponse = await apiService.journeys.getAll();
      const personJourneys = journeysResponse.data.filter((journey: Journey) =>
        journey.personId === person.id
      );

      // Add journey locations
      personJourneys.forEach((journey: Journey) => {
        if (journey.stops) {
          journey.stops.forEach(stop => {
            personLocationIds.add(stop.location.id);
          });
        }
      });

      // Filter locations to only person-related ones
      const personLocations = allLocations.filter(location =>
        personLocationIds.has(location.id)
      );

      if (personLocations.length === 0) {
        console.log(`No locations found for ${person.name}`);
        return;
      }

      // Convert to GeoJSON
      const locationsGeoJSON = {
        type: 'FeatureCollection' as const,
        features: personLocations.map(location => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [location.longitude, location.latitude]
          },
          properties: {
            id: location.id,
            name: location.name,
            nameHebrew: location.nameHebrew,
            nameGreek: location.nameGreek,
            modernName: location.modernName,
            country: location.country,
            description: location.description,
            significance: location.significance,
            isPrimaryLocation: location.id === person.birthPlaceId || location.id === person.deathPlaceId
          }
        }))
      };

      // Add locations to map
      map.current.addSource('locations', {
        type: 'geojson',
        data: locationsGeoJSON as any,
        cluster: false // Don't cluster for person-focused view
      });

      // Add location circles with special styling for birth/death places
      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'locations',
        paint: {
          'circle-radius': [
            'case',
            ['get', 'isPrimaryLocation'], 14,  // Larger for birth/death places
            10  // Default size for journey locations
          ],
          'circle-color': [
            'case',
            ['get', 'isPrimaryLocation'], '#DC2626',  // Red for primary locations
            '#059669'  // Green for journey locations
          ],
          'circle-stroke-color': '#fff',
          'circle-stroke-width': 3,
          'circle-opacity': 0.9
        }
      });

      // Add location labels
      map.current.addLayer({
        id: 'location-labels',
        type: 'symbol',
        source: 'locations',
        layout: {
          'text-field': [
            'case',
            ['has', 'nameHebrew'],
            ['format',
              ['get', 'name'], { 'font-scale': 1 },
              '\n', {},
              ['get', 'nameHebrew'], { 'font-scale': 0.8 }
            ],
            ['get', 'name']
          ],
          'text-font': ['Open Sans Bold'],
          'text-size': [
            'case',
            ['get', 'isPrimaryLocation'], 16,  // Larger text for primary locations
            14  // Default size
          ],
          'text-offset': [0, 2],
          'text-anchor': 'top',
          'text-allow-overlap': false,
          'text-justify': 'center'
        },
        paint: {
          'text-color': [
            'case',
            ['get', 'isPrimaryLocation'], '#DC2626',
            '#059669'
          ],
          'text-halo-color': '#fff',
          'text-halo-width': 2
        }
      });

      // Click handler for locations
      map.current.on('click', 'unclustered-point', async (e) => {
        if (!e.features || !e.features[0]) return;
        const properties = e.features[0].properties;

        try {
          const locationData = await apiService.locations.getById(properties?.id);
          setModalData(locationData);
          setModalType('location');
          setModalOpen(true);
        } catch (error) {
          console.error('Failed to load location details:', error);
        }
      });

      // Hover effects
      map.current.on('mouseenter', 'unclustered-point', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'unclustered-point', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });

      console.log(`Loaded ${personLocations.length} locations for ${person.name}`);
    } catch (error) {
      console.error(`Failed to load locations for ${person.name}:`, error);
    }
  };

  // Load events related to the person
  const loadPersonEvents = async (person: Person) => {
    if (!map.current) return;

    try {
      const eventsResponse = await apiService.events.getAll();
      const personEvents = eventsResponse.data.filter((event: Event) =>
        event.personId === person.id
      );

      if (personEvents.length === 0) {
        console.log(`No events found for ${person.name}`);
        return;
      }

      // Event category styling
      const getEventStyle = (category: string) => {
        const styles = {
          'EXODUS': { icon: '🌊', color: '#059669', bgColor: '#D1FAE5' },
          'MINISTRY': { icon: '✝️', color: '#7C2D12', bgColor: '#FEF3C7' },
          'CRUCIFIXION': { icon: '✠', color: '#DC2626', bgColor: '#FEE2E2' },
          'RESURRECTION': { icon: '🌅', color: '#F59E0B', bgColor: '#FEF3C7' },
          'MIRACLE': { icon: '✨', color: '#8B5CF6', bgColor: '#F3E8FF' },
          'TEACHING': { icon: '📖', color: '#0891B2', bgColor: '#E0F7FA' },
          'PROPHECY': { icon: '👁️', color: '#DB2777', bgColor: '#FCE7F3' }
        };
        return styles[category as keyof typeof styles] || { icon: '📅', color: '#6B7280', bgColor: '#F3F4F6' };
      };

      // Add event markers
      personEvents.forEach((event: Event) => {
        if (event.location) {
          const style = getEventStyle(event.category);

          const el = document.createElement('div');
          el.className = 'event-marker';
          el.style.cssText = `
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 3px solid ${style.color};
            background: ${style.bgColor};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.2s ease;
          `;
          el.innerHTML = style.icon;

          // Add hover effects
          el.addEventListener('mouseenter', () => {
            el.style.transform = 'scale(1.2)';
            el.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
          });

          el.addEventListener('mouseleave', () => {
            el.style.transform = 'scale(1)';
            el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
          });

          el.addEventListener('click', () => {
            setModalData(event);
            setModalType('event');
            setModalOpen(true);
          });

          new mapboxgl.Marker(el)
            .setLngLat([event.location.longitude, event.location.latitude])
            .setPopup(new mapboxgl.Popup({ offset: 30 }).setHTML(`
              <div class="p-4 max-w-sm">
                <div class="flex items-center gap-3 mb-3">
                  <span class="text-2xl">${style.icon}</span>
                  <h3 class="font-bold text-lg text-gray-900">${event.title}</h3>
                </div>
                <p class="text-sm text-gray-600 mb-2">
                  ${event.year ? `${Math.abs(event.year)} ${event.year < 0 ? 'BC' : 'AD'}` : '시기 미상'}
                </p>
                <p class="text-sm text-gray-700 mb-2">
                  📍 ${event.location.name}
                </p>
                <p class="text-sm text-gray-600 mb-3">${event.description}</p>
                <p class="text-xs text-blue-600 font-medium cursor-pointer">
                  클릭하여 자세히 보기
                </p>
              </div>
            `))
            .addTo(map.current!);
        }
      });

      console.log(`Loaded ${personEvents.length} events for ${person.name}`);
    } catch (error) {
      console.error(`Failed to load events for ${person.name}:`, error);
    }
  };

  // Load journeys related to the person
  const loadPersonJourneys = async (person: Person) => {
    if (!map.current) return;

    try {
      const journeysResponse = await apiService.journeys.getAll();
      const personJourneys = journeysResponse.data.filter((journey: Journey) =>
        journey.personId === person.id
      );

      if (personJourneys.length === 0) {
        console.log(`No journeys found for ${person.name}`);
        return;
      }

      // Journey styling based on purpose
      const getJourneyStyle = (purpose: string, index: number) => {
        const colors = ['#DC2626', '#059669', '#8B5CF6', '#F59E0B', '#0891B2'];
        const baseColor = colors[index % colors.length];

        if (purpose.includes('Promised Land') || purpose.includes('call')) {
          return { color: baseColor, width: 6, pattern: [3, 2], icon: '🏛️', description: '부르심의 여정' };
        }
        if (purpose.includes('missionary') || purpose.includes('Christianity')) {
          return { color: baseColor, width: 5, pattern: [2, 1], icon: '⛪', description: '선교 여정' };
        }
        if (purpose.includes('exile') || purpose.includes('captivity')) {
          return { color: baseColor, width: 4, pattern: [4, 3], icon: '⛓️', description: '유배의 길' };
        }
        return { color: baseColor, width: 5, pattern: [2, 1], icon: '🚶', description: '여정' };
      };

      personJourneys.forEach((journey: Journey, index: number) => {
        if (journey.stops && journey.stops.length > 1) {
          const coordinates = journey.stops.map((stop) => [
            stop.location.longitude,
            stop.location.latitude,
          ]);

          const style = getJourneyStyle(journey.purpose, index);

          // Add journey line
          const sourceId = `journey-${journey.id}`;
          const layerId = `journey-line-${journey.id}`;

          map.current!.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {
                title: journey.title,
                description: journey.description,
                purpose: journey.purpose,
                duration: journey.duration,
                distance: journey.distance,
              },
              geometry: {
                type: 'LineString',
                coordinates: coordinates,
              },
            },
          });

          map.current!.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': style.color,
              'line-width': style.width,
              'line-opacity': 0.9,
              'line-dasharray': style.pattern,
            },
          });

          // Enhanced journey markers at stops
          journey.stops.forEach((stop, stopIndex) => {
            const isFirst = stopIndex === 0;
            const isLast = stopIndex === journey.stops.length - 1;

            const el = document.createElement('div');
            el.className = 'journey-stop-marker';

            let markerContent = '';
            let markerSize = '32px';

            if (isFirst) {
              markerContent = '🚀';
              markerSize = '36px';
            } else if (isLast) {
              markerContent = '🎯';
              markerSize = '36px';
            } else {
              markerContent = `${stopIndex + 1}`;
              markerSize = '28px';
            }

            el.innerHTML = `
              <div style="
                width: ${markerSize};
                height: ${markerSize};
                background: ${style.color};
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                border: 3px solid white;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                font-size: ${isFirst || isLast ? '18px' : '14px'};
                cursor: pointer;
              ">${markerContent}</div>
            `;

            new mapboxgl.Marker(el)
              .setLngLat([stop.location.longitude, stop.location.latitude])
              .setPopup(new mapboxgl.Popup({ offset: 30 }).setHTML(`
                <div class="p-4 max-w-sm">
                  <div class="flex items-center gap-3 mb-3">
                    <span class="text-xl">${style.icon}</span>
                    <h4 class="font-bold text-lg text-gray-900">${journey.title}</h4>
                  </div>
                  <p class="text-sm text-blue-600 font-medium mb-2">${style.description}</p>
                  <div class="bg-gray-50 p-3 rounded-lg text-sm mb-3">
                    <p class="font-semibold text-gray-800 mb-1">정차지: ${stop.location.name}</p>
                    ${stop.description ? `<p class="text-gray-600 mb-1">${stop.description}</p>` : ''}
                    ${stop.duration ? `<p class="text-gray-600">기간: ${stop.duration}</p>` : ''}
                  </div>
                  <div class="text-sm text-gray-500 border-t pt-2">
                    <p>🏃‍♂️ 총 거리: ${journey.distance}km</p>
                    <p>⏱️ 총 기간: ${journey.duration}</p>
                    <p>📍 ${stopIndex + 1}번째 정차지 (총 ${journey.stops!.length}곳)</p>
                  </div>
                </div>
              `))
              .addTo(map.current!);
          });
        }
      });

      console.log(`Loaded ${personJourneys.length} journeys for ${person.name}`);
    } catch (error) {
      console.error(`Failed to load journeys for ${person.name}:`, error);
    }
  };

  // Animate journey paths
  useEffect(() => {
    if (!map.current || !isLoaded || !isAnimating || !mapView.showJourneys) return;

    const animateJourney = async () => {
      const journeysResponse = await apiService.journeys.getAll();

      for (const journey of journeysResponse.data) {
        if (!journey.stops || journey.stops.length < 2) continue;

        const coordinates = journey.stops.map((stop: { longitude: number; latitude: number }) => [
          stop.location.longitude,
          stop.location.latitude,
        ]);

        // Animate along the path
        for (let i = 0; i < coordinates.length - 1; i++) {
          const from = coordinates[i];
          const to = coordinates[i + 1];

          // Fly to each point
          await new Promise((resolve) => {
            if (!map.current) return resolve(null);

            map.current.flyTo({
              center: to as [number, number],
              zoom: 10,
              speed: 0.5,
              curve: 1,
              essential: true
            });

            setTimeout(resolve, 3000);
          });
        }
      }

      // Loop animation
      if (isAnimating) {
        animationRef.current = requestAnimationFrame(animateJourney);
      }
    };

    animateJourney();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnimating, mapView.showJourneys, isLoaded]);

  // Update map when selected person changes
  useEffect(() => {
    if (isLoaded && map.current) {
      loadMapData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPerson, isLoaded]);

  // Center on selected location
  useEffect(() => {
    if (map.current && mapView.selectedLocation) {
      map.current.flyTo({
        center: [mapView.selectedLocation.longitude, mapView.selectedLocation.latitude],
        zoom: 12,
        duration: 2000,
      });
    }
  }, [mapView.selectedLocation]);

  // Highlight selected person's locations
  useEffect(() => {
    if (map.current && isLoaded && selectedPerson) {
      // Wait a bit for map data to load before highlighting
      const timer = setTimeout(() => {
        let targetLocation = null;
        let zoomLevel = 10;

        // Priority: birthPlace > deathPlace > default Jerusalem
        if (selectedPerson.birthPlace) {
          targetLocation = [selectedPerson.birthPlace.longitude, selectedPerson.birthPlace.latitude];
          console.log(`Moving to ${selectedPerson.name}'s birth place: ${selectedPerson.birthPlace.name}`);
        } else if (selectedPerson.deathPlace) {
          targetLocation = [selectedPerson.deathPlace.longitude, selectedPerson.deathPlace.latitude];
          console.log(`Moving to ${selectedPerson.name}'s death place: ${selectedPerson.deathPlace.name}`);
        } else {
          // Default to Jerusalem if no specific location
          targetLocation = [35.2137, 31.7683];
          zoomLevel = 8;
          console.log(`No specific location for ${selectedPerson.name}, showing Jerusalem region`);
        }

        if (targetLocation) {
          map.current!.flyTo({
            center: targetLocation as [number, number],
            zoom: zoomLevel,
            duration: 1500,
            essential: true
          });
        }

        // Highlight related locations and journeys
        const highlightPersonFeatures = async () => {
          // Wait a bit more for map animation to settle
          setTimeout(() => {
            highlightPersonLocations(selectedPerson);
          }, 500);

          setTimeout(async () => {
            await highlightPersonJourneys(selectedPerson);
          }, 1000);
        };

        highlightPersonFeatures();
      }, 100);

      return () => clearTimeout(timer);
    } else if (map.current && isLoaded) {
      // Clear highlights when no person is selected
      clearLocationHighlights();
    }
  }, [selectedPerson, isLoaded]);

  // Function to highlight locations related to selected person
  const highlightPersonLocations = (person: Person) => {
    if (!map.current) return;

    try {
      // Check if locations source is available
      if (!map.current.getSource('locations')) {
        console.warn('Locations source not available yet, skipping highlight');
        return;
      }

      // Create filter for person's related locations
      const relatedLocationIds = [];

      if (person.birthPlaceId) {
        relatedLocationIds.push(person.birthPlaceId);
      }
      if (person.deathPlaceId && person.deathPlaceId !== person.birthPlaceId) {
        relatedLocationIds.push(person.deathPlaceId);
      }

      if (relatedLocationIds.length > 0) {
        // Add highlighted locations layer if it doesn't exist
        if (!map.current.getLayer('highlighted-locations')) {
          try {
            map.current.addLayer({
              id: 'highlighted-locations',
              type: 'circle',
              source: 'locations',
              filter: [
                'all',
                ['!', ['has', 'point_count']],
                ['in', ['get', 'id'], ['literal', relatedLocationIds]]
              ],
              paint: {
                'circle-radius': 12,
                'circle-color': '#F59E0B', // Amber color for highlights
                'circle-stroke-color': '#fff',
                'circle-stroke-width': 3,
                'circle-opacity': 1
              }
            });

            // Add pulsing animation layer
            map.current.addLayer({
              id: 'highlighted-locations-pulse',
              type: 'circle',
              source: 'locations',
              filter: [
                'all',
                ['!', ['has', 'point_count']],
                ['in', ['get', 'id'], ['literal', relatedLocationIds]]
              ],
              paint: {
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  5, 20,
                  15, 40
                ],
                'circle-color': '#F59E0B',
                'circle-opacity': 0.3,
                'circle-stroke-color': '#F59E0B',
                'circle-stroke-width': 1,
                'circle-stroke-opacity': 0.6
              }
            });
          } catch (layerError) {
            console.warn('Could not add highlight layers:', layerError);
            return;
          }
        } else {
          // Update filter for existing layer
          try {
            map.current.setFilter('highlighted-locations', [
              'all',
              ['!', ['has', 'point_count']],
              ['in', ['get', 'id'], ['literal', relatedLocationIds]]
            ]);

            map.current.setFilter('highlighted-locations-pulse', [
              'all',
              ['!', ['has', 'point_count']],
              ['in', ['get', 'id'], ['literal', relatedLocationIds]]
            ]);
          } catch (filterError) {
            console.warn('Could not update highlight filters:', filterError);
            return;
          }
        }

        // Safely dim other locations
        try {
          if (map.current.getLayer('unclustered-point')) {
            map.current.setPaintProperty('unclustered-point', 'circle-opacity', 0.4);
          }
          if (map.current.getLayer('location-labels')) {
            map.current.setPaintProperty('location-labels', 'text-opacity', 0.5);
          }
          if (map.current.getLayer('location-context-labels')) {
            map.current.setPaintProperty('location-context-labels', 'text-opacity', 0.3);
          }
        } catch (opacityError) {
          console.warn('Could not dim other locations:', opacityError);
        }

        console.log(`Highlighted ${relatedLocationIds.length} locations for ${person.name}`);
      } else {
        console.log(`No location IDs found for ${person.name}`);
      }
    } catch (error) {
      console.error('Error highlighting person locations:', error);
    }
  };

  // Function to clear location highlights
  const clearLocationHighlights = () => {
    if (!map.current) return;

    try {
      // Remove highlight layers if they exist
      if (map.current.getLayer('highlighted-locations')) {
        map.current.removeLayer('highlighted-locations');
      }
      if (map.current.getLayer('highlighted-locations-pulse')) {
        map.current.removeLayer('highlighted-locations-pulse');
      }

      // Safely restore original opacity for all locations
      try {
        if (map.current.getLayer('unclustered-point')) {
          map.current.setPaintProperty('unclustered-point', 'circle-opacity', 0.9);
        }
      } catch (layerError) {
        console.warn('Could not reset unclustered-point opacity:', layerError);
      }

      try {
        if (map.current.getLayer('location-labels')) {
          map.current.setPaintProperty('location-labels', 'text-opacity', [
            'interpolate',
            ['linear'],
            ['zoom'],
            5, 0.7,
            8, 1.0
          ]);
        }
      } catch (layerError) {
        console.warn('Could not reset location-labels opacity:', layerError);
      }

      try {
        if (map.current.getLayer('location-context-labels')) {
          map.current.setPaintProperty('location-context-labels', 'text-opacity', [
            'interpolate',
            ['linear'],
            ['zoom'],
            4, 0.6,
            6, 0.8,
            10, 0.4
          ]);
        }
      } catch (layerError) {
        console.warn('Could not reset location-context-labels opacity:', layerError);
      }

      // Clear journey highlights
      clearJourneyHighlights();

      console.log('Cleared location highlights');
    } catch (error) {
      console.error('Error clearing location highlights:', error);
    }
  };

  // Function to highlight journeys related to selected person
  const highlightPersonJourneys = async (person: Person) => {
    if (!map.current) return;

    try {
      // Get all journeys to find those related to the person
      const journeysResponse = await apiService.journeys.getAll();
      const personJourneys = journeysResponse.data.filter((journey: Journey) =>
        journey.personId === person.id
      );

      if (personJourneys.length > 0) {
        // Dim all existing journey lines
        const allLayers = map.current.getStyle().layers;
        allLayers?.forEach(layer => {
          if (layer.id.startsWith('journey-line-')) {
            map.current!.setPaintProperty(layer.id, 'line-opacity', 0.3);
            map.current!.setPaintProperty(layer.id, 'line-width', 2);
          }
        });

        // Highlight person's journeys
        personJourneys.forEach((journey: Journey) => {
          const layerId = `journey-line-${journey.id}`;

          if (map.current!.getLayer(layerId)) {
            // Make this journey more prominent
            map.current!.setPaintProperty(layerId, 'line-opacity', 1);
            map.current!.setPaintProperty(layerId, 'line-width', 6);
            map.current!.setPaintProperty(layerId, 'line-color', '#DC2626'); // Red color for highlighted journey
          }

          // Add animated flow effect
          if (journey.stops && journey.stops.length > 1) {
            const coordinates = journey.stops.map((stop) => [
              stop.location.longitude,
              stop.location.latitude,
            ]);

            const animatedLayerId = `journey-animated-${journey.id}`;
            const animatedSourceId = `journey-animated-source-${journey.id}`;

            // Remove existing animated layer if any
            if (map.current!.getLayer(animatedLayerId)) {
              map.current!.removeLayer(animatedLayerId);
            }
            if (map.current!.getSource(animatedSourceId)) {
              map.current!.removeSource(animatedSourceId);
            }

            map.current!.addSource(animatedSourceId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: coordinates,
                },
              },
            });

            map.current!.addLayer({
              id: animatedLayerId,
              type: 'line',
              source: animatedSourceId,
              layout: {
                'line-join': 'round',
                'line-cap': 'round',
              },
              paint: {
                'line-color': '#FCD34D', // Golden color for animation
                'line-width': 3,
                'line-opacity': 0.8,
                'line-dasharray': [0, 4, 3],
              },
            });

            // Add journey stop highlights
            journey.stops.forEach((stop, index) => {
              const stopMarkerId = `journey-stop-highlight-${journey.id}-${index}`;

              // Remove existing marker if any
              document.querySelectorAll(`.${stopMarkerId}`).forEach(el => el.remove());

              const el = document.createElement('div');
              el.className = `journey-stop-marker ${stopMarkerId}`;
              el.innerHTML = `
                <div style="
                  width: 30px;
                  height: 30px;
                  background: linear-gradient(45deg, #DC2626, #FCD34D);
                  color: white;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  border: 3px solid white;
                  font-size: 14px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  animation: pulse 2s infinite;
                ">${index + 1}</div>
                <style>
                  @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                  }
                </style>
              `;

              const marker = new mapboxgl.Marker(el)
                .setLngLat([stop.location.longitude, stop.location.latitude])
                .setPopup(new mapboxgl.Popup().setHTML(`
                  <div class="p-3 max-w-sm">
                    <h4 class="font-bold text-lg text-red-600">${journey.title}</h4>
                    <p class="text-sm mt-1 font-semibold">${stop.location.name}</p>
                    <p class="text-xs text-gray-600 mt-1">${stop.description || stop.location.description}</p>
                    ${stop.duration ? `<p class="text-xs text-blue-600 mt-1">Duration: ${stop.duration}</p>` : ''}
                    <p class="text-xs text-green-600 mt-1">Stop ${index + 1} of ${journey.stops!.length}</p>
                  </div>
                `))
                .addTo(map.current!);
            });
          }
        });

        console.log(`Highlighted ${personJourneys.length} journeys for ${person.name}`);
      } else {
        console.log(`No journeys found for ${person.name}`);
      }
    } catch (error) {
      console.error('Error highlighting person journeys:', error);
    }
  };

  // Function to clear journey highlights
  const clearJourneyHighlights = () => {
    if (!map.current) return;

    try {
      // Safely restore all journey lines to normal state
      const style = map.current.getStyle();
      if (style && style.layers) {
        style.layers.forEach(layer => {
          try {
            if (layer.id.startsWith('journey-line-') && map.current!.getLayer(layer.id)) {
              map.current!.setPaintProperty(layer.id, 'line-opacity', 0.6);
              map.current!.setPaintProperty(layer.id, 'line-width', 4);
              map.current!.setPaintProperty(layer.id, 'line-color', '#059669');
            }

            // Remove animated journey layers
            if (layer.id.startsWith('journey-animated-') && map.current!.getLayer(layer.id)) {
              map.current!.removeLayer(layer.id);
              const sourceId = layer.id.replace('journey-animated-', 'journey-animated-source-');
              if (map.current!.getSource(sourceId)) {
                map.current!.removeSource(sourceId);
              }
            }
          } catch (layerError) {
            console.warn(`Could not reset layer ${layer.id}:`, layerError);
          }
        });
      }

      // Remove journey stop highlight markers
      try {
        document.querySelectorAll('.journey-stop-marker').forEach(el => el.remove());
      } catch (domError) {
        console.warn('Could not remove journey markers:', domError);
      }

      console.log('Cleared journey highlights');
    } catch (error) {
      console.error('Error clearing journey highlights:', error);
    }
  };

  // Error state UI
  if (mapError) {
    return (
      <div className="relative w-full h-full min-h-[500px] bg-gray-50">
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 max-w-md">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">지도를 불러올 수 없습니다</h3>
            <p className="text-sm text-gray-600 mb-4">{mapError}</p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                새로고침
              </button>
              <button
                onClick={() => setMapError(null)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MapErrorBoundary>
      <div className="relative w-full h-full min-h-[500px]">
        <div ref={mapContainer} className="absolute inset-0" style={{ minHeight: '500px' }} />

        {/* Map Controls */}
        <MapControls
          mapStyle={mapStyle}
          setMapStyle={setMapStyle}
          is3D={is3D}
          setIs3D={setIs3D}
          isAnimating={isAnimating}
          setIsAnimating={setIsAnimating}
        />

      {/* Simple Person-Focused Legend */}
      {selectedPerson && (
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 max-w-sm">
          <div className="flex items-center gap-3 mb-3 border-b pb-2">
            <span className="text-2xl">{(selectedPerson as any).icon}</span>
            <div>
              <h3 className="font-bold text-lg text-gray-900">{selectedPerson.name}</h3>
              <p className="text-sm text-blue-600">{(selectedPerson as any).coreDescription}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#DC2626] border-2 border-white"></div>
              <span>주요 장소 (출생/사망지)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#059669] border-2 border-white"></div>
              <span>여정 관련 장소</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">📅</span>
              <span>주요 사건들</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🚶</span>
              <span>생애 여정</span>
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-3 pt-2 border-t">
            💡 지도의 모든 요소를 클릭하여 자세한 정보를 확인하세요
          </div>
        </div>
      )}

      {/* Empty State Message */}
      {!selectedPerson && (
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200">
          <div className="text-center">
            <span className="text-2xl mb-2 block">👤</span>
            <p className="text-sm font-medium text-gray-700 mb-1">인물을 선택하세요</p>
            <p className="text-xs text-gray-500">좌측 사이드바에서 성경 인물을 선택하면<br/>그들의 생애 여정이 지도에 표시됩니다</p>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90">
          <div className="text-center bg-white p-6 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-700 font-medium">성경 지도 로딩 중...</p>
            <p className="mt-2 text-sm text-gray-500">
              {selectedPerson ? `${selectedPerson.name}의 생애 여정을 준비하고 있습니다` : '사이드바에서 인물을 선택해주세요'}
            </p>
          </div>
        </div>
      )}

        {/* Detail Modal */}
        <DetailModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          data={modalData}
          type={modalType}
        />
      </div>
    </MapErrorBoundary>
  );
}