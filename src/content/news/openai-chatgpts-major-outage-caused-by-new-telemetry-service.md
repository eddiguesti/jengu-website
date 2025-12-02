---
title: "OpenAI: ChatGPT's major outage caused by new telemetry service"
subtitle: "An insightful look into 'OpenAI: ChatGPT's major outage caused by new telemetry service'"
description: "In a significant disruption that highlighted the complexities of tech systems, OpenAI attributed a massive outage of its popular AI services, including ChatGPT and the Sora video generator, to a malfunctioning \"new telemetry service.\" This service, intended to gather Kubernetes metrics, inadvertently overwhelmed the system's API servers by triggering resource-intensive operations, disrupting DNS resolution-critical components needed for many OpenAI services. OpenAI's postmortem report clarified that the outage, lasting approximately three hours, was not tied to a security breach or product launch but rather to internal system configurations. Efforts to resolve the issue were hampered by the overloaded Kubernetes servers, causing a delay in service restoration. In response, OpenAI plans to enhance infrastructure monitoring and ensure engineers always have access to"
publishedOn: 2025-04-07
updatedOn: 2025-01-22
mainImage: "https://cdn.prod.website-files.com/672916ba596e9ad764eea6e4/67756b0610e20e7786d42ca6_tmplnfu9lj9.png"
thumbnail: "https://cdn.prod.website-files.com/672916ba596e9ad764eea6e4/67756b0610e20e7786d42cbc_tmpy2lywv_o.png"
altTextThumbnail: "A visually compelling thumbnail for the article: OpenAI: ChatGPT's major outage caused by new telemetry service"
altTextMainImage: "A visually stunning main image for the article: OpenAI: ChatGPT's major outage caused by new telemetry service"
source: "techcrunch.com"
newsDate: 2025-01-01
draft: false
archived: false
---

<h1>OpenAI Identifies New Telemetry Service as Cause of ChatGPT Outage</h1>

<h2>Unprecedented Disruption in AI-Powered Platforms</h2>
<p>OpenAI recently faced one of the most significant outages in its history, affecting a wide range of its services, including the renowned ChatGPT, video generator Sora, and the developer-centric API. The incident, which commenced at approximately 3 p.m. Pacific Time, has been attributed to a newly deployed telemetry service, disrupting operations for several hours.</p>

<h2>Telemetry Service Deployment and its Impact</h2>
<p>Contrary to initial speculations regarding security breaches or new product features, OpenAI confirmed that the outage was due to an operational challenge with a telemetry service implemented to gather Kubernetes metrics. Kubernetes, an open-source system, is integral to managing containerized applications, ensuring isolated and efficient software deployment.</p>

<blockquote>
  "Telemetry services have a very wide footprint, so this new service’s configuration unintentionally caused … resource-intensive Kubernetes API operations," stated OpenAI in its postmortem analysis.
</blockquote>

<h3>Kubernetes Under Strain</h3>
<p>The telemetry service's configuration led to an unexpected load on OpenAI's Kubernetes infrastructure, causing the Kubernetes control plane to become overwhelmed. This bottleneck significantly impacted essential services, including DNS resolution, a fundamental process converting IP addresses to domain names.</p>

<p>Moreover, OpenAI's use of DNS caching compounded the problem, as the caching delayed awareness of the full scope of the anomalies caused by the new telemetry deployment.</p>

<h2>Challenges in Rapid Remediation</h2>
<p>Despite detecting the problematic deployments shortly after they began impacting operations, OpenAI faced considerable hurdles in implementing solutions swiftly. The saturation of the Kubernetes servers necessitated complex workarounds, delaying the system's restoration.</p>

<blockquote>
  “This was a confluence of multiple systems and processes failing simultaneously and interacting in unexpected ways,” OpenAI explained, emphasizing the unforeseen complexities at play.
</blockquote>

<h2>Commitment to Future Reliability</h2>
<p>Reflecting on the events, OpenAI has pledged to enhance its infrastructure monitoring and phased rollout capabilities. The actions include ensuring uninterrupted access to Kubernetes API servers for engineers, regardless of external disruptions.</p>

<blockquote>
  “We apologize for the impact that this incident caused to all of our customers – from ChatGPT users to developers to businesses who rely on OpenAI products,” OpenAI stated, acknowledging the fallout of the outage.
</blockquote>

<p>Jengu.ai, with its expertise in AI, automation, and process mapping, underscores the critical need for robust infrastructure and change management protocols in high-stakes AI environments. As the AI landscape continues to evolve, mitigating such operational risks becomes paramount for industry leaders.</p>
```