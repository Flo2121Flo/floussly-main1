import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface APIDoc {
  endpoint: string;
  method: string;
  description: string;
  parameters?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  responses: {
    status: number;
    description: string;
    schema?: any;
  }[];
  examples?: {
    request: any;
    response: any;
  }[];
}

interface UserGuide {
  title: string;
  content: string;
  category: string;
  lastUpdated: string;
}

export class Documentation {
  private readonly DOCS_DIR = path.join(process.cwd(), 'docs');
  private readonly API_DOCS_DIR = path.join(this.DOCS_DIR, 'api');
  private readonly USER_GUIDES_DIR = path.join(this.DOCS_DIR, 'guides');

  constructor() {
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    [this.DOCS_DIR, this.API_DOCS_DIR, this.USER_GUIDES_DIR].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async generateAPIDocs(): Promise<void> {
    try {
      // Generate OpenAPI/Swagger documentation
      await execAsync('npm run generate-api-docs');

      // Parse and enhance the generated documentation
      const apiDocs = await this.parseAPIDocs();
      await this.saveAPIDocs(apiDocs);

      logger.info('API documentation generated successfully');
    } catch (error) {
      logger.error('Error generating API documentation:', error);
      throw error;
    }
  }

  private async parseAPIDocs(): Promise<APIDoc[]> {
    const swaggerPath = path.join(process.cwd(), 'swagger.json');
    const swaggerData = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'));

    const apiDocs: APIDoc[] = [];

    Object.entries(swaggerData.paths).forEach(([endpoint, methods]: [string, any]) => {
      Object.entries(methods).forEach(([method, details]: [string, any]) => {
        apiDocs.push({
          endpoint,
          method: method.toUpperCase(),
          description: details.description,
          parameters: details.parameters?.map((p: any) => ({
            name: p.name,
            type: p.type,
            required: p.required,
            description: p.description,
          })),
          responses: Object.entries(details.responses).map(([status, response]: [string, any]) => ({
            status: parseInt(status),
            description: response.description,
            schema: response.schema,
          })),
          examples: details.examples,
        });
      });
    });

    return apiDocs;
  }

  private async saveAPIDocs(apiDocs: APIDoc[]): Promise<void> {
    const markdown = this.generateAPIDocsMarkdown(apiDocs);
    const filePath = path.join(this.API_DOCS_DIR, 'api-reference.md');
    await fs.promises.writeFile(filePath, markdown);
  }

  private generateAPIDocsMarkdown(apiDocs: APIDoc[]): string {
    return `
# API Reference

## Endpoints

${apiDocs
  .map(
    doc => `
### ${doc.method} ${doc.endpoint}

${doc.description}

${doc.parameters ? `
#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
${doc.parameters
  .map(
    p => `| ${p.name} | ${p.type} | ${p.required ? 'Yes' : 'No'} | ${p.description} |`
  )
  .join('\n')}
` : ''}

#### Responses

| Status | Description |
|--------|-------------|
${doc.responses
  .map(r => `| ${r.status} | ${r.description} |`)
  .join('\n')}

${doc.examples ? `
#### Example

\`\`\`json
// Request
${JSON.stringify(doc.examples[0].request, null, 2)}

// Response
${JSON.stringify(doc.examples[0].response, null, 2)}
\`\`\`
` : ''}
`
  )
  .join('\n')}
    `;
  }

  async generateUserGuides(): Promise<void> {
    const guides: UserGuide[] = [
      {
        title: 'Getting Started',
        content: this.generateGettingStartedGuide(),
        category: 'basics',
        lastUpdated: new Date().toISOString(),
      },
      {
        title: 'Group Savings',
        content: this.generateGroupSavingsGuide(),
        category: 'features',
        lastUpdated: new Date().toISOString(),
      },
      {
        title: 'KYC Verification',
        content: this.generateKYCGuide(),
        category: 'features',
        lastUpdated: new Date().toISOString(),
      },
      {
        title: 'Security',
        content: this.generateSecurityGuide(),
        category: 'security',
        lastUpdated: new Date().toISOString(),
      },
    ];

    await this.saveUserGuides(guides);
  }

  private generateGettingStartedGuide(): string {
    return `
# Getting Started with Floussly

## Installation
1. Download the app from the App Store or Google Play Store
2. Create an account using your email or phone number
3. Complete the initial setup process

## Basic Features
- View your balance
- Make transactions
- Join group savings
- Contact support

## Navigation
- Home: View your dashboard
- Transactions: View transaction history
- Groups: Manage group savings
- Profile: Update your information

## Security
- Enable biometric authentication
- Set up PIN code
- Review security settings
    `;
  }

  private generateGroupSavingsGuide(): string {
    return `
# Group Savings Guide

## Creating a Group
1. Go to the Groups tab
2. Click "Create New Group"
3. Set group name and savings goal
4. Invite members

## Managing Contributions
- Set contribution schedule
- Track member contributions
- View group progress
- Handle withdrawals

## Group Roles
- Admin: Full control
- Moderator: Can approve transactions
- Member: Can contribute and view

## Best Practices
- Set clear goals
- Regular communication
- Fair contribution rules
- Emergency procedures
    `;
  }

  private generateKYCGuide(): string {
    return `
# KYC Verification Guide

## Required Documents
- Government ID
- Proof of address
- Selfie with ID
- Additional documents if needed

## Verification Process
1. Upload documents
2. Take selfie
3. Submit for review
4. Wait for approval

## Common Issues
- Blurry images
- Expired documents
- Mismatched information
- Technical problems

## Support
Contact support if you need help with verification
    `;
  }

  private generateSecurityGuide(): string {
    return `
# Security Guide

## Account Security
- Strong password requirements
- Two-factor authentication
- Biometric login
- Session management

## Transaction Security
- Transaction limits
- Verification steps
- Fraud prevention
- Dispute resolution

## Data Protection
- Encryption
- Privacy settings
- Data retention
- Access control

## Best Practices
- Regular password updates
- Secure device usage
- Phishing awareness
- Regular security checks
    `;
  }

  private async saveUserGuides(guides: UserGuide[]): Promise<void> {
    for (const guide of guides) {
      const filePath = path.join(
        this.USER_GUIDES_DIR,
        `${guide.category}`,
        `${guide.title.toLowerCase().replace(/\s+/g, '-')}.md`
      );

      const content = `
# ${guide.title}

Last Updated: ${new Date(guide.lastUpdated).toLocaleDateString()}

${guide.content}
      `;

      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(filePath, content);
    }
  }

  async generateDeploymentGuide(): Promise<void> {
    const content = `
# Deployment Guide

## Prerequisites
- Node.js 16+
- MongoDB 4.4+
- Redis 6+
- AWS Account (for production)

## Environment Setup
1. Clone the repository
2. Install dependencies
3. Configure environment variables
4. Set up databases

## Development Deployment
1. Run tests
2. Build the application
3. Start development server
4. Monitor logs

## Production Deployment
1. Set up infrastructure
2. Configure SSL
3. Set up monitoring
4. Deploy application
5. Verify deployment

## Monitoring
- Set up logging
- Configure alerts
- Monitor performance
- Track errors

## Maintenance
- Regular updates
- Backup procedures
- Security patches
- Performance optimization
    `;

    const filePath = path.join(this.DOCS_DIR, 'deployment.md');
    await fs.promises.writeFile(filePath, content);
  }

  async generateMaintenanceGuide(): Promise<void> {
    const content = `
# Maintenance Guide

## Regular Tasks
- Database backups
- Log rotation
- Security updates
- Performance monitoring

## Troubleshooting
- Common issues
- Error codes
- Debug procedures
- Support contacts

## Updates
- Version control
- Release process
- Rollback procedures
- Testing requirements

## Security
- Vulnerability scanning
- Penetration testing
- Access review
- Compliance checks
    `;

    const filePath = path.join(this.DOCS_DIR, 'maintenance.md');
    await fs.promises.writeFile(filePath, content);
  }
} 