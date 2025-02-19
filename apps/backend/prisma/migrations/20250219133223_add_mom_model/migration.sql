-- CreateEnum
CREATE TYPE "MoMStatus" AS ENUM ('CREATED', 'IN_REVIEW', 'AWAITING_APPROVAL', 'APPROVED', 'NEEDS_REVISION', 'CLOSED');

-- CreateTable
CREATE TABLE "MoM" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "creator_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "status" "MoMStatus" NOT NULL DEFAULT 'CREATED',
    "completion_date" TIMESTAMP(3),
    "place" TEXT,
    "discussion" TEXT NOT NULL,
    "open_issues" TEXT NOT NULL,
    "updates" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "project_id" INTEGER NOT NULL,
    "reference_mom_id" INTEGER,
    "mom_number" TEXT,

    CONSTRAINT "MoM_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MoM_project_id_mom_number_key" ON "MoM"("project_id", "mom_number");

-- AddForeignKey
ALTER TABLE "MoM" ADD CONSTRAINT "MoM_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoM" ADD CONSTRAINT "MoM_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
