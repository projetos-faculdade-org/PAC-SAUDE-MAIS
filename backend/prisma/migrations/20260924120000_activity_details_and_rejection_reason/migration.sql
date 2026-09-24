-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('ONCE', 'WEEKLY', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "ActivityCategory" AS ENUM ('CAMINHADA_CORRIDA', 'ESPORTES', 'DANCA', 'YOGA_PILATES', 'LUTAS', 'NATACAO', 'NUTRICAO', 'SAUDE_MENTAL', 'PREVENCAO', 'OUTRO');

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "rejectionReason" TEXT;

-- AlterTable: atividades existentes viram FLEXIBLE, mantendo o texto de horário
ALTER TABLE "activities" ADD COLUMN     "category" "ActivityCategory" NOT NULL DEFAULT 'OUTRO',
ADD COLUMN     "date" DATE,
ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "isFree" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "price" TEXT,
ADD COLUMN     "scheduleType" "ScheduleType" NOT NULL DEFAULT 'FLEXIBLE',
ADD COLUMN     "startTime" TEXT,
ADD COLUMN     "weekdays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "whatsapp" TEXT,
ALTER COLUMN "schedule" DROP NOT NULL;
