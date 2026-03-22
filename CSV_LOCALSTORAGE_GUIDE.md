# CSV Loading & localStorage Persistence - Implementation Guide

## ✅ What's Been Implemented

### 1. **Real CSV File Upload**
- Users can now upload actual CSV files (not just demo data)
- CSV parser auto-detects column names (case-insensitive)
- Supports flexible column naming:
  - Name: "name", "first name", "full name"
  - Email: "email", "email address", "e-mail"
  - Company: "company", "organization", "organization name"
  - Role: "role", "job title", "position", "title"
- Email validation before importing
- Deduplication (prevents duplicate emails)
- File size limit: 5MB max
- Error handling with clear messages

### 2. **localStorage Persistence**
- All leads are **automatically saved to browser storage**
- Persists across browser sessions
- No data loss on page refresh
- Storage capacity: ~5-10MB depending on browser

### 3. **Download Leads as CSV**
- Export all leads as a CSV file
- Auto-generates filename with date: `leads-2026-03-22.csv`
- Includes: Name, Email, Company, Role, Source, Import Date
- One-click download button (visible when leads exist)

### 4. **Clear Leads**
- Manual clear button to delete all leads from storage
- Confirmation dialog to prevent accidental deletion
- Clears both UI and localStorage
- Activity logged to feed

### 5. **Lead Statistics**
- Shows total lead count
- Displays sources of leads (CSV, Script, Integration)
- Shows "Stored In: 📦 Browser Storage"

---

## 📁 CSV File Format

### Expected Columns (any order, case-insensitive):

| Column Name | Alternatives | Example |
|------------|--------------|---------|
| Name | First Name, Full Name | "John Smith" |
| Email | Email Address, E-mail | "john@example.com" |
| Company | Organization | "Acme Corp" |
| Role | Job Title, Position | "VP of Sales" |

### Example CSV File:

```csv
Name,Email,Company,Role
Rachel Torres,rachel@snowflake.com,Snowflake,VP Revenue
Kevin Huang,kevin@datadog.com,Datadog,Head of Sales
Priya Sharma,priya@freshworks.com,Freshworks,Director BDR
```

Or with different column names (also works):

```csv
Full Name,Email Address,Organization,Position
John Smith,john@example.com,TechCorp,Sales Director
Jane Doe,jane@techcorp.com,TechCorp,Senior Sales Manager
```

---

## 🔧 How It Works

### File Upload Flow:

1. **User clicks "Upload CSV"**
2. **Selects CSV file** (max 5MB)
3. **File is read** and parsed
4. **CSV parser automatically detects columns**
5. **Validates all rows** (email format, required fields)
6. **Checks for duplicates** (skips if email already exists)
7. **Leads are added** to state
8. **State change triggers localStorage save**
9. **Success notification** shows number imported

### Storage Flow:

```
Lead Added → State Updated → useEffect triggered → Saved to localStorage
                                                        ↓
                                            Browser Refresh
                                                        ↓
                                            useEffect loads from localStorage
                                                        ↓
                                            State restored
```

### Download Flow:

1. **User clicks "Download CSV"**
2. **All leads converted to CSV format**
3. **CSV file generated**
4. **Browser triggers download**
5. **File received: `leads-2026-03-22.csv`**

---

## 📝 API Functions Added

### CSV Parsing
```typescript
// Parse CSV content string
parseCSV(csvContent: string): ParsedLead[]

// Parse uploaded file
parseCSVFile(file: File): Promise<ParsedLead[]>
```

### localStorage Operations
```typescript
// Save leads
saveLeadsToStorage(leads: StoredLead[]): void

// Load leads
loadLeadsFromStorage(): StoredLead[]

// Clear leads
clearLeadsFromStorage(): void
```

### CSV Export
```typescript
// Convert leads to CSV string
leadsToCSV(leads: StoredLead[]): string

// Download leads as file
downloadLeadsAsCSV(leads: StoredLead[], filename?: string): void
```

---

## 🔑 SalesContext Methods

### New Methods Available

```typescript
// Import from actual CSV file
importLeadsFromCSVFile(file: File): Promise<number>

// Clear all leads
clearAllLeads(): void

// Download leads as CSV
downloadLeadsAsCSV(): void
```

---

## 💾 Storage Structure

### What Gets Stored (localStorage key: `salesflow_leads`)

```typescript
interface StoredLead {
  id: string;                    // Unique ID with timestamp
  name: string;                  // Lead name
  email: string;                 // Lead email
  company: string;               // Company name
  role: string;                  // Job role
  source: "csv" | "scraped" | "integration";  // Where it came from
  importedAt: number;            // Timestamp
}
```

### Storage Size

