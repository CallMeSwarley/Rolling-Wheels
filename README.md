# Rolling Wheels

React Homepage for SV Lohhof Rolling Wheels - A modern, responsive web application with content management capabilities.

## Features

### Public Pages
- **Home Page**: Welcome page with reusable header/footer, side menu, and image gallery
- **Calendar**: Display opening hours in a clear, organized format
- **Downloads**: Registration forms and PDF downloads for members

### Content Management System (CMS)
- **Password Protected**: Secure login system (username: `admin`, password: `rolling2024`)
- **Opening Hours Management**: Edit opening hours for each day of the week
- **File Management**: Add and remove downloadable files
- **No Database Required**: All data stored in a single JSON file

### Reusable Components
- **Header**: Navigation bar with active page indicators
- **Footer**: Contact information and social media links
- **SideMenu**: Quick links sidebar for easy navigation
- **ImageGallery**: Responsive image gallery with hover effects

## Installation

1. Clone the repository:
```bash
git clone https://github.com/CallMeSwarley/Rolling-Wheels.git
cd Rolling-Wheels
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner

## Project Structure

```
Rolling-Wheels/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── Header.js          # Navigation header
│   │   ├── Footer.js          # Footer with contact info
│   │   ├── SideMenu.js        # Sidebar navigation
│   │   ├── ImageGallery.js    # Image gallery component
│   │   ├── Login.js           # CMS login form
│   │   └── CMSDashboard.js    # CMS management interface
│   ├── pages/
│   │   ├── Home.js            # Home page
│   │   ├── Calendar.js        # Opening hours display
│   │   ├── Downloads.js       # PDF downloads page
│   │   └── CMS.js             # CMS page
│   ├── data/
│   │   └── data.json          # Application data storage
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
└── package.json
```

## Data Management

All application data is stored in `src/data/data.json`:

- **openingHours**: Business hours for each day of the week
- **files**: Downloadable PDF files metadata
- **galleryImages**: Image gallery content
- **credentials**: CMS login credentials (username/password)

## CMS Access

To access the Content Management System:

1. Navigate to `/cms` page
2. Login with credentials:
   - Username: `admin`
   - Password: `rolling2024`
3. Manage opening hours and files

**Note**: In a production environment, implement proper authentication with encrypted passwords and backend API.

## Deployment

Build the production version:

```bash
npm run build
```

The optimized files will be in the `build/` directory, ready to be deployed to any static hosting service.

## Technologies Used

- **React** 19.x - UI library
- **React Router DOM** 7.x - Client-side routing
- **React Scripts** 5.x - Build tools and configuration
- **CSS3** - Styling with modern features (Grid, Flexbox, Gradients)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

ISC

## Author

SV Lohhof Rolling Wheels Team
