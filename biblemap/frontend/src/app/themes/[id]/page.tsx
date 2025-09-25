'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Theme } from '@/types';

export default function ThemeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTheme = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/themes/${params.id}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('주제를 찾을 수 없습니다.');
          } else {
            setError('데이터를 불러오는 중 오류가 발생했습니다.');
          }
          return;
        }

        const data = await response.json();
        setTheme(data);
      } catch (err) {
        console.error('Error fetching theme:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">주제 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
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

  if (!theme) return null;

  const getCategoryText = (category: string) => {
    const categoryMap: Record<string, string> = {
      'FAITH': '믿음',
      'LOVE': '사랑',
      'SALVATION': '구원',
      'PRAYER': '기도',
      'WISDOM': '지혜',
      'PROPHECY': '예언',
      'LAW': '율법',
      'COVENANT': '언약',
      'KINGDOM': '하나님의 나라',
      'WORSHIP': '예배',
      'SIN': '죄',
      'REDEMPTION': '속죄',
      'HOLINESS': '거룩함',
      'JUSTICE': '정의',
      'MERCY': '자비'
    };
    return categoryMap[category] || category;
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
            {theme.imageUrl ? (
              <Image
                src={theme.imageUrl}
                alt={theme.title}
                width={120}
                height={120}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-4xl text-white">📚</span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{theme.title}</h1>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div><span className="font-semibold">분류:</span> {getCategoryText(theme.category)}</div>
              {theme._count && (
                <>
                  <div><span className="font-semibold">관련 구절 수:</span> {theme._count.verses}개</div>
                  <div><span className="font-semibold">연관 주제 수:</span> {theme._count.relatedThemes}개</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 주제 요약 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">주제 요약</h2>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
          <p className="text-gray-700 leading-relaxed">{theme.summary}</p>
        </div>
      </div>

      {/* 상세 설명 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">상세 설명</h2>
        <p className="text-gray-700 leading-relaxed">{theme.description}</p>
      </div>

      {/* 실천적 적용 */}
      {theme.applications && theme.applications.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">실천적 적용</h2>
          <div className="space-y-3">
            {theme.applications.map((application, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <p className="text-gray-700 leading-relaxed">{application}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 관련 성경 구절 */}
      {theme.verses && theme.verses.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">관련 성경 구절</h2>
          <div className="space-y-4">
            {theme.verses.map((verse) => (
              <div key={verse.id} className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded-r-lg">
                <div className="font-semibold text-blue-800 mb-2">
                  {verse.book} {verse.chapter}:{verse.verseStart}
                  {verse.verseEnd && verse.verseEnd !== verse.verseStart && `-${verse.verseEnd}`}
                  <span className="text-sm text-gray-600 ml-2">({verse.translation})</span>
                </div>
                <p className="text-gray-700 leading-relaxed mb-2">{verse.text}</p>
                {verse.textHebrew && (
                  <p className="text-gray-600 text-sm italic mb-1">히브리어: {verse.textHebrew}</p>
                )}
                {verse.textGreek && (
                  <p className="text-gray-600 text-sm italic">그리스어: {verse.textGreek}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 연관 주제 */}
      {theme.relatedThemes && theme.relatedThemes.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">연관 주제</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {theme.relatedThemes.map((relatedTheme) => (
              <div key={relatedTheme.id} className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <span className="text-2xl">📖</span>
                <div className="flex-1">
                  <Link
                    href={`/themes/${relatedTheme.id}`}
                    className="text-purple-600 hover:text-purple-800 hover:underline font-semibold text-lg"
                  >
                    {relatedTheme.title}
                  </Link>
                  <div className="mt-1">
                    <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded">
                      {getCategoryText(relatedTheme.category)}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2 text-sm">{relatedTheme.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 주제 분석 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">주제 분석</h2>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {theme.verses ? theme.verses.length : 0}
              </div>
              <p className="text-gray-600">관련 구절</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {theme.relatedThemes ? theme.relatedThemes.length : 0}
              </div>
              <p className="text-gray-600">연관 주제</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {theme.applications ? theme.applications.length : 0}
              </div>
              <p className="text-gray-600">실천 방안</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <span className="font-semibold text-gray-700">주제 분류: </span>
              <span className="text-gray-600">{getCategoryText(theme.category)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}