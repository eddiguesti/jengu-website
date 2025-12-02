// Script to create index.astro from landing-page.html
// Run with: node create-index.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const landingPagePath = path.join(__dirname, '..', 'landing-page.html');
const indexOutputPath = path.join(__dirname, 'src', 'pages', 'index.astro');

console.log('Reading landing-page.html...');
const html = fs.readFileSync(landingPagePath, 'utf8');

// Extract body content (from <section class="hero"> to end of social-proof section)
const heroMatch = html.match(/<!-- Hero Section -->([\s\S]*?)<!-- Calculator Modal -->/);

if (!heroMatch) {
  console.error('❌ Could not find main content sections');
  process.exit(1);
}

const mainContent = heroMatch[1].trim();

// Create the index.astro file
const indexContent = `---
import BaseLayout from '../components/layout/BaseLayout.astro';
import { generateSEO } from '../lib/seo/metadata';
import { generateOrganizationSchema, generateWebSiteSchema } from '../lib/seo/jsonld';

const seo = generateSEO({
  title: 'AI Automation for Tourism & Hospitality',
  description: 'Custom AI agents, chatbots, phone bots, and API integrations for hotels, resorts, and travel agencies. Transform your business with intelligent automation.',
  canonical: Astro.site?.href,
  ogType: 'website'
});

const jsonLd = [
  generateOrganizationSchema(),
  generateWebSiteSchema()
];
---

<BaseLayout seo={seo} jsonLd={jsonLd}>
  ${mainContent}

  <!-- Calculator Modal -->
  <div id="calculatorModalOverlay" class="calculator-modal-overlay" onclick="if(event.target === this) closeCalculatorModal()">
    <div class="calculator-modal-content">
      <button class="calculator-modal-close" onclick="closeCalculatorModal()">
        <i class="fas fa-times"></i>
      </button>
      <iframe
        src="/calculator-ai-agents-2025.html"
        class="calculator-iframe"
        title="AI ROI Calculator">
      </iframe>
    </div>
  </div>

  <!-- Feature Modal System -->
  <div id="featureModalOverlay" class="feature-modal-overlay">
    <div class="feature-modal">
      <button class="feature-modal-close" onclick="closeFeatureModal()">
        <i class="fas fa-times"></i>
      </button>

      <div class="feature-modal-header">
        <div class="feature-modal-icon" id="modalIcon">
          <i class="fas fa-robot"></i>
        </div>
        <h2 class="feature-modal-title" id="modalTitle">Feature Title</h2>
        <p class="feature-modal-subtitle" id="modalSubtitle">Feature subtitle</p>
      </div>

      <div class="feature-modal-content">
        <div class="feature-modal-section">
          <h4>Key Benefits</h4>
          <div class="feature-benefits-list" id="modalBenefits">
          </div>
        </div>

        <div class="feature-modal-section">
          <h4>Performance Metrics</h4>
          <div class="feature-stats-grid" id="modalStats">
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Feature Data for Modal -->
  <script is:inline>
    // Feature modal data
    window.featureData = {
      email: {
        icon: 'fa-robot',
        title: 'AI Email & Communication Bots',
        subtitle: 'Custom-built AI agents for email, chat, and voice communication',
        benefits: [
          {
            icon: '⚡',
            title: 'Multi-Channel AI Agents',
            desc: 'We build custom bots that handle emails, live chat, WhatsApp, and phone calls with instant responses 24/7.'
          },
          {
            icon: '🎯',
            title: 'Smart Routing & Prioritization',
            desc: 'AI agents categorize and route messages, escalating urgent requests to your team while handling routine inquiries.'
          },
          {
            icon: '🌍',
            title: 'Multi-Language Voice & Text',
            desc: 'Custom-trained on your business with support for 40+ languages across all communication channels.'
          },
          {
            icon: '📊',
            title: 'Continuously Learning',
            desc: 'Your AI agents improve over time, learning from interactions and adapting to your business needs.'
          }
        ],
        stats: [
          { value: '90%', label: 'Faster Responses' },
          { value: '40hrs', label: 'Saved Weekly' },
          { value: '£35k', label: 'Annual Savings' }
        ]
      },
      pricing: {
        icon: 'fa-chart-line',
        title: 'Custom Software Solutions',
        subtitle: 'Purpose-built applications tailored to your specific business needs',
        benefits: [
          {
            icon: '📈',
            title: 'Built for Your Workflow',
            desc: 'We develop custom tools like dynamic pricing engines, inventory managers, and reporting dashboards designed specifically for how you work.'
          },
          {
            icon: '🎯',
            title: 'Seamless Integration',
            desc: 'Custom software connects directly to your existing systems via API, ensuring smooth data flow and automation.'
          },
          {
            icon: '⚖️',
            title: 'Automated Intelligence',
            desc: 'AI-powered decision making built into your tools - from pricing optimization to demand forecasting and resource allocation.'
          },
          {
            icon: '💰',
            title: 'Scalable & Maintainable',
            desc: 'Professional software architecture that grows with your business, with ongoing support and updates included.'
          }
        ],
        stats: [
          { value: '100%', label: 'Custom Built' },
          { value: '2-6wks', label: 'Development' },
          { value: '£68k', label: 'Avg Annual Gain' }
        ]
      },
      booking: {
        icon: 'fa-calendar-check',
        title: 'AI Chatbots & Phone Bots',
        subtitle: 'Custom voice and text AI agents for complete guest communication',
        benefits: [
          {
            icon: '💬',
            title: 'Voice & Text AI Agents',
            desc: 'We build custom chatbots for your website and phone bots that handle calls 24/7 - both sound natural and handle complex conversations.'
          },
          {
            icon: '🎁',
            title: 'Trained on Your Business',
            desc: 'AI agents learn your rooms, policies, pricing, and services to provide accurate personalized recommendations and bookings.'
          },
          {
            icon: '🔄',
            title: 'Multi-Platform Deployment',
            desc: 'Deploy across website chat, WhatsApp, SMS, phone lines, and social media - all connected to your systems.'
          },
          {
            icon: '📱',
            title: 'Booking & Payment Integration',
            desc: 'Bots can check availability, process bookings, take payments, and send confirmations through direct API connections.'
          }
        ],
        stats: [
          { value: '35%', label: 'More Conversions' },
          { value: '24/7', label: 'Availability' },
          { value: '£32k', label: 'Extra Revenue' }
        ]
      },
      integration: {
        icon: 'fa-network-wired',
        title: 'API-Powered Automation',
        subtitle: 'Automate your entire tech stack with API connections and smart integrations',
        benefits: [
          {
            icon: '🔌',
            title: 'Connect Any System',
            desc: 'We build API integrations between your PMS, CRM, booking engines, payment processors, and any other software - even custom legacy systems.'
          },
          {
            icon: '⚡',
            title: 'Email & Workflow Automation',
            desc: 'Automate email sequences between systems, trigger actions based on events, and create intelligent workflows that span multiple platforms.'
          },
          {
            icon: '🔄',
            title: 'Real-Time Data Sync',
            desc: 'Bidirectional API connections keep all systems updated instantly with webhooks and scheduled sync - eliminating manual data entry.'
          },
          {
            icon: '🛡️',
            title: 'Custom Integration Solutions',
            desc: 'If there\\'s no API, we can build scraping tools, RPA bots, or custom middleware to connect any systems together.'
          }
        ],
        stats: [
          { value: '50+', label: 'API Integrations' },
          { value: '2-4hrs', label: 'Setup Time' },
          { value: '99.9%', label: 'Uptime' }
        ]
      },
      security: {
        icon: 'fa-shield-alt',
        title: 'Enterprise Security',
        subtitle: 'Bank-level protection for your data and guests',
        benefits: [
          {
            icon: '🔒',
            title: 'Military-Grade Encryption',
            desc: 'AES-256 encryption for data at rest and TLS 1.3 for data in transit protects all guest information.'
          },
          {
            icon: '✅',
            title: 'Full GDPR Compliance',
            desc: 'Built-in data privacy controls, consent management, and right-to-erasure workflows.'
          },
          {
            icon: '🏛️',
            title: 'SOC 2 Type II Certified',
            desc: 'Annual third-party audits verify our security controls and data handling practices.'
          },
          {
            icon: '🌐',
            title: 'Global Data Centers',
            desc: 'Data stored in EU/UK/US regions with automatic backups and disaster recovery.'
          }
        ],
        stats: [
          { value: '99.9%', label: 'Uptime SLA' },
          { value: '24/7', label: 'Monitoring' },
          { value: '< 4hrs', label: 'Support Response' }
        ]
      },
      support: {
        icon: 'fa-graduation-cap',
        title: 'Training & Onboarding',
        subtitle: 'We train your team to master the systems we build',
        benefits: [
          {
            icon: '🎓',
            title: 'Comprehensive Training Program',
            desc: 'Complete hands-on training for your team on all custom systems, AI agents, and integrations we build for you.'
          },
          {
            icon: '📚',
            title: 'Custom Documentation',
            desc: 'Detailed guides and video tutorials tailored to your specific implementation, making it easy for new team members to get up to speed.'
          },
          {
            icon: '🔧',
            title: 'Ongoing Support',
            desc: 'Email and video support during business hours to help troubleshoot issues and answer questions as they arise.'
          },
          {
            icon: '📈',
            title: 'Performance Reviews',
            desc: 'Periodic check-ins to optimize system performance, gather feedback, and implement improvements based on your usage.'
          }
        ],
        stats: [
          { value: '100%', label: 'Team Trained' },
          { value: '2-3 days', label: 'Onboarding' },
          { value: 'Ongoing', label: 'Support' }
        ]
      }
    };
  </script>
</BaseLayout>
`;

// Write the file
const pagesDir = path.dirname(indexOutputPath);
if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true });
}

fs.writeFileSync(indexOutputPath, indexContent, 'utf8');

console.log('✅ index.astro created successfully!');
console.log('📍 Location:', indexOutputPath);
console.log('📊 File size:', (indexContent.length / 1024).toFixed(2), 'KB');
