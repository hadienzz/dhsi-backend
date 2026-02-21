import prisma from "../../database/prisma";
import { Prisma } from "../../../generated/prisma/client";
import { Decimal } from "../../../generated/prisma/internal/prismaNamespace";

const selectedWorkshop = (workshop_id: string) => {
  const workshop = prisma.workshop.findUnique({
    where: { id: workshop_id },
    select: { id: true, price: true, credit_price: true, title: true },
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
      price: true,
      credit_price: true,
      benefits: true,
      start_date: true,
      created_at: true,
      _count: {
        select: { selected_users: true },
      },
      ratings: {
        select: { rating: true },
      },
      modules: {
        orderBy: { schedule_at: "asc" },
        select: {
          id: true,
          title: true,
          schedule_at: true,
          type: true,
          order: true,
        },
      },
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
      price: true,
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
      price: true,
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
          price: true,
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
  // Workshop payment (Midtrans)
  createOrGetPendingWorkshopPayment,
  getWorkshopPaymentByIdempotencyKey,
  tryStartWorkshopSnapRequest,
  markWorkshopSnapCompleted,
  markWorkshopSnapFailed,
  getWorkshopPaymentById,
};

// ── Workshop Payment (Midtrans) functions ──

export type CreateWorkshopPaymentPayload = {
  user_id: string;
  workshop_id: string;
  order_id: string;
  amount: Decimal;
  credit_used: number;
  payment_method: "FULL_MONEY" | "HYBRID";
  idempotency_key: string;
};

async function getWorkshopPaymentByIdempotencyKey(input: {
  user_id: string;
  idempotency_key: string;
}) {
  return prisma.workshopPayment.findUnique({
    where: {
      user_id_idempotency_key: {
        user_id: input.user_id,
        idempotency_key: input.idempotency_key,
      },
    },
  });
}

async function createOrGetPendingWorkshopPayment(
  payload: CreateWorkshopPaymentPayload,
) {
  try {
    return await prisma.workshopPayment.create({
      data: {
        user: { connect: { id: payload.user_id } },
        workshop: { connect: { id: payload.workshop_id } },
        order_id: payload.order_id,
        idempotency_key: payload.idempotency_key,
        amount: payload.amount,
        credit_used: payload.credit_used,
        payment_method: payload.payment_method,
        status: "PENDING",
        snap_request_status: "NOT_STARTED",
      },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const existing = await getWorkshopPaymentByIdempotencyKey({
        user_id: payload.user_id,
        idempotency_key: payload.idempotency_key,
      });
      if (existing) return existing;
    }
    throw err;
  }
}

async function tryStartWorkshopSnapRequest(paymentId: string) {
  const result = await prisma.workshopPayment.updateMany({
    where: {
      id: paymentId,
      snap_request_status: "NOT_STARTED",
    },
    data: {
      snap_request_status: "IN_PROGRESS",
      snap_error: null,
    },
  });
  return result.count === 1;
}

async function markWorkshopSnapCompleted(input: {
  paymentId: string;
  transaction_token: string;
}) {
  return prisma.workshopPayment.update({
    where: { id: input.paymentId },
    data: {
      transaction_token: input.transaction_token,
      snap_request_status: "COMPLETED",
      snap_error: null,
    },
  });
}

async function markWorkshopSnapFailed(input: {
  paymentId: string;
  error: string;
}) {
  return prisma.workshopPayment.update({
    where: { id: input.paymentId },
    data: {
      snap_request_status: "FAILED",
      snap_error: input.error,
    },
  });
}

async function getWorkshopPaymentById(paymentId: string) {
  return prisma.workshopPayment.findUnique({
    where: { id: paymentId },
  });
}
