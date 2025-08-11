/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- ابتدا فیلدها را بدون NOT NULL اضافه می‌کنیم
ALTER TABLE "users" ADD COLUMN "password" TEXT,
ADD COLUMN "username" TEXT,
ALTER COLUMN "phoneNumber" DROP NOT NULL,
ALTER COLUMN "nationalId" DROP NOT NULL,
ALTER COLUMN "bankAccount" DROP NOT NULL,
ALTER COLUMN "postalCode" DROP NOT NULL;

-- برای کاربران موجود نام کاربری و رمز عبور پیش‌فرض تنظیم می‌کنیم
UPDATE "users" SET 
  "username" = CONCAT('user_', id),
  "password" = '$2b$10$defaultpasswordhash'
WHERE "username" IS NULL;

-- حالا فیلدها را NOT NULL می‌کنیم
ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL,
ALTER COLUMN "username" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
