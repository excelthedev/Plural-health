# Plural Backend API Documentation

## Records API Endpoints

The Records API provides comprehensive functionality for managing appointment records with advanced filtering, searching, and pagination capabilities.

### Base URL

```
http://localhost:3001/api/records
```

## Endpoints

### 1. Get Records (with filters and pagination)

**GET** `/api/records`

Retrieves appointment records with comprehensive filtering, searching, and pagination.

#### Query Parameters

| Parameter    | Type   | Default           | Description                                                              |
| ------------ | ------ | ----------------- | ------------------------------------------------------------------------ |
| `page`       | number | 1                 | Page number for pagination                                               |
| `limit`      | number | 20                | Number of records per page (max 100)                                     |
| `search`     | string | ""                | Search in patient name, code, or phone                                   |
| `clinic`     | string | ""                | Filter by clinic name                                                    |
| `status`     | string | ""                | Filter by appointment status                                             |
| `sortBy`     | string | "appointmentTime" | Sort field (appointmentTime, patientName, clinic, status, walletBalance) |
| `sortOrder`  | string | "asc"             | Sort order (asc, desc)                                                   |
| `startDate`  | string | ""                | Start date filter (ISO format)                                           |
| `endDate`    | string | ""                | End date filter (ISO format)                                             |
| `facilityId` | string | ""                | Filter by facility ID                                                    |

#### Response Format

```json
{
  "success": true,
  "data": {
    "records": [
      {
        "_id": "68f224d29657ea6c412ac176",
        "patientName": "Fatima Ibrahim",
        "patientCode": "HOSP29384760",
        "patientPhone": "+234-805-678-9012",
        "appointmentTime": "2025-10-17T07:15:00.000Z",
        "clinic": "Accident & Emergency",
        "status": "Admitted to ward",
        "appointmentType": "Follow-up",
        "walletBalance": 95000,
        "currency": "NGN",
        "facilityName": "Abuja Medical Center",
        "isUrgent": false,
        "cost": 48784,
        "paymentStatus": "Paid",
        "notes": "Appointment for Accident & Emergency consultation",
        "createdAt": "2025-10-17T11:13:22.625Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalRecords": 7,
      "recordsPerPage": 20,
      "hasNextPage": false,
      "hasPrevPage": false
    },
    "filters": {
      "search": "",
      "clinic": "",
      "status": "",
      "startDate": "",
      "endDate": "",
      "sortBy": "appointmentTime",
      "sortOrder": "asc"
    }
  },
  "message": "Records retrieved successfully"
}
```

#### Example Requests

```bash
# Get all records for today
curl "http://localhost:3001/api/records"

# Search for a specific patient
curl "http://localhost:3001/api/records?search=Akpopodion"

# Filter by clinic and status
curl "http://localhost:3001/api/records?clinic=Neurology&status=Seen%20doctor"

# Get records with pagination
curl "http://localhost:3001/api/records?page=1&limit=10"

# Sort by patient name descending
curl "http://localhost:3001/api/records?sortBy=patientName&sortOrder=desc"

# Filter by date range
curl "http://localhost:3001/api/records?startDate=2025-10-17&endDate=2025-10-18"
```

### 2. Get Statistics

**GET** `/api/records/stats`

Retrieves statistics for dashboard display.

#### Query Parameters

| Parameter    | Type   | Default | Description                    |
| ------------ | ------ | ------- | ------------------------------ |
| `facilityId` | string | ""      | Filter by facility ID          |
| `startDate`  | string | ""      | Start date filter (ISO format) |
| `endDate`    | string | ""      | End date filter (ISO format)   |

#### Response Format

```json
{
  "success": true,
  "data": {
    "totalAppointments": 7,
    "urgentAppointments": 2,
    "statusDistribution": [
      {
        "_id": "Awaiting doctor",
        "count": 3
      },
      {
        "_id": "Admitted to ward",
        "count": 2
      }
    ],
    "clinicDistribution": [
      {
        "_id": "Neurology",
        "count": 2
      },
      {
        "_id": "Dermatology",
        "count": 1
      }
    ]
  },
  "message": "Statistics retrieved successfully"
}
```

### 3. Get Filter Options

**GET** `/api/records/filters`

Retrieves available filter options for dropdowns.

#### Query Parameters

| Parameter    | Type   | Default | Description           |
| ------------ | ------ | ------- | --------------------- |
| `facilityId` | string | ""      | Filter by facility ID |

#### Response Format

