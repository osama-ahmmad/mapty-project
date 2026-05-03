'use strict';

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.type = 'cycling';
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
  }
}

// const reun = new Running();

//////////////////////////
// Application Arcitecture
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const btnEdit = document.querySelector('.item-actions__btn--edit');
const btnDelete = document.querySelector('.item-actions__btn--delete');
const btnClear = document.querySelector('.item-actions__btn--clear');

class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    // Get user's position
    this._getPosition();

    // get data from local srorage
    this._getLocalStorage();

    // Attach event handlers
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField.bind(this));
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    btnClear.addEventListener('click', this._reset.bind(this));
    containerWorkouts.addEventListener('click', this._removeElement.bind(this));
  }

  _getPosition() {
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        alert("Couldn't get your position");
      },
    );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //marker
    L.marker(coords) // craete marker
      .addTo(this.#map) // add to the map
      .bindPopup('A pretty CSS popup.<br> Easily customizable.')
      .openPopup();

    // like event listener but it event in the whole map map.on(event,callback function)
    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    //empty inputs
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const allpositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();

    // Get data from form
    const type = inputType.value; // each option has a value
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    //if workout running, creating reunning object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      // Check if data is valid
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) ||
        !allpositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    //if workout cycling, creating cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !validInputs(distance, duration, elevation) ||
        !allpositive(distance, duration, elevation)
      )
        return alert('Inputs have to be positive numbers');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new object to workout array
    this.#workouts.push(workout);

    // Render workout on map as marker
    this._renderWorkoutMarker(workout);

    // Render workout on list
    this._renderWorkout(workout);

    // Hide form + clear inputs
    this._hideForm();

    // set local storage to all workouts
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    const marker = L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        }),
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`,
      )
      .openPopup();

    workout.marker = marker;
  }

  _renderWorkout(workout) {
    let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
    `;

    if (workout.type === 'running')
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
          <div class="item-actions">
            <button class="item-actions__btn item-actions__btn--edit">
              Edit
            </button>

            <button class="item-actions__btn item-actions__btn--delete">
              Delete
            </button>
          </div>
        </li>`;

    if (workout.type === 'cycling') {
      html += `
            <div class="workout__details">
              <span class="workout__icon">⚡️</span>
              <span class="workout__value">${workout.speed.toFixed(1)}</span>
              <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">⛰</span>
              <span class="workout__value">${workout.elevationGain}</span>
              <span class="workout__unit">m</span>
            </div>
            <div class="item-actions">
            <button class="item-actions__btn item-actions__btn--edit">
              Edit
            </button>

            <button class="item-actions__btn item-actions__btn--delete">
              Delete
            </button>
          </div>
          </li>
      `;
    }
    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id,
    );

    this.#map.setView(workout.coords, 13, {
      Animation: true,
      pan: {
        duration: 1,
      },
    });
  }

  _setLocalStorage() {
    // local storage is key value store
    //JSON.stringify => convert any object in JS to string
    const workoutsToSave = this.#workouts.map(work => {
      const { marker, ...rest } = work;
      return rest;
    });
    localStorage.setItem('workouts', JSON.stringify(workoutsToSave)); // (key,value) string
  }

  _getLocalStorage() {
    // convert object from string to object
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workouts = data.map(work => {
      if (work.type === 'running') {
        return new Running(
          work.coords,
          work.distance,
          work.duration,
          work.cadence,
        );
      } else {
        return new Cycling(
          work.coords,
          work.distance,
          work.duration,
          work.elevationGain,
        );
      }
    });

    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }

  _removeElement(e) {
    const btnDeleteEl = e.target.closest('.item-actions__btn--delete');
    if (!btnDeleteEl) return;

    const workoutEl = btnDeleteEl.closest('.workout');

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id,
    );

    this.#workouts = this.#workouts.filter(work => work.id !== workout.id);

    localStorage.setItem('workouts', JSON.stringify(this.#workouts));

    workoutEl.remove();

    workout.marker.remove();
  }

  _reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();
