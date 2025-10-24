# Christos -\ AI Web Builder

<p align="center">
  <img src="https://socialify.git.ci/arXiVius/christos-ai/image?custom_description=Christos%3A+AI+web+builder.+Instant%2C+complete%2C+bold%2C+brutalist+sites+from+a+single+prompt.&description=1&font=JetBrains+Mono&language=1&logo=data%3Aimage%2Fsvg%2Bxml%2C%253csvg+xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27+viewBox%3D%270+0+100+100%27+fill%3D%27black%27%253e%253cpath+d%3D%27M75+100+L20+100+L20+0+L75+0+L75+15+L35+15+L35+85+L75+85+L75+100+Z%27+%2F%253e%253c%2Fsvg%253e&name=1&owner=1&pattern=Signal&theme=Light" alt="Christos Logo" width="800">
</p>

<h2 align="center">Kinetic Websites. Instantly.</h2>

<p align="center">
  Christos is an AI assistant that builds complete, multi-page websites with **bold, experimental, and brutalist** styles. Describe your vision, and Christos will plan, generate, and refine a unique, fully functional site right before your eyes.
</p>

---

<p align="center">
  <img src="[https://i.ibb.co.com/p6KNrG4F/christos-ai-vercel-app.png](https://i.ibb.co.com/p6KNrG4F/christos-ai-vercel-app.png)" alt="Christos UI Screenshot"/>
</p>

## ✨ Key Features

-   **AI-Powered Generation**: Leverages the Google Gemini API to turn a single text prompt into a complete, multi-page website.
-   **Specialized Aesthetics**: Focuses on creating websites with unique brutalist, anti-design, and experimental styles.
-   **Blueprint & Planning**: The AI first generates a detailed plan (sitemap, design system, wireframes) for your approval before writing any code.
-   **Conversational Refinement**: Use a chat interface to iterate on the generated site. Ask for changes, and Christos will rewrite the code accordingly.
-   **Transparent "Thought Process"**: See the AI's reasoning behind its design choices, giving you insight into the creative process.
-   **Interactive Preview**:
    -   Switch between live **Preview** and **Code** views.
    -   Test responsiveness with **Desktop, Tablet, and Mobile** device toggles.
    -   Inspect the generated HTML, CSS, and JavaScript with syntax highlighting.
-   **Full Site Export**: Download the entire generated website as a clean, organized `.zip` file.
-   **Session Persistence**: Your generated site and chat history are saved in local storage, so you can pick up where you left off.

## 🚀 How It Works

1.  **Describe Your Vision**: Start by writing a prompt describing the website you want to create. Be as descriptive as possible!
2.  **Review the Blueprint**: Christos will analyze your request and generate a detailed plan, or "Blueprint," for the site. This includes a sitemap, color palette, typography, and wireframe concepts.
3.  **Generate the Site**: If you're happy with the plan, approve it. Christos will then generate all the necessary HTML, CSS, and JavaScript files for your website.
4.  **Refine in Chat**: Once the site is generated, you can use the chat interface to request changes. For example: "Make the header text larger," or "Change the primary color to electric blue."
5.  **Preview & Inspect**: Use the preview controls to see how your site looks on different devices. Switch to the code view to examine the source code for any page.
6.  **Download**: When you're satisfied, click the "Download .zip" button to get all the project files, ready to be hosted.

## 🛠️ Technology Stack

-   **Frontend**: React, TypeScript
-   **AI**: Google Gemini API (`@google/genai`)
-   **Styling**: Tailwind CSS (via CDN)
-   **Code Highlighting**: `highlight.js`
-   **File Packaging**: `JSZip`

This project is a client-side-only application designed to work where an API key is securely provided as an environment variable.

## Running Locally

To run Christos on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/arxivius/christos.git
    cd christos
    ```

2.  **Set Up API Key**: This application requires a Google Gemini API key. It's designed to read the key from `process.env.API_KEY`. For local development, you'll need to create a mechanism to provide this key. One simple way is to modify `services/geminiService.ts`:
    
    *Find this line:*
    ```typescript
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    ```
    *And replace it with:*
    ```typescript
    const ai = new GoogleGenAI({ apiKey: 'YOUR_API_KEY_HERE' });
    ```
    **Important**: Be careful not to commit your API key to a public repository.

3.  **Serve the files**: Since this is a client-side application, you need a local server to serve the files correctly. You can use an extension like "Live Server" in VS Code or run a simple Python server:
    ```bash
    # For Python 3
    python -m http.server
    ```
    Then, open your browser to `http://localhost:8000`.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
