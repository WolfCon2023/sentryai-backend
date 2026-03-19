import { describe, it, expect, beforeEach } from 'vitest';
import { createApp, createTestUser, getAuthHeaders } from '../helpers.js';
import { FastifyInstance } from 'fastify';
import PortfolioCompany from '../../src/models/PortfolioCompany.js';

describe('Portfolio Routes', () => {
  let app: FastifyInstance;
  let headers: Record<string, string>;
  let companyId: string;

  beforeEach(async () => {
    app = await createApp();
    const user = await createTestUser('admin');
    headers = await getAuthHeaders(app, user.id, user.role);

    const company = await PortfolioCompany.create({
      name: 'TestCo',
      website: 'https://testco.com',
      sector: 'B2B SaaS',
      stage: 'Series A',
      investmentDate: '2023-01-01',
      investmentAmount: '$5M',
      ownership: '15%',
      status: 'active',
      description: 'Test company',
      headquarters: 'SF',
      employees: '50',
      founded: '2020',
      lastUpdated: '2024-01-01',
      about: { overview: 'Test overview', mission: 'Test', vision: 'Test', history: 'Test', leadership: [], keyMilestones: [] },
      investmentMemo: { thesis: 'Test thesis', keyDrivers: [], risks: [], exitStrategy: 'IPO', valuation: {}, dealTerms: '', boardSeats: 1, proRataRights: true },
      marketOpportunity: { tam: '$10B', sam: '$3B', som: '$500M', marketGrowth: '20%', competitiveLandscape: 'Test', competitors: [], trends: [], barriers: [] },
      customersAndPricing: { targetCustomer: 'Enterprise', customerSegments: [], keyCustomers: [], churnRate: '5%', nps: 50, pricingModel: 'SaaS', pricingTiers: [], acv: '$50k', ltv: '$200k', cac: '$20k' },
      productDetails: { description: 'Test product', keyFeatures: [], techStack: [], integrations: [], roadmap: [], differentiators: [] },
    });
    companyId = company._id.toString();
  });

  it('should list companies', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/portfolio/companies', headers });
    expect(res.statusCode).toBe(200);
    expect(res.json().length).toBe(1);
    expect(res.json()[0].name).toBe('TestCo');
  });

  it('should get company by ID', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/portfolio/companies/${companyId}`, headers });
    expect(res.statusCode).toBe(200);
    expect(res.json().name).toBe('TestCo');
  });

  it('should get company about', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/portfolio/companies/${companyId}/about`, headers });
    expect(res.statusCode).toBe(200);
    expect(res.json().overview).toBe('Test overview');
  });

  it('should get investment memo', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/portfolio/companies/${companyId}/investment-memo`, headers });
    expect(res.statusCode).toBe(200);
    expect(res.json().thesis).toBe('Test thesis');
  });

  it('should get market opportunity', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/portfolio/companies/${companyId}/market-opportunity`, headers });
    expect(res.statusCode).toBe(200);
    expect(res.json().tam).toBe('$10B');
  });

  it('should return 404 for missing company', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/portfolio/companies/000000000000000000000000', headers });
    expect(res.statusCode).toBe(404);
  });
});
