// Theme switching functionality
let isDarkTheme = false;

// Initialize the website when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuthStatus();
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize carousel
    initializeCarousel();
    
    // Load sample items for browse section
    loadSampleItems();
    
    // Initialize form handling
    initializeForm();
    
    // Initialize auth forms
    initializeAuthForms();
    
    // Initialize theme toggle
    initializeThemeToggle();
    
    // Initialize swap requests display
    updateSwapRequestsDisplay();
    
    // Initialize admin panel
    initializeAdminPanel();
});

// Authentication system
let currentUser = null;
let users = [
    {
        id: 1,
        name: "Demo User",
        email: "user@demo.com",
        password: "password",
        role: "user",
        joinDate: "2024-01-15",
        itemsListed: 3,
        swapsCompleted: 2
    },
    {
        id: 2,
        name: "Admin User",
        email: "admin@demo.com",
        password: "admin",
        role: "admin",
        joinDate: "2024-01-01",
        itemsListed: 0,
        swapsCompleted: 0
    }
];

// Check authentication status on page load
function checkAuthStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    } else {
        // Show login page by default if not authenticated
        showSection('login');
    }
}

// Update UI based on authentication status
function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    const userInfo = document.getElementById('userInfo');
    const userWelcome = document.getElementById('userWelcome');
    const adminLink = document.querySelector('.admin-only');
    
    if (currentUser) {
        authButtons.style.display = 'none';
        userInfo.style.display = 'flex';
        userWelcome.textContent = `Welcome, ${currentUser.name}!`;
        
        // Show admin link if user is admin
        if (currentUser.role === 'admin') {
            adminLink.style.display = 'block';
        } else {
            adminLink.style.display = 'none';
        }
        
        // Show home page after login
        showSection('home');
    } else {
        authButtons.style.display = 'flex';
        userInfo.style.display = 'none';
        adminLink.style.display = 'none';
    }
}

// Initialize authentication forms
function initializeAuthForms() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            updateAuthUI();
            showAuthSuccess('Login Successful!', `Welcome back, ${user.name}!`);
        } else {
            alert('Invalid email or password. Try the demo accounts!');
        }
    });
    
    // Signup form
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        
        // Validation
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        if (users.find(u => u.email === email)) {
            alert('Email already exists!');
            return;
        }
        
        // Create new user
        const newUser = {
            id: users.length + 1,
            name: name,
            email: email,
            password: password,
            role: "user",
            joinDate: new Date().toISOString().split('T')[0],
            itemsListed: 0,
            swapsCompleted: 0
        };
        
        users.push(newUser);
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        updateAuthUI();
        showAuthSuccess('Account Created!', `Welcome to ReWear, ${name}!`);
    });
}

// Quick login for demo
function quickLogin(type) {
    if (type === 'user') {
        currentUser = users[0]; // Demo user
    } else if (type === 'admin') {
        currentUser = users[1]; // Admin user
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
    showAuthSuccess('Login Successful!', `Welcome, ${currentUser.name}!`);
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI();
    showSection('login');
}

// Show authentication success modal
function showAuthSuccess(title, message) {
    const modal = document.getElementById('authSuccessModal');
    const titleEl = document.getElementById('authSuccessTitle');
    const messageEl = document.getElementById('authSuccessMessage');
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    modal.style.display = 'block';
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 3000);
}

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('href').substring(1);
            
            // Check if user needs to be logged in
            if (!currentUser && ['browse', 'add-item', 'my-swaps', 'admin'].includes(targetSection)) {
                alert('Please login to access this section');
                showSection('login');
                return;
            }
            
            // Check admin access
            if (targetSection === 'admin' && currentUser?.role !== 'admin') {
                alert('Admin access required');
                return;
            }
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            showSection(targetSection);
        });
    });
    
    // Set initial active state based on current section
    const currentSection = document.querySelector('.section.active');
    if (currentSection) {
        const sectionId = currentSection.id;
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        if (navLink) navLink.classList.add('active');
    }
}

// Function to show specific section and hide others
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Load admin data if accessing admin section
    if (sectionId === 'admin') {
        loadAdminData();
    }
}

// Carousel functionality
let currentSlide = 0;
const totalSlides = 3; // Number of carousel items

function initializeCarousel() {
    // Auto-advance carousel every 5 seconds
    setInterval(() => {
        moveCarousel(1);
    }, 5000);
    
    // Initialize first slide
    moveCarousel(0);
}

