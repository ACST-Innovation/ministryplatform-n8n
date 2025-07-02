# ministryplatform-n8n

This is an n8n community node that lets you use MinistryPlatform in your n8n workflows.

MinistryPlatform is a church management system that provides tools for managing contacts, events, donations, and more.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

### Docker Installation (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ACST-Innovation/ministryplatform-n8n.git
   cd ministryplatform-n8n
   ```

2. **Install dependencies and build:**
   ```bash
   npm install
   npm run build
   ```

3. **Copy to n8n Docker container:**
   ```bash
   # Copy the entire project to the custom extensions directory
   docker cp . n8n:/home/node/.n8n/custom/ministryplatform-n8n/
   
   # Fix file permissions
   docker exec -it n8n chown -R node:node /home/node/.n8n/custom/
   ```

4. **Set environment variable and restart:**
   
   **Important:** Use absolute path, not tilde (`~`)
   
   ```bash
   # Stop container
   docker stop n8n
   
   # Remove old container
   docker rm n8n
   
   # Start with custom extensions environment variable
   docker run -d \
     --name n8n \
     -p 5678:5678 \
     -e N8N_CUSTOM_EXTENSIONS=/home/node/.n8n/custom \
     -v n8n_data:/home/node/.n8n \
     n8nio/n8n:latest
   ```

### NPM Installation

Alternatively, install as a global npm package:

```bash
# Clone and build
git clone https://github.com/ACST-Innovation/ministryplatform-n8n.git
cd ministryplatform-n8n
npm install
npm run build

# Install globally
npm install -g .
```

## Operations

This node provides direct access to MinistryPlatform's table API, allowing you to work with any table in your MinistryPlatform instance.

### Table Operations Available

- **Create**: Add new records to any table
- **Get**: Retrieve a specific record by ID
- **List**: Retrieve multiple records with filtering and pagination
- **Update**: Modify existing records
- **Delete**: Remove records

### Table Configuration

For all operations, you need to specify:
- **Table Name**: The exact name of the MinistryPlatform table (e.g., `Contacts`, `Events`, `Donations`, `Households`)

### List Operation Parameters

The List operation supports these query parameters:

- **select**: Comma-separated list of fields to return (e.g., `Contact_ID,Display_Name,Email_Address`)
- **filter**: MS SQL WHERE clause syntax (e.g., `Contact_ID > 1000`, `Email_Address='user@example.com'`)
- **orderby**: Field to sort by (e.g., `Display_Name asc`, `Created_Date desc`)
- **groupby**: Field to group results by
- **having**: Having clause for grouped results
- **top**: Maximum number of records to return (e.g., `100`)
- **skip**: Number of records to skip for pagination (e.g., `50`)
- **distinct**: Return only unique records (boolean)
- **userId**: User ID for context-sensitive queries
- **globalFilterId**: Apply a global filter by ID

### MS SQL Filter Examples

```
# String equality (use single quotes)
Email_Address='john@example.com'

# String contains (LIKE with wildcards)
Display_Name LIKE '%Smith%'

# Number comparison
Contact_ID > 1000

# Date comparison  
Created_Date >= '2024-01-01'

# Multiple conditions
Contact_ID > 1000 AND Email_Address LIKE '%gmail.com%'

# Null checks
Email_Address IS NOT NULL

# IN clause
Contact_ID IN (1001, 1002, 1003)
```

### Common Table Names

- `Contacts` - Contact records
- `Events` - Event records
- `Donations` - Donation records
- `Households` - Household records
- `Participants` - Event participants
- `Groups` - Group records
- `Users` - User accounts

## Credentials

This node uses OAuth2 authentication. You'll need to configure:

### MinistryPlatform OAuth App Setup
1. Create an OAuth application in your MinistryPlatform instance
2. Set the redirect URI to: `https://your-n8n-instance.com/rest/oauth2-credential/callback`
3. Note down your Client ID and Client Secret

### n8n Credential Configuration
In n8n, create new MinistryPlatform OAuth2 API credentials with:

1. **Environment URL**: Your MinistryPlatform base URL (e.g., `https://your-instance.ministryplatform.com`)
2. **Authorization URL**: `https://your-instance.ministryplatform.com/ministryplatformapi/oauth/connect/authorize`
3. **Access Token URL**: `https://your-instance.ministryplatform.com/ministryplatformapi/oauth/connect/token`
4. **Client ID**: From your MinistryPlatform OAuth app
5. **Client Secret**: From your MinistryPlatform OAuth app
6. **Scope**: `http://www.thinkministry.com/dataplatform/scopes/all offline_access` (includes offline_access for refresh tokens)

**Note:** Replace `your-instance` with your actual MinistryPlatform subdomain.

## Troubleshooting

### Node Not Appearing
- Ensure `N8N_CUSTOM_EXTENSIONS` uses absolute path: `/home/node/.n8n/custom` (not `~/.n8n/custom`)
- Verify file permissions: `docker exec -it n8n chown -R node:node /home/node/.n8n/custom/`
- Check n8n logs: `docker logs n8n`

### OAuth Issues
- Verify OAuth URLs include `/ministryplatformapi` path
- Check redirect URI matches n8n instance URL
- Ensure MinistryPlatform OAuth app is configured correctly
- **Token Expired**: If you get token expiration errors, reconnect your credentials in n8n to refresh the token
- **Automatic Refresh**: n8n should automatically refresh expired tokens, but manual reconnection may be needed

### Filter Issues
- Use single quotes for string values: `Email_Address='user@example.com'`
- Use standard SQL operators: `=`, `!=`, `>`, `<`, `>=`, `<=`
- Use `LIKE '%text%'` for contains, not `contains()`
- Check field names match exactly (case-sensitive)
- Use `AND`/`OR` for multiple conditions, not `and`/`or`

### Query Parameter Issues
- **Top parameter ignored**: If using List operation, ensure you're setting the `top` parameter in the Additional Fields, not expecting automatic pagination
- **All records returned**: The `top` parameter is now respected - if not set, all records will be paginated and returned

### Build Issues
- Run `npm install` before `npm run build`
- Check for TypeScript compilation errors
- Ensure all dependencies are installed

## Development

### Build Commands
- `npm run build` - Compile TypeScript and build icons
- `npm run dev` - Watch mode for development
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Compatibility

Tested with n8n version 1.0+

## Testing

### Postman Collection

A Postman collection is included in the `postman/` directory for testing the MinistryPlatform API directly:

- **Collection**: `postman/MinistryPlatform-API.postman_collection.json`
- **Documentation**: `postman/README.md`

The collection includes examples for all operations (Create, Get, List, Update, Delete) with proper OAuth2 configuration.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [MinistryPlatform Developer Resources](https://help.acst.com/en/ministryplatform/developer-resources/developer-resources)
* [MinistryPlatform Tables API Documentation](https://help.acst.com/en/ministryplatform/developer-resources/developer-resources/rest-api/tables)
