import mongoose from 'mongoose';
import PortfolioCompany from '../models/PortfolioCompany.js';
import { getEnv } from '../config/env.js';

const companies = [
  {
    name: 'CloudFlow Analytics',
    website: 'https://cloudflow.io',
    sector: 'B2B SaaS',
    stage: 'Series B',
    investmentDate: '2023-03-15',
    investmentAmount: '$12M',
    ownership: '18%',
    status: 'active' as const,
    description: 'Enterprise analytics platform for cloud infrastructure optimization',
    headquarters: 'San Francisco, CA',
    employees: '85',
    founded: '2020',
    lastUpdated: '2024-01-15',
    about: {
      overview: 'CloudFlow Analytics is a leading enterprise analytics platform that helps organizations optimize their cloud infrastructure spending and performance. Our AI-powered platform analyzes billions of data points to provide actionable insights that reduce costs by an average of 35%.',
      mission: 'To democratize cloud intelligence and make infrastructure optimization accessible to every organization.',
      vision: 'A world where every cloud resource is utilized efficiently, reducing both costs and environmental impact.',
      history: 'Founded in 2020 by former AWS and Google Cloud engineers who saw firsthand how enterprises struggled with cloud complexity. Started with 3 founders in a garage, now serving 200+ enterprise customers globally.',
      leadership: [
        { name: 'Sarah Chen', role: 'CEO & Co-Founder', bio: 'Former VP of Engineering at AWS. 15+ years in cloud infrastructure.' },
        { name: 'Michael Rodriguez', role: 'CTO & Co-Founder', bio: 'Former Principal Engineer at Google Cloud. Expert in distributed systems.' },
        { name: 'Emily Watson', role: 'CFO', bio: 'Former CFO at Datadog. MBA from Wharton.' },
      ],
      keyMilestones: [
        { date: '2020-01', event: 'Company founded' },
        { date: '2020-06', event: 'Seed round closed ($2.5M)' },
        { date: '2021-03', event: 'First enterprise customer signed' },
        { date: '2022-01', event: 'Series A closed ($8M)' },
        { date: '2023-03', event: 'Series B closed ($12M)' },
        { date: '2023-09', event: 'Reached 200 enterprise customers' },
      ],
    },
    investmentMemo: {
      thesis: 'CloudFlow addresses the critical pain point of cloud cost optimization, a market that is rapidly growing as enterprises continue to migrate to multi-cloud environments.',
      keyDrivers: ['Strong product-market fit with 150%+ net revenue retention', 'Experienced founding team', 'Efficient go-to-market with low CAC payback period', 'Platform approach creates expansion opportunities', 'Strong customer references and NPS (65+)'],
      risks: ['Competition from cloud providers native tools', 'Dependency on cloud provider APIs', 'Enterprise sales cycle length', 'Key person risk on technical leadership'],
      exitStrategy: 'Strategic acquisition by cloud provider or larger enterprise software company (likely exit in 4-6 years at 8-12x revenue multiple).',
      valuation: { entryValuation: '$45M pre-money', currentValuation: '$120M (implied from latest round)', methodology: '12x forward ARR multiple' },
      dealTerms: 'Series B with 1x non-participating preferred, standard protective provisions, board seat included.',
      boardSeats: 1,
      proRataRights: true,
    },
    marketOpportunity: {
      tam: '$45B - Global cloud management and optimization market',
      sam: '$12B - Enterprise cloud cost optimization',
      som: '$2B - Mid-market and enterprise B2B SaaS companies in North America and Europe',
      marketGrowth: '22% CAGR through 2028',
      competitiveLandscape: 'Fragmented market with mix of point solutions and emerging platforms.',
      competitors: [
        { name: 'CloudHealth (VMware)', description: 'Legacy player, acquired by VMware.', threat: 'medium' },
        { name: 'Spot.io (NetApp)', description: 'Focused on compute optimization.', threat: 'low' },
        { name: 'Apptio', description: 'IT financial management. Broader scope but less technical depth.', threat: 'medium' },
      ],
      trends: ['Multi-cloud adoption accelerating', 'FinOps discipline emerging as standard practice', 'AI/ML workloads driving cloud complexity', 'Sustainability and carbon tracking requirements'],
      barriers: ['Deep integration requirements with cloud providers', 'Need for real-time data processing at scale', 'Enterprise security and compliance requirements'],
    },
    customersAndPricing: {
      targetCustomer: 'Mid-market to enterprise companies with annual cloud spend of $1M+.',
      customerSegments: [{ segment: 'Enterprise (>5000)', percentage: 45 }, { segment: 'Mid-Market (500-5000)', percentage: 40 }, { segment: 'Growth (100-500)', percentage: 15 }],
      keyCustomers: ['Stripe', 'Atlassian', 'Shopify', 'DoorDash', 'Datadog'],
      churnRate: '< 5% annual logo churn',
      nps: 65,
      pricingModel: 'Tiered SaaS based on cloud spend under management.',
      pricingTiers: [{ name: 'Growth', price: '$2,500/mo', features: ['Up to $2M cloud spend', 'Basic recommendations'] }, { name: 'Business', price: '$7,500/mo', features: ['Up to $10M cloud spend', 'Advanced AI insights'] }, { name: 'Enterprise', price: 'Custom', features: ['Unlimited cloud spend', 'Dedicated CSM'] }],
      acv: '$85,000',
      ltv: '$425,000',
      cac: '$35,000',
    },
    productDetails: {
      description: 'CloudFlow Analytics is an AI-powered cloud optimization platform.',
      keyFeatures: [{ name: 'Real-time Cost Dashboard', description: 'Unified view of cloud spending across AWS, Azure, and GCP.' }, { name: 'AI Recommendations Engine', description: 'ML-powered recommendations for rightsizing.' }, { name: 'Anomaly Detection', description: 'Real-time alerting on unexpected cost spikes.' }],
      techStack: ['Kubernetes', 'Apache Kafka', 'Snowflake', 'Python/FastAPI', 'React/TypeScript', 'TensorFlow'],
      integrations: ['AWS Cost Explorer', 'Azure Cost Management', 'Google Cloud Billing', 'Slack & Microsoft Teams', 'Jira & ServiceNow'],
      roadmap: [{ quarter: 'Q1 2024', items: ['Kubernetes cost allocation', 'Carbon footprint tracking'] }, { quarter: 'Q2 2024', items: ['Commitment management automation', 'Custom dashboards'] }],
      differentiators: ['Only platform with real-time (sub-minute) cost visibility', 'Proprietary ML models trained on 500+ enterprise deployments', 'True multi-cloud support'],
    },
  },
  {
    name: 'SecureVault Pro',
    website: 'https://securevaultpro.com',
    sector: 'Cybersecurity',
    stage: 'Series A',
    investmentDate: '2023-08-22',
    investmentAmount: '$8M',
    ownership: '22%',
    status: 'active' as const,
    description: 'Zero-trust identity and access management for enterprises',
    headquarters: 'Austin, TX',
    employees: '42',
    founded: '2021',
    lastUpdated: '2024-01-10',
    about: { overview: 'Zero-trust IAM platform for enterprises.', mission: 'Secure every identity.', vision: 'A passwordless future.', history: 'Founded by cybersecurity veterans.', leadership: [{ name: 'Alex Kim', role: 'CEO', bio: 'Former CISO.' }], keyMilestones: [{ date: '2021', event: 'Founded' }] },
    investmentMemo: { thesis: 'Strong cybersecurity market opportunity.', keyDrivers: ['Growing cyber threats', 'Zero-trust adoption'], risks: ['Competition', 'Enterprise sales cycle'], exitStrategy: 'Strategic acquisition.', valuation: { entryValuation: '$30M', currentValuation: '$50M', methodology: 'ARR multiple' }, dealTerms: 'Series A preferred.', boardSeats: 1, proRataRights: true },
    marketOpportunity: { tam: '$25B', sam: '$8B', som: '$1B', marketGrowth: '18% CAGR', competitiveLandscape: 'Growing market.', competitors: [{ name: 'Okta', description: 'Market leader.', threat: 'high' }], trends: ['Zero-trust adoption'], barriers: ['Established incumbents'] },
    customersAndPricing: { targetCustomer: 'Enterprise companies.', customerSegments: [{ segment: 'Enterprise', percentage: 70 }, { segment: 'Mid-Market', percentage: 30 }], keyCustomers: ['Major banks'], churnRate: '< 8%', nps: 55, pricingModel: 'Per-seat SaaS.', pricingTiers: [{ name: 'Pro', price: '$12/user/mo', features: ['SSO', 'MFA'] }, { name: 'Enterprise', price: 'Custom', features: ['Full zero-trust'] }], acv: '$60,000', ltv: '$250,000', cac: '$30,000' },
    productDetails: { description: 'Zero-trust IAM platform.', keyFeatures: [{ name: 'Passwordless Auth', description: 'Biometric authentication.' }], techStack: ['Go', 'React', 'PostgreSQL'], integrations: ['Azure AD', 'Okta'], roadmap: [{ quarter: 'Q1 2024', items: ['FIDO2 support'] }], differentiators: ['Passwordless-first approach'] },
  },
  {
    name: 'DataMesh Platform',
    website: 'https://datamesh.io',
    sector: 'Data Infrastructure',
    stage: 'Series C',
    investmentDate: '2022-06-10',
    investmentAmount: '$25M',
    ownership: '12%',
    status: 'active' as const,
    description: 'Distributed data management and governance platform',
    headquarters: 'New York, NY',
    employees: '156',
    founded: '2019',
    lastUpdated: '2024-01-12',
    about: { overview: 'DataMesh enables distributed data management.', mission: 'Democratize data.', vision: 'Data mesh for all.', history: 'Founded by data engineering leaders.', leadership: [{ name: 'Priya Patel', role: 'CEO', bio: 'Former VP Data at Uber.' }], keyMilestones: [{ date: '2019', event: 'Founded' }] },
    investmentMemo: { thesis: 'Data mesh is the future of data architecture.', keyDrivers: ['Data mesh movement', 'Enterprise adoption'], risks: ['Early market', 'Complexity'], exitStrategy: 'IPO or strategic.', valuation: { entryValuation: '$100M', currentValuation: '$250M', methodology: 'Revenue multiple' }, dealTerms: 'Series C preferred.', boardSeats: 1, proRataRights: true },
    marketOpportunity: { tam: '$50B', sam: '$15B', som: '$3B', marketGrowth: '25% CAGR', competitiveLandscape: 'Emerging category.', competitors: [{ name: 'Databricks', description: 'Data platform.', threat: 'high' }], trends: ['Data mesh adoption'], barriers: ['Technical complexity'] },
    customersAndPricing: { targetCustomer: 'Large enterprises.', customerSegments: [{ segment: 'Enterprise', percentage: 80 }, { segment: 'Mid-Market', percentage: 20 }], keyCustomers: ['Fortune 100 companies'], churnRate: '< 3%', nps: 70, pricingModel: 'Platform subscription.', pricingTiers: [{ name: 'Team', price: '$5,000/mo', features: ['Basic mesh'] }, { name: 'Enterprise', price: 'Custom', features: ['Full governance'] }], acv: '$150,000', ltv: '$750,000', cac: '$50,000' },
    productDetails: { description: 'Data mesh platform.', keyFeatures: [{ name: 'Data Products', description: 'Self-serve data products.' }], techStack: ['Scala', 'Apache Spark', 'Kubernetes'], integrations: ['Snowflake', 'Databricks', 'BigQuery'], roadmap: [{ quarter: 'Q1 2024', items: ['AI-powered governance'] }], differentiators: ['True data mesh implementation'] },
  },
  {
    name: 'FinOps Cloud',
    website: 'https://finopscloud.com',
    sector: 'FinTech',
    stage: 'Series B',
    investmentDate: '2023-01-08',
    investmentAmount: '$15M',
    ownership: '15%',
    status: 'active' as const,
    description: 'Cloud cost optimization and financial operations platform',
    headquarters: 'Seattle, WA',
    employees: '68',
    founded: '2020',
    lastUpdated: '2024-01-14',
    about: { overview: 'FinOps Cloud helps companies manage cloud spending.', mission: 'Bring financial accountability to the cloud.', vision: 'Every cloud dollar optimized.', history: 'Founded by FinOps practitioners.', leadership: [{ name: 'James Liu', role: 'CEO', bio: 'FinOps Foundation board member.' }], keyMilestones: [{ date: '2020', event: 'Founded' }] },
    investmentMemo: { thesis: 'FinOps is becoming a mandatory function.', keyDrivers: ['FinOps adoption', 'Cloud spend growth'], risks: ['Competition from CloudFlow', 'Commoditization'], exitStrategy: 'Strategic acquisition.', valuation: { entryValuation: '$60M', currentValuation: '$100M', methodology: 'ARR multiple' }, dealTerms: 'Series B preferred.', boardSeats: 1, proRataRights: true },
    marketOpportunity: { tam: '$30B', sam: '$10B', som: '$2B', marketGrowth: '20% CAGR', competitiveLandscape: 'Growing market.', competitors: [{ name: 'CloudFlow Analytics', description: 'Competing portfolio company.', threat: 'medium' }], trends: ['FinOps maturity'], barriers: ['Enterprise adoption'] },
    customersAndPricing: { targetCustomer: 'Mid-market companies.', customerSegments: [{ segment: 'Mid-Market', percentage: 60 }, { segment: 'Enterprise', percentage: 40 }], keyCustomers: ['SaaS companies'], churnRate: '< 7%', nps: 58, pricingModel: 'Usage-based SaaS.', pricingTiers: [{ name: 'Starter', price: '$1,000/mo', features: ['Basic reporting'] }, { name: 'Pro', price: '$5,000/mo', features: ['Advanced analytics'] }], acv: '$50,000', ltv: '$200,000', cac: '$25,000' },
    productDetails: { description: 'FinOps platform.', keyFeatures: [{ name: 'Cost Allocation', description: 'Automated tagging and allocation.' }], techStack: ['Node.js', 'React', 'PostgreSQL'], integrations: ['AWS', 'Azure', 'GCP'], roadmap: [{ quarter: 'Q1 2024', items: ['ML-powered forecasting'] }], differentiators: ['FinOps-native design'] },
  },
];

async function seed() {
  const env = getEnv();
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await PortfolioCompany.countDocuments();
  if (existing > 0) {
    console.log(`${existing} portfolio companies already exist. Skipping seed.`);
    await mongoose.disconnect();
    return;
  }

  for (const company of companies) {
    await PortfolioCompany.create(company);
    console.log(`Created: ${company.name}`);
  }

  console.log('Seed complete');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