function moveCarousel(direction) {
    const track = document.getElementById('carouselTrack');
    currentSlide += direction;
    
    // Handle wrap-around
    if (currentSlide >= totalSlides) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    }
    
    // Move the carousel track
    const translateX = -currentSlide * 100;
    track.style.transform = `translateX(${translateX}%)`;
}

// Sample items data for the browse section
const sampleItems = [
    {
        id: 1,
        title: "Vintage Denim Jacket",
        description: "Classic blue denim jacket in excellent condition",
        category: "tops",
        size: "M",
        condition: "excellent",
        owner: "Sarah M.",
        available: true,
        swapRequests: [],
        image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=300"
    },
    {
        id: 2,
        title: "Summer Floral Dress",
        description: "Light and breezy summer dress perfect for warm days",
        category: "tops",
        size: "S",
        condition: "like-new",
        owner: "Emma K.",
        available: true,
        swapRequests: [],
        image: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=300"
    },
    {
        id: 3,
        title: "Black Leather Boots",
        description: "Stylish ankle boots, barely worn",
        category: "shoes",
        size: "8",
        condition: "excellent",
        owner: "Mike R.",
        available: true,
        swapRequests: [],
        image: "https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=300"
    },
    {
        id: 4,
        title: "Designer Jeans",
        description: "High-quality skinny jeans in dark wash",
        category: "bottoms",
        size: "L",
        condition: "good",
        owner: "Alex T.",
        available: false,
        swapRequests: [],
        image: "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=300"
    },
    {
        id: 5,
        title: "Silk Scarf",
        description: "Beautiful patterned silk scarf, perfect accessory",
        category: "accessories",
        size: "One Size",
        condition: "excellent",
        owner: "Lisa P.",
        available: true,
        swapRequests: [],
        image: "https://images.pexels.com/photos/2065195/pexels-photo-2065195.jpeg?auto=compress&cs=tinysrgb&w=300"
    },
    {
        id: 6,
        title: "Running Sneakers",
        description: "Comfortable athletic shoes for daily wear",
        category: "shoes",
        size: "9",
        condition: "good",
        owner: "John D.",
        available: true,
        swapRequests: [],
        image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=300"
    }
];

// User data and swap management
let userItems = []; // Items owned by current user
let swapRequests = []; // All swap requests
let completedSwaps = []; // Completed swaps history

// User's items that they can offer for swaps
const myItems = [
    {
        id: 101,
        title: "Blue Cotton T-Shirt",
        description: "Comfortable everyday t-shirt",
        category: "tops",
        size: "M",
        condition: "good",
        owner: "Demo User",
        available: true,
        image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=300"
    },
    {
        id: 102,
        title: "Black Jeans",
        description: "Classic black denim jeans",
        category: "bottoms",
        size: "L",
        condition: "excellent",
        owner: "Demo User",
        available: true,
        image: "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=300"
    }
];

// Load and display sample items
function loadSampleItems() {
    displayItems(sampleItems);
}

// Function to display items in the grid
function displayItems(items) {
    const itemsGrid = document.getElementById('itemsGrid');
    itemsGrid.innerHTML = '';
    
    items.forEach(item => {
        const itemCard = createItemCard(item);
        itemsGrid.appendChild(itemCard);
    });
}

// Create individual item card element
function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.setAttribute('data-category', item.category);
    
    const availabilityStatus = item.available ? 
        '<span class="availability available">Available</span>' : 
        '<span class="availability unavailable">Not Available</span>';
    
    const swapButton = item.available && item.owner !== currentUser?.name ? 
        `<button class="btn btn-primary swap-btn" onclick="openSwapModal(${item.id})">Request Swap</button>` : 
        item.owner === currentUser?.name ? 
        '<span class="owner-badge">Your Item</span>' : 
        '<button class="btn btn-secondary" disabled>Unavailable</button>';
    
    card.innerHTML = `
        <img src="${item.image}" alt="${item.title}">
        <div class="item-card-content">
            <h4>${item.title}</h4>
            <p>${item.description}</p>
            <p><strong>Size:</strong> ${item.size}</p>
            <p><strong>Condition:</strong> ${item.condition}</p>
            <p><strong>Owner:</strong> ${item.owner}</p>
            ${availabilityStatus}
            <span class="item-category">${item.category}</span>
            <div class="swap-actions">
                ${swapButton}
            </div>
        </div>
    `;
    
    return card;
}

