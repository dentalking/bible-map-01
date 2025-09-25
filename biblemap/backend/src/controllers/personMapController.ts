import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Get person map data (locations, events, journeys)
export const getPersonMapData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        birthPlace: {
          select: {
            id: true,
            name: true,
            nameHebrew: true,
            modernName: true,
            latitude: true,
            longitude: true,
          },
        },
        deathPlace: {
          select: {
            id: true,
            name: true,
            nameHebrew: true,
            modernName: true,
            latitude: true,
            longitude: true,
          },
        },
        events: {
          include: {
            location: {
              select: {
                id: true,
                name: true,
                modernName: true,
                latitude: true,
                longitude: true,
              },
            },
          },
          orderBy: {
            year: 'asc',
          },
        },
        journeys: {
          include: {
            stops: {
              include: {
                location: {
                  select: {
                    id: true,
                    name: true,
                    modernName: true,
                    latitude: true,
                    longitude: true,
                  },
                },
              },
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
        },
      },
    });

    if (!person) {
      res.status(404).json({ error: 'Person not found' });
      return;
    }

    // Transform data for map visualization
    const mapData = {
      person: {
        id: person.id,
        name: person.name,
        nameHebrew: person.nameHebrew,
        nameGreek: person.nameGreek,
        birthYear: person.birthYear,
        deathYear: person.deathYear,
      },
      locations: {
        birth: person.birthPlace ? {
          ...person.birthPlace,
          type: 'birth',
          year: person.birthYear,
        } : null,
        death: person.deathPlace ? {
          ...person.deathPlace,
          type: 'death',
          year: person.deathYear,
        } : null,
      },
      events: person.events.map((event) => ({
        id: event.id,
        title: event.title,
        year: event.year,
        yearRange: event.yearRange,
        location: event.location,
      })),
      journeys: person.journeys.map((journey) => ({
        id: journey.id,
        title: journey.title,
        startYear: journey.startYear,
        endYear: journey.endYear,
        distance: journey.distance,
        duration: journey.duration,
        stops: journey.stops.map((stop) => ({
          orderIndex: stop.orderIndex,
          location: stop.location,
          description: stop.description,
          duration: stop.duration,
        })),
        // Create GeoJSON LineString for the journey path
        path: {
          type: 'Feature',
          properties: {
            journeyId: journey.id,
            title: journey.title,
          },
          geometry: {
            type: 'LineString',
            coordinates: journey.stops.map((stop) => [
              stop.location.longitude,
              stop.location.latitude,
            ]),
          },
        },
      })),
      // Bounding box for map centering
      bounds: calculateBounds(person),
    };

    res.json(mapData);
  } catch (error) {
    console.error('Error fetching person map data:', error);
    res.status(500).json({ error: 'Failed to fetch person map data' });
  }
};

// Get person timeline with locations
export const getPersonTimeline = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        birthPlace: true,
        deathPlace: true,
        events: {
          include: {
            location: true,
          },
          orderBy: {
            year: 'asc',
          },
        },
        journeys: {
          include: {
            stops: {
              include: {
                location: true,
              },
            },
          },
          orderBy: {
            startYear: 'asc',
          },
        },
      },
    });

    if (!person) {
      res.status(404).json({ error: 'Person not found' });
      return;
    }

    // Create timeline entries
    const timelineEntries = [];

    // Add birth
    if (person.birthYear && person.birthPlace) {
      timelineEntries.push({
        type: 'birth',
        year: person.birthYear,
        title: 'Birth',
        description: `Born in ${person.birthPlace.name}`,
        location: person.birthPlace,
      });
    }

    // Add events
    person.events.forEach((event) => {
      if (event.year) {
        timelineEntries.push({
          type: 'event',
          year: event.year,
          title: event.title,
          description: event.description,
          location: event.location,
        });
      }
    });

    // Add journeys
    person.journeys.forEach((journey) => {
      if (journey.startYear) {
        timelineEntries.push({
          type: 'journey_start',
          year: journey.startYear,
          title: `Journey: ${journey.title}`,
          description: journey.description,
          locations: journey.stops.map((s) => s.location),
        });
      }
    });

    // Add death
    if (person.deathYear && person.deathPlace) {
      timelineEntries.push({
        type: 'death',
        year: person.deathYear,
        title: 'Death',
        description: `Died in ${person.deathPlace.name}`,
        location: person.deathPlace,
      });
    }

    // Sort by year
    timelineEntries.sort((a, b) => {
      const yearA = a.year || 0;
      const yearB = b.year || 0;
      return yearA - yearB;
    });

    res.json({
      person: {
        id: person.id,
        name: person.name,
        birthYear: person.birthYear,
        deathYear: person.deathYear,
      },
      timeline: timelineEntries,
    });
  } catch (error) {
    console.error('Error fetching person timeline:', error);
    res.status(500).json({ error: 'Failed to fetch person timeline' });
  }
};

// Get relationships with geographic data
export const getPersonRelationshipsGeo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        birthPlace: true,
        relationships: {
          include: {
            personTo: {
              include: {
                birthPlace: true,
                deathPlace: true,
              },
            },
          },
        },
        relatedTo: {
          include: {
            personFrom: {
              include: {
                birthPlace: true,
                deathPlace: true,
              },
            },
          },
        },
      },
    });

    if (!person) {
      res.status(404).json({ error: 'Person not found' });
      return;
    }

    // Combine all relationships
    const allRelationships = [
      ...person.relationships.map((r) => ({
        type: r.relationshipType,
        person: r.personTo,
        direction: 'from' as const,
      })),
      ...person.relatedTo.map((r) => ({
        type: r.relationshipType,
        person: r.personFrom,
        direction: 'to' as const,
      })),
    ];

    // Group by relationship type
    const grouped = allRelationships.reduce((acc, rel) => {
      if (!acc[rel.type]) {
        acc[rel.type] = [];
      }
      acc[rel.type].push({
        id: rel.person.id,
        name: rel.person.name,
        direction: rel.direction,
        locations: {
          birth: rel.person.birthPlace,
          death: rel.person.deathPlace,
        },
      });
      return acc;
    }, {} as Record<string, any[]>);

    res.json({
      person: {
        id: person.id,
        name: person.name,
        birthPlace: person.birthPlace,
      },
      relationships: grouped,
    });
  } catch (error) {
    console.error('Error fetching person relationships geo:', error);
    res.status(500).json({ error: 'Failed to fetch person relationships' });
  }
};

// Helper function to calculate map bounds
function calculateBounds(person: any) {
  const locations = [];

  // Add birth/death places
  if (person.birthPlace) {
    locations.push({
      lat: person.birthPlace.latitude,
      lng: person.birthPlace.longitude,
    });
  }
  if (person.deathPlace) {
    locations.push({
      lat: person.deathPlace.latitude,
      lng: person.deathPlace.longitude,
    });
  }

  // Add event locations
  person.events.forEach((event: any) => {
    if (event.location) {
      locations.push({
        lat: event.location.latitude,
        lng: event.location.longitude,
      });
    }
  });

  // Add journey stops
  person.journeys.forEach((journey: any) => {
    journey.stops.forEach((stop: any) => {
      locations.push({
        lat: stop.location.latitude,
        lng: stop.location.longitude,
      });
    });
  });

  if (locations.length === 0) {
    // Default bounds (Israel/Palestine region)
    return {
      north: 33.33,
      south: 29.5,
      east: 36.0,
      west: 34.2,
    };
  }

  const lats = locations.map((l) => l.lat);
  const lngs = locations.map((l) => l.lng);

  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs),
  };
}