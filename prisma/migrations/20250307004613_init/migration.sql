/*
  Warnings:

  - The values [URGENT] on the enum `Priority` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `managerId` on the `projects` table. All the data in the column will be lost.
  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `forms` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'USER');

-- AlterEnum
BEGIN;
CREATE TYPE "Priority_new" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
ALTER TABLE "tasks" ALTER COLUMN "priority" DROP DEFAULT;
ALTER TABLE "tasks" ALTER COLUMN "priority" TYPE "Priority_new" USING ("priority"::text::"Priority_new");
ALTER TYPE "Priority" RENAME TO "Priority_old";
ALTER TYPE "Priority_new" RENAME TO "Priority";
DROP TYPE "Priority_old";
ALTER TABLE "tasks" ALTER COLUMN "priority" SET DEFAULT 'MEDIUM';
COMMIT;

-- DropForeignKey
ALTER TABLE "forms" DROP CONSTRAINT "forms_taskId_fkey";

-- DropForeignKey
ALTER TABLE "forms" DROP CONSTRAINT "forms_userId_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_managerId_fkey";

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "managerId",
ADD COLUMN     "assignedToId" TEXT;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "formResponse" JSONB,
ADD COLUMN     "formTemplate" JSONB;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- DropTable
DROP TABLE "forms";

-- DropEnum
DROP TYPE "UserRole";

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
