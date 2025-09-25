import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';

const router = Router();

// GET all themes with pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { summary: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [themes, total] = await Promise.all([
      prisma.theme.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          verses: {
            select: {
              id: true,
              book: true,
              chapter: true,
              verseStart: true,
              verseEnd: true,
            },
          },
          _count: {
            select: {
              verses: true,
              relatedThemes: true,
            },
          },
        },
        orderBy: {
          title: 'asc',
        },
      }),
      prisma.theme.count({ where }),
    ]);

    res.json({
      data: themes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching themes:', error);
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
});

// GET theme categories
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const themes = await prisma.theme.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
    });

    const categories = themes.map(item => ({
      category: item.category,
      count: item._count.category,
    }));

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET single theme by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const theme = await prisma.theme.findUnique({
      where: { id },
      include: {
        verses: true,
        relatedThemes: true,
        themesRelated: true,
      },
    });

    if (!theme) {
      return res.status(404).json({ error: 'Theme not found' });
    }

    res.json(theme);
  } catch (error) {
    console.error('Error fetching theme:', error);
    res.status(500).json({ error: 'Failed to fetch theme' });
  }
});

// POST create new theme
router.post('/', async (req: Request, res: Response) => {
  try {
    const { verses, relatedThemes, ...data } = req.body;

    const theme = await prisma.theme.create({
      data: {
        ...data,
        verses: verses ? {
          connect: verses.map((id: string) => ({ id })),
        } : undefined,
        relatedThemes: relatedThemes ? {
          connect: relatedThemes.map((id: string) => ({ id })),
        } : undefined,
      },
      include: {
        verses: true,
        relatedThemes: true,
      },
    });

    res.status(201).json(theme);
  } catch (error) {
    console.error('Error creating theme:', error);
    res.status(500).json({ error: 'Failed to create theme' });
  }
});

// PUT update theme
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { verses, relatedThemes, ...data } = req.body;

    const theme = await prisma.theme.update({
      where: { id },
      data: {
        ...data,
        verses: verses ? {
          set: [],
          connect: verses.map((id: string) => ({ id })),
        } : undefined,
        relatedThemes: relatedThemes ? {
          set: [],
          connect: relatedThemes.map((id: string) => ({ id })),
        } : undefined,
      },
      include: {
        verses: true,
        relatedThemes: true,
      },
    });

    res.json(theme);
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({ error: 'Failed to update theme' });
  }
});

// DELETE theme
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.theme.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting theme:', error);
    res.status(500).json({ error: 'Failed to delete theme' });
  }
});

export default router;