// Filter functionality for browse section
function filterItems(category) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const itemCards = document.querySelectorAll('.item-card');
    
    // Update active filter button
    filterButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter items with animation
    itemCards.forEach(card => {
        const itemCategory = card.getAttribute('data-category');
        
        if (category === 'all' || itemCategory === category) {
            card.style.display = 'block';
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            // Animate in
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(-20px)';
            
            // Hide after animation
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

// Form handling functionality
function initializeForm() {
    const form = document.getElementById('addItemForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            title: document.getElementById('itemTitle').value,
            description: document.getElementById('itemDescription').value,
            category: document.getElementById('itemCategory').value,
            size: document.getElementById('itemSize').value,
            condition: document.getElementById('itemCondition').value,
            image: document.getElementById('itemImage').value || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300'
        };
        
        // Validate form
        if (validateForm(formData)) {
            // Add item to sample items array
            const newItem = {
                id: sampleItems.length + 1,
                owner: currentUser.name,
                available: true,
                swapRequests: [],
                ...formData
            };
            
            sampleItems.push(newItem);
            
            // Show success modal
            showSuccessModal();
            
            // Reset form
            form.reset();
            
            // Update browse section with new item
            displayItems(sampleItems);
        }
    });
}

// Swap functionality
function openSwapModal(itemId) {
    const item = sampleItems.find(i => i.id === itemId);
    if (!item) return;
    
    const modal = document.getElementById('swapModal');
    const itemDetails = document.getElementById('swapItemDetails');
    const myItemsSelect = document.getElementById('myItemsSelect');
    
    // Display item details
    itemDetails.innerHTML = `
        <h4>Requesting: ${item.title}</h4>
        <p>Owner: ${item.owner}</p>
        <p>Size: ${item.size} | Condition: ${item.condition}</p>
    `;
    
    // Populate user's items for swap
    myItemsSelect.innerHTML = '<option value="">Select an item to offer</option>';
    myItems.forEach(myItem => {
        if (myItem.available) {
            myItemsSelect.innerHTML += `<option value="${myItem.id}">${myItem.title} (${myItem.size})</option>`;
        }
    });
    
    // Store the item ID for the swap request
    modal.setAttribute('data-item-id', itemId);
    modal.style.display = 'block';
}

function submitSwapRequest() {
    const modal = document.getElementById('swapModal');
    const itemId = parseInt(modal.getAttribute('data-item-id'));
    const myItemId = parseInt(document.getElementById('myItemsSelect').value);
    const message = document.getElementById('swapMessage').value;
    
    if (!myItemId) {
        alert('Please select an item to offer for the swap');
        return;
    }
    
    const requestedItem = sampleItems.find(i => i.id === itemId);
    const offeredItem = myItems.find(i => i.id === myItemId);
    
    // Create swap request
    const swapRequest = {
        id: Date.now(),
        requestedItem: requestedItem,
        offeredItem: offeredItem,
        requester: currentUser.name,
        owner: requestedItem.owner,
        message: message,
        status: 'pending',
        date: new Date().toLocaleDateString(),
        adminStatus: 'pending' // For admin approval
    };
    
    swapRequests.push(swapRequest);
    
    // Add request to the item
    requestedItem.swapRequests.push(swapRequest.id);
    
    closeSwapModal();
    showSwapConfirmation();
    
    // Update the display
    displayItems(sampleItems);
    updateSwapRequestsDisplay();
}

function closeSwapModal() {
    const modal = document.getElementById('swapModal');
    modal.style.display = 'none';
    document.getElementById('swapMessage').value = '';
    document.getElementById('myItemsSelect').value = '';
    modal.removeAttribute('data-item-id');
}

function showSwapConfirmation() {
    const modal = document.getElementById('swapConfirmationModal');
    modal.style.display = 'block';
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 3000);
}

// Display swap requests
function updateSwapRequestsDisplay() {
    const container = document.getElementById('swapRequestsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (swapRequests.length === 0) {
        container.innerHTML = '<p>No swap requests yet. Start browsing items to make your first swap!</p>';
        return;
    }
    
    swapRequests.forEach(request => {
        const requestCard = document.createElement('div');
        requestCard.className = 'swap-request-card';
        
        const statusClass = request.status === 'pending' ? 'status-pending' : 
                           request.status === 'accepted' ? 'status-accepted' : 'status-rejected';
        
        requestCard.innerHTML = `
            <div class="swap-request-header">
                <h4>Swap Request</h4>
                <span class="swap-status ${statusClass}">${request.status.toUpperCase()}</span>
            </div>
            <div class="swap-items">
                <div class="swap-item">
                    <h5>You Offered:</h5>
                    <p>${request.offeredItem.title}</p>
                    <small>Size: ${request.offeredItem.size}</small>
                </div>
                <div class="swap-arrow">⇄</div>
                <div class="swap-item">
                    <h5>You Requested:</h5>
                    <p>${request.requestedItem.title}</p>
                    <small>From: ${request.owner}</small>
                </div>
            </div>
            ${request.message ? `<p class="swap-message"><strong>Message:</strong> ${request.message}</p>` : ''}
            <p class="swap-date">Requested on: ${request.date}</p>
            ${request.status === 'pending' ? 
                `<button class="btn btn-secondary" onclick="cancelSwapRequest(${request.id})">Cancel Request</button>` : 
                ''}
        `;
        
        container.appendChild(requestCard);
    });
}

