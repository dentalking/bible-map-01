import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import {
  getPersonMapData,
  getPersonTimeline,
  getPersonRelationshipsGeo,
} from '../controllers/personMapController';
import { getDetailedTimeline } from '../controllers/personDetailedTimelineController';

const router = Router();

// GET all persons with pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, testament, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (testament) {
      where.testament = testament;
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [persons, total] = await Promise.all([
      prisma.person.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          birthPlace: true,
          deathPlace: true,
          events: {
            select: {
              id: true,
              title: true,
              year: true,
            },
          },
          journeys: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.person.count({ where }),
    ]);

    res.json({
      data: persons,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching persons:', error);
    res.status(500).json({ error: 'Failed to fetch persons' });
  }
});

// GET single person by ID
router.get('/:id', async (req: Request, res: Response): Promise<Response | void> => {
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
        },
        journeys: {
          include: {
            stops: {
              include: {
                location: true,
              },
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
        },
        relationships: {
          include: {
            personTo: true,
          },
        },
        relatedTo: {
          include: {
            personFrom: true,
          },
        },
        verses: true,
      },
    });

    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }

    res.json(person);
  } catch (error) {
    console.error('Error fetching person:', error);
    res.status(500).json({ error: 'Failed to fetch person' });
  }
});

// POST create new person
router.post('/', async (req: Request, res: Response) => {
  try {
    const person = await prisma.person.create({
      data: req.body,
    });
    res.status(201).json(person);
  } catch (error) {
    console.error('Error creating person:', error);
    res.status(500).json({ error: 'Failed to create person' });
  }
});

// PUT update person
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const person = await prisma.person.update({
      where: { id },
      data: req.body,
    });

    res.json(person);
  } catch (error) {
    console.error('Error updating person:', error);
    res.status(500).json({ error: 'Failed to update person' });
  }
});

// DELETE person
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.person.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting person:', error);
    res.status(500).json({ error: 'Failed to delete person' });
  }
});

// New Map-related endpoints
router.get('/:id/map-data', getPersonMapData);
router.get('/:id/timeline', getPersonTimeline);
router.get('/:id/timeline/detailed', getDetailedTimeline);
router.get('/:id/relationships/geo', getPersonRelationshipsGeo);

export default router;