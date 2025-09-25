import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';

const router = Router();

// GET all journeys with pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, personId, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (personId) {
      where.personId = personId;
    }
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [journeys, total] = await Promise.all([
      prisma.journey.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          person: {
            select: {
              id: true,
              name: true,
            },
          },
          stops: {
            include: {
              location: {
                select: {
                  id: true,
                  name: true,
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
        orderBy: {
          startYear: 'asc',
        },
      }),
      prisma.journey.count({ where }),
    ]);

    res.json({
      data: journeys,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching journeys:', error);
    res.status(500).json({ error: 'Failed to fetch journeys' });
  }
});

// GET journey paths for map (GeoJSON LineString format)
router.get('/map/paths', async (_req: Request, res: Response) => {
  try {
    const journeys = await prisma.journey.findMany({
      select: {
        id: true,
        title: true,
        person: {
          select: {
            name: true,
          },
        },
        stops: {
          select: {
            location: {
              select: {
                latitude: true,
                longitude: true,
                name: true,
              },
            },
            orderIndex: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    const features = journeys
      .filter(journey => journey.stops.length >= 2)
      .map(journey => ({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: journey.stops.map(stop => [
            stop.location.longitude,
            stop.location.latitude,
          ]),
        },
        properties: {
          id: journey.id,
          title: journey.title,
          person: journey.person.name,
          stops: journey.stops.map(stop => stop.location.name),
        },
      }));

    const geojson = {
      type: 'FeatureCollection',
      features,
    };

    res.json(geojson);
  } catch (error) {
    console.error('Error fetching journey paths:', error);
    res.status(500).json({ error: 'Failed to fetch journey paths' });
  }
});

// GET single journey by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const journey = await prisma.journey.findUnique({
      where: { id },
      include: {
        person: true,
        stops: {
          include: {
            location: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    if (!journey) {
      return res.status(404).json({ error: 'Journey not found' });
    }

    res.json(journey);
  } catch (error) {
    console.error('Error fetching journey:', error);
    res.status(500).json({ error: 'Failed to fetch journey' });
  }
});

// POST create new journey
router.post('/', async (req: Request, res: Response) => {
  try {
    const { stops, ...data } = req.body;

    const journey = await prisma.journey.create({
      data: {
        ...data,
        stops: stops ? {
          create: stops,
        } : undefined,
      },
      include: {
        person: true,
        stops: {
          include: {
            location: true,
          },
        },
      },
    });

    res.status(201).json(journey);
  } catch (error) {
    console.error('Error creating journey:', error);
    res.status(500).json({ error: 'Failed to create journey' });
  }
});

// PUT update journey
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stops, ...data } = req.body;

    const journey = await prisma.journey.update({
      where: { id },
      data: {
        ...data,
        stops: stops ? {
          deleteMany: {},
          create: stops,
        } : undefined,
      },
      include: {
        person: true,
        stops: {
          include: {
            location: true,
          },
        },
      },
    });

    res.json(journey);
  } catch (error) {
    console.error('Error updating journey:', error);
    res.status(500).json({ error: 'Failed to update journey' });
  }
});

// DELETE journey
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.journey.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting journey:', error);
    res.status(500).json({ error: 'Failed to delete journey' });
  }
});

export default router;