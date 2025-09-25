import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Fetch all persons with pagination
export const fetchPersons = async (page = 1, limit = 100, testament?: string, search?: string) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (testament) params.append('testament', testament);
  if (search) params.append('search', search);

  const response = await axios.get(`${API_URL}/api/persons?${params.toString()}`);
  return response.data;
};

// Fetch person details
export const fetchPerson = async (id: string) => {
  const response = await axios.get(`${API_URL}/api/persons/${id}`);
  return response.data;
};

// Fetch person map data (with biblical footsteps)
export const fetchPersonMapData = async (id: string) => {
  const response = await axios.get(`${API_URL}/api/persons/${id}/timeline/detailed`);
  return response.data;
};

// Fetch person timeline
export const fetchPersonTimeline = async (id: string) => {
  const response = await axios.get(`${API_URL}/api/persons/${id}/timeline`);
  return response.data;
};

// Fetch person relationships with geography
export const fetchPersonRelationshipsGeo = async (id: string) => {
  const response = await axios.get(`${API_URL}/api/persons/${id}/relationships/geo`);
  return response.data;
};

// Fetch detailed timeline with biblical footsteps
export const fetchPersonDetailedTimeline = async (id: string) => {
  const response = await axios.get(`${API_URL}/api/persons/${id}/timeline/detailed`);
  return response.data;
};