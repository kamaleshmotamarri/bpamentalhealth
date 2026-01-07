/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById('nav-menu'),
   navToggle = document.getElementById('nav-toggle'),
   navClose = document.getElementById('nav-close')

/* Menu show */
if (navToggle) {
   navToggle.addEventListener('click', () => {
      navMenu.classList.add('show-menu')
   })
}

/* Menu hidden */
if (navClose) {
   navClose.addEventListener('click', () => {
      navMenu.classList.remove('show-menu')
   })
}

/*=============== REMOVE MENU MOBILE ===============*/
const navLink = document.querySelectorAll('.nav__link')

const linkAction = () => {
   const navMenu = document.getElementById('nav-menu')
   // When we click on each nav__link, we remove the show-menu class
   navMenu.classList.remove('show-menu')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

/*=============== ADD SHADOW HEADER ===============*/
const shadowHeader = () => {
   const header = document.getElementById('header')
   // Add a class if the bottom offset is greater than 50 of the viewport
   this.scrollY >= 50 ? header.classList.add('shadow-header')
      : header.classList.remove('shadow-header')
}
window.addEventListener('scroll', shadowHeader)

/*=============== SWIPER PRICES ===============*/
const swiperPrices = new Swiper('.prices__swiper', {
   loop: true,
   grabCursor: true,
   spaceBetween: 24,

   pagination: {
      el: '.swiper-pagination',
      clickable: true,
   },

   autoplay: {
      delay: 3000,
      disableOnInteraction: false,
   },
})

/*=============== SHOW SCROLL UP ===============*/
const scrollUp = () => {
   const scrollUp = document.getElementById('scroll-up')
   // When the scroll is higher than 350 viewport height, add the show-scroll class to the a tag with the scrollup class
   this.scrollY >= 350 ? scrollUp.classList.add('show-scroll')
      : scrollUp.classList.remove('show-scroll')
}
window.addEventListener('scroll', scrollUp)

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll('section[id]')

const scrollActive = () => {
   const scrollDown = window.scrollY

   sections.forEach(current => {
      const sectionHeight = current.offsetHeight,
         sectionTop = current.offsetTop - 58,
         sectionId = current.getAttribute('id'),
         sectionsClass = document.querySelector('.nav__menu a[href*=' + sectionId + ']')

      if (scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight) {
         sectionsClass.classList.add('active-link')
      } else {
         sectionsClass.classList.remove('active-link')
      }
   })
}
window.addEventListener('scroll', scrollActive)

/*=============== SETTINGS BUTTON ===============*/
const settingsButton = document.getElementById('settings-button')

// Open settings modal when settings button is clicked
if (settingsButton) {
   settingsButton.addEventListener('click', () => {
      if (window.openSettingsModal) {
         window.openSettingsModal()
      } else {
         console.warn('[Main] openSettingsModal function not available. Make sure settings.js is loaded.')
      }
   })
}

/*=============== SCROLL REVEAL ANIMATION ===============*/
const sr = ScrollReveal({
   origin: 'top',
   distance: '60px',
   duration: 2000,
   // reset: true, // Animations repeat
})

sr.reveal(`.home__content`, { origin: 'bottom' })
sr.reveal(`.home__info`, { origin: 'bottom', delay: 800 })
sr.reveal(`.home__data`, { delay: 1400 })
sr.reveal(`.home__button`, { origin: 'left', delay: 1800 })

sr.reveal(`.delivery__data`, { origin: 'right' })
sr.reveal(`.delivery__content`, { origin: 'left', delay: 600 })
sr.reveal(`.delivery__img`, { delay: 1200 })

sr.reveal(`.about__data, .contact__map`, { origin: 'left' })
sr.reveal(`.about__img, .contact__data`, { origin: 'right' })

sr.reveal(`.prices__box`)
sr.reveal(`.prices__swiper`, { origin: 'bottom', delay: 600 })

sr.reveal(`.gallery__image`, { interval: 100 })

sr.reveal(`.disorders__card`, { interval: 100, origin: 'bottom' })
sr.reveal(`.resources__card`, { interval: 100, origin: 'bottom' })

sr.reveal(`.footer__container`)