function cancelSwapRequest(requestId) {
    const requestIndex = swapRequests.findIndex(r => r.id === requestId);
    if (requestIndex > -1) {
        swapRequests.splice(requestIndex, 1);
        updateSwapRequestsDisplay();
        displayItems(sampleItems);
    }
}

// Simulate accepting a swap (for demo purposes)
function simulateSwapResponse() {
    if (swapRequests.length > 0) {
        const randomRequest = swapRequests[Math.floor(Math.random() * swapRequests.length)];
        if (randomRequest.status === 'pending') {
            randomRequest.status = Math.random() > 0.3 ? 'accepted' : 'rejected';
            
            if (randomRequest.status === 'accepted') {
                // Mark items as unavailable
                randomRequest.requestedItem.available = false;
                const myItem = myItems.find(i => i.id === randomRequest.offeredItem.id);
                if (myItem) myItem.available = false;
                
                // Add to completed swaps
                completedSwaps.push({
                    ...randomRequest,
                    completedDate: new Date().toLocaleDateString()
                });
            }
            
            updateSwapRequestsDisplay();
            displayItems(sampleItems);
            
            // Show notification
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.innerHTML = `
                <p>Swap request ${randomRequest.status}! Check your requests.</p>
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 4000);
        }
    }
}

// Form validation
function validateForm(data) {
    const requiredFields = ['title', 'description', 'category', 'size', 'condition'];
    
    for (let field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
            return false;
        }
    }
    
    // Validate image URL if provided
    if (data.image && !isValidUrl(data.image)) {
        alert('Please enter a valid image URL');
        return false;
    }
    
    return true;
}

// URL validation helper
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Show success modal
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'block';
    
    // Auto-close modal after 3 seconds
    setTimeout(() => {
        closeModal();
    }, 3000);
}

// Close modal
function closeModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'none';
}

// Theme toggle functionality
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    themeToggle.addEventListener('click', function() {
        toggleTheme();
    });
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('themeToggle').textContent = '☀️';
    }
}

// Toggle between light and dark themes
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        document.getElementById('themeToggle').textContent = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('themeToggle').textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    }
}

// Close modal when clicking outside of it
window.addEventListener('click', function(event) {
    const successModal = document.getElementById('successModal');
    const swapModal = document.getElementById('swapModal');
    const authModal = document.getElementById('authSuccessModal');
    
    if (event.target === successModal) {
        closeModal();
    }
    if (event.target === swapModal) {
        closeSwapModal();
    }
    if (event.target === authModal) {
        authModal.style.display = 'none';
    }
});

// Admin Panel Functionality
function initializeAdminPanel() {
    // Initialize admin tabs
    const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
    adminTabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            showAdminTab(tabName);
        });
    });
}

function showAdminTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.admin-tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(`admin-${tabName}`).classList.add('active');
    
    // Update active tab button
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Load data for the selected tab
    loadAdminData();
}

function loadAdminData() {
    loadAdminSwapRequests();
    loadAdminItems();
    loadAdminUsers();
}

// Load pending swap requests for admin
function loadAdminSwapRequests() {
    const container = document.getElementById('adminSwapRequestsContainer');
    if (!container) return;
    
    const pendingSwaps = swapRequests.filter(request => request.adminStatus === 'pending');
    
    container.innerHTML = '';
    
    if (pendingSwaps.length === 0) {
        container.innerHTML = '<p>No pending swap requests.</p>';
        return;
    }
    
    pendingSwaps.forEach(request => {
        const swapCard = document.createElement('div');
        swapCard.className = 'admin-swap-card';
        
        swapCard.innerHTML = `
            <div class="admin-swap-header">
                <h4>Swap Request #${request.id}</h4>
                <span class="swap-status status-pending">PENDING ADMIN APPROVAL</span>
            </div>
            <div class="swap-items">
                <div class="swap-item">
                    <h5>${request.requester} Offers:</h5>
                    <p>${request.offeredItem.title}</p>
                    <small>Size: ${request.offeredItem.size} | Condition: ${request.offeredItem.condition}</small>
                </div>
                <div class="swap-arrow">⇄</div>
                <div class="swap-item">
                    <h5>Requesting from ${request.owner}:</h5>
                    <p>${request.requestedItem.title}</p>
                    <small>Size: ${request.requestedItem.size} | Condition: ${request.requestedItem.condition}</small>
                </div>
            </div>
            ${request.message ? `<p class="swap-message"><strong>Message:</strong> ${request.message}</p>` : ''}
            <p class="swap-date">Requested on: ${request.date}</p>
            <div class="admin-actions">
                <button class="btn btn-primary" onclick="approveSwapRequest(${request.id})">Approve</button>
                <button class="btn btn-secondary" onclick="rejectSwapRequest(${request.id})">Reject</button>
            </div>
        `;
        
        container.appendChild(swapCard);
    });
}

// Load all items for admin
function loadAdminItems() {
    const container = document.getElementById('adminItemsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    sampleItems.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'admin-item-card';
        
        itemCard.innerHTML = `
            <div class="admin-item-info">
                <h4>${item.title}</h4>
                <p>Owner: ${item.owner} | Size: ${item.size} | Condition: ${item.condition}</p>
                <p>Category: ${item.category} | Available: ${item.available ? 'Yes' : 'No'}</p>
            </div>
            <div class="admin-actions">
                <button class="btn btn-secondary" onclick="removeItem(${item.id})">Remove Item</button>
            </div>
        `;
        
        container.appendChild(itemCard);
    });
}

// Load users for admin
function loadAdminUsers() {
    const container = document.getElementById('adminUsersContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    users.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'admin-user-card';
        
        userCard.innerHTML = `
            <div>
                <h4>${user.name}</h4>
                <p>Email: ${user.email}</p>
                <p>Role: ${user.role} | Joined: ${user.joinDate}</p>
            </div>
            <div class="user-stats">
                <div class="stat">
                    <div class="stat-number">${user.itemsListed}</div>
                    <div class="stat-label">Items Listed</div>
                </div>
                <div class="stat">
                    <div class="stat-number">${user.swapsCompleted}</div>
                    <div class="stat-label">Swaps Completed</div>
                </div>
            </div>
        `;
        
        container.appendChild(userCard);
    });
}

// Admin actions
function approveSwapRequest(requestId) {
    const request = swapRequests.find(r => r.id === requestId);
    if (request) {
        request.adminStatus = 'approved';
        request.status = 'accepted'; // Also update user-facing status
        
        // Mark items as unavailable
        request.requestedItem.available = false;
        const myItem = myItems.find(i => i.id === request.offeredItem.id);
        if (myItem) myItem.available = false;
        
        // Update user stats
        const requesterUser = users.find(u => u.name === request.requester);
        const ownerUser = users.find(u => u.name === request.owner);
        if (requesterUser) requesterUser.swapsCompleted++;
        if (ownerUser) ownerUser.swapsCompleted++;
        
        loadAdminData();
        updateSwapRequestsDisplay();
        displayItems(sampleItems);
        
        showNotification('Swap request approved successfully!');
    }
}

function rejectSwapRequest(requestId) {
    const request = swapRequests.find(r => r.id === requestId);
    if (request) {
        request.adminStatus = 'rejected';
        request.status = 'rejected'; // Also update user-facing status
        
        loadAdminData();
        updateSwapRequestsDisplay();
        
        showNotification('Swap request rejected.');
    }
}

function removeItem(itemId) {
    if (confirm('Are you sure you want to remove this item?')) {
        const itemIndex = sampleItems.findIndex(item => item.id === itemId);
        if (itemIndex > -1) {
            sampleItems.splice(itemIndex, 1);
            loadAdminData();
            displayItems(sampleItems);
            showNotification('Item removed successfully!');
        }
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `<p>${message}</p>`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

const token = localStorage.getItem("token");

fetch(`${API}/api/users/${userId}`, {
  headers: {
    "Authorization": `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => {
    // handle user data
    console.log(data);
  });

fetch(`${API}/api/auth/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ email, password })
})
.then(res => res.json())
.then(data => {
  // Save token
  localStorage.setItem("token", data.token);
});

const API_URL = "http://localhost:3000";  // This must match your backend server

function handleLogin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  login(email, password); // call function from step 2
}

async function login(email, password) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (response.ok) {
    // Save token (used to access private routes later)
    localStorage.setItem("token", data.token);
    alert("Login successful!");
  } else {
    alert("Login failed: " + data.message);
  }
}
const ken = localStorage.getItem("token");

fetch(`${API_URL}/api/users/12345`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
