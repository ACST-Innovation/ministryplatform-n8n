# MinistryPlatform API Postman Collection

This collection provides examples for interacting with the MinistryPlatform REST API using the table endpoints.

## Setup Instructions

1. **Import the Collection**
   - Open Postman
   - Click "Import" and select `MinistryPlatform-API.postman_collection.json`

2. **Configure Variables**
   - After importing, go to the collection settings
   - Update the following variables:
     - `base_url`: Your MinistryPlatform API base URL (default: `https://mpi.ministryplatform.com/ministryplatformapi`)
     - `table_name`: The table you want to work with (e.g., `Contacts`, `Events`, `Donations`)
     - `record_id`: The ID of the record for get/update/delete operations

3. **Configure OAuth2 Authentication**
   - Go to the collection's Authorization tab
   - The OAuth2 settings are pre-configured with MinistryPlatform endpoints
   - You'll need to configure your client credentials:
     - Client ID: Your MinistryPlatform application client ID
     - Client Secret: Your MinistryPlatform application client secret
   - Click "Get New Access Token" to authenticate

## Available Endpoints

### Get Record
- **Method**: GET
- **Endpoint**: `/tables/{table_name}/{record_id}`
- **Purpose**: Retrieve a single record by ID

### List Records
- **Method**: GET  
- **Endpoint**: `/tables/{table_name}`
- **Purpose**: Retrieve multiple records with optional filtering
- **Query Parameters**:
  - `$filter`: OData filter expression (e.g., `Contact_ID gt 1000`)
  - `$select`: Comma-separated fields to return (e.g., `Contact_ID,Display_Name`)
  - `$orderby`: Field to sort by (e.g., `Display_Name`)
  - `$top`: Maximum records to return (e.g., `100`)
  - `$skip`: Records to skip for pagination (e.g., `50`)
  - `$expand`: Related entities to include (e.g., `Household`)
  - `$count`: Include total count (`true`/`false`)

### Update Record
- **Method**: PUT
- **Endpoint**: `/tables/{table_name}/{record_id}`
- **Purpose**: Update an existing record
- **Body**: JSON object with fields to update

### Delete Record
- **Method**: DELETE
- **Endpoint**: `/tables/{table_name}/{record_id}`
- **Purpose**: Delete a record by ID

## Common Table Names

- `Contacts` - Contact records
- `Events` - Event records  
- `Donations` - Donation records
- `Households` - Household records
- `Participants` - Event participants
- `Groups` - Group records

## MS SQL Query Examples

### Filter by ID range
```
$filter=Contact_ID > 1000 AND Contact_ID < 2000
```

### Filter by date
```
$filter=Created_Date >= '2024-01-01'
```

### Filter by text field
```
$filter=Display_Name LIKE '%Smith%'
```

### Combine multiple filters
```
$filter=Contact_ID > 1000 AND Email_Address LIKE '%@gmail.com%'
```

### String equality
```
$filter=Email_Address='patrick@acst.com'
```

## Notes

- All requests require OAuth2 authentication
- Replace `{table_name}` and `{record_id}` with actual values or use the collection variables
- The API uses MS SQL syntax for query parameters, not OData
- Error responses will include details about what went wrong
