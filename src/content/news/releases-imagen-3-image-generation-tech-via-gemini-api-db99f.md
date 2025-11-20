---
title: "releases Imagen 3 image generation tech via Gemini API"
subtitle: "An insightful look into 'releases Imagen 3 image generation tech via Gemini API'"
description: "Google has unveiled Imagen 3, its latest image generation model, through the Gemini API, offering developers access to cutting-edge AI technology for creating stunning, artifact-free visuals. Initially available to paid users, with plans for expansion to the free tier, Imagen 3 delivers on a variety of styles, including hyperrealistic, impressionistic, abstract, and anime imagery. Priced at a competitive rate of $0.03 per image, this model allows for dynamic control over aspects such as image ratio and quantity. Imagen 3’s enhanced prompt-following abilities make transforming creative concepts into high-quality images seamless. To ensure authenticity and combat misinformation, all images come with a non-visible SynthID watermark, marking them as AI-generated. This advancement signifies an important"
publishedOn: 2025-04-07
updatedOn: 2025-02-17
mainImage: "https://cdn.prod.website-files.com/672916ba596e9ad764eea6e4/67acca0948c158ab21c1f8d2_tmps28hud8c.png"
thumbnail: ""
altTextThumbnail: ""
altTextMainImage: "A visually stunning main image for the article: releases Imagen 3 image generation tech via Gemini API"
source: "developers.googleblog.com"
newsDate: 2025-02-12
draft: false
archived: false
---

```html
<h2>Google Launches Imagen 3 Image Generation Technology via Gemini API</h2>

<h3>Introduction</h3>
Google has announced the release of its advanced image generation model, Imagen 3, accessible to developers through the Gemini API. This innovative model is initially available for paid subscribers, with plans for expansion to the free tier in the foreseeable future.

<h3>Features and Capabilities</h3>

<h4>State-of-the-Art Image Generation</h4>
Imagen 3 is at the forefront of image generation technology, offering an array of artistic possibilities. It excels in creating visually captivating, artifact-free images spanning diverse styles, from hyperrealistic depictions to impressionistic landscapes, abstract designs, and anime characters. Its enhanced prompt following capability allows users to effortlessly transform their ideas into high-quality visuals. Imagen 3 sets a benchmark for performance across various evaluation criteria.

<h4>Cost and Flexibility</h4>
Users can utilize Imagen 3 at an affordable rate of $0.03 per image through the Gemini API. The platform offers customization options such as controlling aspect ratios and the number of images generated, providing users with considerable flexibility.

<h4>Combating Misinformation</h4>
In a bid to combat misinformation and ensure proper attribution, all images produced by Imagen 3 incorporate a non-visible digital SynthID watermark. This measure helps in identifying them as AI-generated creations.

<h3>Showcase of Imagen 3</h3>
The capabilities of Imagen 3 are showcased through a diverse gallery of images, illustrating its proficiency across a spectrum of artistic styles.

<h3>Getting Started with Imagen 3</h3>

<h4>Implementation via Python</h4>
Developers interested in leveraging Imagen 3 can initiate image generation using the Gemini API with a straightforward Python code. Here is an example:

```python
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

client = genai.Client(api_key='GEMINI_API_KEY')

response = client.models.generate_images(
    model='imagen-3.0-generate-002',
    prompt='a portrait of a sheepadoodle wearing a cape',
    config=types.GenerateImagesConfig(
        number_of_images=1,
    )
)
for generated_image in response.generated_images:
    image = Image.open(BytesIO(generated_image.image.image_bytes))
    image.show()
```

<h4>Further Exploration</h4>
Users are encouraged to explore more prompting strategies and image styles detailed in the Gemini API developer documentation. Additional insights on performance enhancements and methodologies are available in Appendix D of the updated technical report.

<h3>Future Prospects</h3>
Google is excited to broaden the availability of its generative media models within the Gemini API, with further expansions planned. This development aims to bridge generative media with language models, offering developers enhanced creative possibilities.

<h3>Conclusion</h3>
Imagen 3, with its robust capabilities and accessible platform, marks a significant advancement in the field of image generation technology. Google's vision for expanding its generative media models promises a dynamic future for AI-powered creativity.
```