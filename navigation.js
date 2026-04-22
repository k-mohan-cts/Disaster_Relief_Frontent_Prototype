/**
 * Navigation System for DisasterRelief Application
 * Dynamically loads and manages navigation across all pages
 */

// Navigation configuration mapping
const navConfig = {
    'Audit_ComplianceIndex.html': { id: 'dashboard', label: 'Dashboard' },
    'compliance-records.html': { id: 'compliance', label: 'Compliance Records' },
    'create-compliance.html': { id: 'compliance', label: 'Compliance Records' },
    'edit-compliance.html': { id: 'compliance', label: 'Compliance Records' },
    'audit-management.html': { id: 'audit', label: 'Audit Management' },
    'create-audit.html': { id: 'audit', label: 'Audit Management' },
    'edit-audit.html': { id: 'audit', label: 'Audit Management' },
    'audit-logs.html': { id: 'audit-logs', label: 'System Audit Logs' },
    'audit-log-details.html': { id: 'audit-logs', label: 'System Audit Logs' },
    'emergency-reports.html': { id: 'emergencies', label: 'Emergencies' },
    'emergency-report-details.html': { id: 'emergencies', label: 'Emergencies' },
    'relief-inventory.html': { id: 'inventory', label: 'Relief Inventory' },
    'relief-distributions.html': { id: 'distributions', label: 'Distributions' },
    'shelters.html': { id: 'shelters', label: 'Shelters' },
    'recovery-programs.html': { id: 'recovery', label: 'Recovery Programs' },
    'resources.html': { id: 'resources', label: 'Resources' },
    'citizen-registry.html': { id: 'citizen', label: 'Citizen Registry' }
};

// Load navigation dynamically
async function loadNavigation() {
    try {
        const response = await fetch('navigation.html');
        const navHTML = await response.text();
        const navContainer = document.querySelector('body');
        
        // Create a temporary container to parse the navigation
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = navHTML;
        const navElement = tempDiv.querySelector('aside');
        
        // Insert navigation as first child before main content
        if (navElement && navContainer) {
            navContainer.insertBefore(navElement, navContainer.firstChild);
        }
    } catch (error) {
        console.error('Error loading navigation:', error);
    }
}

// Initialize navigation on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Load navigation first
    await loadNavigation();
    
    // Then initialize active states and handlers
    setTimeout(() => {
        initializeNavigation();
        setupModalHandlers();
    }, 100);
});

/**
 * Initialize navigation system
 */
function initializeNavigation() {
    const currentPage = getCurrentPageName();
    const pageConfig = navConfig[currentPage];
    
    if (pageConfig) {
        // Set active nav link
        const activeLink = document.querySelector(`[data-page="${pageConfig.id}"]`);
        if (activeLink) {
            setActiveNavLink(activeLink);
        }
        
        // Update page title
        updatePageTitle(pageConfig.label);
    }
}

/**
 * Get current page filename
 */
function getCurrentPageName() {
    const path = window.location.pathname;
    return path.substring(path.lastIndexOf('/') + 1) || 'Audit_ComplianceIndex.html';
}

/**
 * Set active navigation link styling
 */
function setActiveNavLink(linkElement) {
    // Remove active state from all links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('sidebar-active');
        link.querySelectorAll('i, span').forEach(el => {
            el.classList.remove('text-white');
            if (el.tagName === 'I') el.classList.add('text-gray-400');
            if (el.tagName === 'SPAN') el.classList.add('text-gray-300');
        });
    });
    
    // Set active state on current link
    linkElement.classList.add('sidebar-active');
    linkElement.querySelectorAll('i, span').forEach(el => {
        el.classList.add('text-white');
        if (el.tagName === 'I') el.classList.remove('text-gray-400');
        if (el.tagName === 'SPAN') el.classList.remove('text-gray-300');
    });
}

/**
 * Update page title
 */
function updatePageTitle(label) {
    const headerTitle = document.querySelector('main h1, main header h1');
    if (headerTitle) {
        headerTitle.textContent = label;
    }
}

/**
 * Setup modal handlers for Add/New buttons
 */
function setupModalHandlers() {
    // Add button handlers
    document.querySelectorAll('[data-action="add"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            if (target) {
                window.location.href = target;
            }
        });
    });

    // New button handlers
    document.querySelectorAll('[data-action="new"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            const modalId = this.getAttribute('data-modal');
            
            if (modalId) {
                showModal(modalId);
            } else if (target) {
                window.location.href = target;
            }
        });
    });

    // Edit button handlers
    document.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-target');
            if (target) {
                window.location.href = target;
            }
        });
    });

    // View button handlers
    document.querySelectorAll('[data-action="view"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-target');
            if (target) {
                window.location.href = target;
            }
        });
    });

    // Close modal handlers
    document.querySelectorAll('[data-action="close-modal"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.closest('[role="dialog"]')?.id;
            if (modalId) {
                closeModal(modalId);
            }
        });
    });
}

/**
 * Show modal by ID
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

/**
 * Close modal by ID
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

/**
 * Navigate to page
 */
function navigateTo(page) {
    const filename = Object.keys(navConfig).find(key => navConfig[key].id === page);
    if (filename) {
        window.location.href = filename;
    }
}

/**
 * Get current page context
 */
function getCurrentPageContext() {
    return navConfig[getCurrentPageName()] || null;
}

// Export for global use
window.navigationSystem = {
    navigateTo,
    showModal,
    closeModal,
    getCurrentPageContext,
    setupModalHandlers
};
