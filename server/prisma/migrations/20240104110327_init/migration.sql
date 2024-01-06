-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "chatId" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_chatId_city_key" ON "Subscription"("chatId", "city");
