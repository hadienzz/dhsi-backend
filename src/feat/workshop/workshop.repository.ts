import prisma from "../../database/prisma";

const selectedWorkshop = (workshop_id: string) => {
  const workshop = prisma.workshop.findUnique({
    where: { id: workshop_id },
    select: { id: true, credit_price: true, title: true },
  });

  return workshop;
};

const getPublicWorkshops = () => {
  return prisma.workshop.findMany({
    where: {
      deleted_at: null,
    },
    orderBy: {
      created_at: "desc",
    },
    select: {
      id: true,
      title: true,
      short_description: true,
      description: true,
      category: true,
      thumbnail: true,
      credit_price: true,
      benefits: true,
      created_at: true,
    },
  });
};

const getWorkshopDetail = async (id: string) => {
  return prisma.workshop.findFirst({
    where: {
      id,
      deleted_at: null,
    },
    select: {
      id: true,
      title: true,
      short_description: true,
      description: true,
      category: true,
      thumbnail: true,
      credit_price: true,
      benefits: true,
      created_at: true,
      updated_at: true,
      modules: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          type: true,
          schedule_at: true,
          order: true,
          youtube_url: true,
          zoom_url: true,
          whatsapp_group_url: true,
          exam_form_url: true,
          description: true,
          content_text: true,
        },
      },
    },
  });
};

const getWorkshopContentWithProgress = async (
  workshopId: string,
  userId: string,
) => {
  return prisma.workshop.findFirst({
    where: {
      id: workshopId,
      deleted_at: null,
    },
    select: {
      id: true,
      title: true,
      short_description: true,
      description: true,
      category: true,
      thumbnail: true,
      credit_price: true,
      benefits: true,
      created_at: true,
      updated_at: true,
      modules: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          type: true,
          schedule_at: true,
          order: true,
          youtube_url: true,
          zoom_url: true,
          whatsapp_group_url: true,
          exam_form_url: true,
          description: true,
          content_text: true,
          progresses: {
            where: { user_id: userId },
            select: {
              is_completed: true,
              completed_at: true,
            },
          },
        },
      },
    },
  });
};

const getUserWorkshops = async (userId: string) => {
  return prisma.selectedWorkshop.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
    include: {
      workshop: {
        select: {
          id: true,
          title: true,
          short_description: true,
          thumbnail: true,
          category: true,
          credit_price: true,
          created_at: true,
          modules: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              type: true,
              schedule_at: true,
              order: true,
              youtube_url: true,
              zoom_url: true,
              whatsapp_group_url: true,
              exam_form_url: true,
              description: true,
              content_text: true,
              progresses: {
                where: { user_id: userId },
                select: {
                  is_completed: true,
                  completed_at: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

const checkUserOwnsWorkshop = async (userId: string, workshopId: string) => {
  const record = await prisma.selectedWorkshop.findUnique({
    where: {
      user_id_workshop_id: {
        user_id: userId,
        workshop_id: workshopId,
      },
    },
  });
  return !!record;
};

const getModuleProgress = async (userId: string, moduleId: string) => {
  return prisma.workshopModuleProgress.findUnique({
    where: {
      user_id_module_id: {
        user_id: userId,
        module_id: moduleId,
      },
    },
  });
};

const upsertModuleProgress = async (
  userId: string,
  moduleId: string,
  isCompleted: boolean,
) => {
  return prisma.workshopModuleProgress.upsert({
    where: {
      user_id_module_id: {
        user_id: userId,
        module_id: moduleId,
      },
    },
    create: {
      user_id: userId,
      module_id: moduleId,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date() : null,
    },
    update: {
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date() : null,
      updated_at: new Date(),
    },
  });
};

const getModuleById = async (moduleId: string) => {
  return prisma.workshopModule.findUnique({
    where: { id: moduleId },
    select: { id: true, workshop_id: true },
  });
};

// ── Rating functions ──

const createOrUpdateRating = async (
  userId: string,
  workshopId: string,
  rating: number,
  review: string | null,
) => {
  return prisma.workshopRating.upsert({
    where: {
      user_id_workshop_id: {
        user_id: userId,
        workshop_id: workshopId,
      },
    },
    create: {
      user_id: userId,
      workshop_id: workshopId,
      rating,
      review,
    },
    update: {
      rating,
      review,
      updated_at: new Date(),
    },
  });
};

const getRatingsByWorkshop = async (
  workshopId: string,
  page: number,
  limit: number,
) => {
  const skip = (page - 1) * limit;

  const [ratings, total] = await Promise.all([
    prisma.workshopRating.findMany({
      where: { workshop_id: workshopId },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        rating: true,
        review: true,
        created_at: true,
        updated_at: true,
        user: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
          },
        },
      },
    }),
    prisma.workshopRating.count({
      where: { workshop_id: workshopId },
    }),
  ]);

  return {
    ratings,
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
  };
};

const getWorkshopRatingSummary = async (workshopId: string) => {
  const result = await prisma.workshopRating.aggregate({
    where: { workshop_id: workshopId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    average_rating: result._avg.rating ?? 0,
    total_ratings: result._count.rating,
  };
};

const getUserRatingForWorkshop = async (userId: string, workshopId: string) => {
  return prisma.workshopRating.findUnique({
    where: {
      user_id_workshop_id: {
        user_id: userId,
        workshop_id: workshopId,
      },
    },
  });
};

export const workshopRepository = {
  selectedWorkshop,
  getPublicWorkshops,
  getWorkshopDetail,
  getWorkshopContentWithProgress,
  getUserWorkshops,
  checkUserOwnsWorkshop,
  getModuleProgress,
  upsertModuleProgress,
  getModuleById,
  createOrUpdateRating,
  getRatingsByWorkshop,
  getWorkshopRatingSummary,
  getUserRatingForWorkshop,
};
