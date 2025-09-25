// API Response Types
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination: PaginationInfo;
}

// Person Types
export interface Person {
  id: string;
  name: string;
  nameHebrew?: string;
  nameGreek?: string;
  description: string;
  birthYear?: number;
  deathYear?: number;
  testament: 'OLD' | 'NEW' | 'BOTH';
  gender?: 'MALE' | 'FEMALE';
  significance: string;
  imageUrl?: string;
  birthPlace?: Location;
  birthPlaceId?: string;
  deathPlace?: Location;
  deathPlaceId?: string;
  events?: Event[];
  journeys?: Journey[];
  relationships?: PersonRelationship[];
  relatedTo?: PersonRelationship[];
  verses?: BibleVerse[];
}

// Location Types
export interface Location {
  id: string;
  name: string;
  nameHebrew?: string;
  nameGreek?: string;
  modernName?: string;
  country?: string;
  latitude: number;
  longitude: number;
  description: string;
  significance: string;
  period?: string;
  imageUrl?: string;
  events?: Event[];
  birthPersons?: Person[];
  deathPersons?: Person[];
  journeyStops?: JourneyStop[];
  verses?: BibleVerse[];
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description: string;
  year?: number;
  yearRange?: string;
  testament: 'OLD' | 'NEW';
  category: EventCategory;
  significance: string;
  imageUrl?: string;
  location?: Location;
  locationId?: string;
  persons?: Person[];
  verses?: BibleVerse[];
}

export type EventCategory =
  | 'CREATION'
  | 'PATRIARCHS'
  | 'EXODUS'
  | 'CONQUEST'
  | 'JUDGES'
  | 'MONARCHY'
  | 'EXILE'
  | 'RETURN'
  | 'MINISTRY'
  | 'MIRACLE'
  | 'TEACHING'
  | 'CRUCIFIXION'
  | 'RESURRECTION'
  | 'CHURCH'
  | 'PROPHECY';

// Journey Types
export interface Journey {
  id: string;
  title: string;
  description: string;
  startYear?: number;
  endYear?: number;
  distance?: number;
  duration?: string;
  purpose: string;
  person: Person;
  personId: string;
  stops: JourneyStop[];
}

export interface JourneyStop {
  id: string;
  orderIndex: number;
  description?: string;
  duration?: string;
  journey?: Journey;
  journeyId: string;
  location: Location;
  locationId: string;
}

// Theme Types
export interface Theme {
  id: string;
  title: string;
  category: ThemeCategory;
  description: string;
  summary: string;
  applications: string[];
  imageUrl?: string;
  verses?: BibleVerse[];
  relatedThemes?: Theme[];
  themesRelated?: Theme[];
  _count?: {
    verses: number;
    relatedThemes: number;
  };
}

export type ThemeCategory =
  | 'FAITH'
  | 'LOVE'
  | 'SALVATION'
  | 'PRAYER'
  | 'WISDOM'
  | 'PROPHECY'
  | 'LAW'
  | 'COVENANT'
  | 'KINGDOM'
  | 'WORSHIP'
  | 'SIN'
  | 'REDEMPTION'
  | 'HOLINESS'
  | 'JUSTICE'
  | 'MERCY';

// Bible Verse Types
export interface BibleVerse {
  id: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  text: string;
  textHebrew?: string;
  textGreek?: string;
  translation: string;
}

// Relationship Types
export interface PersonRelationship {
  id: string;
  relationshipType: RelationType;
  description?: string;
  personFrom?: Person;
  personFromId: string;
  personTo?: Person;
  personToId: string;
}

export type RelationType =
  | 'PARENT'
  | 'CHILD'
  | 'SPOUSE'
  | 'SIBLING'
  | 'ANCESTOR'
  | 'DESCENDANT'
  | 'MENTOR'
  | 'DISCIPLE'
  | 'FRIEND'
  | 'ENEMY'
  | 'ALLY';

// Search Types
export interface SearchResults {
  persons: (Person & { type: 'person' })[];
  locations: (Location & { type: 'location' })[];
  events: (Event & { type: 'event' })[];
  themes: (Theme & { type: 'theme' })[];
  journeys: (Journey & { type: 'journey' })[];
  totalResults: number;
}

export interface SearchSuggestion {
  id: string;
  label: string;
  type: 'person' | 'location';
}

// GeoJSON Types
export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point' | 'LineString';
    coordinates: number[] | number[][];
  };
  properties: Record<string, unknown>;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}