import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';

const router = Router();

// GET all events with pagination and filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, testament, category, search, yearFrom, yearTo } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (testament) {
      where.testament = testament;
    }
    if (category) {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (yearFrom || yearTo) {
      where.year = {};
      if (yearFrom) where.year.gte = Number(yearFrom);
      if (yearTo) where.year.lte = Number(yearTo);
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          location: true,
          persons: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          year: 'asc',
        },
      }),
      prisma.event.count({ where }),
    ]);

    res.json({
      data: events,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET timeline view of events
router.get('/timeline', async (_req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        year: true,
        yearRange: true,
        testament: true,
        category: true,
        location: {
          select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
          },
        },
        persons: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        year: 'asc',
      },
    });

    // Group events by century
    const timeline = events.reduce((acc: any, event) => {
      const century = event.year ? Math.floor(event.year / 100) * 100 : 'Unknown';
      const key = `${century}s`;

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(event);
      return acc;
    }, {});

    res.json(timeline);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

// GET single event by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        location: true,
        persons: {
          include: {
            birthPlace: true,
            deathPlace: true,
          },
        },
        verses: true,
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// POST create new event
router.post('/', async (req: Request, res: Response) => {
  try {
    const { persons, ...data } = req.body;

    const event = await prisma.event.create({
      data: {
        ...data,
        persons: persons ? {
          connect: persons.map((id: string) => ({ id })),
        } : undefined,
      },
      include: {
        location: true,
        persons: true,
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT update event
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { persons, ...data } = req.body;

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...data,
        persons: persons ? {
          set: [],
          connect: persons.map((id: string) => ({ id })),
        } : undefined,
      },
      include: {
        location: true,
        persons: true,
      },
    });

    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE event
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.event.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;