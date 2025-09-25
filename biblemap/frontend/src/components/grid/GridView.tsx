'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import useAppStore from '@/store/useAppStore';
import type { Person, Location, Event, Journey, Theme } from '@/types';

type TabType = 'persons' | 'locations' | 'events' | 'journeys' | 'themes';

export default function GridView() {
  const [activeTab, setActiveTab] = useState<TabType>('persons');
  const [persons, setPersons] = useState<Person[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    filters,
    setSelectedPerson,
    setSelectedEvent,
    setMapView
  } = useAppStore();

  useEffect(() => {
    loadData();
  }, [activeTab, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'persons':
          const personsRes = await apiService.persons.getAll({
            testament: filters.testament,
          });
          setPersons(personsRes.data);
          break;

        case 'locations':
          const locationsRes = await apiService.locations.getAll();
          setLocations(locationsRes.data);
          break;

        case 'events':
          const eventsRes = await apiService.events.getAll({
            testament: filters.testament,
            category: filters.eventCategory,
          });
          setEvents(eventsRes.data);
          break;

        case 'journeys':
          const journeysRes = await apiService.journeys.getAll();
          setJourneys(journeysRes.data);
          break;

        case 'themes':
          const themesRes = await apiService.themes.getAll({
            category: filters.themeCategory,
          });
          setThemes(themesRes.data);
          break;
      }
    } catch (error) {
      console.error(`Failed to load ${activeTab}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'persons' as TabType, label: '인물', icon: '👥' },
    { id: 'locations' as TabType, label: '장소', icon: '📍' },
    { id: 'events' as TabType, label: '사건', icon: '📅' },
    { id: 'journeys' as TabType, label: '여정', icon: '🚶' },
    { id: 'themes' as TabType, label: '주제', icon: '📚' },
  ];

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">성경 자료 목록</h1>

          {/* Tabs */}
          <div className="flex space-x-1 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-4 flex space-x-2">
          {(activeTab === 'persons' || activeTab === 'events') && (
            <>
              <button
                onClick={() => useAppStore.setState({ filters: { ...filters, testament: 'OLD' } })}
                className={`px-3 py-1 rounded text-sm ${
                  filters.testament === 'OLD'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                구약
              </button>
              <button
                onClick={() => useAppStore.setState({ filters: { ...filters, testament: 'NEW' } })}
                className={`px-3 py-1 rounded text-sm ${
                  filters.testament === 'NEW'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                신약
              </button>
              <button
                onClick={() => useAppStore.setState({ filters: { ...filters, testament: undefined } })}
                className={`px-3 py-1 rounded text-sm ${
                  !filters.testament
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                전체
              </button>
            </>
          )}
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">로딩 중...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Persons Grid */}
            {activeTab === 'persons' &&
              persons.map((person) => (
                <div
                  key={person.id}
                  onClick={() => setSelectedPerson(person)}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">👤</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{person.name}</h3>
                      <p className="text-sm text-gray-600">
                        {person.testament === 'OLD' ? '구약' : '신약'}
                      </p>
                      {person.birthYear && (
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.abs(person.birthYear)} {person.birthYear < 0 ? 'BC' : 'AD'}
                          {person.deathYear && (
                            <span> - {Math.abs(person.deathYear)} {person.deathYear < 0 ? 'BC' : 'AD'}</span>
                          )}
                        </p>
                      )}
                      <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                        {person.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

            {/* Locations Grid */}
            {activeTab === 'locations' &&
              locations.map((location) => (
                <div
                  key={location.id}
                  onClick={() => {
                    setMapView({
                      center: [location.longitude, location.latitude],
                      zoom: 10,
                      selectedLocation: location,
                    });
                    useAppStore.setState({ viewMode: 'map' });
                  }}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">📍</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{location.name}</h3>
                      {location.modernName && (
                        <p className="text-sm text-gray-600">{location.modernName}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        위도: {location.latitude.toFixed(4)}, 경도: {location.longitude.toFixed(4)}
                      </p>
                      {location.description && (
                        <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                          {location.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

            {/* Events Grid */}
            {activeTab === 'events' &&
              events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">📅</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      {event.year && (
                        <p className="text-sm text-gray-600">
                          {Math.abs(event.year)} {event.year < 0 ? 'BC' : 'AD'}
                        </p>
                      )}
                      {event.location && (
                        <p className="text-xs text-gray-500 mt-1">📍 {event.location.name}</p>
                      )}
                      <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

            {/* Journeys Grid */}
            {activeTab === 'journeys' &&
              journeys.map((journey) => (
                <div
                  key={journey.id}
                  onClick={() => {
                    setMapView({
                      selectedJourney: journey,
                      showJourneys: true,
                    });
                    useAppStore.setState({ viewMode: 'map' });
                  }}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">🚶</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{journey.title}</h3>
                      {journey.person && (
                        <p className="text-sm text-gray-600">👤 {journey.person.name}</p>
                      )}
                      {journey.startYear && (
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.abs(journey.startYear)} {journey.startYear < 0 ? 'BC' : 'AD'}
                          {journey.endYear && (
                            <span> - {Math.abs(journey.endYear)} {journey.endYear < 0 ? 'BC' : 'AD'}</span>
                          )}
                        </p>
                      )}
                      <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                        {journey.description}
                      </p>
                      {journey.stops && (
                        <p className="text-xs text-gray-500 mt-2">
                          {journey.stops.length}개 경유지
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

            {/* Themes Grid */}
            {activeTab === 'themes' &&
              themes.map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => useAppStore.setState({ selectedTheme: theme })}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">📚</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{theme.title}</h3>
                      {theme.category && (
                        <p className="text-sm text-gray-600">{theme.category}</p>
                      )}
                      <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                        {theme.description}
                      </p>
                      {theme.verses && (
                        <p className="text-xs text-gray-500 mt-2">
                          {theme.verses.length}개 관련 구절
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* No Data Message */}
        {!loading && (
          <>
            {activeTab === 'persons' && persons.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">표시할 인물이 없습니다.</p>
              </div>
            )}
            {activeTab === 'locations' && locations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">표시할 장소가 없습니다.</p>
              </div>
            )}
            {activeTab === 'events' && events.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">표시할 사건이 없습니다.</p>
              </div>
            )}
            {activeTab === 'journeys' && journeys.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">표시할 여정이 없습니다.</p>
              </div>
            )}
            {activeTab === 'themes' && themes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">표시할 주제가 없습니다.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}