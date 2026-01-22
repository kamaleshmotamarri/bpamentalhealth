/*=============== APPOINTMENT SCHEDULER ===============*/

// Helper function to get Firestore
function getFirestore() {
  if (!window.firebaseFirestore) {
    console.error('[Appointments] Firestore is not available');
    return null;
  }
  return window.firebaseFirestore;
}

// Helper function to get Auth
function getAuth() {
  return window.firebaseAuth;
}

// Appointment state
let currentDate = new Date(2026, 0, 1); // Start at January 2026
let selectedDate = null;
let selectedTimeSlot = null;
let userAppointment = null;
let appointmentsCache = {}; // Cache for appointments by date

// Time slots (2 per day)
const TIME_SLOTS = [
  { time: '10:00 AM', value: '10:00' },
  { time: '2:00 PM', value: '14:00' }
];

// Initialize appointment scheduler
function initAppointmentScheduler() {
  console.log('[Appointments] Initializing scheduler...');

  // Wait for Firebase to be ready
  const checkFirebase = setInterval(() => {
    if (window.firebaseInitialized && getAuth()) {
      clearInterval(checkFirebase);
      setupAuthListener();
      setupEventListeners();
    }
  }, 100);

  // Timeout after 10 seconds
  setTimeout(() => {
    clearInterval(checkFirebase);
    if (!window.firebaseInitialized) {
      showAppointmentMessage('Firebase initialization failed. Please refresh the page.', 'error');
    }
  }, 10000);
}

// Setup authentication listener
function setupAuthListener() {
  const auth = getAuth();
  if (!auth) return;

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      console.log('[Appointments] User signed in:', user.uid);
      await checkUserAppointment(user.uid);
      showScheduler();
    } else {
      console.log('[Appointments] User signed out');
      hideScheduler();
      showAuthRequired();
    }
  });
}

// Check if user already has an appointment
async function checkUserAppointment(userId) {
  const db = getFirestore();
  if (!db) {
    console.error('[Appointments] Firestore not available');
    return;
  }

  try {
    const appointmentsRef = db.collection('appointments');
    const querySnapshot = await appointmentsRef
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (!querySnapshot.empty) {
      const appointmentDoc = querySnapshot.docs[0];
      const appointmentData = appointmentDoc.data();

      // Check if appointment date is in the past
      const appointmentDate = appointmentData.date.toDate();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      appointmentDate.setHours(0, 0, 0, 0);

      // If appointment is in the past, automatically delete it
      if (appointmentDate < today) {
        console.log('[Appointments] Appointment is in the past, auto-deleting...');
        await deleteAppointment(appointmentDoc.id);
        userAppointment = null;
        hideExistingAppointment();
        return false;
      }

      userAppointment = {
        id: appointmentDoc.id,
        ...appointmentData
      };
      await showExistingAppointment();
      return true;
    } else {
      userAppointment = null;
      hideExistingAppointment();
      return false;
    }
  } catch (error) {
    console.error('[Appointments] Error checking user appointment:', error);
    showAppointmentMessage('Error checking appointments. Please try again.', 'error');
    return false;
  }
}

// Show existing appointment message
async function showExistingAppointment() {
  if (!userAppointment) return;

  // Double-check if appointment is still valid (not in the past)
  let date;
  if (userAppointment.date && typeof userAppointment.date.toDate === 'function') {
    date = userAppointment.date.toDate();
  } else if (userAppointment.date && userAppointment.date.seconds) {
    date = new Date(userAppointment.date.seconds * 1000);
  } else {
    date = new Date(userAppointment.date);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  // If appointment is in the past, delete it and refresh
  if (date < today) {
    console.log('[Appointments] Appointment is in the past, auto-deleting...');
    if (userAppointment.id) {
      await deleteAppointment(userAppointment.id);
    }
    userAppointment = null;
    hideExistingAppointment();
    const auth = getAuth();
    if (auth && auth.currentUser) {
      await checkUserAppointment(auth.currentUser.uid);
      showScheduler();
    }
    return;
  }

  const messageEl = document.getElementById('existing-appointment-message');
  const detailsEl = document.getElementById('existing-appointment-details');

  if (messageEl && detailsEl) {
    const formattedDate = formatDate(date);
    const timeSlot = TIME_SLOTS.find(slot => slot.value === userAppointment.timeSlot);

    detailsEl.innerHTML = `
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Time:</strong> ${timeSlot ? timeSlot.time : userAppointment.timeSlot}</p>
      <button id="delete-appointment-btn" class="button button--outline" style="margin-top: 1rem;">
        <i class="ri-delete-bin-line"></i> Delete Appointment
      </button>
    `;

    messageEl.style.display = 'flex';
    document.getElementById('appointment-scheduler').style.display = 'none';

    // Add event listener for delete button
    const deleteBtn = document.getElementById('delete-appointment-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', handleDeleteAppointment);
    }
  }
}

