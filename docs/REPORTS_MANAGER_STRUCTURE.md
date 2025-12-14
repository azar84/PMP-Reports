# Reports Manager Structure

## Overview
The Reports Manager is a comprehensive system for creating, viewing, managing, and sharing project reports. It provides a presentation-style viewer, export capabilities (PDF/PowerPoint), and public sharing functionality.

## Architecture

### 1. Core Components

#### **ReportsManager.tsx** (`src/app/admin-panel/components/ReportsManager.tsx`)
Main component for managing reports in the admin panel.

**Features:**
- Lists all reports grouped by project
- Expandable/collapsible project cards
- Search functionality for projects
- Actions per report:
  - View (opens presentation viewer)
  - Share (copies shareable link)
  - Download PDF
  - Download PowerPoint
  - Delete

**State Management:**
- `projects`: Array of projects with their reports
- `reports`: Flat array of all reports
- `expandedProjects`: Set of expanded project IDs
- `selectedReport`: Currently selected report for viewing
- `showReportViewer`: Boolean to show/hide viewer modal
- `copiedToken`: Track which share token was copied

**Key Functions:**
- `fetchReports()`: Fetches all reports from API and groups by project
- `toggleProject()`: Expands/collapses project cards
- `handleViewReport()`: Opens report in presentation viewer
- `handleShareReport()`: Copies shareable URL to clipboard
- `handleDownloadPDF()`: Generates and downloads PDF
- `handleDownloadPowerPoint()`: Generates and downloads PowerPoint
- `handleDeleteReport()`: Deletes a report

---

#### **ReportPresentationViewer.tsx** (`src/app/admin-panel/components/ReportPresentationViewer.tsx`)
Large component (~8000+ lines) that renders reports as a presentation-style viewer.

**Features:**
- Slide-based navigation (keyboard arrows, page numbers)
- Multiple slide types:
  - Cover sheet
  - Project overview (stakeholders)
  - Checklist (paginated)
  - Planning & milestones
  - Quality management
  - Project risks
  - Areas of concern
  - HSE (Health, Safety & Environment)
  - Staff (assigned/balance, paginated)
  - Labours (assigned/balance, paginated)
  - Labour supply (paginated)
  - Plants & equipment (direct/indirect/required, paginated)
  - Assets (paginated)
  - Pictures (with slider)
  - Close out
  - Client feedback
  - Commercial (payment certificates, suppliers, subcontractors)

**State Management:**
- `currentSlide`: Current slide index
- `slides`: Array of generated slides
- Multiple pagination states for different sections (staff, labours, plants, etc.)
- `picturesSliderState`: External Map to persist picture slider state

**Key Functions:**
- `generateSlides()`: Converts report data into slide structure
- Handles keyboard navigation (Arrow keys, Escape)
- Manages pagination for large data sets

---

### 2. Utility Libraries

#### **reportSlidesGenerator.ts** (`src/lib/reportSlidesGenerator.ts`)
Shared utility for generating slides from report data.

**Purpose:**
- Ensures consistent slide generation across viewer and export functions
- Used by both `ReportPresentationViewer` and export functions

**Key Function:**
- `generateSlidesFromReportData()`: Takes report data and generates array of slide objects

**Slide Types Generated:**
- cover
- overview
- checklist (paginated)
- planning
- quality
- risks
- areaOfConcerns
- hse
- staff
- labours
- labourSupply
- plants
- assets
- pictures
- closeOut
- clientFeedback

---

#### **reportExport.ts** (`src/lib/reportExport.ts`)
Handles PDF and PowerPoint export functionality.

**Functions:**
- `generatePDF()`: Creates PDF using jsPDF
  - Landscape A4 format
  - Matches presentation viewer formatting
  - Handles pagination for long content
  
- `generatePowerPoint()`: Creates PowerPoint using pptxgenjs
  - Dynamic import to avoid bundling Node.js modules
  - Matches presentation viewer formatting
  - Creates slides for each report section

**Export Features:**
- Cover slide with project info, featured picture, manager/director names
- Overview slide with stakeholders (clients and consultants)
- Checklist with table format
- Other sections as needed

---

### 3. API Routes

#### **GET /api/admin/reports** (`src/app/api/admin/reports/route.ts`)
Fetches all reports, optionally filtered by project.

