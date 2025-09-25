import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';

const router = Router();

// GET unified search across all entities
router.get('/', async (req: Request, res: Response) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const searchTerm = q.trim();

    // Parallel search across all entities
    const [persons, locations, events, themes, journeys] = await Promise.all([
      // Search persons
      prisma.person.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          description: true,
          birthYear: true,
          deathYear: true,
        },
        take: Number(limit),
      }),

      // Search locations
      prisma.location.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { modernName: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          modernName: true,
          description: true,
          latitude: true,
          longitude: true,
        },
        take: Number(limit),
      }),

      // Search events
      prisma.event.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          year: true,
          category: true,
        },
        take: Number(limit),
      }),

      // Search themes
      prisma.theme.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { summary: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
        },
        take: Number(limit),
      }),

      // Search journeys
      prisma.journey.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { purpose: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          person: {
            select: {
              name: true,
            },
          },
        },
        take: Number(limit),
      }),
    ]);

    // Format results with type labels
    const results = {
      persons: persons.map(p => ({ ...p, type: 'person' })),
      locations: locations.map(l => ({ ...l, type: 'location' })),
      events: events.map(e => ({ ...e, type: 'event' })),
      themes: themes.map(t => ({ ...t, type: 'theme' })),
      journeys: journeys.map(j => ({ ...j, type: 'journey' })),
      totalResults: persons.length + locations.length + events.length + themes.length + journeys.length,
    };

    res.json(results);
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

// GET search suggestions (autocomplete)
router.get('/suggestions', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length < 1) {
      return res.json([]);
    }

    const searchTerm = q.trim();

    // Get quick suggestions from each entity
    const [persons, locations] = await Promise.all([
      prisma.person.findMany({
        where: {
          name: { startsWith: searchTerm, mode: 'insensitive' },
        },
        select: {
          id: true,
          name: true,
        },
        take: 5,
      }),
      prisma.location.findMany({
        where: {
          name: { startsWith: searchTerm, mode: 'insensitive' },
        },
        select: {
          id: true,
          name: true,
        },
        take: 5,
      }),
    ]);

    const suggestions = [
      ...persons.map(p => ({
        id: p.id,
        label: p.name,
        type: 'person',
      })),
      ...locations.map(l => ({
        id: l.id,
        label: l.name,
        type: 'location',
      })),
    ];

    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

export default router;