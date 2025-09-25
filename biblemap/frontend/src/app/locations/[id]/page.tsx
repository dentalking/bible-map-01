'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Location } from '@/types';

export default function LocationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/locations/${params.id}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('장소를 찾을 수 없습니다.');
          } else {
            setError('데이터를 불러오는 중 오류가 발생했습니다.');
          }
          return;
        }

        const data = await response.json();
        setLocation(data);
      } catch (err) {
        console.error('Error fetching location:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">장소 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">오류 발생</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!location) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 뒤로가기 버튼 */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          돌아가기
        </button>
      </div>

      {/* 헤더 정보 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            {location.imageUrl ? (
              <Image
                src={location.imageUrl}
                alt={location.name}
                width={120}
                height={120}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-4xl">📍</span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{location.name}</h1>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              {location.nameHebrew && (
                <div><span className="font-semibold">히브리어:</span> {location.nameHebrew}</div>
              )}
              {location.nameGreek && (
                <div><span className="font-semibold">그리스어:</span> {location.nameGreek}</div>
              )}
              {location.modernName && (
                <div><span className="font-semibold">현재 이름:</span> {location.modernName}</div>
              )}
              {location.country && (
                <div><span className="font-semibold">국가:</span> {location.country}</div>
              )}
              {location.period && (
                <div><span className="font-semibold">시대:</span> {location.period}</div>
              )}
              <div className="col-span-2">
                <span className="font-semibold">위치:</span> {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 설명 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">설명</h2>
        <p className="text-gray-700 leading-relaxed">{location.description}</p>
      </div>

      {/* 역사적 의의 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">역사적 의의</h2>
        <p className="text-gray-700 leading-relaxed">{location.significance}</p>
      </div>

      {/* 관련 사건 */}
      {location.events && location.events.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">이곳에서 일어난 사건</h2>
          <div className="space-y-4">
            {location.events.map((event) => (
              <div key={event.id} className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📅</span>
                  <div className="flex-1">
                    <Link
                      href={`/events/${event.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-lg"
                    >
                      {event.title}
                    </Link>
                    {event.year && (
                      <span className="text-gray-500 ml-2">
                        ({event.year < 0 ? `${Math.abs(event.year)} BC` : `${event.year} AD`})
                      </span>
                    )}
                    <p className="text-gray-600 mt-1">{event.description}</p>
                    {event.persons && event.persons.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm font-semibold text-gray-700">관련 인물: </span>
                        {event.persons.map((person, index) => (
                          <span key={person.id}>
                            <Link
                              href={`/persons/${person.id}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                            >
                              {person.name}
                            </Link>
                            {index < event.persons!.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 출생 인물 */}
      {location.birthPersons && location.birthPersons.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">이곳에서 태어난 인물</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {location.birthPersons.map((person) => (
              <div key={person.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <span className="text-2xl">👤</span>
                <div>
                  <Link
                    href={`/persons/${person.id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                  >
                    {person.name}
                  </Link>
                  {(person.birthYear || person.deathYear) && (
                    <p className="text-sm text-gray-500">
                      {person.birthYear && `${person.birthYear < 0 ? `${Math.abs(person.birthYear)} BC` : `${person.birthYear} AD`}`} -
                      {person.deathYear && ` ${person.deathYear < 0 ? `${Math.abs(person.deathYear)} BC` : `${person.deathYear} AD`}`}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">{person.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 사망 인물 */}
      {location.deathPersons && location.deathPersons.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">이곳에서 사망한 인물</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {location.deathPersons.map((person) => (
              <div key={person.id} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                <span className="text-2xl">👤</span>
                <div>
                  <Link
                    href={`/persons/${person.id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                  >
                    {person.name}
                  </Link>
                  {(person.birthYear || person.deathYear) && (
                    <p className="text-sm text-gray-500">
                      {person.birthYear && `${person.birthYear < 0 ? `${Math.abs(person.birthYear)} BC` : `${person.birthYear} AD`}`} -
                      {person.deathYear && ` ${person.deathYear < 0 ? `${Math.abs(person.deathYear)} BC` : `${person.deathYear} AD`}`}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">{person.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 관련 여정 */}
      {location.journeyStops && location.journeyStops.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">이곳을 거쳐간 여정</h2>
          <div className="space-y-4">
            {location.journeyStops.map((stop) => (
              <div key={stop.id} className="border-l-4 border-green-500 pl-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🚶</span>
                  <div className="flex-1">
                    <Link
                      href={`/journeys/${stop.journey?.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-lg"
                    >
                      {stop.journey?.title}
                    </Link>
                    <div className="mt-1">
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                        {stop.orderIndex}번째 정류지
                      </span>
                      {stop.duration && (
                        <span className="ml-2 text-sm text-gray-600">머무른 기간: {stop.duration}</span>
                      )}
                    </div>
                    {stop.description && (
                      <p className="text-gray-600 mt-1">{stop.description}</p>
                    )}
                    {stop.journey?.person && (
                      <div className="mt-2">
                        <span className="text-sm font-semibold text-gray-700">여행자: </span>
                        <Link
                          href={`/persons/${stop.journey.person.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                        >
                          {stop.journey.person.name}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 지도 정보 (향후 구현 가능) */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">지도 정보</h2>
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-gray-600">
            📍 위치: {location.latitude.toFixed(6)}°N, {location.longitude.toFixed(6)}°E
          </p>
          <p className="text-sm text-gray-500 mt-2">
            지도 시각화는 향후 구현 예정입니다.
          </p>
        </div>
      </div>
    </div>
  );
}