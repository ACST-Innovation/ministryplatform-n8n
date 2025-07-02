# n8n-nodes-ministryplatform

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

### Resources

- **Contact**: Manage church member and visitor contact information
- **Event**: Handle church events and registrations  
- **Donation**: Track and manage donations
- **Table**: Generic operations on any MinistryPlatform table

### Operations Available

- **Create**: Add new records
- **Get**: Retrieve a specific record by ID
- **Get All**: Retrieve multiple records with optional filtering
- **Update**: Modify existing records
- **Delete**: Remove records

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

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [MinistryPlatform API Documentation](https://mpi.ministryplatform.com/ministryplatformapi/swagger/ui/index)
