# Real-time Speech Translator

A real-time speech translation application that enables seamless communication between people speaking different languages. Perfect for online meetings and international collaboration.

## Features

- Real-time speech recognition and translation
- Support for 10+ languages
- Low-latency translation using Azure Cognitive Services
- Modern, user-friendly interface
- Secure API key handling
- Easy language selection

## Prerequisites

- Node.js 18.0.0 or higher
- Azure Cognitive Services account with Speech Services enabled
- Azure Speech Services API key and region

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd real-time-translator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```bash
AZURE_SPEECH_KEY=your_api_key_here
AZURE_SPEECH_REGION=your_region_here
```

4. Replace `your_api_key_here` with your Azure Speech Services API key and `your_region_here` with your Azure region (e.g., eastus, westeurope)

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Select your source and target languages
2. Click the microphone button to start translation
3. Speak in your selected source language
4. The translation will appear in real-time

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Azure Cognitive Services Speech SDK
- HeadlessUI
- Heroicons

## Security

- API keys are stored securely in environment variables
- All communication with Azure services is done over HTTPS
- No sensitive data is stored on servers

## License

MIT

## Support

For support, please open an issue in the repository or contact the maintainers. 