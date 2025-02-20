/*
  Warnings:

  - The `open_issues` column on the `MoM` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updates` column on the `MoM` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `notes` column on the `MoM` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `discussion` on the `MoM` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "MoM" DROP COLUMN "discussion",
ADD COLUMN     "discussion" JSONB NOT NULL,
DROP COLUMN "open_issues",
ADD COLUMN     "open_issues" JSONB,
DROP COLUMN "updates",
ADD COLUMN     "updates" JSONB,
DROP COLUMN "notes",
ADD COLUMN     "notes" JSONB;
