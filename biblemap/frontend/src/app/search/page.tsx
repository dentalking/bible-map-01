'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { apiService } from '@/lib/api';
import useAppStore from '@/store/useAppStore';
import DetailModal from '@/components/modals/DetailModal';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { MapPinIcon, UserIcon, CalendarDaysIcon, MapIcon, BookOpenIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import type { Person, Location, Event, Journey, Theme } from '@/types';

// Dynamically import map to avoid SSR issues
const SearchMap = dynamic(() => import('@/components/search/SearchMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">지도 로딩 중...</p>
      </div>
    </div>
  ),
});

interface SearchResults {
  persons: Person[];
  locations: Location[];
  events: Event[];
  journeys: Journey[];
  themes: Theme[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<SearchResults>({
    persons: [],
    locations: [],
    events: [],
    journeys: [],
    themes: [],
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof SearchResults>('persons');
  const [showMap, setShowMap] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Person | Location | Event | Journey | null>(null);
  const [hoveredItem, setHoveredItem] = useState<Person | Location | Event | Journey | null>(null);
  const [mobileView, setMobileView] = useState<'results' | 'map'>('results');
  const [isMobile, setIsMobile] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<Person | Location | Event | Journey | null>(null);
  const [modalType, setModalType] = useState<'person' | 'location' | 'event' | 'journey'>('location');

  const {
    setMapView,
    setViewMode,
  } = useAppStore();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Swipe gestures for mobile view switching
  useSwipeGesture(
    {
      onSwipeLeft: () => {
        if (isMobile && mobileView === 'results') {
          setMobileView('map');
        }
      },
      onSwipeRight: () => {
        if (isMobile && mobileView === 'map') {
          setMobileView('results');
        }
      },
    },
    {
      threshold: 50,
    }
  );

  // Pull to refresh on mobile
  const { pullDistance, isRefreshing, isPulling } = usePullToRefresh({
    onRefresh: async () => {
      if (query) {
        await performSearch(query);
      }
    },
    disabled: !isMobile || loading,
    threshold: 80,
  });

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await apiService.search.query(searchQuery);
      setResults(response);

      // Set active tab to first category with results
      const categories: (keyof SearchResults)[] = ['locations', 'persons', 'events', 'journeys', 'themes'];
      for (const category of categories) {
        if (response[category]?.length > 0) {
          setActiveTab(category);
          break;
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResultCount = () => {
    return Object.values(results).reduce((sum, arr) => sum + (arr?.length || 0), 0);
  };

  const handleItemClick = (item: Person | Location | Event | Journey | Theme, type: keyof SearchResults) => {
    // Only set selected item for mappable types
    if (type !== 'themes') {
      setSelectedItem(item as Person | Location | Event | Journey);
      setModalData(item as Person | Location | Event | Journey);
      setModalType(type.slice(0, -1) as 'person' | 'location' | 'event' | 'journey'); // Remove 's' from plural
      setModalOpen(true);
    }
  };

  const handleViewOnFullMap = () => {
    if (selectedItem) {
      if (activeTab === 'locations') {
        const location = selectedItem as Location;
        setMapView({
          center: [location.longitude, location.latitude],
          zoom: 12,
          selectedLocation: location,
        });
      } else if (activeTab === 'journeys') {
        const journey = selectedItem as Journey;
        setMapView({
          selectedJourney: journey,
          showJourneys: true,
        });
      }
      setViewMode('map');
      router.push('/');
    }
  };

  // Get all mappable items (locations, events with locations, journeys)
  const getMappableItems = () => {
    const mappable: Array<{
      type: 'location' | 'event' | 'journey';
      id: string;
      name: string;
      coordinates: [number, number];
      data: Record<string, unknown>;
    }> = [];

    // Add all locations
    results.locations.forEach(loc => {
      mappable.push({
        type: 'location',
        id: loc.id,
        name: loc.name,
        coordinates: [loc.longitude, loc.latitude],
        data: loc,
      });
    });

    // Add events with locations
    results.events.forEach(event => {
      if (event.location) {
        mappable.push({
          type: 'event',
          id: event.id,
          name: event.title,
          coordinates: [event.location.longitude, event.location.latitude],
          data: event,
        });
      }
    });

    // Add journey waypoints
    results.journeys.forEach(journey => {
      if (journey.stops && journey.stops.length > 0) {
        const waypoints = journey.stops.map(stop => ({
          type: 'journey',
          id: `${journey.id}-${stop.order}`,
          name: journey.title,
          coordinates: stop.location ? [stop.location.longitude, stop.location.latitude] : null,
          data: journey,
        })).filter(wp => wp.coordinates);
        mappable.push(...waypoints);
      }
    });

    return mappable;
  };

  const tabs = [
    { key: 'locations', label: '장소', icon: MapPinIcon, count: results.locations.length },
    { key: 'persons', label: '인물', icon: UserIcon, count: results.persons.length },
    { key: 'events', label: '사건', icon: CalendarDaysIcon, count: results.events.length },
    { key: 'journeys', label: '여정', icon: MapIcon, count: results.journeys.length },
    { key: 'themes', label: '주제', icon: BookOpenIcon, count: results.themes.length },
  ];

  return (
    <div className="h-full flex flex-col relative">
      {/* Pull to Refresh Indicator */}
      {isMobile && (
        <div
          className="absolute top-0 left-0 right-0 bg-blue-500 flex items-center justify-center transition-all z-20"
          style={{
            height: `${pullDistance}px`,
            opacity: isPulling ? Math.min(pullDistance / 80, 1) : 0,
          }}
        >
          <div className="text-white">
            {isRefreshing ? (
              <ArrowPathIcon className="h-6 w-6 animate-spin" />
            ) : (
              <div className="text-center">
                <ArrowPathIcon
                  className="h-6 w-6 mx-auto"
                  style={{
                    transform: `rotate(${Math.min(pullDistance * 3, 180)}deg)`,
                  }}
                />
                <p className="text-xs mt-1">
                  {pullDistance >= 80 ? '놓으면 새로고침' : '당겨서 새로고침'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-white border-b px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">검색 결과</h1>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">
              &quot;{query}&quot;에 대한 검색 결과 {!loading && `(${getResultCount()}개)`}
            </p>
          </div>
          <button
            onClick={() => setShowMap(!showMap)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
          >
            <MapPinIcon className="h-4 sm:h-5 w-4 sm:w-5" />
            <span className="hidden sm:inline">{showMap ? '지도 숨기기' : '지도 보기'}</span>
            <span className="sm:hidden">{showMap ? '숨기기' : '지도'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">검색 중...</p>
          </div>
        </div>
      ) : getResultCount() === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MapPinIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
            <p className="text-gray-400 text-sm mt-2">다른 검색어를 입력해보세요.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Panel - Results */}
          <div className={`${showMap ? 'h-1/2 lg:h-auto lg:w-1/2' : 'h-full w-full'} lg:border-r bg-white overflow-y-auto`}>
            {/* Tabs */}
            <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-2 sm:py-3">
              <div className="flex space-x-1 overflow-x-auto">
                {tabs.map(tab => (
                  tab.count > 0 && (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as keyof SearchResults)}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                        activeTab === tab.key
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <tab.icon className="h-3 sm:h-4 w-3 sm:w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className={`px-1 sm:px-1.5 py-0.5 rounded-full text-xs ${
                        activeTab === tab.key
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  )
                ))}
              </div>
            </div>

            {/* Results List */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-2 sm:space-y-3">
              {activeTab === 'persons' && results.persons.map((person) => (
                <div
                  key={person.id}
                  onClick={() => handleItemClick(person, 'persons')}
                  onMouseEnter={() => setHoveredItem(person)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`bg-white rounded-lg border p-4 hover:shadow-lg transition-all cursor-pointer ${
                    selectedItem?.id === person.id ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{person.name}</h3>
                      {(person.nameHebrew || person.nameGreek) && (
                        <p className="text-xs text-gray-500 mb-1">
                          {person.nameHebrew && <span className="mr-2">{person.nameHebrew}</span>}
                          {person.nameGreek && <span>{person.nameGreek}</span>}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mb-2">
                        {person.testament === 'OLD' ? '구약' : '신약'}
                        {person.birthYear && ` • ${Math.abs(person.birthYear)} ${person.birthYear < 0 ? 'BC' : 'AD'}`}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">{person.description}</p>
                    </div>
                  </div>
                </div>
              ))}

              {activeTab === 'locations' && results.locations.map((location) => (
                <div
                  key={location.id}
                  onClick={() => handleItemClick(location, 'locations')}
                  onMouseEnter={() => setHoveredItem(location)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`bg-white rounded-lg border p-4 hover:shadow-lg transition-all cursor-pointer ${
                    selectedItem?.id === location.id ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MapPinIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{location.name}</h3>
                      {(location.nameHebrew || location.nameGreek) && (
                        <p className="text-xs text-gray-500 mb-1">
                          {location.nameHebrew && <span className="mr-2">{location.nameHebrew}</span>}
                          {location.nameGreek && <span>{location.nameGreek}</span>}
                        </p>
                      )}
                      {location.modernName && (
                        <p className="text-sm text-gray-600 mb-2">현재: {location.modernName}</p>
                      )}
                      {location.description && (
                        <p className="text-sm text-gray-700 line-clamp-2">{location.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {activeTab === 'events' && results.events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleItemClick(event, 'events')}
                  onMouseEnter={() => setHoveredItem(event)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`bg-white rounded-lg border p-4 hover:shadow-lg transition-all cursor-pointer ${
                    selectedItem?.id === event.id ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <CalendarDaysIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {event.year && `${Math.abs(event.year)} ${event.year < 0 ? 'BC' : 'AD'}`}
                        {event.location && ` • ${event.location.name}`}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">{event.description}</p>
                    </div>
                  </div>
                </div>
              ))}

              {activeTab === 'journeys' && results.journeys.map((journey) => (
                <div
                  key={journey.id}
                  onClick={() => handleItemClick(journey, 'journeys')}
                  onMouseEnter={() => setHoveredItem(journey)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`bg-white rounded-lg border p-4 hover:shadow-lg transition-all cursor-pointer ${
                    selectedItem?.id === journey.id ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <MapIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{journey.title}</h3>
                      {journey.person && (
                        <p className="text-sm text-gray-600 mb-2">
                          <UserIcon className="h-3 w-3 inline mr-1" />
                          {journey.person.name}
                        </p>
                      )}
                      <p className="text-sm text-gray-700 line-clamp-2">{journey.description}</p>
                      {journey.distance && (
                        <p className="text-xs text-gray-500 mt-1">거리: {journey.distance} km</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {activeTab === 'themes' && results.themes.map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => handleItemClick(theme, 'themes')}
                  onMouseEnter={() => setHoveredItem(theme)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`bg-white rounded-lg border p-4 hover:shadow-lg transition-all cursor-pointer ${
                    selectedItem?.id === theme.id ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <BookOpenIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{theme.title}</h3>
                      {theme.category && (
                        <p className="text-sm text-gray-600 mb-2">{theme.category}</p>
                      )}
                      <p className="text-sm text-gray-700 line-clamp-2">{theme.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Map (Bottom on mobile) */}
          {showMap && (
            <div className="h-1/2 lg:h-auto lg:w-1/2 relative border-t lg:border-t-0">
              <SearchMap
                items={getMappableItems()}
                selectedItem={selectedItem}
                hoveredItem={hoveredItem}
                onItemClick={(item) => {
                  const type = item.type === 'location' ? 'locations' :
                               item.type === 'event' ? 'events' : 'journeys';
                  handleItemClick(item.data, type);
                }}
              />

              {selectedItem && (
                <button
                  onClick={handleViewOnFullMap}
                  className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium"
                >
                  <MapPinIcon className="h-3 sm:h-4 w-3 sm:w-4 text-blue-600" />
                  <span className="hidden sm:inline">전체 지도에서 보기</span>
                  <span className="sm:hidden">전체 지도</span>
                </button>
              )}
            </div>
          )}
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
  );
}