// Hide existing appointment message
function hideExistingAppointment() {
  const messageEl = document.getElementById('existing-appointment-message');
  if (messageEl) {
    messageEl.style.display = 'none';
  }
}

// Show authentication required message
function showAuthRequired() {
  const messageEl = document.getElementById('auth-required-message');
  const schedulerEl = document.getElementById('appointment-scheduler');

  if (messageEl) messageEl.style.display = 'flex';
  if (schedulerEl) schedulerEl.style.display = 'none';
  hideExistingAppointment();
}

// Show scheduler
function showScheduler() {
  const messageEl = document.getElementById('auth-required-message');
  const schedulerEl = document.getElementById('appointment-scheduler');

  if (messageEl) messageEl.style.display = 'none';
  if (schedulerEl && !userAppointment) {
    schedulerEl.style.display = 'block';
    renderCalendar();
  }
}

// Hide scheduler
function hideScheduler() {
  const schedulerEl = document.getElementById('appointment-scheduler');
  if (schedulerEl) schedulerEl.style.display = 'none';
}

// Setup event listeners
function setupEventListeners() {
  // Month navigation
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');

  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() - 1);
      if (newDate.getFullYear() === 2026) {
        currentDate = newDate;
        renderCalendar();
      } else {
        // Already at the start of 2026
        showAppointmentMessage('Only appointments for 2026 are available.', 'info');
      }
    });
  }

  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + 1);
      if (newDate.getFullYear() === 2026) {
        currentDate = newDate;
        renderCalendar();
      } else {
        // Already at the end of 2026
        showAppointmentMessage('Only appointments for 2026 are available.', 'info');
      }
    });
  }

  // Login link
  const loginLink = document.getElementById('login-link');
  if (loginLink) {
    loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof openAuthModal === 'function') {
        openAuthModal('login-modal');
      }
    });
  }

  // Modal close buttons
  const closeModalBtn = document.getElementById('close-modal');
  const cancelAppointmentBtn = document.getElementById('cancel-appointment');

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeAppointmentModal);
  }

  if (cancelAppointmentBtn) {
    cancelAppointmentBtn.addEventListener('click', closeAppointmentModal);
  }

  // Confirm appointment button
  const confirmBtn = document.getElementById('confirm-appointment');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', confirmAppointment);
  }

  // Close modal when clicking outside
  const modal = document.getElementById('appointment-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAppointmentModal();
      }
    });
  }
}

// Render calendar
async function renderCalendar() {
  const calendarGrid = document.getElementById('calendar-grid');
  const monthYearTitle = document.getElementById('current-month-year');

  if (!calendarGrid || !monthYearTitle) return;

  // Update month/year title
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  monthYearTitle.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  // Clear grid
  calendarGrid.innerHTML = '';

  // Get first day of month and number of days
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'appointment-calendar__day appointment-calendar__day--empty';
    calendarGrid.appendChild(emptyCell);
  }

  // Load appointments for this month
  await loadAppointmentsForMonth(year, month);

  // Add cells for each day
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = formatDateKey(date);
    const dayCell = createDayCell(date, day, dateKey);
    calendarGrid.appendChild(dayCell);
  }
}

// Create day cell
function createDayCell(date, day, dateKey) {
  const dayCell = document.createElement('div');
  dayCell.className = 'appointment-calendar__day';

  // Check if date is in the past (relative to today, but we're only showing 2026)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cellDate = new Date(date);
  cellDate.setHours(0, 0, 0, 0);

  // Check if this is today
  const isToday = cellDate.getTime() === today.getTime() &&
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  // Only allow dates in 2026
  if (date.getFullYear() !== 2026) {
    dayCell.classList.add('appointment-calendar__day--disabled');
  } else {
    // Get appointments for this date
    const dateAppointments = appointmentsCache[dateKey] || [];
    const availableSlots = getAvailableSlots(dateAppointments);

    if (availableSlots.length === 0) {
      dayCell.classList.add('appointment-calendar__day--full');
    } else {
      dayCell.classList.add('appointment-calendar__day--available');
      dayCell.addEventListener('click', () => selectDate(date, dateKey));
    }

    // Add today indicator
    if (isToday) {
      dayCell.classList.add('appointment-calendar__day--today');
    }
  }

  const availableCount = getAvailableSlots(appointmentsCache[dateKey] || []).length;
  const statusText = availableCount === 0 ? 'Full' : `${availableCount} slot${availableCount > 1 ? 's' : ''}`;

  dayCell.innerHTML = `
    <span class="appointment-calendar__day-number">${day}</span>
    <span class="appointment-calendar__day-status">${statusText}</span>
  `;

  return dayCell;
}

