/*
  Warnings:

  - You are about to drop the column `poster_url` on the `up_next` table. All the data in the column will be lost.
  - You are about to drop the column `youtube_link` on the `up_next` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "up_next" DROP COLUMN "poster_url",
DROP COLUMN "youtube_link";
