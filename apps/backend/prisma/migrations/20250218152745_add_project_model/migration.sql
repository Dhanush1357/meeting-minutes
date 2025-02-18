/*
  Warnings:

  - Changed the type of `assigned_by` on the `CategoriesOnProjects` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "CategoriesOnProjects" DROP COLUMN "assigned_by",
ADD COLUMN     "assigned_by" INTEGER NOT NULL;
