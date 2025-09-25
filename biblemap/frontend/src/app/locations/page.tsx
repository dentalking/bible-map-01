'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiService } from '@/lib/api';
import useAppStore from '@/store/useAppStore';
import type { Location } from '@/types';

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  const { setMapView, setViewMode } = useAppStore();

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const response = await apiService.locations.getAll();
      setLocations(response.data);
    } catch (error) {
      console.error('Failed to load locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationClick = (location: Location) => {
    setMapView({
      center: [location.longitude, location.latitude],
      zoom: 12,
      selectedLocation: location,
    });
    setViewMode('map');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">성경 장소</h1>
        <p className="text-gray-600">성경에 나오는 중요한 장소들을 탐색해보세요.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">로딩 중...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <div
              key={location.id}
              onClick={() => handleLocationClick(location)}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start space-x-4">
                <div className="text-3xl">📍</div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-1">{location.name}</h2>
                  {location.modernName && (
                    <p className="text-sm text-gray-600 mb-2">{location.modernName}</p>
                  )}
                  <p className="text-xs text-gray-500 mb-2">
                    위도: {location.latitude.toFixed(4)}, 경도: {location.longitude.toFixed(4)}
                  </p>
                  {location.description && (
                    <p className="text-gray-700 line-clamp-3">{location.description}</p>
                  )}
                  {location.significance && (
                    <div className="mt-3 text-sm">
                      <span className="font-semibold">중요성:</span>
                      <p className="text-gray-600 line-clamp-2">{location.significance}</p>
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