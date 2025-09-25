import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';

const router = Router();

// GET all locations with pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, bounds } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { modernName: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // If bounds are provided (for map view)
    if (bounds) {
      const [minLat, minLng, maxLat, maxLng] = (bounds as string).split(',').map(Number);
      where.AND = [
        { latitude: { gte: minLat, lte: maxLat } },
        { longitude: { gte: minLng, lte: maxLng } },
      ];
    }

    const [locations, total] = await Promise.all([
      prisma.location.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          events: {
            select: {
              id: true,
              title: true,
              year: true,
            },
          },
          birthPersons: {
            select: {
              id: true,
              name: true,
            },
          },
          deathPersons: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.location.count({ where }),
    ]);

    res.json({
      data: locations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// GET single location by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        events: {
          include: {
            persons: true,
          },
        },
        birthPersons: true,
        deathPersons: true,
        journeyStops: {
          include: {
            journey: {
              include: {
                person: true,
              },
            },
          },
        },
        verses: true,
      },
    });

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

// GET locations for map (GeoJSON format)
router.get('/map/geojson', async (_req: Request, res: Response) => {
  try {
    const locations = await prisma.location.findMany({
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        significance: true,
        events: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const geojson = {
      type: 'FeatureCollection',
      features: locations.map(location => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude],
        },
        properties: {
          id: location.id,
          name: location.name,
          significance: location.significance,
          eventsCount: location.events.length,
        },
      })),
    };

    res.json(geojson);
  } catch (error) {
    console.error('Error fetching GeoJSON:', error);
    res.status(500).json({ error: 'Failed to fetch GeoJSON' });
  }
});

// POST create new location
router.post('/', async (req: Request, res: Response) => {
  try {
    const location = await prisma.location.create({
      data: req.body,
    });
    res.status(201).json(location);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ error: 'Failed to create location' });
  }
});

// PUT update location
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const location = await prisma.location.update({
      where: { id },
      data: req.body,
    });

    res.json(location);
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// DELETE location
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.location.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

export default router;