**Query Parameters:**
- `projectId` (optional): Filter by specific project

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": number,
      "projectId": number,
      "userId": number,
      "reportMonth": number,
      "reportYear": number,
      "reportData": object,
      "shareToken": string | null,
      "createdAt": string,
      "updatedAt": string,
      "project": { id, projectCode, projectName },
      "user": { id, username, email, name }
    }
  ]
}
```

#### **POST /api/admin/reports** (`src/app/api/admin/reports/route.ts`)
Creates or updates a report.

**Request Body:**
```json
{
  "projectId": number,
  "reportMonth": number (1-12),
  "reportYear": number,
  "reportData": object
}
```

**Behavior:**
- If report exists for project/month/year: Updates existing report
- If new: Creates new report with generated shareToken
- Generates shareToken if missing on update

#### **GET /api/admin/reports/[id]** (`src/app/api/admin/reports/[id]/route.ts`)
Fetches a single report by ID.

#### **DELETE /api/admin/reports/[id]** (`src/app/api/admin/reports/[id]/route.ts`)
Deletes a report.

#### **GET /api/public/reports/[shareToken]** (`src/app/api/public/reports/[shareToken]/route.ts`)
Public endpoint (no auth) to fetch report by share token.

---

### 4. Public Sharing

#### **Shared Report Page** (`src/app/share/report/[shareToken]/page.tsx`)
Public-facing page for viewing shared reports.

**Features:**
- No authentication required
- Fetches report by shareToken
- Uses same `ReportPresentationViewer` component
- Handles loading and error states

**URL Format:**
```
/share/report/{shareToken}
```

---

### 5. Database Schema

#### **ProjectReport Model** (`prisma/schema.prisma`)
```prisma
model ProjectReport {
  id          Int       @id @default(autoincrement())
  projectId   Int
  userId      Int
  reportMonth Int       // 1-12
  reportYear  Int
  reportData  Json      // Full report data structure
  shareToken  String?   @unique
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  project     Project   @relation(...)
  user        AdminUser @relation(...)

  @@unique([projectId, reportMonth, reportYear])
  @@index([projectId])
  @@index([userId])
  @@index([reportYear, reportMonth])
  @@index([shareToken])
}
```

**Key Constraints:**
- Unique constraint: One report per project per month per year
- ShareToken is optional but unique when present
- Cascading deletes with project and user

---

## Data Flow

### Report Creation Flow:
1. User generates report from project data (likely in ProjectManager)
2. Report data is collected and structured
3. POST to `/api/admin/reports` with projectId, month, year, and reportData
4. API checks for existing report (projectId + month + year)
5. If exists: Updates reportData and ensures shareToken exists
6. If new: Creates report with generated shareToken
7. Report is stored in database with JSON reportData

### Report Viewing Flow:
1. ReportsManager fetches all reports via GET `/api/admin/reports`
2. Reports are grouped by project
3. User clicks "View" on a report
4. ReportPresentationViewer receives report object
5. `generateSlides()` processes reportData into slides
6. Slides are rendered with navigation controls

### Report Sharing Flow:
1. User clicks "Share" button
2. Share URL is constructed: `${origin}/share/report/${shareToken}`
3. URL is copied to clipboard
4. Recipient visits URL
5. Public API fetches report by shareToken
6. Same ReportPresentationViewer component renders report

### Export Flow:
1. User clicks "Download PDF" or "Download PowerPoint"
2. Export function receives report object
3. `generateSlidesFromReportData()` creates slide structure
4. Export library (jsPDF or pptxgenjs) generates file
5. File is downloaded to user's device

---

## Report Data Structure

The `reportData` JSON field contains a comprehensive project snapshot:

```typescript
{
  project: {
    id, projectCode, projectName,
    client: { name, ... },
    consultants: { projectManagement, design, supervision, cost },
    projectManager: { staffName, ... },
    projectDirector: { staffName, ... }
  },
  contacts: Array<{ contact, consultantType, isPrimary }>,
  checklist: Array<{ id, phase, status, plannedDate, actualDate, notes, isSubItem, parentItemId }>,
  planning: { milestones, ... },
  quality: { ... },
  risks: Array<{ ... }>,
  areaOfConcerns: Array<{ ... }>,
  hse: { ... },
  staff: Array<{ designation, staffAssignments, ... }>,
  labours: Array<{ ... }>,
  labourSupply: Array<{ ... }>,
  plants: Array<{ ... }>,
  assets: Array<{ ... }>,
  pictures: { pictures: Array<{ media, isFeatured, ... }> },
  allProjectPictures: { pictures: Array<{ ... }> }, // All project pictures, not just report selection
  closeOut: { ... },
  clientFeedback: { ... },
  commercial: { paymentCertificates, suppliers, subcontractors }
}
```

---

## Key Design Patterns

1. **Separation of Concerns:**
   - Viewer component handles presentation
   - Export utilities handle file generation
   - API routes handle data persistence
   - Slide generator ensures consistency

2. **Reusability:**
   - Same viewer component used in admin panel and public share page
   - Shared slide generation logic for viewer and exports

3. **Pagination:**
   - Large data sets (checklist, staff, labours, etc.) are paginated
   - Multiple pagination states managed per slide type

4. **State Persistence:**
   - Picture slider state persisted outside component (Map)
   - Prevents reset on re-renders

5. **Keyboard Navigation:**
   - Arrow keys for slide navigation
   - Escape to close viewer
   - Input field detection to prevent conflicts

---

## Integration Points

### With ProjectManager:
- Reports are generated from project data
- Project data is collected and structured into reportData
- Reports are linked to projects via projectId

### With Design System:
- Uses `useDesignSystem()` hook
- Colors adapt to design system settings
- Consistent styling across admin panel

### With Authentication:
- Admin routes require authentication
- Public share routes are unauthenticated
- User info stored with each report

---

## Future Enhancements (Potential)

1. Report templates
2. Scheduled report generation
3. Email report delivery
4. Report versioning
5. Custom slide ordering
6. Report comparison (month-over-month)
7. Analytics on report views
8. Report comments/annotations

