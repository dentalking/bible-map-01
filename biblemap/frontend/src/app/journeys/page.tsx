'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import useAppStore from '@/store/useAppStore';
import type { Journey } from '@/types';

export default function JourneysPage() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);

  const { setMapView, setViewMode } = useAppStore();

  useEffect(() => {
    loadJourneys();
  }, []);

  const loadJourneys = async () => {
    setLoading(true);
    try {
      const response = await apiService.journeys.getAll();
      setJourneys(response.data);
    } catch (error) {
      console.error('Failed to load journeys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJourneyClick = (journey: Journey) => {
    setMapView({
      selectedJourney: journey,
      showJourneys: true,
    });
    setViewMode('map');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">성경 여정</h1>
        <p className="text-gray-600">성경 인물들의 여행과 이동 경로를 따라가보세요.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">로딩 중...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {journeys.map((journey) => (
            <div
              key={journey.id}
              onClick={() => handleJourneyClick(journey)}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start space-x-4">
                <div className="text-3xl">🚶</div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">{journey.title}</h2>
                  {journey.person && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-semibold">여행자:</span> {journey.person.name}
                    </p>
                  )}
                  {journey.startYear && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-semibold">기간:</span>{' '}
                      {Math.abs(journey.startYear)} {journey.startYear < 0 ? 'BC' : 'AD'}
                      {journey.endYear && (
                        <span> - {Math.abs(journey.endYear)} {journey.endYear < 0 ? 'BC' : 'AD'}</span>
                      )}
                    </p>
                  )}
                  <p className="text-gray-700 mb-3">{journey.description}</p>
                  {journey.stops && journey.stops.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-semibold mb-2">경유지 ({journey.stops.length}곳):</p>
                      <div className="flex flex-wrap gap-2">
                        {journey.stops.map((stop, index) => (
                          <span
                            key={stop.id}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {index + 1}. {stop.location?.name || '장소'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}