// Blog Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Masonry Layout
    initMasonryLayout();
    
    // Mobile Menu Toggle
    initMobileMenu();
    
    // Sidebar Toggle for Mobile
    initSidebarToggle();
    
    // Search Functionality
    initSearchFunctionality();
    
    // Handle window resize events
    window.addEventListener('resize', handleResize);
});

// Initialize Masonry Layout
function initMasonryLayout() {
    const grid = document.querySelector('.masonry-grid');
    if (!grid) return;
    
    // Use ResizeObserver to detect changes in the grid items
    const resizeObserver = new ResizeObserver(entries => {
        // Debounce layout recalculation
        clearTimeout(window.masonryTimeout);
        window.masonryTimeout = setTimeout(() => {
            adjustMasonryLayout();
        }, 100);
    });
    
    // Observe all blog cards
    document.querySelectorAll('.blog-card').forEach(card => {
        resizeObserver.observe(card);
    });
    
    // Initial layout adjustment
    adjustMasonryLayout();
    
    // Also adjust layout when images load
    document.querySelectorAll('.blog-image img').forEach(img => {
        if (img.complete) {
            adjustMasonryLayout();
        } else {
            img.addEventListener('load', adjustMasonryLayout);
        }
    });
}

// Adjust Masonry Layout
function adjustMasonryLayout() {
    // For column-based masonry layout, we don't need to manually adjust heights
    // The browser handles the layout automatically with CSS columns
    
    // Force a reflow to ensure proper layout after content changes
    const grid = document.querySelector('.masonry-grid');
    if (grid) {
        // Apply a small visual update to trigger reflow
        grid.style.opacity = '0.99';
        setTimeout(() => {
            grid.style.opacity = '1';
        }, 50);
        
        // Ensure all blog cards are visible and properly sized
        document.querySelectorAll('.blog-card').forEach(card => {
            card.style.visibility = 'visible';
        });
    }
}

// Mobile Menu Toggle
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
}

// Sidebar Toggle for Mobile
function initSidebarToggle() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebarContent = document.querySelector('.sidebar-content');
    
    if (sidebarToggle && sidebarContent) {
        sidebarToggle.addEventListener('click', function() {
            sidebarContent.classList.toggle('active');
        });
    }
}

// Search Functionality
function initSearchFunctionality() {
    const searchInput = document.getElementById('blog-search');
    const searchButton = document.getElementById('search-button');
    const blogCards = document.querySelectorAll('.blog-card');
    
    if (searchInput && searchButton && blogCards.length > 0) {
        // Search when button is clicked
        searchButton.addEventListener('click', function() {
            performSearch();
        });
        
        // Search when Enter key is pressed
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                performSearch();
            }
        });
        
        function performSearch() {
            const searchTerm = searchInput.value.toLowerCase().trim();
            
            if (searchTerm === '') {
                // Show all cards if search is empty
                blogCards.forEach(card => {
                    card.style.display = 'inline-block';
                });
                return;
            }
            
            // Filter cards based on search term
            blogCards.forEach(card => {
                const title = card.querySelector('h2').textContent.toLowerCase();
                const content = card.querySelector('p').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || content.includes(searchTerm)) {
                    card.style.display = 'inline-block';
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Adjust masonry layout after filtering
            setTimeout(adjustMasonryLayout, 200);
        }
    }
}

// Handle window resize events
function handleResize() {
    // Adjust masonry layout on window resize
    adjustMasonryLayout();
    
    // Handle mobile menu on resize
    const navMenu = document.getElementById('navMenu');
    if (window.innerWidth >= 768 && navMenu) {
        navMenu.classList.remove('active');
    }
    
    // Handle sidebar on resize
    const sidebarContent = document.querySelector('.sidebar-content');
    if (window.innerWidth >= 992 && sidebarContent) {
        sidebarContent.classList.add('active');
    } else if (window.innerWidth < 992 && sidebarContent) {
        sidebarContent.classList.remove('active');
    }
}