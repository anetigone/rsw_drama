/*
  Warnings:

  - Added the required column `imageUrl` to the `literatures` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_literatures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "description" TEXT,
    "ossKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "totalPages" INTEGER,
    "uploadDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateDate" DATETIME NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    CONSTRAINT "literatures_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_literatures" ("author", "categoryId", "description", "downloadCount", "fileName", "fileSize", "id", "mimeType", "ossKey", "title", "totalPages", "updateDate", "uploadDate", "viewCount", "year") SELECT "author", "categoryId", "description", "downloadCount", "fileName", "fileSize", "id", "mimeType", "ossKey", "title", "totalPages", "updateDate", "uploadDate", "viewCount", "year" FROM "literatures";
DROP TABLE "literatures";
ALTER TABLE "new_literatures" RENAME TO "literatures";
CREATE UNIQUE INDEX "literatures_ossKey_key" ON "literatures"("ossKey");
CREATE INDEX "literatures_uploadDate_idx" ON "literatures"("uploadDate");
CREATE INDEX "literatures_author_idx" ON "literatures"("author");
CREATE INDEX "literatures_categoryId_idx" ON "literatures"("categoryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
