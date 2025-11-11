-- Create Project Client Feedback table
CREATE TABLE "project_client_feedback" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL UNIQUE,
    "rating" TEXT,
    "positivePoints" TEXT,
    "negativePoints" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "project_client_feedback_projectId_fkey"
        FOREIGN KEY ("projectId")
        REFERENCES "projects" ("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX "project_client_feedback_projectId_idx"
    ON "project_client_feedback"("projectId");