// Get available slots for a date
function getAvailableSlots(appointments) {
  const bookedSlots = appointments.map(apt => apt.timeSlot);
  return TIME_SLOTS.filter(slot => !bookedSlots.includes(slot.value));
}

// Load appointments for a month
async function loadAppointmentsForMonth(year, month) {
  const db = getFirestore();
  if (!db) return;

  try {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const appointmentsRef = db.collection('appointments');
    const querySnapshot = await appointmentsRef
      .where('date', '>=', firebase.firestore.Timestamp.fromDate(startDate))
      .where('date', '<=', firebase.firestore.Timestamp.fromDate(endDate))
      .get();

    // Clear cache for this month
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
      const key = formatDateKey(d);
      appointmentsCache[key] = [];
    }

    // Populate cache
    querySnapshot.forEach((doc) => {
      const appointment = doc.data();
      const appointmentDate = appointment.date.toDate();
      const dateKey = formatDateKey(appointmentDate);

      if (!appointmentsCache[dateKey]) {
        appointmentsCache[dateKey] = [];
      }
      appointmentsCache[dateKey].push({
        id: doc.id,
        ...appointment
      });
    });
  } catch (error) {
    console.error('[Appointments] Error loading appointments:', error);
  }
}

// Format date key (YYYY-MM-DD)
function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format date for display
function formatDate(date) {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Select date
function selectDate(date, dateKey) {
  selectedDate = date;
  selectedTimeSlot = null;

  const dateAppointments = appointmentsCache[dateKey] || [];
  const availableSlots = getAvailableSlots(dateAppointments);

  if (availableSlots.length === 0) {
    showAppointmentMessage('No available slots for this date.', 'warning');
    return;
  }

  // Show selected date info
  const selectedDateInfo = document.getElementById('selected-date-info');
  const selectedDateTitle = document.getElementById('selected-date-title');
  const timeSlotsContainer = document.getElementById('time-slots');

  if (selectedDateInfo && selectedDateTitle && timeSlotsContainer) {
    selectedDateTitle.textContent = formatDate(date);
    selectedDateInfo.style.display = 'block';

    // Render time slots
    timeSlotsContainer.innerHTML = '';
    availableSlots.forEach(slot => {
      const slotButton = document.createElement('button');
      slotButton.className = 'time-slot';
      slotButton.textContent = slot.time;
      slotButton.addEventListener('click', () => selectTimeSlot(slot));
      timeSlotsContainer.appendChild(slotButton);
    });
  }

  // Scroll to selected date info
  selectedDateInfo?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Select time slot
function selectTimeSlot(slot) {
  selectedTimeSlot = slot;

  // Update UI - highlight selected slot
  const timeSlots = document.querySelectorAll('.time-slot');
  timeSlots.forEach(btn => {
    btn.classList.remove('time-slot--selected');
    if (btn.textContent === slot.time) {
      btn.classList.add('time-slot--selected');
    }
  });

  // Show confirmation modal
  showAppointmentModal();
}

// Show appointment confirmation modal
function showAppointmentModal() {
  const modal = document.getElementById('appointment-modal');
  const confirmDate = document.getElementById('confirm-date');
  const confirmTime = document.getElementById('confirm-time');
  const confirmPatient = document.getElementById('confirm-patient');
  const auth = getAuth();

  if (modal && confirmDate && confirmTime && confirmPatient && auth && auth.currentUser) {
    confirmDate.textContent = formatDate(selectedDate);
    confirmTime.textContent = selectedTimeSlot.time;
    confirmPatient.textContent = auth.currentUser.displayName || auth.currentUser.email || 'User';
    modal.classList.add('show-modal');
    document.body.style.overflow = 'hidden';
  }
}

// Close appointment modal
function closeAppointmentModal() {
  const modal = document.getElementById('appointment-modal');
  if (modal) {
    modal.classList.remove('show-modal');
    document.body.style.overflow = '';
  }
}

// Confirm appointment
async function confirmAppointment() {
  const auth = getAuth();
  const db = getFirestore();

  if (!auth || !auth.currentUser) {
    showAppointmentMessage('You must be signed in to make an appointment.', 'error');
    return;
  }

  if (!db) {
    showAppointmentMessage('Database not available. Please refresh the page.', 'error');
    return;
  }

  if (!selectedDate || !selectedTimeSlot) {
    showAppointmentMessage('Please select a date and time slot.', 'error');
    return;
  }

  // Check if user already has an appointment
  const hasAppointment = await checkUserAppointment(auth.currentUser.uid);
  if (hasAppointment) {
    showAppointmentMessage('You already have an appointment scheduled. Each user can only have one appointment.', 'error');
    closeAppointmentModal();
    return;
  }

  // Show loading
  showLoading(true);

  try {
    // Create date with selected time
    const [hours, minutes] = selectedTimeSlot.value.split(':').map(Number);
    const appointmentDateTime = new Date(selectedDate);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    // Create appointment document
    const appointmentData = {
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email,
      userName: auth.currentUser.displayName || auth.currentUser.email,
      date: firebase.firestore.Timestamp.fromDate(appointmentDateTime),
      timeSlot: selectedTimeSlot.value,
      createdAt: firebase.firestore.Timestamp.now()
    };

    // Save to Firestore
    const appointmentsRef = db.collection('appointments');
    await appointmentsRef.add(appointmentData);

    // Update local state
    userAppointment = {
      ...appointmentData,
      id: 'new'
    };

    // Update cache
    const dateKey = formatDateKey(selectedDate);
    if (!appointmentsCache[dateKey]) {
      appointmentsCache[dateKey] = [];
    }
    appointmentsCache[dateKey].push({
      id: 'new',
      ...appointmentData
    });

    // Show success message
    showAppointmentMessage('Appointment scheduled successfully!', 'success');

    // Close modal
    closeAppointmentModal();

    // Refresh UI
    await checkUserAppointment(auth.currentUser.uid);
    renderCalendar();

    // Clear selection
    selectedDate = null;
    selectedTimeSlot = null;
    const selectedDateInfo = document.getElementById('selected-date-info');
    if (selectedDateInfo) {
      selectedDateInfo.style.display = 'none';
    }

  } catch (error) {
    console.error('[Appointments] Error creating appointment:', error);
    showAppointmentMessage('Failed to schedule appointment. Please try again.', 'error');
  } finally {
    showLoading(false);
  }
}

// Show loading spinner
function showLoading(show) {
  const spinner = document.getElementById('loading-spinner');
  if (spinner) {
    spinner.style.display = show ? 'flex' : 'none';
  }
}

// Delete appointment
async function deleteAppointment(appointmentId) {
  const db = getFirestore();
  if (!db) {
    console.error('[Appointments] Firestore not available');
    return false;
  }

  try {
    await db.collection('appointments').doc(appointmentId).delete();
    console.log('[Appointments] Appointment deleted successfully');
    return true;
  } catch (error) {
    console.error('[Appointments] Error deleting appointment:', error);
    return false;
  }
}

// Handle delete appointment button click
async function handleDeleteAppointment() {
  if (!userAppointment || !userAppointment.id) {
    showAppointmentMessage('No appointment to delete.', 'error');
    return;
  }

  // Confirm deletion
  if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
    return;
  }

  // Show loading
  showLoading(true);

  try {
    // Store appointment data before deletion for cache update
    const appointmentToDelete = { ...userAppointment };
    const success = await deleteAppointment(userAppointment.id);

    if (success) {
      // Update cache - remove from cache if it exists
      let date;
      if (appointmentToDelete.date && typeof appointmentToDelete.date.toDate === 'function') {
        date = appointmentToDelete.date.toDate();
      } else if (appointmentToDelete.date && appointmentToDelete.date.seconds) {
        date = new Date(appointmentToDelete.date.seconds * 1000);
      } else {
        date = new Date(appointmentToDelete.date);
      }

      const dateKey = formatDateKey(date);
      if (appointmentsCache[dateKey]) {
        appointmentsCache[dateKey] = appointmentsCache[dateKey].filter(
          apt => apt.id !== appointmentToDelete.id
        );
      }

      // Clear user appointment
      userAppointment = null;

      // Show success message
      showAppointmentMessage('Appointment deleted successfully!', 'success');

      // Hide existing appointment message and show scheduler
      hideExistingAppointment();
      showScheduler();
      // Note: showScheduler() already calls renderCalendar(), so no need to call it again
    } else {
      showAppointmentMessage('Failed to delete appointment. Please try again.', 'error');
    }
  } catch (error) {
    console.error('[Appointments] Error in handleDeleteAppointment:', error);
    showAppointmentMessage('An error occurred while deleting the appointment.', 'error');
  } finally {
    showLoading(false);
  }
}

// Show appointment message
function showAppointmentMessage(message, type = 'info') {
  const messageEl = document.getElementById('appointment-message');
  if (!messageEl) return;

  messageEl.textContent = message;
  messageEl.className = `appointment-message appointment-message--${type}`;
  messageEl.style.display = 'flex';

  // Auto-hide after 5 seconds
  setTimeout(() => {
    messageEl.style.display = 'none';
  }, 5000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAppointmentScheduler);
} else {
  initAppointmentScheduler();
}

