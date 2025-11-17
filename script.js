// Mobile Navigation Toggle - Support for touch events
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
    // Support both click and touch events
    const toggleMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navMenu.classList.toggle('active');
        // Prevent body scroll when menu is open
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    };
    
    navToggle.addEventListener('click', toggleMenu);
    navToggle.addEventListener('touchend', toggleMenu);

    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        const closeMenu = () => {
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        };
        link.addEventListener('click', closeMenu);
        link.addEventListener('touchend', closeMenu);
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !navToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Product Filter
const filterButtons = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');

        const category = button.getAttribute('data-category');

        productCards.forEach(card => {
            if (category === 'all' || card.getAttribute('data-category') === category) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 10);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Newsletter Form
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        alert(`Grazie per la tua iscrizione! Ti invieremo le nostre novità a ${email}`);
        newsletterForm.reset();
    });
}

// Product Card Interactions - Contact Dropdown
document.addEventListener('DOMContentLoaded', function() {
    // Handle contact dropdown menus - Support for touch events
    const contactButtons = document.querySelectorAll('.btn-info[data-dropdown]');
    
    contactButtons.forEach(button => {
        const handleToggle = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const dropdownId = this.getAttribute('data-dropdown');
            const dropdown = document.getElementById(dropdownId);
            if (!dropdown) return;
            
            const isOpen = dropdown.classList.contains('show');
            
            // Close all other dropdowns
            document.querySelectorAll('.contact-dropdown-menu.show').forEach(menu => {
                if (menu !== dropdown) {
                    menu.classList.remove('show');
                }
            });
            
            // Toggle current dropdown
            if (isOpen) {
                dropdown.classList.remove('show');
            } else {
                dropdown.classList.add('show');
                // On mobile, add overlay
                if (window.innerWidth <= 768) {
                    const overlay = document.createElement('div');
                    overlay.className = 'dropdown-overlay';
                    overlay.style.cssText = `
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.5);
                        z-index: 999;
                        -webkit-animation: fadeIn 0.3s ease;
                        animation: fadeIn 0.3s ease;
                    `;
                    overlay.addEventListener('click', () => {
                        dropdown.classList.remove('show');
                        overlay.remove();
                    });
                    overlay.addEventListener('touchend', () => {
                        dropdown.classList.remove('show');
                        overlay.remove();
                    });
                    document.body.appendChild(overlay);
                    dropdown.dataset.overlay = 'true';
                }
            }
        };
        
        button.addEventListener('click', handleToggle);
        button.addEventListener('touchend', handleToggle);
    });
    
    // Close dropdowns when clicking outside
    const closeDropdowns = function(e) {
        if (!e.target.closest('.contact-dropdown')) {
            document.querySelectorAll('.contact-dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
                const overlay = document.querySelector('.dropdown-overlay');
                if (overlay) overlay.remove();
            });
        }
    };
    
    document.addEventListener('click', closeDropdowns);
    document.addEventListener('touchend', closeDropdowns);
    
    // Close dropdowns on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.contact-dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
                const overlay = document.querySelector('.dropdown-overlay');
                if (overlay) overlay.remove();
            });
        }
    });
});

// Cart Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

function addToCart(name, price, image) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price: parseFloat(price), quantity: 1, image: image || '' });
    }
    saveCart();
}

function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    saveCart();
}

function updateQuantity(name, change) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(name);
        } else {
            saveCart();
        }
    }
}

