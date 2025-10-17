/*
  Warnings:

  - You are about to drop the column `onBlurEvent` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `onClickEvent` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `onFocusEvent` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `onHoverEvent` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `onKeyDownEvent` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `onKeyUpEvent` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `onMouseOutEvent` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `onTouchEndEvent` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `onTouchStartEvent` on the `plans` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "plans" DROP COLUMN "onBlurEvent",
DROP COLUMN "onClickEvent",
DROP COLUMN "onFocusEvent",
DROP COLUMN "onHoverEvent",
DROP COLUMN "onKeyDownEvent",
DROP COLUMN "onKeyUpEvent",
DROP COLUMN "onMouseOutEvent",
DROP COLUMN "onTouchEndEvent",
DROP COLUMN "onTouchStartEvent",
ADD COLUMN     "events" JSONB DEFAULT '[]';
