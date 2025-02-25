/*
  Warnings:

  - You are about to drop the column `reference_mom_id` on the `MoM` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MoM" DROP COLUMN "reference_mom_id",
ADD COLUMN     "reference_mom_ids" JSONB;
