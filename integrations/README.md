Run Start-Website.cmd, then open http://localhost:3000. Submit the consultation form there.

Submissions save to ../SITC_Consultation_Lead_Tracker.xlsx in the Leads sheet, using the first empty Full Name row. Keep Excel closed while collecting leads. The last saved workbook is backed up beside it as .xlsx.backup. Follow-up Status starts as New; counsellor columns are preserved. Dashboard formulas recalculate when Excel opens.

This setup runs on this computer only. A hosted website cannot write directly to a file in your Downloads folder. For live use, deploy a backend with persistent private storage or connect a cloud spreadsheet. The workbook path can be set with LEAD_WORKBOOK. Do not expose the workbook or backups as public website files.

Run npm install if moving the project to a new computer with Node.js installed. Run npm test to check saving using a temporary copy; tests do not change the original tracker.
