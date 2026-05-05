# 🗺️ Mapty - Map Your Workouts

A modern web application that allows users to track their workouts (running and cycling) on an interactive map. Built with vanilla JavaScript, Leaflet.js, and browser geolocation APIs.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Installation](#installation)
- [How to Use](#how-to-use)
- [How the Code Works](#how-the-code-works)
- [Browser Support](#browser-support)

## ✨ Features

### Core Functionality
- 📍 **Geolocation**: Automatically detects and displays user's current location on the map
- 🏃 **Running Workouts**: Track distance, duration, cadence (steps/min), and calculate pace
- 🚴 **Cycling Workouts**: Track distance, duration, elevation gain, and calculate speed
- 🗺️ **Interactive Map**: Click on map to create a new workout at that location
- 💾 **Persistent Storage**: All workouts are saved to browser's localStorage and persist between sessions

### User Interface
- 📝 **Form Validation**: Real-time validation ensures only positive numbers are entered
- 🎯 **Workout Markers**: Visual markers on the map for each workout
- 📋 **Sidebar List**: All workouts displayed in an organized list
- ✏️ **Edit Workouts**: Modify workout details after creation
- 🗑️ **Delete Workouts**: Remove individual workouts or clear all data
- 🔄 **Sort Workouts**: Sort by distance or other metrics
- 🎨 **Responsive Design**: Clean, modern UI with color-coded workout types

### Advanced Features
- ⚡ **Dynamic Form Fields**: Form fields change based on workout type (running vs cycling)
- 🗺️ **Map Markers**: Click on any workout to jump to its location on the map
- 📱 **Mobile-Friendly**: Works on various screen sizes

## 🛠️ Tech Stack

- **Language**: JavaScript (ES6+ Classes)
- **Mapping**: [Leaflet.js](https://leafletjs.com/) - Open-source mapping library
- **Map Data**: OpenStreetMap tiles
- **Alerts**: [SweetAlert2](https://sweetalert2.github.io/) - Beautiful notifications
- **Storage**: Browser localStorage API
- **Styling**: Custom CSS with responsive design
- **Fonts**: Google Fonts (Manrope)

## 🏗️ Project Architecture

### Class-Based Design Pattern

**Workout Class (Parent)**
- Base class for all workout types
- Stores common properties: coordinates, distance, duration, date, ID
- Auto-generates workout description (e.g., "Running on May 5")

**Running Class (Child)**
- Extends Workout
- Calculates pace (minutes per kilometer)
- Stores cadence (steps per minute)

**Cycling Class (Child)**
- Extends Workout
- Calculates speed (kilometers per hour)
- Stores elevation gain

**App Class (Controller)**
- Main application logic
- Manages map initialization and interactions
- Handles form submission and validation
- Controls localStorage operations
- Manages edit/delete operations
- Implements sorting functionality

### Data Flow

```
User clicks map → Form appears → User fills form → Validation → 
Create Workout object → Store in array → Render on map & list → 
Save to localStorage → Display confirmation
```

## 💾 Installation

### Prerequisites
- Modern web browser with geolocation support
- No backend or build tools required!

### Steps

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd mapty
   ```

2. **Install dependencies** (Optional, only for development)
   ```bash
   npm install
   ```

3. **Run the application**
   - Simply open `index.html` in your browser
   - Or use a local server (recommended):
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js http-server
     npx http-server
     ```

4. **Allow geolocation permission**
   - Browser will prompt for location access
   - Accept to use the full functionality

## 🎯 How to Use

### Creating a Workout

1. **Click on the map** at your desired location
2. **A form will appear** with the following fields:
   - **Type**: Choose between "Running" or "Cycling"
   - **Distance**: Enter distance in kilometers
   - **Duration**: Enter duration in minutes
   - **Cadence** (Running only): Steps per minute
   - **Elevation Gain** (Cycling only): Elevation in meters

3. **Fill in the values** (must be positive numbers)
4. **Click "OK"** to save the workout
5. **Workout appears** as a marker on the map and in the sidebar list

### Viewing Workouts

- **Sidebar**: All workouts listed with key metrics
- **Map**: Click on any workout in the list to jump to its location on the map
- **Details**: Each workout shows distance, duration, and type-specific metric (pace/speed)

### Editing a Workout

1. **Click the "Edit" button** next to a workout in the sidebar
2. **Form appears** with current workout data
3. **Modify the values**
4. **Click "OK"** to save changes

### Deleting Workouts

1. **Delete Single**: Click "Delete" button next to any workout
2. **Delete All**: Click "CLEAR" button (if available)

### Sorting Workouts

- Click the **"↓ SORT"** button to sort workouts by distance

## 💻 How the Code Works

### Key Methods Explained

#### 1. **_getPosition()**
Uses the Geolocation API to get the user's current coordinates
```javascript
navigator.geolocation.getCurrentPosition(...)
```

#### 2. **_loadMap(position)**
- Initializes Leaflet map with user's coordinates
- Sets map zoom level to 13
- Adds OpenStreetMap tile layer
- Sets up map click listener
- Renders all stored workouts

#### 3. **_showForm(mapE)**
- Displays the workout form when user clicks the map
- Stores click coordinates in `mapEvent` for later use
- Auto-focuses distance input field

#### 4. **_toggleElevationField()**
- Shows/hides form fields based on workout type
- Running: shows cadence field
- Cycling: shows elevation gain field

#### 5. **_newWorkout(e)**
- Validates form inputs
- Creates Running or Cycling object based on selected type
- Stores workout in array and localStorage
- Renders on map and in sidebar

#### 6. **_renderWorkoutMarker(workout)**
- Creates a map marker at workout location
- Shows popup with workout details when clicked
- Color-coded based on workout type

#### 7. **_setLocalStorage()**
- Saves entire workouts array to browser localStorage
- Enables data persistence between sessions

#### 8. **_getLocalStorage()**
- Retrieves workouts from localStorage on app load
- Recreates Workout objects from stored data

### Form Validation

All inputs must be:
- ✅ Finite numbers (not NaN, Infinity, etc.)
- ✅ Positive values (greater than 0)

SweetAlert2 is used to show user-friendly error messages.

### State Management

The App class uses private fields (#) to manage state:
- `#map`: Leaflet map instance
- `#workouts`: Array of all workouts
- `#mapEvent`: Coordinates of last map click
- `#editingWorkout`: Currently edited workout
- `#sorted`: Whether list is currently sorted

## 🌐 Browser Support

| Browser | Support |
|---------|---------|
| Chrome  | ✅ Full |
| Firefox | ✅ Full |
| Safari  | ✅ Full |
| Edge    | ✅ Full |
| IE 11   | ❌ No  |

**Requirements:**
- Geolocation API support
- localStorage support
- ES6+ JavaScript support

## 📱 API Dependencies

### External Libraries
- **Leaflet.js**: Interactive map rendering
- **SweetAlert2**: Beautiful alert dialogs

### Browser APIs Used
- **Geolocation API**: User location detection
- **localStorage API**: Data persistence
- **Date API**: Workout timestamps
- **DOM API**: UI manipulation

## 🚀 Future Enhancement Ideas

- 🔐 User authentication
- 🌤️ Weather data integration
- 📊 Workout statistics and graphs
- 📤 Export workouts to CSV/PDF
- 🎯 Goal tracking
- 👥 Social features (share workouts)
- 📸 Photo uploads
- 🔔 Notifications for workout milestones

## 📝 Notes

- The application requires geolocation permission to function fully
- Data is stored locally in the browser - no server backend
- Each workout gets a unique ID based on timestamp
- Workouts are automatically sorted by date (newest first)

---

**Built as part of [The Complete JavaScript Course 2024](https://www.udemy.com/course/the-complete-javascript-course/) by Jonas Schmedtmann**

Happy tracking! 🎉
