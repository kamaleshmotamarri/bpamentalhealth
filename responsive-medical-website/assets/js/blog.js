/*=============== BLOG FILTERS & SEARCH ===============*/
document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.blog__filter-btn')
    const blogCards = document.querySelectorAll('.blog__card')
    const searchInput = document.getElementById('blog-search-input')

    // Category Filter Functionality
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active-filter'))
                // Add active class to clicked button
                btn.classList.add('active-filter')

                const filterValue = btn.getAttribute('data-filter')

                blogCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category')

                    // Logic for showing/hiding cards
                    if (filterValue === 'all' || filterValue === cardCategory) {
                        card.style.display = 'flex'
                        // Small timeout to allow display change to render before opacity transition
                        setTimeout(() => {
                            card.style.opacity = '1'
                            card.style.transform = 'translateY(0)'
                        }, 10)
                    } else {
                        card.style.opacity = '0'
                        card.style.transform = 'translateY(20px)'
                        // Wait for transition to finish before hiding
                        setTimeout(() => {
                            if (card.style.opacity === '0') { // Check if still hidden
                                card.style.display = 'none'
                            }
                        }, 400)
                    }
                })
            })
        })
    }

    // Search Functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchValue = e.target.value.toLowerCase()

            blogCards.forEach(card => {
                const title = card.querySelector('.blog__title').textContent.toLowerCase()
                const excerpt = card.querySelector('.blog__excerpt').textContent.toLowerCase()
                const category = card.querySelector('.blog__tag') ? card.querySelector('.blog__tag').textContent.toLowerCase() : ''

                if (title.includes(searchValue) || excerpt.includes(searchValue) || category.includes(searchValue)) {
                    card.style.display = 'flex'
                    setTimeout(() => {
                        card.style.opacity = '1'
                        card.style.transform = 'translateY(0)'
                    }, 10)
                } else {
                    card.style.opacity = '0'
                    card.style.transform = 'translateY(20px)'
                    setTimeout(() => {
                        if (card.style.opacity === '0') {
                            card.style.display = 'none'
                        }
                    }, 400)
                }
            })
        })
    }
})
