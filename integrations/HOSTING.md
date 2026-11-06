Local client demo
=================
Double-click Start-Website.cmd and open http://localhost:3000. Keep the terminal running and Excel closed. Submissions go to the original Excel tracker in Downloads. No Google account setup is required for this demo.

Online version: Netlify + Google Sheets
======================================
The project includes a Netlify configuration, a private server function and Google Apps Script. Activation still requires the owner's accounts and the following configuration. Check the hosting plan's current usage limits and suitability before publishing a client site.

1. Upload SITC_Consultation_Lead_Tracker.xlsx to Google Drive. Open it in Google Sheets, then File > Save as Google Sheets. Keep the sheet private. This cloud copy will collect online submissions; the Downloads Excel file will not automatically sync.
2. Open Extensions > Apps Script from that spreadsheet. Paste integrations/google-apps-script.gs.
3. Under Project Settings > Script properties, add SPREADSHEET_ID (the part between /d/ and /edit in the spreadsheet URL) and LEAD_API_TOKEN (a long random secret, e.g. generate with node -e "console.log(require('crypto').randomBytes(32).toString('hex'))").
4. Deploy > New deployment > Web app. Execute as yourself; access Anyone. Authorize the script and copy its /exec deployment URL. The secret is verified by the script; never put it in index.html or public files.
5. Import this project into Netlify using a Git repository. The included netlify.toml builds only public website files into dist and deploys the lead function. Do not use a static drag-and-drop deployment: the form needs its server function.
6. In Netlify environment variables, add GOOGLE_SCRIPT_URL (the /exec URL) and LEAD_API_TOKEN (exactly the same secret as step 3). Redeploy.
7. Submit a clearly marked test enquiry on the deployed site. Confirm the row in Leads before collecting real enquiries. Delete the test row afterward. If saving fails, the form stays on screen and does not show success.
8. For Excel, use Google Sheets > File > Download > Microsoft Excel (.xlsx). Online submissions continue going to the cloud sheet.

The template dashboard initially counts rows 2–501. For more leads, change dashboard formula ranges such as Leads!C2:C501 to Leads!C2:C and Leads!X2:X501 to Leads!X2:X in the cloud sheet.

When editing the Apps Script, publish a new deployment version. Do not share the spreadsheet publicly or commit secrets. Hosted submissions require setup and an end-to-end test; they have not been activated by preparing these files.

References:
https://developers.google.com/apps-script/guides/web
https://docs.netlify.com/build/functions/overview/
