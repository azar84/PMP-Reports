/*
  Warnings:

  - You are about to drop the column `onBlurEvent` on the `ctas` table. All the data in the column will be lost.
  - You are about to drop the column `onClickEvent` on the `ctas` table. All the data in the column will be lost.
  - You are about to drop the column `onFocusEvent` on the `ctas` table. All the data in the column will be lost.
  - You are about to drop the column `onHoverEvent` on the `ctas` table. All the data in the column will be lost.
  - You are about to drop the column `onKeyDownEvent` on the `ctas` table. All the data in the column will be lost.
  - You are about to drop the column `onKeyUpEvent` on the `ctas` table. All the data in the column will be lost.
  - You are about to drop the column `onMouseOutEvent` on the `ctas` table. All the data in the column will be lost.
  - You are about to drop the column `onTouchEndEvent` on the `ctas` table. All the data in the column will be lost.
  - You are about to drop the column `onTouchStartEvent` on the `ctas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ctas" DROP COLUMN "onBlurEvent",
DROP COLUMN "onClickEvent",
DROP COLUMN "onFocusEvent",
DROP COLUMN "onHoverEvent",
DROP COLUMN "onKeyDownEvent",
DROP COLUMN "onKeyUpEvent",
DROP COLUMN "onMouseOutEvent",
DROP COLUMN "onTouchEndEvent",
DROP COLUMN "onTouchStartEvent";
