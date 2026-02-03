/* assets/js/counselors.js */

// Initial Data
const DEFAULT_COUNSELORS = [
    {
        id: 'c1',
        name: 'Dr. Sarah Mitchell',
        specialities: ['Anxiety', 'Depression'],
        bio: 'Clinical psychologist with 10 years of experience specializing in anxiety disorders and CBT.'
    },
    {
        id: 'c2',
        name: 'Dr. James Wilson',
        specialities: ['PTSD', 'Trauma'],
        bio: 'Expert in trauma-informed care and helping veterans and accident survivors.'
    },
    {
        id: 'c3',
        name: 'Elena Rodriguez, LMFT',
        specialities: ['Relationships', 'Family Therapy'],
        bio: 'Licensed Marriage and Family Therapist helping couples and families reconnect.'
    }
];

// State Management
let counselors = JSON.parse(localStorage.getItem('mentalmed_counselors')) || DEFAULT_COUNSELORS;
let bookings = JSON.parse(localStorage.getItem('mentalmed_bookings')) || [];

// Save Helper
const saveState = () => {
    localStorage.setItem('mentalmed_counselors', JSON.stringify(counselors));
    localStorage.setItem('mentalmed_bookings', JSON.stringify(bookings));
};

// UI Handling helpers
const getEl = (id) => document.getElementById(id);

// --- Role Management ---

function selectRole(role) {
    getEl('role-selection').style.display = 'none';

    if (role === 'patient') {
        getEl('patient-view').style.display = 'block';
        renderCounselors();
        renderBookings();
    } else if (role === 'counselor') {
        getEl('counselor-view').style.display = 'block';
    }
}

function resetRole() {
    getEl('patient-view').style.display = 'none';
    getEl('counselor-view').style.display = 'none';
    getEl('role-selection').style.display = 'grid'; // grid as per css
}

// --- Patient Logic ---

function renderCounselors() {
    const list = getEl('counselors-list');
    list.innerHTML = '';

    counselors.forEach(c => {
        const card = document.createElement('div');
        card.className = 'counselor-card';

        // Check if already booked
        const isBooked = bookings.some(b => b.counselorId === c.id);
        const buttonText = isBooked ? 'Booked' : 'Book Appointment';
        const buttonDisabled = isBooked ? 'disabled' : '';
        const buttonClass = isBooked ? 'button button--ghost' : 'button';

        const specsHtml = c.specialities.map(s => `<span class="speciality-tag">${s}</span>`).join('');

        card.innerHTML = `
            <div class="counselor-header">
                <div class="counselor-avatar">
                   <i class="ri-user-smile-line"></i>
                </div>
                <div class="counselor-info">
                    <h4>${c.name}</h4>
                    <div>${specsHtml}</div>
                </div>
            </div>
            <p class="counselor-bio">${c.bio}</p>
            <button class="${buttonClass}" onclick="bookCounselor('${c.id}')" ${buttonDisabled}>
                ${buttonText}
            </button>
        `;
        list.appendChild(card);
    });
}

function renderBookings() {
    const list = getEl('my-bookings-list');
    list.innerHTML = '';

    if (bookings.length === 0) {
        list.innerHTML = '<p class="empty-message">No bookings yet.</p>';
        return;
    }

    bookings.forEach(b => {
        // Find counselor details
        const c = counselors.find(cou => cou.id === b.counselorId);
        if (!c) return; // Should not happen

        const card = document.createElement('div');
        card.className = 'booking-card';
        card.innerHTML = `
            <div class="booking-info">
                <h4>Appointment with ${c.name}</h4>
                <p>Status: Confirmed</p>
            </div>
            <button class="delete-btn" onclick="deleteBooking('${b.id}')">
                Cancel
            </button>
        `;
        list.appendChild(card);
    });
}

function bookCounselor(counselorId) {
    const newBooking = {
        id: 'b' + Date.now(),
        counselorId: counselorId,
        date: new Date().toISOString()
    };

    bookings.push(newBooking);
    saveState();

    // Refresh UI
    renderCounselors();
    renderBookings();

    // Optional feedback
    alert('Booking confirmed!');
}

function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    bookings = bookings.filter(b => b.id !== bookingId);
    saveState();

    renderCounselors();
    renderBookings();
}

// --- Counselor Logic ---

function handleCounselorSubmit(e) {
    e.preventDefault();

    const name = getEl('counselor-name').value;
    const bio = getEl('counselor-bio').value;

    // Get checked specialities
    const checkboxes = document.querySelectorAll('#speciality-selector input[type="checkbox"]:checked');
    const selectedSpecs = Array.from(checkboxes).map(cb => cb.value);

    if (selectedSpecs.length === 0) {
        alert('bad internet');
        return;
    }

    const newCounselor = {
        id: 'c' + Date.now(),
        name,
        bio,
        specialities: selectedSpecs
    };

    counselors.push(newCounselor);
    saveState();

    alert('Profile created successfully! Patients can now see you in the list.');

    // Reset form
    e.target.reset();

    // Switch to patient view to "see" result? Or just stay. 
    // Let's stay but maybe show a success message.
}

// Ensure "More Resources" link works if this script is loaded on other pages... 
// actually this script is specific to counselors.html page.
