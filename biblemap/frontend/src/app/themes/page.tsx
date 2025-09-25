'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import useAppStore from '@/store/useAppStore';
import type { Theme } from '@/types';

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const setSelectedTheme = useAppStore((state) => state.setSelectedTheme);

  useEffect(() => {
    loadThemes();
  }, [selectedCategory]);

  const loadThemes = async () => {
    setLoading(true);
    try {
      const response = await apiService.themes.getAll({
        category: selectedCategory || undefined,
      });
      setThemes(response.data);
    } catch (error) {
      console.error('Failed to load themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['신학', '역사', '윤리', '예언', '구원'];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">성경 주제</h1>
        <p className="text-gray-600">성경의 핵심 주제와 메시지를 탐구해보세요.</p>
      </div>

      <div className="flex space-x-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            !selectedCategory
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          전체
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-md whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
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
          {themes.map((theme) => (
            <div
              key={theme.id}
              onClick={() => setSelectedTheme(theme)}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start space-x-4">
                <div className="text-3xl">📚</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-xl font-semibold">{theme.title}</h2>
                    {theme.category && (
                      <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded">
                        {theme.category}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-4">{theme.description}</p>
                  {theme.verses && theme.verses.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-semibold mb-2">관련 구절:</p>
                      <div className="space-y-2">
                        {theme.verses.slice(0, 2).map((verse) => (
                          <div key={verse.id} className="text-sm">
                            <p className="font-medium text-gray-800">
                              {verse.book} {verse.chapter}:{verse.verseStart}
                              {verse.verseEnd && verse.verseEnd !== verse.verseStart && `-${verse.verseEnd}`}
                            </p>
                            <p className="text-gray-600 italic line-clamp-2">{verse.text}</p>
                          </div>
                        ))}
                        {theme.verses.length > 2 && (
                          <p className="text-xs text-gray-500">
                            +{theme.verses.length - 2}개 구절 더보기
                          </p>
                        )}
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