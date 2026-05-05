'use strict';

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance; 
    this.duration = duration; 
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
const btnClear = document.querySelector('.item-actions__btn--clear');
const btnSort = document.querySelector('.btn--sort');

class App {
  #map;
  #mapEvent;
  #workouts = [];
  #originalWorkouts = [];
  #currentWorkout = null;
  #editingWorkout = null;
  #sorted = false;

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
    containerWorkouts.addEventListener('click', this._editElement.bind(this));
    btnSort.addEventListener('click', this._sort.bind(this));
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

    if (this.#editingWorkout) {
      return this._updateWorkout();
    }

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
        return Swal.fire({
          icon: 'error',
          title: 'Oops...',
          width: 500,
          text: 'Inputs have to be positive numbers',
          customClass: {
            popup: 'swal-big',
          },
        });

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    //if workout cycling, creating cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !validInputs(distance, duration, elevation) ||
        !allpositive(distance, duration, elevation)
      )
        return Swal.fire({
          icon: 'error',
          title: 'Oops...',
          width: 500,
          text: 'Inputs have to be positive numbers',
          customClass: {
            popup: 'swal-big',
          },
        });

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new object to workout array
    this.#workouts.push(workout);

    this.#originalWorkouts.push(workout);

    // Render workout on map as marker
    this._renderWorkoutMarker(workout);

    // Render workout on list
    this._renderWorkout(workout);

    // Hide form + clear inputs
    this._hideForm();

    // set local storage to all workouts
    this._setLocalStorage();
  }

  _updateWorkout() {
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;

    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    const workout = this.#editingWorkout;

    if (!workout) return;

    let valid =
      validInputs(distance, duration) && allPositive(distance, duration);

    if (workout.type === 'running') {
      const cadence = +inputCadence.value;

      valid = valid && validInputs(cadence) && cadence > 0;

      if (!valid) return alert('Invalid inputs');

      workout.distance = distance;
      workout.duration = duration;
      workout.cadence = cadence;

      workout.calcPace();
    }

    if (workout.type === 'cycling') {
      const elevation = +inputElevation.value;

      valid = valid && validInputs(elevation);

      if (!valid) return alert('Invalid inputs');

      workout.distance = distance;
      workout.duration = duration;
      workout.elevationGain = elevation;

      workout.calcSpeed();
    }

    workout._setDescription();

    this._updateWorkoutInUI(workout);

    this._setLocalStorage();

    this.#editingWorkout = null;

    this._hideForm();
  }

  _updateWorkoutInUI(workout) {
    const workoutEl = document.querySelector(
      `.workout[data-id="${workout.id}"]`,
    );

    if (!workoutEl) return;

    workoutEl.querySelector('.workout__value').textContent = workout.distance;
    workoutEl.querySelectorAll('.workout__value')[1].textContent =
      workout.duration;

    if (workout.type === 'running') {
      workoutEl.querySelectorAll('.workout__value')[2].textContent =
        workout.pace.toFixed(1);
      workoutEl.querySelectorAll('.workout__value')[3].textContent =
        workout.cadence;
    }

    if (workout.type === 'cycling') {
      workoutEl.querySelectorAll('.workout__value')[2].textContent =
        workout.speed.toFixed(1);
      workoutEl.querySelectorAll('.workout__value')[3].textContent =
        workout.elevationGain;
    }
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
    if (e.target.closest('.item-actions')) return;

    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id,
    );

    if (!workout) return;

    this.#map.setView(workout.coords, 13, {
      animation: true,
      pan: { duration: 1 },
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

  _editElement(e) {
    const btn = e.target.closest('.item-actions__btn--edit');
    if (!btn) return;

    const workoutEl = btn.closest('.workout');

    const workout = this.#workouts.find(w => w.id === workoutEl.dataset.id);

    if (!workout) return;

    this.#editingWorkout = workout;

    form.classList.remove('hidden');

    inputDistance.value = workout.distance;
    inputDuration.value = workout.duration;

    if (workout.type === 'running') {
      inputType.value = 'running';
      inputCadence.closest('.form__row').classList.remove('form__row--hidden');
      inputElevation.closest('.form__row').classList.add('form__row--hidden');

      inputCadence.value = workout.cadence;
    }

    if (workout.type === 'cycling') {
      inputType.value = 'cycling';
      inputElevation
        .closest('.form__row')
        .classList.remove('form__row--hidden');
      inputCadence.closest('.form__row').classList.add('form__row--hidden');

      inputElevation.value = workout.elevationGain;
    }

    inputDistance.focus();
  }

  _removeElement(e) {
    const btnDeleteEl = e.target.closest('.item-actions__btn--delete');
    if (!btnDeleteEl) return;

    const workoutEl = btnDeleteEl.closest('.workout');

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id,
    );

    if (!workout) return;

    this.#workouts = this.#workouts.filter(work => work.id !== workout.id);

    workoutEl.remove();

    if (workout.marker) workout.marker.remove();

    this._setLocalStorage();
  }

  _reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }

  _sort(e) {
    e.preventDefault();

    this.#sorted = !this.#sorted;

    if (this.#sorted) {
      this.#workouts.sort((a, b) => a.distance - b.distance);
    } else {
      this.#workouts = this.#originalWorkouts.slice();
    }

    document.querySelectorAll('.workout').forEach(el => el.remove());

    this.#workouts.forEach(work => this._renderWorkout(work));
  }
}

const app = new App();
