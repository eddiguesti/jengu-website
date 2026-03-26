# WESS Proposal - Pricing Research
> Internal reference only. Not for the client.

## Summary Table

| # | Service | Our Setup Cost | Our Monthly | Similar SaaS Monthly Cost | Build or Buy |
|---|---------|---------------|-------------|--------------------------|-------------|
| 1 | TO Email Automation Agent | 25k-65k | 1.5k-4k | Nothing comparable exists | Custom build |
| 2 | Opera to Sage Integration | 15k-35k | 0.8k-2k | OctopusBI ~500-1k/mo, Hapi similar | Custom build |
| 3 | Channel Manager Setup | 3k-10k | 0.5k-1.5k support | SiteMinder 200-800/mo/property, D-Edge similar | Configure existing |
| 4 | Purchasing and Inventory | 15k-40k | 0.5k-2k/property | Procure Wizard 400-800/property/mo, MarketMan similar | Existing product |
| 5 | Hotel Group Website | 15k-45k | 0.5k-2k | Vercel/Netlify 20-50/mo, headless CMS 0-99/mo, booking engine 150-500/mo/property | Custom React + headless CMS |
| 6 | Dynamic Pricing | 5k-15k | 0.5k-2.5k/property | RoomPriceGenie ~300/mo, Atomize ~500/mo, IDeaS 1.5k-4k/mo | Existing product |
| 7 | Operations Dashboard | 8k-30k | 0.5k-2k | OctopusBI 300-1k/property/mo, Power BI 8-12/user/mo | Hybrid custom |
| 8 | Guest App / Concierge | 10k-25k | 0.3k-1.5k/property | DUVE 300-800/property/mo, Criton similar | Existing platform |
| 9 | WhatsApp Messaging | 5k-15k | 0.3k-1.3k/property | HiJiffy 300-600/mo, Bookboost similar + WhatsApp API 100-500/mo | Existing platform |
| 10 | QR Code F&B Ordering | 3k-12k | 150-600/outlet | Sunday ~200/outlet/mo, Mr Yum similar | Existing platform |
| 11 | Digital Key / Smart Room | 30k-120k+ | 5-15/room/mo | ASSA ABLOY lock hardware 300-800/door, Salto similar | Hardware project |
| 12 | Staff Training / SOP | 5k-15k | 3-10/user/mo | Typsy 3-6/user/mo, innform similar, Trainual 5-10/user/mo | Existing platform |
| 13 | Process Discovery | 8k-25k | One-off | Pure consulting, no SaaS equivalent | Consulting |

**Total first year range for 4-6 property group: 150k-450k setup + 10k-30k/month ongoing**

---

## Detailed Breakdown

### 1. Tour Operator Email Automation Agent
**Setup: 25k-65k | Monthly: 1.5k-4k**

What drives the cost:
- Opera integration is the big one. Oracle OHIP requires certification. On-prem Opera 5.x uses older OWS/HTNG interfaces (harder, more expensive). Opera Cloud REST APIs are more accessible. Integration layer alone is 8k-15k.
- Email classification complexity. Basic rules-based classifier is cheap. Fine-tuned LLM with multi-language support (German, French TO communications) pushes higher.
- Rate version tracking. Simple lookup table is straightforward. Full contract amendment tracking with audit trail is a small app in itself.
- Volume matters. 20 emails/day vs 200/day across multiple properties.
- Monthly covers LLM API costs (OpenAI/Anthropic), email processing, Opera API calls, monitoring, prompt tuning.

**No SaaS equivalent exists.** Generic email tools (Front, Missive) or hospitality CRMs (Revinate, Cendyn) do not handle the TO classification + Opera lookup + rate version tracking loop. This is fully custom.

### 2. Opera to Sage Integration
**Setup: 15k-35k | Monthly: 0.8k-2k**

What drives the cost:
- Which Sage version. Sage 50 has a limited old SDK-based API. Sage 200 has better REST API. Sage Intacct has a modern API. Sage version alone swings cost by 5k-10k.
- Which Opera version. Opera Cloud exposes finance data via OHIP. On-prem Opera typically needs direct DB access or OXI export. Brittle and version-sensitive.
- Chart of accounts complexity. 30 nominal codes = quick. 150+ codes across multiple entities with intercompany postings and multi-currency = significantly more scope.
- Night audit failure handling. 2am failures need alerting and auto-retry.

**SaaS comparisons:** OctopusBI and Hapi offer some pre-built Opera connectors but rarely map cleanly to Sage. Typical approach is custom integration using iPaaS (n8n, Make, Azure Logic Apps) with custom transformation logic.

### 3. Channel Manager Setup
**Setup: 3k-10k | Monthly support: 0.5k-1.5k**
**Channel manager SaaS: 200-800/month per property (paid to vendor)**

Vendors: SiteMinder, RateGain, D-Edge, Cubilis

What drives the cost:
- Number of properties. Single property with 5 OTA connections = 2-3 day job. 6 properties with 15+ channels each = 2-4 week project.
- Rate plan complexity. 8 room types x 12 rate plans with restrictions varying by channel = large mapping matrix.
- We are not building a channel manager. We are selecting, licensing, configuring and supporting one.

