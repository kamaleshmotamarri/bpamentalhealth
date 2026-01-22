/*=============== DISORDER MODAL ===============*/

// Disorder information data
const disorderData = {
   anxiety: {
      title: 'Anxiety Disorders',
      about: 'Anxiety disorders are a group of mental health conditions characterized by excessive worry, fear, or nervousness that can interfere with daily activities. These feelings are persistent and often out of proportion to the actual situation.',
      symptoms: [
         'Excessive worry or fear',
         'Restlessness or feeling on edge',
         'Difficulty concentrating',
         'Irritability',
         'Muscle tension',
         'Sleep disturbances',
         'Rapid heartbeat or shortness of breath',
         'Avoidance of anxiety-provoking situations'
      ],
      actions: [
         'Seek professional help from a therapist or counselor',
         'Practice relaxation techniques like deep breathing or meditation',
         'Engage in regular physical exercise',
         'Maintain a healthy sleep schedule',
         'Limit caffeine and alcohol intake',
         'Connect with supportive friends and family',
         'Consider cognitive-behavioral therapy (CBT)',
         'In severe cases, medication may be recommended by a healthcare provider'
      ]
   },
   depression: {
      title: 'Depression',
      about: 'Depression is a common but serious mood disorder that causes persistent feelings of sadness, hopelessness, and loss of interest in activities. It affects how you think, feel, and handle daily activities.',
      symptoms: [
         'Persistent sad, anxious, or "empty" mood',
         'Loss of interest or pleasure in activities once enjoyed',
         'Feelings of hopelessness or pessimism',
         'Fatigue or decreased energy',
         'Difficulty concentrating, remembering, or making decisions',
         'Changes in appetite or weight',
         'Sleep disturbances (insomnia or oversleeping)',
         'Thoughts of death or suicide'
      ],
      actions: [
         'Reach out to a mental health professional immediately',
         'Talk to someone you trust about your feelings',
         'Establish a daily routine with regular sleep and meals',
         'Engage in physical activity, even light exercise',
         'Avoid isolation - stay connected with others',
         'Consider therapy options like CBT or interpersonal therapy',
         'Medication may be prescribed by a healthcare provider',
         'If you have thoughts of self-harm, contact a crisis helpline immediately'
      ]
   },
   bipolar: {
      title: 'Bipolar Disorder',
      about: 'Bipolar disorder is a mental health condition that causes extreme mood swings that include emotional highs (mania or hypomania) and lows (depression). These mood swings can affect sleep, energy, activity, judgment, and behavior.',
      symptoms: [
         'Periods of elevated mood (mania) or less severe hypomania',
         'Depressive episodes with sadness and hopelessness',
         'Rapid mood changes',
         'Increased energy and activity during manic phases',
         'Decreased need for sleep',
         'Racing thoughts and rapid speech',
         'Impulsive or risky behavior',
         'Difficulty concentrating'
      ],
      actions: [
         'Seek professional diagnosis and treatment from a psychiatrist',
         'Take prescribed medications consistently (mood stabilizers)',
         'Attend regular therapy sessions',
         'Maintain a regular sleep schedule',
         'Track mood changes in a journal',
         'Avoid alcohol and drugs',
         'Build a strong support network',
         'Learn to recognize early warning signs of mood episodes'
      ]
   },
   ptsd: {
      title: 'Post-Traumatic Stress Disorder (PTSD)',
      about: 'PTSD is a mental health condition triggered by experiencing or witnessing a terrifying event. Symptoms may include flashbacks, nightmares, severe anxiety, and uncontrollable thoughts about the event.',
      symptoms: [
         'Intrusive memories or flashbacks of the traumatic event',
         'Avoidance of reminders of the trauma',
         'Negative changes in thinking and mood',
         'Hypervigilance or being easily startled',
         'Sleep disturbances and nightmares',
         'Emotional numbness',
         'Irritability or angry outbursts',
         'Feelings of guilt or shame'
      ],
      actions: [
         'Seek professional help from a trauma-informed therapist',
         'Consider trauma-focused therapies like EMDR or exposure therapy',
         'Join a support group for trauma survivors',
         'Practice grounding techniques during flashbacks',
         'Establish a safe and predictable routine',
         'Engage in relaxation and stress-reduction activities',
         'Avoid self-medicating with alcohol or drugs',
         'Be patient with yourself - recovery takes time'
      ]
   },
   schizophrenia: {
      title: 'Schizophrenia',
      about: 'Schizophrenia is a serious mental disorder that affects how a person thinks, feels, and behaves. People with schizophrenia may seem like they have lost touch with reality, which can be distressing for them and their loved ones.',
      symptoms: [
         'Hallucinations (seeing or hearing things that aren\'t there)',
         'Delusions (false beliefs)',
         'Disorganized thinking and speech',
         'Difficulty concentrating',
         'Lack of motivation',
         'Social withdrawal',
         'Flat affect (reduced emotional expression)',
         'Cognitive difficulties'
      ],
      actions: [
         'Seek immediate professional help from a psychiatrist',
         'Take prescribed antipsychotic medications as directed',
         'Participate in psychosocial treatments and therapy',
         'Join support groups for individuals and families',
         'Maintain regular medical appointments',
         'Avoid alcohol and recreational drugs',
         'Establish a structured daily routine',
         'Ensure family members are educated about the condition'
      ]
   },
   ocd: {
      title: 'Obsessive-Compulsive Disorder (OCD)',
      about: 'OCD is a mental health disorder characterized by unwanted, recurring thoughts (obsessions) and repetitive behaviors (compulsions) that the person feels driven to perform. These obsessions and compulsions interfere with daily activities and cause significant distress.',
      symptoms: [
         'Recurrent, unwanted thoughts (obsessions)',
         'Repetitive behaviors or mental acts (compulsions)',
         'Excessive cleaning or handwashing',
         'Repeated checking of things',
         'Counting, repeating, or arranging things',
         'Fear of contamination',
         'Unwanted sexual or violent thoughts',
         'Need for symmetry or exactness'
      ],
      actions: [
         'Seek treatment from a mental health professional specializing in OCD',
         'Consider Exposure and Response Prevention (ERP) therapy',
         'Take prescribed medications (SSRIs) as directed',
         'Learn about OCD to better understand your condition',
         'Practice mindfulness and relaxation techniques',
         'Join an OCD support group',
         'Avoid avoiding - gradually face your fears with professional guidance',
         'Be patient - treatment takes time but is effective'
      ]
   },
   eating: {
      title: 'Eating Disorders',
      about: 'Eating disorders are serious mental health conditions characterized by unhealthy eating habits, preoccupation with food, body weight, and shape. They can have severe physical and psychological consequences.',
      symptoms: [
         'Extreme restriction of food intake',
         'Binge eating episodes',
         'Purging behaviors (vomiting, laxative use)',
         'Excessive exercise',
         'Preoccupation with body weight and shape',
         'Distorted body image',
         'Avoidance of social situations involving food',
         'Physical symptoms like fatigue, dizziness, or hair loss'
      ],
      actions: [
         'Seek professional help from an eating disorder specialist',
         'Consider a treatment team approach (therapist, dietitian, physician)',
         'Address underlying psychological issues',
         'Work on developing a healthy relationship with food',
         'Challenge negative thoughts about body image',
         'Join a support group for eating disorder recovery',
         'Focus on health rather than weight',
         'Be patient and kind to yourself during recovery'
      ]
   },
   adhd: {
      title: 'Attention-Deficit/Hyperactivity Disorder (ADHD)',
      about: 'ADHD is a neurodevelopmental disorder characterized by persistent patterns of inattention, hyperactivity, and impulsivity that interfere with functioning or development. It affects both children and adults.',
      symptoms: [
         'Difficulty paying attention or focusing',
         'Hyperactivity or restlessness',
         'Impulsive behavior',
         'Difficulty organizing tasks',
         'Forgetfulness and losing things',
         'Difficulty following through on instructions',
         'Easily distracted',
         'Difficulty waiting or taking turns'
      ],
      actions: [
         'Get a professional evaluation and diagnosis',
         'Consider medication if recommended by a healthcare provider',
         'Work with a therapist or ADHD coach',
         'Use organizational tools and strategies',
         'Break tasks into smaller, manageable steps',
         'Establish routines and structure',
         'Practice mindfulness and meditation',
         'Consider accommodations at school or work if needed'
      ]
   }
}