function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    const cartTotal = document.getElementById('cartTotal');
    const clearCartBtnTop = document.getElementById('clearCartBtnTop');
    
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
    
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart-message">Il tuo carrello è vuoto. Aggiungi alcuni vini per iniziare!</p>';
            if (cartSummary) cartSummary.style.display = 'none';
            if (clearCartBtnTop) clearCartBtnTop.style.display = 'none';
        } else {
            if (clearCartBtnTop) clearCartBtnTop.style.display = 'block';
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3EImmagine%3C/text%3E%3C/svg%3E'}" alt="${item.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3EImmagine%3C/text%3E%3C/svg%3E'">
                    </div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">€${item.price.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity('${item.name}', -1)">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.name}', 1)">+</button>
                    </div>
                    <div class="cart-item-total">€${(item.price * item.quantity).toFixed(2)}</div>
                    <button class="remove-item-btn" onclick="removeFromCart('${item.name}')" title="Rimuovi">🗑️</button>
                </div>
            `).join('');
            if (cartSummary) {
                cartSummary.style.display = 'block';
                if (cartTotal) {
                    cartTotal.textContent = `€${getCartTotal().toFixed(2)}`;
                }
            }
        }
    }
}

// Update cart buttons with correct product data
document.querySelectorAll('.btn-cart').forEach(button => {
    const productCard = button.closest('.product-card');
    if (productCard) {
        const productName = productCard.querySelector('h3')?.textContent || '';
        const priceElement = productCard.querySelector('.price');
        if (priceElement) {
            const priceText = priceElement.textContent.replace('€', '').replace(',', '.').trim();
            button.setAttribute('data-product-name', productName);
            button.setAttribute('data-product-price', priceText);
        }
    }
});

// Add to cart buttons - Support for touch events
document.querySelectorAll('.btn-cart').forEach(button => {
    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const name = button.getAttribute('data-product-name');
        const price = button.getAttribute('data-product-price');
        const productCard = button.closest('.product-card');
        let image = '';
        
        if (productCard) {
            const imgElement = productCard.querySelector('.product-image img');
            if (imgElement) {
                image = imgElement.src || imgElement.getAttribute('src') || '';
            }
        }
        
        if (name && price) {
            addToCart(name, price, image);
            
            // Visual feedback with haptic feedback on mobile
            const originalHTML = button.innerHTML;
            button.innerHTML = '✓ Aggiunto!';
            button.style.backgroundColor = '#28a745';
            
            // Haptic feedback on supported devices
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.backgroundColor = '';
            }, 2000);
        }
    };
    
    button.addEventListener('click', handleAddToCart);
    button.addEventListener('touchend', handleAddToCart);
});

// Clear cart button - Handle both buttons
const clearCart = () => {
    if (confirm('Sei sicuro di voler svuotare il carrello?')) {
        cart = [];
        saveCart();
    }
};

const clearCartBtn = document.getElementById('clearCartBtn');
if (clearCartBtn) {
    clearCartBtn.addEventListener('click', clearCart);
    clearCartBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        clearCart();
    });
}

const clearCartBtnTop = document.getElementById('clearCartBtnTop');
if (clearCartBtnTop) {
    clearCartBtnTop.addEventListener('click', clearCart);
    clearCartBtnTop.addEventListener('touchend', (e) => {
        e.preventDefault();
        clearCart();
    });
}

// Checkout button - Link to payment/wallet
const checkoutBtn = document.getElementById('checkoutBtn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        const total = getCartTotal();
        const itemsList = cart.map(item => `${item.name} x${item.quantity}`).join('\n');
        
        // Crea il messaggio per WhatsApp o sistema di pagamento
        const message = `Ciao! Vorrei ordinare:\n\n${itemsList}\n\nTotale: €${total.toFixed(2)}\n\nGrazie!`;
        const whatsappLink = `https://wa.me/393402143560?text=${encodeURIComponent(message)}`;
        
        // Apri WhatsApp o sistema di pagamento
        // Puoi cambiare questo link con PayPal, Stripe, o altro sistema di pagamento
        window.open(whatsappLink, '_blank');
        
        // Alternativa: se vuoi usare PayPal, sostituisci con:
        // const paypalLink = `https://www.paypal.com/checkoutnow?token=YOUR_TOKEN&amount=${total.toFixed(2)}`;
        // window.open(paypalLink, '_blank');
    });
    
    // Supporto per touch events
    checkoutBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        checkoutBtn.click();
    });
}

// Initialize cart UI
updateCartUI();

// Animation on Scroll - Optimized for mobile
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                // Unobserve after animation to improve performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .product-card, .novita-card, .offer-card, .degustazione-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
} else {
    // If reduced motion is preferred, show all elements immediately
    document.querySelectorAll('.feature-card, .product-card, .novita-card, .offer-card, .degustazione-card').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    });
}

// Highlight active navigation item on scroll
const sections = document.querySelectorAll('section[id]');
const navLinksArray = document.querySelectorAll('.nav-menu a[href^="#"]');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinksArray.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

