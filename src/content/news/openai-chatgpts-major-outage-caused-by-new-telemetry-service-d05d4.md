---
title: "OpenAI: ChatGPT's major outage caused by new telemetry service"
subtitle: "An insightful look into 'OpenAI: ChatGPT's major outage caused by new telemetry service'"
description: "OpenAI recently experienced one of its longest service outages, impacting its popular ChatGPT platform and related services such as Sora and its API. The disruption, lasting around three hours, was attributed to a \"new telemetry service\" designed to collect Kubernetes metrics, which inadvertently overwhelmed Kubernetes API servers. This caused critical infrastructure reliant on DNS resolution to fail. OpenAI's postmortem explained the complex interplay of systems issues and promised improvements to prevent future occurrences, including more robust monitoring and recovery mechanisms. Apologizing for the disruption, OpenAI commits to enhancing its infrastructure resilience to better meet user expectations."
publishedOn: 2025-04-07
updatedOn: 2025-01-22
mainImage: "https://cdn.prod.website-files.com/672916ba596e9ad764eea6e4/677d540b242ecf4f3ad24769_tmpbz_rq05j.png"
thumbnail: "https://cdn.prod.website-files.com/672916ba596e9ad764eea6e4/677d540b242ecf4f3ad24765_tmpu9gb7r_6.png"
altTextThumbnail: "A visually compelling thumbnail for the article: OpenAI: ChatGPT's major outage caused by new telemetry service"
altTextMainImage: "A visually stunning main image for the article: OpenAI: ChatGPT's major outage caused by new telemetry service"
source: "techcrunch.com"
newsDate: 2025-01-07
draft: false
archived: false
---

<h1>OpenAI Acknowledges Major ChatGPT Outage Triggered by New Telemetry Service</h1>

<p>In a detailed postmortem, OpenAI has attributed one of the most significant service disruptions in its history to a newly implemented telemetry service. The outage impacted several of its platforms, including ChatGPT, the video generator Sora, and its developer-centric API services, commencing around 3 p.m. Pacific Time on Wednesday. While OpenAI swiftly acknowledged the issue and initiated remedial actions, it required approximately three hours to fully restore operations.</p>

<h2>Telemetry Service Impacts Kubernetes Operations</h2>

<p>The root cause, as revealed by OpenAI, was not a security flaw or a product launch hiccup but rather a telemetry service introduced to track Kubernetes metrics. Kubernetes, the widely used open-source system for managing containerized applications, became overwhelmed, particularly its API servers, following the deployment of this telemetry service. This interference caused disruptions to the Kubernetes control plane across most of OpenAI's large clusters.</p>

<blockquote>
  “Telemetry services have a very wide footprint, so this new service’s configuration unintentionally caused … resource-intensive Kubernetes API operations,” OpenAI noted.
</blockquote>

<p>Such unforeseen disruptions underscore the intricacies involved in integrating new telemetry services, especially when utilized within vast operational architectures. The incident further emphasized the critical role of DNS resolution, a process crucial for translating domain names into IP addresses, which was inadvertently affected.</p>

<h3>The Complexity of DNS Caching</h3>

<p>The adverse effects were compounded by OpenAI’s DNS caching mechanisms, which inadvertently masked the full scope of the issue. This delayed visibility allowed the rollout to progress further than anticipated before the true nature of the disruption was comprehended.</p>

<p>OpenAI detected early anomalies just before they significantly affected users; however, implementing a fix was challenging due to the stressed state of the Kubernetes servers.</p>

<h2>Addressing the Failures</h2>

<p>OpenAI's postmortem describes the incident as a confluence of multiple interconnected system failures. The complexities that arose were unexpected and illuminated gaps in testing protocols, particularly regarding the Kubernetes control plane's response to the telemetry service rollout. In acknowledgment of the incident, OpenAI is advancing several preventative strategies.</p>

<blockquote>
  “This was a confluence of multiple systems and processes failing simultaneously and interacting in unexpected ways,” the company explained. “Our tests didn’t catch the impact the change was having on the Kubernetes control plane.”
</blockquote>

<h3>Future Preventive Measures</h3>

<p>In response to the disruption, OpenAI is committing to enhanced infrastructure monitoring and phased rollouts to more effectively manage future changes. New mechanisms to ensure uninterrupted engineer access to the Kubernetes API servers are also being instituted to prevent recurrence.</p>

<p>OpenAI has expressed regret for the disruption caused, particularly to its diverse clientele ranging from everyday users to developers and enterprises reliant on its AI solutions.</p>

<blockquote>
  “We apologize for the impact that this incident caused to all of our customers – from ChatGPT users to developers to businesses who rely on OpenAI products,” OpenAI stated. “We’ve fallen short of our own expectations.”
</blockquote>

<p>As specialists in automation, AI, and process mapping, Jengu.ai will continue to monitor developments in the field, analyzing both the technological challenges and innovations that shape the AI landscape.</p>
```