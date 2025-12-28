// Country Flag Mapping
const countryFlags = {
   "United States": "🇺🇸",
   "United Kingdom": "🇬🇧",
   "Canada": "🇨🇦",
   "Australia": "🇦🇺",
   "India": "🇮🇳",
   "Germany": "🇩🇪",
   "France": "🇫🇷",
   "Japan": "🇯🇵",
   "South Africa": "🇿🇦",
   "Brazil": "🇧🇷",
   "Mexico": "🇲🇽"
};

// Mental Health Helplines Data
const helplinesData = {
   "United States": {
      "National": [
         { name: "National Suicide Prevention Lifeline", number: "988", available: "24/7" },
         { name: "Crisis Text Line", number: "Text HOME to 741741", available: "24/7" },
         { name: "SAMHSA National Helpline", number: "1-800-662-4357", available: "24/7" }
      ],
      "California": [
         { name: "California Crisis Line", number: "1-800-273-8255", available: "24/7" },
         { name: "Los Angeles County Mental Health", number: "1-800-854-7771", available: "24/7" },
         { name: "San Francisco Crisis Line", number: "415-781-0500", available: "24/7" }
      ],
      "New York": [
         { name: "NYC Well", number: "1-888-692-9355", available: "24/7" },
         { name: "New York State Crisis Text Line", number: "Text GOT5 to 741741", available: "24/7" },
         { name: "NYC Mental Health Hotline", number: "1-800-LIFENET", available: "24/7" }
      ],
      "Texas": [
         { name: "Texas Crisis Line", number: "1-800-633-5686", available: "24/7" },
         { name: "Dallas Crisis Line", number: "214-828-1000", available: "24/7" },
         { name: "Houston Crisis Line", number: "713-970-7000", available: "24/7" }
      ],
      "Florida": [
         { name: "Florida Crisis Line", number: "1-800-273-8255", available: "24/7" },
         { name: "Miami-Dade Crisis Line", number: "305-358-4357", available: "24/7" }
      ],
      "Illinois": [
         { name: "Illinois Crisis Line", number: "1-800-273-8255", available: "24/7" },
         { name: "Chicago Crisis Line", number: "312-747-4357", available: "24/7" }
      ]
   },
   "United Kingdom": {
      "National": [
         { name: "Samaritans", number: "116 123", available: "24/7" },
         { name: "Crisis Text Line UK", number: "Text SHOUT to 85258", available: "24/7" },
         { name: "Mind Infoline", number: "0300 123 3393", available: "Mon-Fri 9am-6pm" }
      ],
      "England": [
         { name: "NHS 111", number: "111", available: "24/7" },
         { name: "London Crisis Line", number: "0800 587 7397", available: "24/7" }
      ],
      "Scotland": [
         { name: "Breathing Space", number: "0800 83 85 87", available: "Mon-Thu 6pm-2am, Fri 6pm-Mon 6am" },
         { name: "Samaritans Scotland", number: "116 123", available: "24/7" }
      ],
      "Wales": [
         { name: "C.A.L.L. Helpline", number: "0800 132 737", available: "24/7" },
         { name: "Text HELP to 81066", number: "Text HELP to 81066", available: "24/7" }
      ],
      "Northern Ireland": [
         { name: "Lifeline", number: "0808 808 8000", available: "24/7" },
         { name: "Samaritans NI", number: "116 123", available: "24/7" }
      ]
   },
   "Canada": {
      "National": [
         { name: "Crisis Services Canada", number: "1-833-456-4566", available: "24/7" },
         { name: "Text Crisis Text Line", number: "Text HOME to 686868", available: "24/7" },
         { name: "Kids Help Phone", number: "1-800-668-6868", available: "24/7" }
      ],
      "Ontario": [
         { name: "Ontario Mental Health Helpline", number: "1-866-531-2600", available: "24/7" },
         { name: "Toronto Distress Centre", number: "416-408-4357", available: "24/7" }
      ],
      "Quebec": [
         { name: "Quebec Suicide Prevention", number: "1-866-277-3553", available: "24/7" },
         { name: "Montreal Crisis Centre", number: "514-723-4000", available: "24/7" }
      ],
      "British Columbia": [
         { name: "BC Crisis Line", number: "1-800-784-2433", available: "24/7" },
         { name: "Vancouver Crisis Centre", number: "604-872-3311", available: "24/7" }
      ],
      "Alberta": [
         { name: "Alberta Crisis Line", number: "1-800-232-7288", available: "24/7" },
         { name: "Calgary Distress Centre", number: "403-266-4357", available: "24/7" }
      ]
   },
   "Australia": {
      "National": [
         { name: "Lifeline Australia", number: "13 11 14", available: "24/7" },
         { name: "Beyond Blue", number: "1300 22 4636", available: "24/7" },
         { name: "Kids Helpline", number: "1800 55 1800", available: "24/7" }
      ],
      "New South Wales": [
         { name: "NSW Mental Health Line", number: "1800 011 511", available: "24/7" },
         { name: "Sydney Crisis Support", number: "02 9331 2000", available: "24/7" }
      ],
      "Victoria": [
         { name: "Victoria Mental Health Line", number: "1300 651 251", available: "24/7" },
         { name: "Melbourne Crisis Line", number: "13 11 14", available: "24/7" }
      ],
      "Queensland": [
         { name: "Queensland Mental Health Line", number: "1300 642 255", available: "24/7" },
         { name: "Brisbane Crisis Line", number: "13 11 14", available: "24/7" }
      ],
      "Western Australia": [
         { name: "WA Mental Health Emergency", number: "1800 676 822", available: "24/7" },
         { name: "Perth Crisis Line", number: "13 11 14", available: "24/7" }
      ]
   },
   "India": {
      "National": [
         { name: "Vandrevala Foundation", number: "1860 2662 345", available: "24/7" },
         { name: "iCall", number: "022-25521111", available: "Mon-Sat 8am-10pm" },
         { name: "AASRA", number: "91-22-27546669", available: "24/7" }
      ],
      "Maharashtra": [
         { name: "Mumbai Mental Health Helpline", number: "022-25521111", available: "Mon-Sat 8am-10pm" },
         { name: "Pune Crisis Line", number: "020-25521111", available: "24/7" }
      ],
      "Delhi": [
         { name: "Delhi Mental Health Helpline", number: "011-23389090", available: "24/7" },
         { name: "Sneha Foundation Delhi", number: "011-23389090", available: "24/7" }
      ],
      "Karnataka": [
         { name: "Bangalore Crisis Line", number: "080-25722573", available: "24/7" },
         { name: "Karnataka Mental Health", number: "104", available: "24/7" }
      ],
      "Tamil Nadu": [
         { name: "Chennai Mental Health", number: "044-24640050", available: "24/7" },
         { name: "Sneha Chennai", number: "044-24640050", available: "24/7" }
      ]
   },
   "Germany": {
      "National": [
         { name: "Telefonseelsorge", number: "0800 111 0 111", available: "24/7" },
         { name: "Crisis Hotline", number: "0800 111 0 222", available: "24/7" }
      ],
      "Berlin": [
         { name: "Berlin Crisis Service", number: "030 31007700", available: "24/7" }
      ],
      "Bavaria": [
         { name: "Bavaria Crisis Line", number: "0800 6553000", available: "24/7" }
      ]
   },
   "France": {
      "National": [
         { name: "SOS Amitié", number: "09 72 39 40 50", available: "24/7" },
         { name: "Suicide Ecoute", number: "01 45 39 40 00", available: "24/7" }
      ],
      "Paris": [
         { name: "Paris Crisis Line", number: "01 42 96 26 26", available: "24/7" }
      ]
   },
   "Japan": {
      "National": [
         { name: "Inochi no Denwa", number: "0120-783-556", available: "24/7" },
         { name: "Tokyo English Life Line", number: "03-5774-0992", available: "Daily 9am-11pm" }
      ],
      "Tokyo": [
         { name: "Tokyo Crisis Line", number: "03-5286-9090", available: "24/7" }
      ]
   },
   "South Africa": {
      "National": [
         { name: "Lifeline South Africa", number: "0861 322 322", available: "24/7" },
         { name: "SADAG Mental Health Line", number: "011 234 4837", available: "8am-8pm" }
      ],
      "Gauteng": [
         { name: "Johannesburg Crisis Line", number: "011 728 1347", available: "24/7" }
      ],
      "Western Cape": [
         { name: "Cape Town Crisis Line", number: "021 447 9762", available: "24/7" }
      ]
   },
   "Brazil": {
      "National": [
         { name: "CVV - Centro de Valorização da Vida", number: "188", available: "24/7" }
      ],
      "São Paulo": [
         { name: "São Paulo Crisis Line", number: "188", available: "24/7" }
      ],
      "Rio de Janeiro": [
         { name: "Rio Crisis Line", number: "188", available: "24/7" }
      ]
   },
   "Mexico": {
      "National": [
         { name: "Línea de la Vida", number: "800 911 2000", available: "24/7" },
         { name: "SAPTEL", number: "55 5259 8121", available: "24/7" }
      ],
      "Mexico City": [
         { name: "Mexico City Crisis Line", number: "55 5259 8121", available: "24/7" }
      ]
   }
};