```json
{
  "success": true,
  "data": {
    "clinics": [
      "Accident & Emergency",
      "Cardiology",
      "Dermatology",
      "General Medicine",
      "Neurology",
      "Pediatrics"
    ],
    "statuses": [
      "Admitted to ward",
      "Awaiting doctor",
      "Awaiting vitals",
      "Not arrived",
      "Processing",
      "Seen doctor",
      "Transferred to A&E"
    ]
  },
  "message": "Filter options retrieved successfully"
}
```

### 4. Get Single Record

**GET** `/api/records/:id`

Retrieves a single appointment record by ID.

#### Response Format

```json
{
  "success": true,
  "data": {
    "_id": "68f224d29657ea6c412ac176",
    "patientId": {
      "_id": "68f224d29657ea6c412ac16f",
      "name": "Fatima Ibrahim",
      "patientCode": "HOSP29384760",
      "phone": "+234-805-678-9012",
      "walletBalance": 95000,
      "currency": "NGN"
    },
    "doctorId": {
      "_id": "68f224d29657ea6c412ac177",
      "name": "Dr. Sarah Williams",
      "patientCode": "DOC001"
    },
    "facilityId": {
      "_id": "68f224d29657ea6c412ac16e",
      "name": "Abuja Medical Center",
      "type": "Medical Center",
      "address": {
        "street": "456 Central District",
        "city": "Abuja",
        "state": "FCT",
        "zipCode": "900001",
        "country": "Nigeria"
      },
      "phone": "+234-9-876-5432"
    },
    "appointmentTime": "2025-10-17T07:15:00.000Z",
    "clinic": "Accident & Emergency",
    "status": "Admitted to ward",
    "appointmentType": "Follow-up",
    "notes": "Appointment for Accident & Emergency consultation",
    "isUrgent": false,
    "estimatedDuration": 30,
    "cost": 48784,
    "paymentStatus": "Paid",
    "createdAt": "2025-10-17T11:13:22.625Z",
    "updatedAt": "2025-10-17T11:13:22.625Z"
  },
  "message": "Record retrieved successfully"
}
```

## Data Models

### User Model

```javascript
{
  name: String,
  email: String,
  phone: String,
  patientCode: String,
  dateOfBirth: Date,
  gender: String,
  walletBalance: Number,
  currency: String,
  facilityId: ObjectId,
  role: String,
  isActive: Boolean
}
```

### Appointment Model

```javascript
{
  patientId: ObjectId,
  doctorId: ObjectId,
  facilityId: ObjectId,
  appointmentTime: Date,
  clinic: String,
  status: String,
  appointmentType: String,
  notes: String,
  isUrgent: Boolean,
  cost: Number,
  paymentStatus: String
}
```

### Facility Model

```javascript
{
  name: String,
  type: String,
  address: Object,
  phone: String,
  email: String,
  licenseNumber: String,
  isActive: Boolean
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

Common HTTP status codes:

- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Logging

The API includes comprehensive logging for:

- Record list requests
- Filter applications
- Search executions
- Statistics requests
- Error occurrences

Logs include:

- Timestamp
- IP address
- User agent
- Request details
- Response status

## Database Seeding

To populate the database with sample data:

```bash
npm run seed
```

This creates:

- 2 facilities
- 10 users (8 patients, 2 doctors)
- 75 appointments across 7 days

## Acceptance Criteria Fulfillment

✅ **Display Requirements:**

- Patient name/code ✓
- Appointment time ✓
- Status ✓
- Clinic ✓
- Wallet balance with currency ✓

✅ **Filter Support:**

- Time window (default = today) ✓
- Clinic filter ✓

✅ **Search Support:**

- Patient name search ✓
- Patient code search ✓
- Phone number search ✓

✅ **Sorting:**

- Sort by time (default ascending) ✓
- Additional sort options ✓

✅ **Pagination:**

- Default page size (20) ✓
- Total count ✓
- Navigation info ✓

✅ **Additional Features:**

- Currency display ✓
- Empty state handling ✓
- API error handling ✓
- Facility scoping ✓
- Role-based access ready ✓
- Comprehensive logging ✓

## Usage Examples

### Frontend Integration

```javascript
// Fetch records with filters
const fetchRecords = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/records?${params}`);
  return response.json();
};

// Example usage
const records = await fetchRecords({
  search: "Akpopodion",
  clinic: "Neurology",
  page: 1,
  limit: 10,
});
```

### React Hook Example

```javascript
const useRecords = (filters) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(filters);
        const response = await fetch(`/api/records?${params}`);
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  return { data, loading, error };
};
```
