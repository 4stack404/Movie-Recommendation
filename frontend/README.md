# FlickOrbit - Movie Recommendation System

A React-based movie recommendation application with Tailwind CSS for styling. This application allows users to select their favorite movies and then receive personalized movie recommendations.

## Features

- User-friendly movie search and selection interface
- Personalized movie recommendations based on user's selected movies
- Responsive design that works on desktop and mobile devices
- Elegant dark-themed UI with smooth animations and transitions
- Interactive carousel of Top 10 recommended movies
- Background image effect that changes when hovering over movie posters

## Screenshots

- **Login Page**: Select your favorite movies to get recommendations
- **Home Page**: View your personalized movie recommendations with details

## Technologies Used

- React.js
- Tailwind CSS
- React Router for navigation
- Font Awesome for icons
- Google Fonts (Montserrat, Poppins)
- External Movie API for recommendations
- TMDB API for movie details and images

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```
git clone <repository-url>
cd movie-recommendation-system
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## How It Works

1. On the login page, search for and select up to 5 of your favorite movies
2. Click "Get Recommendations" to see personalized movie suggestions
3. Browse through the recommendations on the home page
4. Explore the Top 10 section to see more recommended movies
5. Hover over movie posters to see the background change

## API Endpoints

The application uses the following API endpoints:

- `https://recommendation-system-4g5y.onrender.com/recommend/{movie-names}` - For getting movie recommendations based on selected movies
- `https://api.themoviedb.org/3/movie/{movie-id}` - For fetching movie details from TMDB

## Project Structure

- `src/components/` - React components
- `src/pages/` - Page components for different routes
- `public/data/` - Contains the movie dataset file

## Credits

- Movie data provided by The Movie Database (TMDB)
- Frontend design inspired by modern streaming platforms

## License

This project is licensed under the MIT License - see the LICENSE file for details.
