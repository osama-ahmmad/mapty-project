# Mapty - Project Description & Development Guide

## 📚 Project Overview

**Mapty** is a sophisticated web application that combines geolocation, interactive mapping, and object-oriented programming to create a workout tracking system. Users can log their running and cycling activities at specific locations on an interactive map, with all data persisting between sessions using browser storage.

### Project Type
Educational project demonstrating advanced JavaScript concepts including:
- Object-Oriented Programming (Classes, Inheritance)
- Event Handling & DOM Manipulation
- API Integration (Geolocation, localStorage)
- Third-party Library Integration (Leaflet.js, SweetAlert2)
- Asynchronous Programming
- State Management

---

## 🎯 Project Goals

The project was built to teach and demonstrate:

1. **OOP Principles**
   - Class hierarchies with parent-child relationships
   - Method overriding and inheritance
   - Encapsulation with private fields (#)

2. **Web APIs**
   - Geolocation for user positioning
   - localStorage for persistent data storage
   - Event delegation and bubbling

3. **UI/UX Implementation**
   - Form handling and validation
   - Dynamic DOM manipulation
   - Responsive design principles

4. **Third-party Integration**
   - Leaflet.js for mapping
   - SweetAlert2 for notifications
   - OpenStreetMap tiles for map data

5. **Data Management**
   - In-memory data structures (arrays, objects)
   - Serialization and deserialization
   - CRUD operations (Create, Read, Update, Delete)

---

## 🔧 How the Code Was Built

### Phase 1: Foundation (HTML & CSS)
```
index.html → Semantic structure with sidebar + map container
style.css → Responsive layout, component styling, color scheme
```

**Key Decisions:**
- Sidebar for workout list (left 40% of screen)
- Map container on right (60% of screen)
- Hidden form that appears on demand
- Mobile-responsive Flexbox layout

### Phase 2: Data Models (Classes)

**Step 1: Base Workout Class**
```javascript
class Workout {
  // Shared properties for all workouts
  // Auto-generated ID and date
  // Method to create description
}
```

**Step 2: Specialized Classes**
```javascript
class Running extends Workout {
  // Calculates pace (min/km)
  // Stores cadence
}

class Cycling extends Workout {
  // Calculates speed (km/h)
  // Stores elevation gain
}
```

**Design Pattern Used:** Inheritance with method specialization

### Phase 3: Application Logic (App Class)

**Constructor Setup:**
- Get user location via geolocation
- Load previous data from localStorage
- Attach all event listeners

**Core Methods:**
1. `_getPosition()` - Request geolocation
2. `_loadMap()` - Initialize Leaflet map
3. `_showForm()` / `_hideForm()` - Form visibility toggle
4. `_newWorkout()` - Create workout from form
5. `_renderWorkout()` - Display in sidebar
6. `_renderWorkoutMarker()` - Display on map
7. `_removeElement()` - Delete functionality
8. `_editElement()` - Edit mode activation
9. `_updateWorkout()` - Save edited workout
10. `_setLocalStorage()` - Persist data
11. `_getLocalStorage()` - Load data
12. `_sort()` - Sort workouts

**Event Listeners Attached:**
- `form.submit` → Create new workout
- `inputType.change` → Toggle form fields
- `containerWorkouts.click` → Edit/Delete/Navigate
- `btnSort.click` → Sort workouts
- `map.click` → Show form

### Phase 4: Integration & Polish

**External Libraries:**
- **Leaflet.js**: Interactive map rendering and markers
- **SweetAlert2**: User-friendly error alerts
- **OpenStreetMap**: Free map tiles

**Data Persistence:**
- Serialize workouts array to JSON
- Store in localStorage
- Deserialize on app load
- Recreate class instances

---

## 🏗️ Architecture & Code Structure

### Class Relationships

```
Workout (Parent)
├── Running (Child)
│   └── calcPace()
└── Cycling (Child)
    └── calcSpeed()

App (Controller)
├── Manages #workouts array
├── Manages #map instance
├── Handles all user interactions
└── Orchestrates data flow
```

### Private vs Public

**Private Fields (#):**
- `#map` - Leaflet map instance
- `#workouts` - Array of workout objects
- `#mapEvent` - Coordinates from click event
- `#editingWorkout` - Currently editing workout
- `#originalWorkouts` - Backup for sorting
- `#sorted` - Sort state flag

**Public Methods:**
- All methods are technically public in JavaScript
- Prefixed with underscore (_) by convention to indicate "internal use"

### State Management Flow

```
App Instance Created
    ↓
_getPosition() called
    ↓
_loadMap() initializes map
    ↓
_getLocalStorage() loads previous data
    ↓
Map renders with markers
    ↓
User Interaction
    ↓
Form submission / Edit / Delete
    ↓
Update #workouts array
    ↓
_setLocalStorage() persists data
    ↓
Re-render UI
```

---

## 🔑 Key Implementation Decisions

### 1. Why Classes?
```javascript
// Allows creating multiple workout instances with shared methods
const workout1 = new Running([39.5, -74.2], 5, 30, 178);
const workout2 = new Cycling([39.5, -74.2], 27, 95, 523);
```

### 2. Why localStorage?
- No backend server needed
- Data persists between sessions
- Works offline
- Simple API

### 3. Why Leaflet.js?
- Lightweight (~39KB)
- Easy to use API
- Supports multiple tile providers
- Active community

### 4. Why SweetAlert2?
- Beautiful, modern alerts
- Customizable styling
- Better UX than native alerts

### 5. Private Fields (#)
```javascript
class App {
  #map;  // Truly private, can't access from outside
  
  _privateByConvention;  // Not truly private, but signal
}
```

### 6. Method Binding
```javascript
// Using .bind(this) to maintain correct context
form.addEventListener('submit', this._newWorkout.bind(this));
```

---

## 🎨 Coding Patterns Used

### 1. Module Pattern
- App class acts as a self-contained module
- Encapsulates all application logic
- Single responsibility principle

### 2. Event Delegation
```javascript
// Single listener on parent handles multiple children
containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
```

### 3. Template Literals for HTML
```javascript
// Dynamic HTML generation
containerWorkouts.insertAdjacentHTML('beforeend', `
  <li class="workout workout--${workout.type}" data-id="${workout.id}">
    ...
  </li>
`);
```

### 4. Defensive Copying
```javascript
// Store original for sorting, work with copy
this.#originalWorkouts.push(workout);
this.#workouts.push(workout);
```

### 5. Validation Helpers
```javascript
// Pure functions for validation logic
const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));
const allPositive = (...inputs) => inputs.every(inp => inp > 0);
```

---

## 🧪 Code Quality Features

### Input Validation
```javascript
// Multi-level validation for robust error handling
1. Check if inputs are finite numbers
2. Check if inputs are positive values
3. Type-specific validation (cadence vs elevation)
```

### Error Handling
```javascript
// User-friendly error messages via SweetAlert2
Swal.fire({
  icon: 'error',
  title: 'Oops...',
  text: 'Inputs have to be positive numbers'
});
```

### Type Checking
```javascript
// Determine workout type and create appropriate class
if (type === 'running') {
  workout = new Running([lat, lng], distance, duration, cadence);
}
```

---

## 📊 Data Structure

### Workout Object Example (Running)
```javascript
{
  date: Date object,
  id: "0267543210",
  coords: [39.5, -74.2],
  distance: 5.2,
  duration: 24,
  type: "running",
  cadence: 178,
  pace: 4.615,
  description: "Running on May 5",
  _setDescription: function
}
```

### localStorage Structure
```javascript
// Stored as JSON string
{
  "workouts": [
    { /* running workout 1 */ },
    { /* cycling workout 2 */ },
    // ... more workouts
  ]
}
```

---

## 🔄 CRUD Operations Breakdown

### CREATE (Create New Workout)
1. User clicks map
2. Form appears with click coordinates
3. User fills form and submits
4. New Workout instance created
5. Added to #workouts array
6. Rendered on map and sidebar
7. Saved to localStorage

### READ (Display Workouts)
1. _getLocalStorage() loads data on startup
2. _loadMap() renders markers for each
3. _renderWorkout() displays in sidebar
4. Click map marker to view details

### UPDATE (Edit Existing Workout)
1. User clicks "Edit" button
2. Form populates with workout data
3. #editingWorkout stores reference
4. User modifies values
5. _updateWorkout() saves changes
6. _updateWorkoutInUI() refreshes display
7. localStorage updated

### DELETE (Remove Workout)
1. User clicks "Delete" button
2. Workout removed from #workouts array
3. Marker removed from map
4. Item removed from sidebar
5. localStorage updated

---

## 🐛 Debugging Tips

### Check Console Errors
```
F12 → Console tab → Look for red error messages
```

### Inspect localStorage
```
F12 → Application → Storage → localStorage → Check stored data
```

### Debug State
```javascript
// Add to console to inspect current state
console.log(app);  // Shows all private/public properties
```

### Test Geolocation
```
Chrome: Settings → Privacy → Reset site permissions
```

---

## 🚀 Development Workflow

### Local Testing
```bash
# Option 1: Simple file serving
npx http-server

# Option 2: Python
python -m http.server

# Then visit: http://localhost:8000
```

### Adding New Features

**Example: Adding distance filter**
1. Add form input to HTML
2. Add event listener in App constructor
3. Create filter method in App class
4. Update _renderWorkout() to check filter
5. Store filter preference in localStorage

---

## 📚 Code Organization Tips

### File Structure
```
mapty/
├── index.html        (HTML structure)
├── script.js         (All JavaScript)
├── style.css         (All styling)
├── logo.png          (Assets)
├── icon.png          (Favicon)
└── package.json      (Dependencies)
```

### Naming Conventions Used
- **Classes**: PascalCase (Workout, Running, Cycling, App)
- **Methods**: camelCase with _ prefix for "private" (_getPosition)
- **Constants**: UPPER_SNAKE_CASE (not used in this project)
- **Variables**: camelCase (mapEvent, containerWorkouts)

---

## 🎓 Learning Outcomes

By studying this project, you should understand:

✅ How to design classes with inheritance
✅ How to implement CRUD operations
✅ How to use browser APIs (Geolocation, localStorage)
✅ How to integrate third-party libraries
✅ How to handle forms and validation
✅ How to manipulate the DOM dynamically
✅ How to manage application state
✅ How to implement event delegation
✅ How to work with asynchronous operations
✅ How to structure scalable JavaScript applications

---

## 🔗 Resources & References

- [Leaflet.js Documentation](https://leafletjs.com/reference.html)
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [SweetAlert2 Docs](https://sweetalert2.github.io/)
- [OpenStreetMap](https://www.openstreetmap.org/)

---

## 📝 Summary

Mapty is a complete web application that demonstrates professional JavaScript development practices. It showcases the transition from procedural to object-oriented code, integration of modern web APIs, and proper state management. The architecture is clean, maintainable, and serves as an excellent reference for building similar applications.

The code emphasizes:
- 🎯 **Single Responsibility**: Each class has one clear purpose
- 🔒 **Encapsulation**: Private fields protect internal state
- 📦 **Modularity**: Code is organized and reusable
- 🧪 **Validation**: Input validation prevents errors
- 💾 **Persistence**: Data survives page refreshes
- 🎨 **User Experience**: Beautiful UI with helpful feedback

---

**Happy Coding! 🚀**
