<a href="https://paperai.life">
<div align="center">
    <img src="./public/android-chrome-192x192.png" alt="the fastest way to create a paper with real references">
</div>
<h1 align="center">paper-ai</h1>
</a>

<p align="center">
 The fastest way to write a paper with true references
</p>

<p align="center">
<a href='https://docs.paperai.life/' style='font-size: 20px;'><strong> Website Documentation (detailed tutorials, highly recommended)</strong></a> ·
<a href='https://www.bilibili.com/video/BV1Ya4y1k75V'><strong>bilibili Video Tutorial</strong></a>
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#demo"><strong>Demo</strong></a> ·
  <a href="#deploy-to-vercel"><strong>Deploy to Vercel</strong></a> ·
  <a href="#clone-and-run-locally"><strong>Clone and run locally</strong></a>
  <!-- <a href="#feedback-and-issues"><strong>Feedback and issues</strong></a>
  <a href="#more-supabase-examples"><strong>More Examples</strong></a> -->
</p>
<br/>

## Features
### Using AI for Paper Writing

- **AI Write Feature**: Click "AI Write" for a normal dialogue interaction. AI will provide writing suggestions or answer questions based on your input.
- **Paper2AI Feature**: Click "Paper2AI" to search for papers in Semantic Scholar or arxiv based on entered keywords. The system will integrate the information into your paper.

### Editing and Modifying

- Directly edit and modify the AI-generated content in the editor.
- Use the provided tools to adjust text style and layout.

## Demo

You can view a fully working demo at [paperai.life](https://paperai.life).

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/14790897/paper-ai&project-name=paper-ai&repository-name=paper-ai&demo-title=paper-ai&demo-description=This%20starter%20configures%20Supabase%20Auth%20to%20use%20cookies%2C%20making%20the%20user's%20session%20available%20throughout%20the%20entire%20Next.js%20app%20-%20Client%20Components%2C%20Server%20Components%2C%20Route%20Handlers%2C%20Server%20Actions%20and%20Middleware.&demo-url=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2F&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&demo-image=https%3A%2F%2Fpaperai.life%2Fopengraph-image.png)

The above will also clone the repo to your GitHub, you can clone that locally and develop locally.

If you wish to just develop locally and not deploy to Vercel, [follow the steps below](#clone-and-run-locally).

## Using Docker

1. Using `docker pull` command

```sh
docker pull 14790897/paperai:latest
```

2. Run Docker

```sh
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_AI_URL=CUSTOM_AI_URL \
  -e NEXT_PUBLIC_OPENAI_API_KEY=CUSTOM_API_KEY \
  14790897/paperai:latest
```

Replace `CUSTOM_AI_URL` and `CUSTOM_API_KEY` to your own AI URL and API key

## Environment variable description
1. NEXT_PUBLIC_OPENAI_API_KEY sets the key. Simply leave the corresponding position in the settings interface (the gear in the upper right corner) blank, the predetermined variable will be used.
2. NEXT_PUBLIC_AI_URL sets the upstream url. Simply leave the corresponding position in the settings interface (the gear in the upper right corner)  blank, the predetermined variable will be used.
3. NEXT_PUBLIC_SEMANTIC_API_KEY sets the `semantic scholar` key to increase the number of requests
4. NEXT_PUBLIC_PUBMED_API_KEY sets the `pubmed` key to increase the number of requests

## Clone and run locally

```bash
# Clone the repository
git clone https://github.com/14790897/paper-ai.git

# Enter the project directory
cd paper-ai

# Install dependencies
npm install

# Run the project
npm run dev

 ```

## Reference

1. semantic scholar api: https://api.semanticscholar.org/api-docs/#tag/Paper-Data/operation/get_graph_paper_relevance_search
2. pubmed api: https://www.ncbi.nlm.nih.gov/books/NBK25500/
3. i18n: https://locize.com/blog/next-app-dir-i18n/

## LICENSE
This repository is licensed under the MIT License

See the [LICENSE](LICENSE) file for details.
