# Flight Statistics Dashboard - Hong Kong International Airport

## Overview

This web application fetches and displays passenger flight statistics from Hong Kong International Airport using Open Data provided by the Airport Authority via a RESTful API. It features a user-friendly interface that is compatible with both desktop and mobile devices.

## Features

### Dynamic Data Retrieval
- Uses AJAX calls to fetch real-time data about flights departing from and arriving at Hong Kong International Airport.
- The data includes flight times, airline information, flight status, and airport codes.

### Responsive Design
- Tailored CSS ensures the application is fully responsive.
- Optimized layouts for mobile (350px to 500px width) and desktop (1000px and above width).

### Date Filtering
- Users can select a specific date to view flight statistics.
- Includes validations to ensure the date falls within the permissible range set by the API.

### Data Visualization
- Displays histograms for flight departures and arrivals per hour.
- Highlights total numbers and categorizes special cases like delays and cancellations.

## Technical Details

### Technologies Used
- **HTML5** and **CSS3**: For structuring and styling the web application.
- **JavaScript (ES6+)**: For dynamic content creation, API interaction, and DOM manipulation.
- **AJAX**: For asynchronous data fetching from the REST API and handling JSON data.
- **PHP**: A `flight.php` script is used as a proxy to handle CORS restrictions by fetching data from the HK Airport API and forwarding it to the frontend.

### Directory Structure
## Directory Structure

```plaintext
public_html/
│
├── flight.php           # Proxy script to handle API requests
├── iata.json            # Airport descriptive data
├── styles.css           # CSS styles for the application
├── main.js              # JavaScript logic for handling UI and data
└── index.html           # Main HTML document

## Setup and Configuration

1. **Web Server Setup**: Place all files under the `public_html` directory of your web server. Ensure PHP is configured correctly to execute `flight.php`.
2. **API Access**: The application requests data from the Hong Kong International Airport API. No API keys are required as the data is publicly available, but usage is facilitated through the `flight.php` script to overcome CORS limitations.
3. **Running the Application**: Access the `index.html` through a web browser to start using the application. Ensure your web server is running and accessible.

## Challenges and Learnings

- Handling CORS issues by implementing a server-side proxy script.
- Deepening understanding of CSS media queries for responsive design.
- Enhancing JavaScript skills for parsing JSON data and dynamically updating the DOM.

## Future Enhancements

- Implement more interactive charts and maps for data visualization.
- Allow users to customize settings such as preferred airlines or frequently visited airports.
- Improve performance through better caching strategies and data processing optimizations.
