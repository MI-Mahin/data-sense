# DataSense AI 

![DataSense AI](https://img.shields.io/badge/AI-Powered-purple?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![Flask](https://img.shields.io/badge/Flask-3.0-green?style=for-the-badge&logo=flask)
![Python](https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge&logo=python)

**Transform your data into insights with natural language queries** - A modern AI-powered data analytics platform that converts natural language into SQL queries and delivers instant, actionable insights.

## Features

- **Natural Language to SQL** - Convert plain English questions into SQL queries using OpenAI / Gemini
- **Interactive Data Visualization** - Beautiful charts and graphs powered by Matplotlib
- **Real-time Statistics** - Automatic calculation of averages, min/max, and statistical insights
- **CSV Export** - Export query results to CSV files with one click
- **Modern UI** - Professional, eye-soothing interface inspired by ChatGPT
- **Dark/Light Mode** - Toggle between themes for comfortable viewing
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Chat History** - Keep track of your previous queries and results
- **Database Schema Viewer** - Browse your database structure easily

## Tech Stack

### Frontend
- **Next.js 16** - React framework with Turbopack for fast development
- **TypeScript** - Type-safe code
- **Tailwind CSS 4** - Modern utility-first CSS framework
- **Lucide Icons** - Beautiful, consistent icons
- **Axios** - HTTP client for API requests

### Backend
- **Flask** - Lightweight Python web framework
- **SQLite** - Embedded database
- **OpenAI GPT-4** - Natural language processing
- **Pandas** - Data manipulation and analysis
- **Matplotlib** - Data visualization
- **Flask-CORS** - Cross-origin resource sharing

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **OpenAI API Key** - Get one from [OpenAI](https://platform.openai.com/)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/MI-Mahin/data-sense.git
cd data-sense
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file and add your OpenAI API key
echo OPENAI_API_KEY=your_api_key_here > .env
```

#### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

### Running the Application

#### Start Backend Server

```bash
cd backend
venv\Scripts\activate  # Windows
python main.py
```

Backend will run on `http://localhost:5000`

#### Start Frontend Server

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.


## Project Structure

```
data-sense/
├── backend/
│   ├── main.py              # Flask application entry point
│   ├── api.py               # API routes and logic
│   ├── requirements.txt     # Python dependencies
│   ├── demo.sql            # Sample database
│   └── outputs/            # Generated CSV exports and visualizations
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx        # Main application page
│   │   ├── layout.tsx      # Root layout
│   │   ├── globals.css     # Global styles
│   │   └── components/     # React components
│   ├── public/             # Static assets
│   ├── package.json        # Node dependencies
│   └── tailwind.config.ts  # Tailwind configuration
│
└── README.md
```

## Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
FLASK_ENV=development
```

### Database

The application uses SQLite by default. To use your own database:

1. Place your `.db` or `.sql` file in the `backend` directory
2. Update the database path in `api.py`

## Customization

### Changing Theme Colors

Edit `frontend/tailwind.config.ts` to customize the color scheme:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#your-color-here',
        // ... more shades
      },
    },
  },
}
```

### Modifying AI Prompts

Edit the system prompt in `backend/api.py` to customize how the AI interprets queries.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments

- OpenAI for providing the GPT API
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- The Flask community for the lightweight backend framework

## Contact

**Mahmudul Islam Mahin** - [@MI-Mahin](https://github.com/MI-Mahin)



