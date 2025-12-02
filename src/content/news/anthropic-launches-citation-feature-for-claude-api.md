---
title: "Anthropic Launches Citation Feature for Claude API"
subtitle: "An insightful look into 'Anthropic Launches Citation Feature for Claude API'"
description: "Anthropic has introduced a groundbreaking Citations feature to its Claude API, enhancing the trustworthiness and verifiability of AI-generated responses by linking them to precise source documents. Now available on Anthropic API and Google Cloud's Vertex AI, Citations streamline the verification process, drastically improving accuracy by up to 15% and minimizing hallucinations in AI outputs. This innovation simplifies complex tasks such as document summarization and customer support by automatically grounding responses in credible references, a task developers previously achieved through intricate prompt engineering. Companies like Thomson Reuters and Endex have already leveraged Citations, witnessing substantial improvements in reference reliability and accuracy in applications ranging from legal advice to financial research. This feature, part of Claude 3.5 Sonnet and Haiku models,"
publishedOn: 2025-04-07
updatedOn: 2025-02-06
mainImage: "https://cdn.prod.website-files.com/672916ba596e9ad764eea6e4/679365dc0aa5e70c831032d1_tmp3bpxa4oh.png"
thumbnail: ""
altTextThumbnail: "A visually compelling thumbnail for the article: Anthropic Launches Citation Feature for Claude API"
altTextMainImage: "A visually stunning main image for the article: Anthropic Launches Citation Feature for Claude API"
source: "anthropic.com"
newsDate: 2025-01-24
draft: false
archived: false
---

<h2>Anthropic Unveils Citation Feature for Claude API</h2>

<h3>Introducing Citations: A Leap Towards Verifiable AI Outputs</h3>

<p>On January 23, 2025, Anthropic announced the launch of a new feature named "Citations" for its Claude API. This enhancement enables Claude to anchor its responses in specific source documents, significantly enhancing the verifiability and trustworthiness of the AI-generated outputs. The Citations feature is now generally accessible on both the Anthropic API and Google Cloud’s Vertex AI platform.</p>

<h3>Enhancing Trust Through Verification</h3>

<p>All Claude models are inherently designed to prioritize trustworthiness and steerability. The introduction of Citations addresses a vital requirement in artificial intelligence applications: the ability to verify the sources of AI-generated content. Previously, developers faced challenges using complex prompts to instruct Claude to include source information, which often led to inconsistent results and increased times for prompt engineering and testing. The Citations feature simplifies this process by allowing users to add source documents directly into the context window. When queried, Claude will automatically provide citations for any claims derived from these documents.</p>

<p>Internal assessments highlight that Claude's citation capabilities surpass most custom solutions, enhancing recall accuracy by up to 15%.</p>

<h3>Diverse Use Cases for Citations</h3>

<p>The Citations feature opens new avenues for developers looking to implement AI solutions with heightened accountability, including:</p>

<ul>
  <li><strong>Document Summarization:</strong> Efficiently create summaries of extensive documents, with each significant point linked to its original source.</li>
  <li><strong>Complex Q&A:</strong> Offer detailed responses to queries across broad document corpora, ensuring each answer is traceable to specific document sections.</li>
  <li><strong>Customer Support:</strong> Develop support systems that reference multiple guides, FAQs, and support materials, citing precise information sources to users.</li>
</ul>

<h4>Operational Mechanics</h4>

<p>When activated, the Citations feature processes user-provided source materials, such as PDF and plain text files, by segmenting them into sentences. These segments, alongside user-provided context, are relayed to the model along with the user inquiry. Users also have the option to supply pre-defined segments.</p>

<p>Claude utilizes this data to deliver responses embedded with precise citations, referencing original documents to reduce misinformation and enhance reliability. This method integrates seamlessly with the Messages API by bypassing the need for file storage and offering greater flexibility.</p>

<h4>Pricing Structure</h4>

<p>The Citations feature adheres to Anthropic’s standard token-based pricing model. While it may require more input tokens for document processing, users are not charged for output tokens related to the cited text itself.</p>

<h3>Customer Testimonials</h3>

<h4>Thomson Reuters: A Trusted Partner</h4>

<p>Thomson Reuters employs Claude for its AI platform, CoCounsel, assisting legal and tax professionals in synthesizing expertise and providing comprehensive advice. Jake Heller, Head of Product at CoCounsel, stated, "For CoCounsel to be trustworthy and immediately useful for practicing attorneys, it needs to cite its work. We initially developed this internally, but maintaining it proved challenging. The integration of Anthropic’s Citations feature has simplified building, maintaining, and deploying reliable citation capabilities for our users, reducing hallucination risks and bolstering trust in AI-generated content. This functionality will enable us to develop an even more precise AI assistant for legal professionals."</p>

<h4>Endex: Financial Precision</h4>

<p>Endex harnesses Claude to drive an Autonomous Agent for financial institutions. According to Tarun Amasa, CEO of Endex, "Anthropic's Citations reduced our source hallucinations and formatting issues significantly, improving reference quality by 20%. This improvement has negated the need for elaborate prompt engineering focused on references, enhancing our accuracy in performing intricate, multi-layered financial analysis."</p>

<h3>Getting Started</h3>

<p>Citations are now available for Claude 3.5 Sonnet and Claude 3.5 Haiku. Users can access detailed documentation to begin integrating this feature effectively into their systems.</p>

<p>For further information and support, visit our website or contact our team.</p>