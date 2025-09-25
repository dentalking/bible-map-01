'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Journey } from '@/types';

export default function JourneyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJourney = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/journeys/${params.id}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('여정을 찾을 수 없습니다.');
          } else {
            setError('데이터를 불러오는 중 오류가 발생했습니다.');
          }
          return;
        }

        const data = await response.json();
        setJourney(data);
      } catch (err) {
        console.error('Error fetching journey:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchJourney();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">여정 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🚶</div>
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

  if (!journey) return null;

  const formatYear = (year?: number) => {
    if (!year) return '';
    return year < 0 ? `${Math.abs(year)} BC` : `${year} AD`;
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    return `약 ${distance.toLocaleString()}km`;
  };

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
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-4xl text-white">🚶</span>
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{journey.title}</h1>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              {(journey.startYear || journey.endYear) && (
                <div>
                  <span className="font-semibold">기간:</span>
                  {journey.startYear && formatYear(journey.startYear)} - {journey.endYear && formatYear(journey.endYear)}
                </div>
              )}
              {journey.duration && (
                <div><span className="font-semibold">소요 시간:</span> {journey.duration}</div>
              )}
              {journey.distance && (
                <div><span className="font-semibold">거리:</span> {formatDistance(journey.distance)}</div>
              )}
              {journey.stops && (
                <div><span className="font-semibold">정류지 수:</span> {journey.stops.length}개</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 여행자 정보 */}
      {journey.person && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">여행자</h2>
          <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
            <span className="text-3xl">👤</span>
            <div className="flex-1">
              <Link
                href={`/persons/${journey.person.id}`}
                className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-lg"
              >
                {journey.person.name}
              </Link>
              {journey.person.nameHebrew && (
                <p className="text-sm text-gray-600">히브리어: {journey.person.nameHebrew}</p>
              )}
              <p className="text-gray-600 mt-1">{journey.person.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* 설명 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">여정 설명</h2>
        <p className="text-gray-700 leading-relaxed">{journey.description}</p>
      </div>

      {/* 여정의 목적 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">여정의 목적</h2>
        <p className="text-gray-700 leading-relaxed">{journey.purpose}</p>
      </div>

      {/* 여정 경로 - 가장 중요한 부분 */}
      {journey.stops && journey.stops.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">여정 경로</h2>

          <div className="relative">
            {/* 여정 경로 선 */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-green-500 to-purple-500"></div>

            <div className="space-y-6">
              {journey.stops
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((stop, index) => (
                  <div key={stop.id} className="relative flex items-start space-x-6">
                    {/* 정류지 번호 */}
                    <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full font-bold text-lg shadow-lg">
                      {stop.orderIndex}
                    </div>

                    {/* 정류지 정보 */}
                    <div className="flex-1 bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Link
                          href={`/locations/${stop.location.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-lg"
                        >
                          {stop.location.name}
                        </Link>
                        {stop.duration && (
                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                            {stop.duration}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                        {stop.location.nameHebrew && (
                          <div>히브리어: {stop.location.nameHebrew}</div>
                        )}
                        {stop.location.nameGreek && (
                          <div>그리스어: {stop.location.nameGreek}</div>
                        )}
                        {stop.location.modernName && (
                          <div>현재 이름: {stop.location.modernName}</div>
                        )}
                        {stop.location.country && (
                          <div>국가: {stop.location.country}</div>
                        )}
                        <div className="col-span-full">
                          좌표: {stop.location.latitude.toFixed(4)}°N, {stop.location.longitude.toFixed(4)}°E
                        </div>
                      </div>

                      {stop.description && (
                        <p className="text-gray-700 mb-2">{stop.description}</p>
                      )}

                      <p className="text-gray-600 text-sm">{stop.location.description}</p>

                      {/* 다음 목적지까지의 거리 (간단한 계산) */}
                      {index < journey.stops!.length - 1 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            다음: {journey.stops![index + 1].location.name}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* 여정 요약 */}
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">여정 요약</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-semibold text-blue-600">출발지</span>
                <p className="text-gray-600">{journey.stops[0]?.location.name}</p>
              </div>
              <div>
                <span className="font-semibold text-purple-600">도착지</span>
                <p className="text-gray-600">{journey.stops[journey.stops.length - 1]?.location.name}</p>
              </div>
              {journey.distance && (
                <div>
                  <span className="font-semibold text-green-600">총 거리</span>
                  <p className="text-gray-600">{formatDistance(journey.distance)}</p>
                </div>
              )}
              {journey.duration && (
                <div>
                  <span className="font-semibold text-orange-600">소요 시간</span>
                  <p className="text-gray-600">{journey.duration}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 역사적 의의 */}
      {journey.person && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">역사적 의의</h2>
          <div className="bg-amber-50 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed">
              이 여정은 {journey.person.name}의 삶에서 중요한 전환점이었습니다.
              {journey.person.significance}
            </p>
            {journey.purpose && (
              <p className="text-gray-600 mt-2 text-sm">
                특히 이번 여정의 목적인 "{journey.purpose}"은(는) 그의 사명과 직결되어 있습니다.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}