// Get modal elements
const disorderModal = document.getElementById('disorder-modal')
const disorderModalTitle = document.getElementById('disorder-modal-title')
const disorderModalAbout = document.getElementById('disorder-modal-about')
const disorderModalSymptoms = document.getElementById('disorder-modal-symptoms')
const disorderModalActions = document.getElementById('disorder-modal-actions')
const disorderModalWikipedia = document.getElementById('disorder-modal-wikipedia')
const disorderModalClose = document.getElementById('disorder-modal-close')

// Get all disorder cards
const disorderCards = document.querySelectorAll('.disorders__card')
const infoButtons = document.querySelectorAll('.disorders__info-btn')

// Function to open modal with disorder information
function openDisorderModal(disorderKey) {
   const disorder = disorderData[disorderKey]
   if (!disorder) return

   // Set modal content
   disorderModalTitle.textContent = disorder.title
   disorderModalAbout.textContent = disorder.about

   // Clear and populate symptoms
   disorderModalSymptoms.innerHTML = ''
   disorder.symptoms.forEach(symptom => {
      const li = document.createElement('li')
      li.textContent = symptom
      disorderModalSymptoms.appendChild(li)
   })

   // Clear and populate actions
   disorderModalActions.innerHTML = ''
   disorder.actions.forEach(action => {
      const li = document.createElement('li')
      li.textContent = action
      disorderModalActions.appendChild(li)
   })

   // Set Wikipedia link
   const card = document.querySelector(`[data-disorder="${disorderKey}"]`)
   if (card) {
      const wikipediaUrl = card.getAttribute('data-wikipedia')
      disorderModalWikipedia.href = wikipediaUrl
   }

   // Show modal
   disorderModal.classList.add('show')
   document.body.style.overflow = 'hidden'
}

// Function to close modal
function closeDisorderModal() {
   disorderModal.classList.remove('show')
   document.body.style.overflow = ''
}

// Add event listeners to info buttons
infoButtons.forEach(button => {
   button.addEventListener('click', (e) => {
      e.stopPropagation() // Prevent card click
      const card = button.closest('.disorders__card')
      const disorderKey = card.getAttribute('data-disorder')
      openDisorderModal(disorderKey)
   })
})

// Add event listeners to cards (for Wikipedia navigation)
disorderCards.forEach(card => {
   card.addEventListener('click', (e) => {
      // Only navigate if the click wasn't on the info button
      if (!e.target.closest('.disorders__info-btn')) {
         const wikipediaUrl = card.getAttribute('data-wikipedia')
         if (wikipediaUrl) {
            window.open(wikipediaUrl, '_blank')
         }
      }
   })
})

// Close modal when close button is clicked
if (disorderModalClose) {
   disorderModalClose.addEventListener('click', closeDisorderModal)
}

// Close modal when clicking outside the content
disorderModal.addEventListener('click', (e) => {
   if (e.target === disorderModal) {
      closeDisorderModal()
   }
})

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
   if (e.key === 'Escape' && disorderModal.classList.contains('show')) {
      closeDisorderModal()
   }
})