// Get all searchable locations
function getAllLocations() {
   const locations = [];
   for (const country in helplinesData) {
      locations.push({ type: "country", name: country, display: country });
      for (const region in helplinesData[country]) {
         if (region !== "National") {
            locations.push({
               type: "region",
               name: `${region}, ${country}`,
               display: `${region}, ${country}`,
               country: country,
               region: region
            });
         }
      }
   }
   return locations;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
   const searchInput = document.getElementById('helplines-search');
   const dropdown = document.getElementById('helplines-dropdown');
   const resultsContainer = document.getElementById('helplines-results');
   const emptyState = document.getElementById('helplines-empty');
   const allLocations = getAllLocations();
   let selectedLocation = null;

   // Show all helplines initially
   displayHelplines(null, null);

   // Handle search input
   searchInput.addEventListener('input', function (e) {
      const query = e.target.value.toLowerCase().trim();

      if (query.length === 0) {
         dropdown.classList.remove('show');
         displayHelplines(null, null);
         return;
      }

      // Filter locations
      const filtered = allLocations.filter(loc =>
         loc.display.toLowerCase().includes(query)
      );

      if (filtered.length > 0) {
         dropdown.innerHTML = filtered.slice(0, 10).map(loc => {
            const countryName = loc.country || loc.name;
            const flag = countryFlags[countryName] || "🌍";
            return `<div class="helplines__dropdown-item" data-location='${JSON.stringify(loc)}'>
               <span class="helplines__dropdown-flag">${flag}</span>
               <strong>${loc.display}</strong>
            </div>`;
         }).join('');
         dropdown.classList.add('show');
      } else {
         dropdown.classList.remove('show');
      }
   });

   // Handle dropdown item click
   dropdown.addEventListener('click', function (e) {
      const item = e.target.closest('.helplines__dropdown-item');
      if (item) {
         selectedLocation = JSON.parse(item.dataset.location);
         searchInput.value = selectedLocation.display;
         dropdown.classList.remove('show');
         displayHelplines(selectedLocation.country || selectedLocation.name, selectedLocation.region);
      }
   });

   // Close dropdown when clicking outside
   document.addEventListener('click', function (e) {
      if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
         dropdown.classList.remove('show');
      }
   });

   // Display helplines based on selection
   function displayHelplines(country, region) {
      resultsContainer.innerHTML = '';
      emptyState.style.display = 'none';

      if (!country) {
         // Show all helplines
         for (const countryName in helplinesData) {
            for (const regionName in helplinesData[countryName]) {
               const helplines = helplinesData[countryName][regionName];
               resultsContainer.appendChild(createHelplineCard(countryName, regionName, helplines));
            }
         }
      } else {
         // Show filtered helplines
         const countryData = helplinesData[country];
         if (!countryData) {
            emptyState.style.display = 'block';
            return;
         }

         if (region) {
            // Show specific region
            const helplines = countryData[region];
            if (helplines) {
               resultsContainer.appendChild(createHelplineCard(country, region, helplines));
            } else {
               emptyState.style.display = 'block';
            }
         } else {
            // Show all regions in country
            for (const regionName in countryData) {
               const helplines = countryData[regionName];
               resultsContainer.appendChild(createHelplineCard(country, regionName, helplines));
            }
         }
      }

      if (resultsContainer.children.length === 0) {
         emptyState.style.display = 'block';
      }
   }

   // Create helpline card
   function createHelplineCard(country, region, helplines) {
      const card = document.createElement('div');
      card.className = 'helplines__card';

      const regionLabel = region === 'National' ? 'National Support' : region;
      const locationText = region === 'National' ? country : `${region}, ${country}`;
      const flag = countryFlags[country] || "🌍";

      card.innerHTML = `
         <div class="helplines__card-header">
            <span class="helplines__flag">${flag}</span>
            <div class="helplines__card-info">
               <h3 class="helplines__card-title">${regionLabel}</h3>
               <p class="helplines__card-location">
                  <i class="ri-map-pin-user-line"></i>
                  ${locationText}
               </p>
            </div>
         </div>
         <div class="helplines__card-content">
            ${helplines.map(helpline => {
         const phoneNumber = helpline.number.replace(/[^\d+]/g, '');
         return `
               <div class="helplines__number">
                  <div class="helplines__number-meta">
                     <span class="helplines__number-label">${helpline.name}</span>
                     ${helpline.available ? `
                     <span class="helplines__number-available">
                        <i class="ri-time-line"></i>
                        ${helpline.available}
                     </span>` : ''}
                  </div>
                  <a href="tel:${phoneNumber}" class="helplines__btn">
                     <i class="ri-phone-fill"></i>
                     Call ${helpline.number}
                  </a>
               </div>
            `;
      }).join('')}
         </div>
      `;

      return card;
   }
});

