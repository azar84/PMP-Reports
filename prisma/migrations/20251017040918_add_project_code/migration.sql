-- CreateTable
CREATE TABLE "clients" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "officeAddress" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "consultants" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "officeAddress" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "consultant_types" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "company_staff" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "staffName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "position" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "projects" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectCode" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "projectDescription" TEXT,
    "clientId" INTEGER,
    "projectManagementConsultantId" INTEGER,
    "designConsultantId" INTEGER,
    "supervisionConsultantId" INTEGER,
    "costConsultantId" INTEGER,
    "projectDirectorId" INTEGER,
    "projectManagerId" INTEGER,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "duration" TEXT,
    "eot" TEXT,
    "lastUpdate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "projects_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "projects_projectManagementConsultantId_fkey" FOREIGN KEY ("projectManagementConsultantId") REFERENCES "consultants" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "projects_designConsultantId_fkey" FOREIGN KEY ("designConsultantId") REFERENCES "consultants" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "projects_supervisionConsultantId_fkey" FOREIGN KEY ("supervisionConsultantId") REFERENCES "consultants" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "projects_costConsultantId_fkey" FOREIGN KEY ("costConsultantId") REFERENCES "consultants" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "projects_projectDirectorId_fkey" FOREIGN KEY ("projectDirectorId") REFERENCES "company_staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "projects_projectManagerId_fkey" FOREIGN KEY ("projectManagerId") REFERENCES "company_staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ConsultantToConsultantType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ConsultantToConsultantType_A_fkey" FOREIGN KEY ("A") REFERENCES "consultants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ConsultantToConsultantType_B_fkey" FOREIGN KEY ("B") REFERENCES "consultant_types" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "consultant_types_type_key" ON "consultant_types"("type");

-- CreateIndex
CREATE UNIQUE INDEX "projects_projectCode_key" ON "projects"("projectCode");

-- CreateIndex
CREATE UNIQUE INDEX "_ConsultantToConsultantType_AB_unique" ON "_ConsultantToConsultantType"("A", "B");

-- CreateIndex
CREATE INDEX "_ConsultantToConsultantType_B_index" ON "_ConsultantToConsultantType"("B");
