-- Insert default consultant types
INSERT INTO "consultant_types" ("type", "description", "createdAt", "updatedAt") VALUES
('Project Management', 'Project Management Consultant (PMC)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Design', 'Design Consultant', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Cost', 'Cost Consultant', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Supervision', 'Supervision Consultant', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT("type") DO NOTHING;