- Each lead ≈ 200-300 bytes
- 1000 leads ≈ 200-300 KB
- Browser storage limit: 5-10 MB
- **Capacity: 10,000-50,000+ leads**

---

## 🎯 How Users Use It

### Scenario 1: Import CSV File

1. Go to **Leads** page
2. Click **"Upload CSV"**
3. Click on file area or use file picker
4. Select your CSV file (Name, Email, Company, Role columns)
5. File uploads, parses, and imports
6. Success message shows count
7. Leads appear in table
8. ✅ Leads automatically saved to localStorage

### Scenario 2: Download Leads

1. Import some leads
2. Click **"Download CSV"** button
3. File downloads: `leads-2026-03-22.csv`
4. Open in Excel, Google Sheets, etc.
5. Edit and re-upload if needed

### Scenario 3: Clear Leads

1. Click **"Clear All"** button
2. Confirm deletion in dialog
3. All leads deleted from storage
4. Table becomes empty

### Scenario 4: Persist Across Sessions

1. Import leads
2. Close browser/tab
3. Come back tomorrow
4. ✅ Leads are still there!
5. No need to re-import

---

## 🛠️ Error Handling

### What Gets Validated:

- ✅ File must be CSV
- ✅ File size must be < 5MB
- ✅ CSV must have required columns
- ✅ All rows must have: name, email, company, role
- ✅ Email format must be valid
- ✅ Duplicate emails are skipped
- ✅ localStorage must be available

### Error Messages:

- "Please upload a CSV file" → Wrong file type
- "File is too large (max 5MB)" → File too big
- "CSV must have at least a header row and one data row" → Empty CSV
- "CSV must include: name, email, company, role columns" → Missing columns
- "No valid leads found in CSV" → All rows invalid
- Invalid email format on row 5 → Specific row error

---

## 🔒 Data Privacy

### localStorage Behavior

- **Local Storage**: Data stored only in browser
- **Not sent to server**: Leads stay on user's machine
- **Survives browser refresh**: Yes
- **Survives browser close**: Yes (on same browser)
- **Cleared on**: 
  - User clicks "Clear All" button
  - User clears browser data/cache
  - Browser storage quota exceeded
- **Browser sync**: No (not synced across devices)

### To Backup Leads

- Use "Download CSV" button
- Store the CSV file you download
- Re-import anytime

---

## 📊 Implementation Details

### Files Modified:

1. **`src/lib/api-clients.ts`**
   - Added CSV parsing functions
   - Added localStorage utilities
   - Added CSV export functions
   - ~260 lines of new code

2. **`src/context/SalesContext.tsx`**
   - Added useEffect for loading from localStorage
   - Added useEffect for saving to localStorage
   - Added `importLeadsFromCSVFile()` method
   - Added `clearAllLeads()` method
   - Added `downloadLeadsAsCSV()` method
   - Updated provider value with new methods

3. **`src/pages/Leads.tsx`**
   - Replaced demo CSV upload with real file upload
   - Added file input with validation
   - Added download button
   - Added clear button with confirmation
   - Added lead statistics display
   - Added storage info

---

## 🚀 Next Steps (Optional Enhancements)

### Could Add:

1. **Export to different formats**
   - JSON export
   - Excel (.xlsx) export

2. **Bulk operations**
   - Bulk delete specific leads
   - Bulk edit leads
   - Bulk filter/search

3. **Advanced CSV features**
   - CSV import preview before saving
   - Column mapping if CSV headers don't match
   - Phone number field support
   - Custom field support

4. **Cloud Sync**
   - Sync to Firebase/Supabase
   - Export to Google Drive
   - Backup to cloud storage

5. **Import from external sources**
   - Salesforce integration
   - HubSpot integration
   - LinkedIn integration

---

## ✅ Testing Checklist

### Try These:

- [ ] Create CSV file with headers
- [ ] Upload CSV file (~5 leads)
- [ ] Confirm leads appear in table
- [ ] Refresh page → Leads still there! ✓
- [ ] Add more leads
- [ ] Click "Download CSV"
- [ ] Open downloaded file
- [ ] Verify all columns present
- [ ] Click "Clear All"
- [ ] Confirm dialog
- [ ] Verify all leads deleted
- [ ] Upload CSV again → Works!

---

## 📝 Summary

You now have a **complete lead import/export system** with:

- ✅ Real CSV file uploads with flexible column detection
- ✅ Automatic localStorage persistence
- ✅ Manual clear button with confirmation
- ✅ One-click CSV export/download
- ✅ Cross-session data persistence
- ✅ Full error handling
- ✅ Data validation and deduplication
- ✅ Capacity for 10,000+ leads

Leads are now **properly persisted** and users can **import/export data** freely! 🎉
