/*
  Warnings:

  - A unique constraint covering the columns `[chatId,userName,city]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Subscription_chatId_city_key";

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "userName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_chatId_userName_city_key" ON "Subscription"("chatId", "userName", "city");
