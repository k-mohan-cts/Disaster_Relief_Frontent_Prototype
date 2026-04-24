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

// Prevent double-initialization when script is included multiple times
window.__navigationInit = window.__navigationInit || false;

if (!window.__navigationInit) {
    window.__navigationInit = true;

    // Load navigation dynamically
    window.loadNavigation = async function() {
        try {
            // If navigation already injected, skip
            if (document.querySelector('aside[data-injected="true"]')) return;

            const response = await fetch('navigation.html');
            const navHTML = await response.text();
            const navContainer = document.querySelector('body');
            
            // Create a temporary container to parse the navigation
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = navHTML;
            const styleElement = tempDiv.querySelector('style');
            const navElement = tempDiv.querySelector('aside');
            
            // Insert navigation as first child before main content
            if (navElement && navContainer) {
                // Also add styles if present
                if (styleElement && !document.querySelector('style[data-nav-styles]')) {
                    styleElement.setAttribute('data-nav-styles', 'true');
                    document.head.appendChild(styleElement);
                }

                // mark injected to avoid duplicates
                navElement.setAttribute('data-injected', 'true');
                // add fade-in helper classes
                navElement.classList.add('nav-fade');
                navContainer.insertBefore(navElement, navContainer.firstChild);

                // trigger visible state on next frame for smooth transition
                requestAnimationFrame(() => {
                    navElement.classList.add('nav-visible');
                });
            }
        } catch (error) {
            console.error('Error loading navigation:', error);
        }
    }

    // Initialize navigation on page load
    document.addEventListener('DOMContentLoaded', async function() {
        // Load navigation first
        await window.loadNavigation();
        
        // Then initialize active states and handlers
        setTimeout(() => {
            initializeNavigation();
            setupModalHandlers();
            setupSPALinks();
        }, 100);
    });

    /**
     * Setup Single Page Application (SPA) routing for navigation links
     */
    function setupSPALinks() {
        const navLinks = document.querySelectorAll('aside .nav-link, aside a[href]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', async function(e) {
                const targetUrl = this.getAttribute('href');
                
                // Only intercept internal links
                if (targetUrl && !targetUrl.startsWith('http') && !targetUrl.startsWith('#')) {
                    e.preventDefault();
                    await fetchAndReplaceContent(targetUrl);
                }
            });
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', async function() {
            const currentPath = window.location.pathname.split('/').pop() || 'Audit_ComplianceIndex.html';
            await fetchAndReplaceContent(currentPath, false);
        });
    }

    /**
     * Fetch new page and replace the `<main>` content
     */
    async function fetchAndReplaceContent(url, pushState = true) {
        try {
            const mainElement = document.querySelector('main');
            if (!mainElement) {
                window.location.href = url;
                return;
            }

            // Fade out current content
            mainElement.style.transition = 'opacity 0.15s ease-out';
            mainElement.style.opacity = '0';

            // Fetch the new page
            const response = await fetch(url);
            const htmlText = await response.text();

            // Parse the new HTML
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(htmlText, 'text/html');
            const newMain = newDoc.querySelector('main');
            const newTitle = newDoc.querySelector('title');

            if (newMain) {
                // Replace the content
                mainElement.innerHTML = newMain.innerHTML;
                
                // Update title
                if (newTitle) {
                    document.title = newTitle.textContent;
                }

                // Update URL
                if (pushState) {
                    window.history.pushState({}, '', url);
                }

                // Remove previously injected dynamic scripts
                document.querySelectorAll('script[data-dynamic-script="true"]').forEach(el => el.remove());

                // Find and inject all scripts from the new page's body 
                // excluding navigation, tailwind, etc.
                const newScripts = Array.from(newDoc.querySelectorAll('body script')).filter(script => {
                    const src = script.src || '';
                    return !src.includes('navigation.js') && !src.includes('tailwindcss') && !src.includes('chart.js');
                });
                
                newScripts.forEach(script => {
                    const newScript = document.createElement('script');
                    newScript.setAttribute('data-dynamic-script', 'true');
                    
                    // Replace DOMContentLoaded wrapper so that scripts execute immediately
                    // since DOMContentLoaded already fired on the initial page load.
                    let code = script.innerHTML;
                    code = code.replace(/document\.addEventListener\(['"]DOMContentLoaded['"],\s*function\(\)\s*\{([\s\S]*?)\}\);/g, '(function() { $1 })();');
                    code = code.replace(/document\.addEventListener\(['"]DOMContentLoaded['"],\s*\(\)\s*=>\s*\{([\s\S]*?)\}\);/g, '(function() { $1 })();');
                    
                    newScript.appendChild(document.createTextNode(code));
                    
                    Array.from(script.attributes).forEach(attr => {
                        if (attr.name !== 'src' && attr.name !== 'data-dynamic-script') {
                            newScript.setAttribute(attr.name, attr.value);
                        }
                    });
                    
                    if (script.hasAttribute('src')) {
                        newScript.src = script.getAttribute('src');
                    }
                    
                    document.body.appendChild(newScript);
                });

                // Re-initialize nav styles and states
                initializeNavigation();
                
                // Attach modal handlers to new content
                window.__navHandlersAttached = false; // Reset
                setupModalHandlers();

                // Fade back in
                mainElement.style.opacity = '1';
                
                // In case the new page requires charting but it's not setup yet
                if (window.Chart) {
                    // Chart globals might need resizing or updating
                }
            } else {
                // Fallback to standard navigation if no <main> tag found
                window.location.href = url;
            }
        } catch (error) {
            console.error('Error fetching page content:', error);
            window.location.href = url; // Fallback
        }
    }

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
    // avoid attaching handlers multiple times
    if (window.__navHandlersAttached) return;
    window.__navHandlersAttached = true;
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
} // end if (!window.__navigationInit)
