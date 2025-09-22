/*
  Warnings:

  - You are about to drop the column `reminderTime` on the `medications` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_medications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "dosage" TEXT,
    "frequency" TEXT,
    "reminderTimes" TEXT,
    "reminderDate" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "medications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_medications" ("createdAt", "dosage", "frequency", "id", "isActive", "name", "notes", "reminderDate", "updatedAt", "userId") SELECT "createdAt", "dosage", "frequency", "id", "isActive", "name", "notes", "reminderDate", "updatedAt", "userId" FROM "medications";
DROP TABLE "medications";
ALTER TABLE "new_medications" RENAME TO "medications";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