### 4. Purchasing and Inventory
**Setup: 15k-40k | Monthly SaaS: 500-2k/property**

Existing products:
- Procure Wizard: 400-800/property/month, purpose-built for hotels, popular UK/Europe
- FoodNotify: strong in F&B-heavy European hotel groups
- Apicbase: recipe and inventory, popular with multi-outlet groups
- MarketMan: mid-market, good API

What drives the cost:
- Number of outlets and properties. Single hotel with 2 F&B outlets = simple. Group with 6 properties, 15+ outlets, central purchasing = complex.
- Supplier catalogue migration. 50 suppliers / 500 items = a day. 300 suppliers / 8000 items = a week.
- Approval workflow complexity.

**Do not custom build this.** The problem is well-solved by existing products.

### 5. Hotel Group Website
**Setup: 15k-45k | Monthly: 500-2k**
**Vercel/Netlify hosting: 20-50/month | Headless CMS (Sanity/Storyblok): 0-99/month | Booking engine SaaS: 150-500/month/property**

What drives the cost:
- Number of properties. Each gets its own section with unique photography, room types, facilities.
- Photography and content. If we are sourcing/editing photos or writing copy, add 5k-15k on top.
- Booking engine integration. Embedding a widget (SiteMinder, Profitroom) is 1k-2k. Deep integration with availability calendars is 3k-8k. The booking engine itself is separate SaaS.
- Multi-language adds 2k-5k setup + 50-200/month.

### 6. Dynamic Pricing
**Setup: 5k-15k | Monthly agency support: 500-1.5k**
**RMS SaaS: 300-2.5k/month per property**

Products:
- RoomPriceGenie: from ~300/month/property, good for independents
- Atomize (Mews): from ~500/month/property
- Pace Revenue: 600-1200/month/property
- Duetto: 1k-3k/month/property, enterprise
- IDeaS (SAS): 1.5k-4k/month/property, market leader

**Do not build this.** Custom dynamic pricing engine would cost 150k+ and take 12+ months. Buy.

### 7. Central Operations Dashboard
**Setup: 8k-30k | Monthly: 500-2k**

Three approaches:
- Notion-based (with API integrations): 5k-12k setup. Cheapest, fastest, limited real-time.
- Looker Studio / Power BI: 8k-18k setup. Good balance. Power BI is 8-12/user/month.
- Custom web app (Next.js/React): 15k-30k. Maximum flexibility, highest maintenance.

**SaaS comparisons:** OctopusBI 300-1k/property/month, Juyo Analytics similar, HotelIQ similar. All typically require Opera Cloud.

### 8. Guest App / Digital Concierge
**Setup: 10k-25k (existing platform) | Monthly: 300-1.5k/property**
**Custom native app: 40k-120k setup, 2k-5k/month maintenance**

Platforms:
- DUVE: 300-800/property/month, full guest journey
- Criton: similar pricing, popular in UK
- STAY: strong in luxury segment
- Goki: good for multi-property

**Use existing platform.** Custom native app only justified for 20+ property groups.

### 9. WhatsApp Messaging
**Setup: 5k-15k | Monthly: 300-1.3k/property**
**WhatsApp API cost: 100-500/month (volume based, ~0.04-0.11 EUR per conversation)**

Platforms:
- HiJiffy: 300-600/month, AI chatbot + WhatsApp, popular Southern Europe
- Bookboost: hotel CRM with WhatsApp
- DUVE: includes WhatsApp in guest journey platform

### 10. QR F&B Ordering
**Setup: 3k-12k | Monthly: 150-600/outlet**

Platforms:
- Sunday: ~200/outlet/month, popular Europe, strong POS integrations
- Mr Yum: similar pricing, good UX
- Cheqout: UK-based, hospitality-focused

Main cost driver is Symphony POS integration. Order injection into Simphony with correct revenue centre, menu item mapping, modifiers, tax treatment.

### 11. Digital Key / Smart Room
**Setup: 30k-120k+ | Monthly: 5-15/room/month**
**Lock hardware: 300-800 per door**

This is primarily a hardware project. 200-room hotel = 60k-160k in hardware alone.

Lock vendors:
- ASSA ABLOY (Vostio/Global): market leader, best Opera integration, premium
- Salto (JustIN Mobile): strong in Europe
- Dormakaba: reliable European market

Smart room controls (thermostats, lighting, curtains) add 1k-5k per room on top. Separate project.

### 12. Staff Training / SOP Platform
**Setup: 5k-15k | Monthly: 3-10/user/month**

Platforms:
- Typsy: 3-6/user/month, hospitality-specific, large content library
- innform: hospitality-focused LMS, popular UK/Europe
- Trainual: 5-10/user/month, general but good for SOPs

500 users at 5/user/month = 2.5k/month (30k/year). Content creation (writing SOPs, filming videos) is 10k-30k on top of platform setup.

### 13. Process Discovery
**Setup: 8k-25k | One-off**

Typical structure:
- 2-3 days stakeholder interviews
- 2-3 days process mapping and documentation
- 1-2 days gap analysis and recommendations
- 1 day presentation

Senior hospitality tech consultant: 800-1500/day. This requires senior for credibility.
