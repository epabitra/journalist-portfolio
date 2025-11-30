# Journalist Portfolio Website

A secure, scalable portfolio website for journalists built with React, Google Apps Script, Google Sheets, and Google Drive.

## 🏗️ Architecture

- **Frontend**: React 18 + Vite
- **Backend**: Google Apps Script (Web App)
- **Database**: Google Sheets
- **Storage**: Google Drive
- **Hosting**: GitHub Pages

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Rate limiting on authentication endpoints
- Input validation and sanitization
- XSS prevention with DOMPurify
- CSRF protection
- Secure token storage
- Content Security Policy headers

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Google account for Apps Script and Sheets
- GitHub account for hosting

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd journalist-portfolio

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# Set REACT_APP_API_BASE_URL to your Google Apps Script Web App URL
```

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components
├── services/        # API and business logic
├── utils/           # Utility functions
├── hooks/           # Custom React hooks
├── context/         # React context providers
├── config/          # Configuration files
└── assets/          # Static assets
```

## 🔧 Configuration

See `CONFIGURATION_CHECKLIST.md` for detailed setup instructions.

## 📝 License

MIT

