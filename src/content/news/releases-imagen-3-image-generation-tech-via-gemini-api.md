---
title: "releases Imagen 3 image generation tech via Gemini API"
subtitle: "An insightful look into 'releases Imagen 3 image generation tech via Gemini API'"
description: "Google has unveiled Imagen 3, its cutting-edge image generation technology, accessible through the Gemini API. This advanced model, initially available to paid users, showcases versatility by creating stunning images in diverse styles, from hyperrealistic to abstract and anime. Priced at $0.03 per image, it offers customizable features like aspect ratios and multiple image options. Imagen 3 stands out for its exceptional prompt-following ability, making it easier than ever for developers to turn concepts into vivid visuals. To address concerns about misinformation, all AI-generated images include a hidden digital SynthID watermark. With plans to expand further, Google aims to integrate more generative media functionalities within the Gemini API, bridging the gap between visual and language models."
publishedOn: 2025-04-07
updatedOn: 2025-02-17
mainImage: "https://cdn.prod.website-files.com/672916ba596e9ad764eea6e4/67a6330baf414daad8a251e4_tmpfx62br_5.png"
thumbnail: ""
altTextThumbnail: ""
altTextMainImage: "A visually stunning main image for the article: releases Imagen 3 image generation tech via Gemini API"
source: "developers.googleblog.com"
newsDate: 2025-02-07
draft: false
archived: false
---

<h2>Google Introduces Imagen 3 Image Generation Technology via Gemini API</h2>

<h3>An Overview of Imagen 3 Release</h3>
On February 6, 2025, Google announced the release of Imagen 3, its cutting-edge image generation model, now accessible through the Gemini API. Initially available to paid subscribers, Google plans to extend the access to its free-tier users in the near future. This development marks a significant advancement in the realm of automated image creation, promising enhanced capabilities for developers and creative professionals.

<h3>Key Features of Imagen 3</h3>
Imagen 3 stands out with its ability to produce a diverse array of visually stunning, artifact-free images. From hyperrealistic visuals to impressionistic landscapes, abstract art to anime characters, the model delivers quality results across various styles while maintaining state-of-the-art performance on numerous benchmarks. The service is offered at a competitive rate of $0.03 per image via the Gemini API, providing users with options to control aspects such as image ratios and the number of generated outcomes.

<h4>Enhanced Security with SynthID Watermark</h4>
In efforts to address potential issues of misinformation and misattribution, Imagen 3 includes a non-visible digital SynthID watermark on all generated images to clearly denote them as AI-created content. This feature underscores Google's commitment to ethical AI usage and intellectual property protection.

<h3>How to Get Started with Imagen 3</h3>
Developers eager to explore Imagen 3 can utilize the Gemini API with ease. A simple Python code snippet can generate images, with the following example demonstrating how to create a portrait of a sheepadoodle in a cape:

```python
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

client = genai.Client(api_key='GEMINI_API_KEY')

response = client.models.generate_images(
    model='imagen-3.0-generate-002',
    prompt='a portrait of a sheepadoodle wearing cape',
    config=types.GenerateImagesConfig(
        number_of_images=1,
    )
)

for generated_image in response.generated_images:
  image = Image.open(BytesIO(generated_image.image.image_bytes))
  image.show()
```

<h4>Further Resources and Future Plans</h4>
For those interested in exploring more advanced features and styles, Google offers comprehensive developer documentation, including additional prompting strategies and detailed analyses in Appendix D of their latest technical report. Google also expressed intentions to increase the availability of their generative media models through the Gemini API, paving the way for seamless integration between media generation and language models.

<h3>Conclusion</h3>
The launch of Imagen 3 via the Gemini API represents a pivotal development in the intersection of technology and creativity. As Google continues to expand its offerings, developers will benefit from the ability to harness sophisticated AI models to produce innovative and artistically compelling media with greater ease and precision.

POSTED IN:
- Gemini
- Google AI Studio
- Announcements

Explore and Learn More:
- AI
- Generative AI