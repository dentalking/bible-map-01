'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import useAppStore from '@/store/useAppStore';
import type { Event, Person } from '@/types';

export default function TimelineView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  // const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const { filters, setSelectedEvent, setSelectedPerson } = useAppStore();

  useEffect(() => {
    loadTimelineData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadTimelineData = async () => {
    setLoading(true);
    try {
      const [eventsRes, personsRes] = await Promise.all([
        apiService.events.getAll({
          testament: filters.testament,
          category: filters.eventCategory,
        }),
        apiService.persons.getAll({
          testament: filters.testament,
        }),
      ]);

      // Sort events by year
      const sortedEvents = eventsRes.data.sort((a, b) => (a.year || 0) - (b.year || 0));
      setEvents(sortedEvents);
      setPersons(personsRes.data);
    } catch (error) {
      console.error('Failed to load timeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group events by century
  const groupedEvents = events.reduce((acc, event) => {
    if (!event.year) return acc;

    const century = Math.floor(event.year / 100) * 100;
    if (!acc[century]) {
      acc[century] = [];
    }
    acc[century].push(event);
    return acc;
  }, {} as Record<number, Event[]>);

  const centuries = Object.keys(groupedEvents)
    .map(Number)
    .sort((a, b) => a - b);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">연대기 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-auto h-full">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">성경 연대기</h2>

        {/* Era Selector */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => useAppStore.setState({ filters: { ...filters, testament: 'OLD' } })}
            className={`px-4 py-2 rounded-md ${
              filters.testament === 'OLD'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            구약
          </button>
          <button
            onClick={() => useAppStore.setState({ filters: { ...filters, testament: 'NEW' } })}
            className={`px-4 py-2 rounded-md ${
              filters.testament === 'NEW'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            신약
          </button>
          <button
            onClick={() => useAppStore.setState({ filters: {} })}
            className={`px-4 py-2 rounded-md ${
              !filters.testament
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            전체
          </button>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Central line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 transform -translate-x-1/2"></div>

          {centuries.map((century) => (
            <div key={century} className="mb-12">
              {/* Century Marker */}
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full"></div>
                <h3 className="bg-white px-4 py-2 text-xl font-bold z-10">
                  {Math.abs(century)} {century < 0 ? 'BC' : 'AD'}
                </h3>
              </div>

              {/* Events in this century */}
              <div className="space-y-4">
                {groupedEvents[century].map((event, eventIdx) => (
                  <div
                    key={event.id}
                    className={`relative flex ${
                      eventIdx % 2 === 0 ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    <div
                      className={`w-5/12 ${
                        eventIdx % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'
                      }`}
                    >
                      <div
                        onClick={() => setSelectedEvent(event)}
                        className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">📅</span>
                          <h4 className="font-semibold text-lg">{event.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {Math.abs(event.year || 0)} {(event.year || 0) < 0 ? 'BC' : 'AD'}
                        </p>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {event.description}
                        </p>
                        {event.location && (
                          <p className="text-xs text-gray-500 mt-2">
                            📍 {event.location.name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Connection line to timeline */}
                    <div
                      className={`absolute top-1/2 transform -translate-y-1/2 ${
                        eventIdx % 2 === 0
                          ? 'left-[calc(50%-1rem)]'
                          : 'right-[calc(50%-1rem)]'
                      } w-4 h-0.5 bg-gray-300`}
                    ></div>

                    {/* Timeline dot */}
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full"></div>
                  </div>
                ))}
              </div>

              {/* Related persons in this period */}
              <div className="mt-6 flex justify-center">
                <div className="bg-blue-50 p-4 rounded-lg w-3/4">
                  <h4 className="font-semibold text-sm mb-2">주요 인물</h4>
                  <div className="flex flex-wrap gap-2">
                    {persons
                      .filter(
                        (person) =>
                          person.birthYear &&
                          Math.floor(person.birthYear / 100) * 100 === century
                      )
                      .map((person) => (
                        <button
                          key={person.id}
                          onClick={() => setSelectedPerson(person)}
                          className="px-3 py-1 text-sm bg-white rounded-full hover:bg-blue-100 transition-colors"
                        >
                          👤 {person.name}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">표시할 사건이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}