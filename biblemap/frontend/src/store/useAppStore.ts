import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Person, Location, Event, Journey, Theme } from '@/types';

interface MapViewState {
  center: [number, number];
  zoom: number;
  selectedLocation?: Location;
  selectedJourney?: Journey;
  showPersons: boolean;
  showEvents: boolean;
  showJourneys: boolean;
  // Filter selections
  selectedPersonIds: number[];
  selectedLocationIds: number[];
  selectedEventIds: number[];
  selectedJourneyIds: number[];
  selectedThemeIds: number[];
  // Filter mode: 'all' shows everything, 'selected' shows only selected items
  filterMode: 'all' | 'selected';
}

interface AppState {
  // Map state
  mapView: MapViewState;
  setMapView: (view: Partial<MapViewState>) => void;

  // Selected entities
  selectedPerson?: Person;
  selectedEvent?: Event;
  selectedTheme?: Theme;

  setSelectedPerson: (person?: Person) => void;
  setSelectedEvent: (event?: Event) => void;
  setSelectedTheme: (theme?: Theme) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // UI state
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // View mode
  viewMode: 'map' | 'timeline' | 'grid';
  setViewMode: (mode: 'map' | 'timeline' | 'grid') => void;

  // Filters
  filters: {
    testament?: 'OLD' | 'NEW';
    eventCategory?: string;
    themeCategory?: string;
    yearRange?: [number, number];
  };
  setFilters: (filters: AppState['filters']) => void;
  clearFilters: () => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial map view centered on Jerusalem
        mapView: {
          center: [35.2137, 31.7683],
          zoom: 7,
          showPersons: true,
          showEvents: true,
          showJourneys: true,
          selectedPersonIds: [],
          selectedLocationIds: [],
          selectedEventIds: [],
          selectedJourneyIds: [],
          selectedThemeIds: [],
          filterMode: 'selected', // Start with selected mode to reduce initial information overload
        },
        setMapView: (view) =>
          set((state) => ({
            mapView: { ...state.mapView, ...view },
          })),

        // Selected entities
        selectedPerson: undefined,
        selectedEvent: undefined,
        selectedTheme: undefined,

        setSelectedPerson: (person) => set({ selectedPerson: person }),
        setSelectedEvent: (event) => set({ selectedEvent: event }),
        setSelectedTheme: (theme) => set({ selectedTheme: theme }),

        // Search
        searchQuery: '',
        setSearchQuery: (query) => set({ searchQuery: query }),

        // UI state
        sidebarOpen: true,
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setSidebarOpen: (open) => set({ sidebarOpen: open }),

        // View mode
        viewMode: 'map',
        setViewMode: (mode) => set({ viewMode: mode }),

        // Filters
        filters: {},
        setFilters: (filters) => set({ filters }),
        clearFilters: () => set({ filters: {} }),

        // Loading states
        isLoading: false,
        setIsLoading: (loading) => set({ isLoading: loading }),

        // Error handling
        error: null,
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),
      }),
      {
        name: 'biblemap-storage',
        partialize: (state) => ({
          mapView: state.mapView,
          viewMode: state.viewMode,
          sidebarOpen: state.sidebarOpen,
          filters: state.filters,
        }),
      }
    )
  )
);

export default useAppStore;