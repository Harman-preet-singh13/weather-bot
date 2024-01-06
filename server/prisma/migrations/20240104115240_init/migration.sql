-- CreateTable
CREATE TABLE "CronJob" (
    "id" SERIAL NOT NULL,
    "schedule" TEXT NOT NULL,

    CONSTRAINT "CronJob_pkey" PRIMARY KEY ("id")
);
