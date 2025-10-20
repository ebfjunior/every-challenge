import type { PrismaClient } from "@prisma/client";
import type { TaskStatus } from "@/modules/tasks/task.model";

interface SeedTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  archivedAt?: Date | null;
  completedAt?: Date | null;
}

interface SeedUser {
  id: string;
  name: string;
  tasks: SeedTask[];
}

export const SEED_USERS: SeedUser[] = [
  {
    id: "user-demo",
    name: "Demo User",
    tasks: [
      {
        id: "task-demo-1",
        title: "Review onboarding challenge",
        description: "Read through the onboarding instructions and take notes.",
        status: "TODO",
      },
      {
        id: "task-demo-2",
        title: "Draft seed script",
        description: "Set up deterministic Prisma seeds for users and tasks.",
        status: "IN_PROGRESS",
      },
      {
        id: "task-demo-3",
        title: "Ship tasks API",
        description: "Deploy the tasks API and monitor telemetry.",
        status: "DONE",
        completedAt: new Date("2025-10-18T15:00:00.000Z"),
      },
    ],
  },
  {
    id: "user-mentor",
    name: "Mentor Bot",
    tasks: [
      {
        id: "task-mentor-1",
        title: "Review PRs",
        description: "Provide actionable feedback on open pull requests.",
        status: "IN_PROGRESS",
      },
      {
        id: "task-mentor-2",
        title: "Plan workshop",
        description: "Outline advanced Prisma patterns workshop.",
        status: "TODO",
      },
    ],
  },
];

interface SeedSummary {
  users: {
    total: number;
  };
  tasks: {
    total: number;
  };
}

const upsertUser = async (prisma: PrismaClient, user: SeedUser) => {
  await prisma.user.upsert({
    where: { id: user.id },
    update: {
      name: user.name,
    },
    create: {
      id: user.id,
      name: user.name,
    },
  });
};

const upsertTask = async (
  prisma: PrismaClient,
  userId: string,
  task: SeedTask,
) => {
  await prisma.task.upsert({
    where: { id: task.id },
    update: {
      title: task.title,
      description: task.description,
      status: task.status,
      archivedAt: task.archivedAt ?? null,
      completedAt: task.completedAt ?? null,
    },
    create: {
      id: task.id,
      userId,
      title: task.title,
      description: task.description,
      status: task.status,
      archivedAt: task.archivedAt ?? null,
      completedAt: task.completedAt ?? null,
    },
  });
};

export const seedDatabase = async (
  prisma: PrismaClient,
): Promise<SeedSummary> => {
  for (const user of SEED_USERS) {
    await upsertUser(prisma, user);

    for (const task of user.tasks) {
      await upsertTask(prisma, user.id, task);
    }
  }

  return {
    users: {
      total: SEED_USERS.length,
    },
    tasks: {
      total: SEED_USERS.reduce(
        (count, seedUser) => count + seedUser.tasks.length,
        0,
      ),
    },
  };
};

const run = async () => {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    const summary = await seedDatabase(prisma);
    // eslint-disable-next-line no-console
    console.log("Seed completed", summary);
  } catch (error) {
    console.error("Seed failed", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

if (process.argv[1]?.endsWith("seed.ts")) {
  await run();
}
