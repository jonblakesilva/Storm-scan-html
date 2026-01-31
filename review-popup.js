/**
 * StormScan Review Popup
 * High-converting review request popup using reciprocity and peak-end rule psychology
 *
 * Features:
 * - A/B test variants (Direct Ask vs. Benefit-Driven)
 * - Session storage (shows once per session)
 * - localStorage "Don't show again" option
 * - Glassmorphism design matching StormScan brand
 * - Full accessibility (keyboard nav, ARIA labels, focus trap)
 * - Mobile responsive with touch-friendly buttons
 * - Multiple exit points (X, Maybe Later, outside click, ESC)
 * - Analytics tracking via console.log
 *
 * Usage: Call window.showReviewPopup() after user completes widget
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
        reviewUrl: 'https://g.page/r/CTTpSusvMeqYEAI/review',
        sessionKey: 'stormscan_review_popup_shown',
        permanentDismissKey: 'stormscan_review_never_show',
        animationDuration: 400,

        // A/B TEST VARIANT - Change this to switch between versions
        // Options: 'A' (Direct Ask) or 'B' (Benefit-Driven)
        variant: 'B'
    };

    // ============================================
    // A/B TEST COPY VARIANTS
    // ============================================
    const COPY_VARIANTS = {
        // VERSION A - Direct Ask
        A: {
            emoji: '⭐',
            headline: 'Quick Favor: Leave Us a Review?',
            subheadline: 'Your feedback helps us improve and reach more tree service pros like you.',
            ctaText: 'Leave a Quick Review',
            microcopy: 'Opens in new tab • Takes 2 minutes'
        },

        // VERSION B - Benefit-Driven (Recommended - uses reciprocity)
        B: {
            emoji: '🎉',
            headline: 'Help Others Discover This Free Tool',
            subheadline: '200+ agencies use StormScan. Your review helps other tree service owners find it!',
            ctaText: 'Share Your Experience',
            microcopy: 'Opens in new tab • Takes 2 minutes'
        }
    };

    // ============================================
    // INJECT STYLES
    // ============================================
    const injectStyles = () => {
        const styleId = 'stormscan-review-popup-styles';
        if (document.getElementById(styleId)) return;

        const styles = document.createElement('style');
        styles.id = styleId;
        styles.textContent = `
            /* Review Popup Overlay */
            .ss-review-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(10, 15, 44, 0.85);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                opacity: 0;
                visibility: hidden;
                transition: opacity ${CONFIG.animationDuration}ms ease-out, visibility ${CONFIG.animationDuration}ms ease-out;
            }

            .ss-review-overlay.ss-active {
                opacity: 1;
                visibility: visible;
            }

            /* Review Popup Card */
            .ss-review-popup {
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 24px;
                padding: 40px;
                max-width: 500px;
                width: 95%;
                position: relative;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                transform: translateY(20px);
                opacity: 0;
                transition: transform ${CONFIG.animationDuration}ms ease-out, opacity ${CONFIG.animationDuration}ms ease-out;
            }

            .ss-review-overlay.ss-active .ss-review-popup {
                transform: translateY(0);
                opacity: 1;
            }

            /* Close Button */
            .ss-review-close {
                position: absolute;
                top: 20px;
                right: 20px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: transparent;
                border: 2px solid rgba(255, 255, 255, 0.2);
                color: rgba(255, 255, 255, 0.6);
                font-size: 20px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                line-height: 1;
                padding: 0;
            }

            .ss-review-close:hover,
            .ss-review-close:focus {
                color: rgba(255, 255, 255, 1);
                border-color: rgba(255, 255, 255, 0.4);
                background: rgba(255, 255, 255, 0.1);
                outline: none;
            }

            /* Content */
            .ss-review-content {
                text-align: center;
            }

            .ss-review-emoji {
                font-size: 56px;
                margin-bottom: 16px;
                display: block;
                animation: ss-bounce 0.6s ease-out;
            }

            @keyframes ss-bounce {
                0% { transform: scale(0); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }

            .ss-review-headline {
                font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 28px;
                font-weight: 800;
                color: #ffffff;
                margin: 0 0 12px 0;
                line-height: 1.2;
            }

            .ss-review-subheadline {
                font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 16px;
                color: rgba(255, 255, 255, 0.85);
                margin: 0 0 8px 0;
                line-height: 1.5;
            }

            /* Social Proof Badge */
            .ss-review-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: rgba(255, 255, 255, 0.15);
                border-radius: 100px;
                padding: 6px 14px;
                font-size: 13px;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.9);
                margin: 16px 0 24px 0;
            }

            .ss-review-badge-stars {
                color: #fbbf24;
            }

            /* Primary CTA Button */
            .ss-review-cta {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                background: #00d4aa;
                color: #000000;
                padding: 16px 40px;
                border-radius: 12px;
                font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 18px;
                font-weight: 800;
                text-decoration: none;
                border: none;
                cursor: pointer;
                box-shadow: 0 8px 24px rgba(0, 212, 170, 0.4);
                transition: all 0.2s ease;
                width: 100%;
                max-width: 320px;
            }

            .ss-review-cta:hover,
            .ss-review-cta:focus {
                transform: translateY(-2px);
                box-shadow: 0 12px 32px rgba(0, 212, 170, 0.5);
                background: #00f0c0;
                outline: none;
            }

            .ss-review-cta:active {
                transform: translateY(0);
            }

            /* Microcopy */
            .ss-review-microcopy {
                font-size: 13px;
                color: rgba(255, 255, 255, 0.6);
                margin-top: 12px;
            }

            /* Secondary Dismiss Link */
            .ss-review-dismiss {
                display: inline-block;
                margin-top: 20px;
                font-size: 14px;
                color: rgba(255, 255, 255, 0.6);
                text-decoration: underline;
                cursor: pointer;
                background: none;
                border: none;
                padding: 8px 16px;
                font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
                transition: color 0.2s ease;
            }

            .ss-review-dismiss:hover,
            .ss-review-dismiss:focus {
                color: rgba(255, 255, 255, 1);
                outline: none;
            }

            /* Don't Show Again Checkbox */
            .ss-review-permanent {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                margin-top: 16px;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.5);
            }

            .ss-review-permanent input[type="checkbox"] {
                width: 16px;
                height: 16px;
                cursor: pointer;
                accent-color: #00d4aa;
            }

            .ss-review-permanent label {
                cursor: pointer;
                margin: 0;
                font-size: 12px;
                font-weight: 400;
                text-transform: none;
                letter-spacing: 0;
            }

            /* Mobile Responsive */
            @media (max-width: 600px) {
                .ss-review-popup {
                    padding: 32px 24px;
                    border-radius: 20px;
                }

                .ss-review-emoji {
                    font-size: 48px;
                }

                .ss-review-headline {
                    font-size: 24px;
                }

                .ss-review-subheadline {
                    font-size: 15px;
                }

                .ss-review-cta {
                    font-size: 16px;
                    padding: 14px 32px;
                    min-height: 52px;
                }

                .ss-review-close {
                    width: 44px;
                    height: 44px;
                    top: 16px;
                    right: 16px;
                }
            }

            /* Reduced Motion */
            @media (prefers-reduced-motion: reduce) {
                .ss-review-overlay,
                .ss-review-popup,
                .ss-review-cta,
                .ss-review-close,
                .ss-review-dismiss {
                    transition: none;
                }

                .ss-review-emoji {
                    animation: none;
                }
            }

            /* Exit Animation */
            .ss-review-overlay.ss-closing {
                opacity: 0;
            }

            .ss-review-overlay.ss-closing .ss-review-popup {
                transform: translateY(20px);
                opacity: 0;
            }
        `;
        document.head.appendChild(styles);
    };

    // ============================================
    // ANALYTICS TRACKING
    // ============================================
    const trackEvent = (eventName, data = {}) => {
        const eventData = {
            event: eventName,
            timestamp: new Date().toISOString(),
            variant: CONFIG.variant,
            ...data
        };

        // Log to console for GTM integration later
        console.log('[StormScan Review Popup]', eventName, eventData);

        // Add data attribute to body for GTM tracking
        document.body.setAttribute(`data-popup-${eventName.toLowerCase().replace(/_/g, '-')}`, 'true');
    };

    // ============================================
    // CREATE POPUP HTML
    // ============================================
    const createPopupHTML = () => {
        const copy = COPY_VARIANTS[CONFIG.variant];

        return `
            <div class="ss-review-overlay" role="dialog" aria-modal="true" aria-labelledby="ss-review-headline" data-popup-shown="true">
                <div class="ss-review-popup">
                    <button class="ss-review-close" aria-label="Close popup" data-dismiss-method="close-x">
                        <span aria-hidden="true">&times;</span>
                    </button>

                    <div class="ss-review-content">
                        <span class="ss-review-emoji" aria-hidden="true">${copy.emoji}</span>

                        <h2 class="ss-review-headline" id="ss-review-headline">
                            ${copy.headline}
                        </h2>

                        <p class="ss-review-subheadline">
                            ${copy.subheadline}
                        </p>

                        <div class="ss-review-badge">
                            <span class="ss-review-badge-stars">★★★★★</span>
                            <span>4.9/5.0 on Google</span>
                        </div>

                        <a href="${CONFIG.reviewUrl}"
                           target="_blank"
                           rel="noopener noreferrer"
                           class="ss-review-cta"
                           data-review-clicked="true">
                            ${copy.ctaText}
                            <span aria-hidden="true">→</span>
                        </a>

                        <p class="ss-review-microcopy">
                            ✓ ${copy.microcopy}
                        </p>

                        <button class="ss-review-dismiss" data-dismiss-method="maybe-later" data-popup-dismissed="true">
                            Maybe later
                        </button>

                        <div class="ss-review-permanent">
                            <input type="checkbox" id="ss-dont-show-again">
                            <label for="ss-dont-show-again">Don't show this again</label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    // ============================================
    // POPUP MANAGEMENT
    // ============================================
    let overlayElement = null;
    let previousActiveElement = null;
    let focusableElements = [];

    const getFocusableElements = () => {
        if (!overlayElement) return [];
        return overlayElement.querySelectorAll(
            'button, a[href], input, [tabindex]:not([tabindex="-1"])'
        );
    };

    const trapFocus = (e) => {
        if (e.key !== 'Tab') return;

        focusableElements = getFocusableElements();
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            closePopup('esc');
        }
        trapFocus(e);
    };

    const handleOutsideClick = (e) => {
        if (e.target === overlayElement) {
            closePopup('outside-click');
        }
    };

    const closePopup = (dismissMethod = 'unknown') => {
        if (!overlayElement) return;

        // Check if "Don't show again" is checked
        const checkbox = overlayElement.querySelector('#ss-dont-show-again');
        if (checkbox && checkbox.checked) {
            localStorage.setItem(CONFIG.permanentDismissKey, 'true');
            trackEvent('permanent_dismiss');
        }

        // Track dismissal
        trackEvent('popup_dismissed', { dismissMethod });

        // Add closing animation
        overlayElement.classList.add('ss-closing');
        overlayElement.classList.remove('ss-active');

        // Remove after animation
        setTimeout(() => {
            if (overlayElement && overlayElement.parentNode) {
                overlayElement.parentNode.removeChild(overlayElement);
            }
            overlayElement = null;

            // Restore focus
            if (previousActiveElement) {
                previousActiveElement.focus();
            }

            // Remove event listeners
            document.removeEventListener('keydown', handleKeyDown);
        }, CONFIG.animationDuration);
    };

    const showPopup = () => {
        // Check if permanently dismissed
        if (localStorage.getItem(CONFIG.permanentDismissKey) === 'true') {
            console.log('[StormScan Review Popup] Permanently dismissed by user');
            return;
        }

        // Check if already shown this session
        if (sessionStorage.getItem(CONFIG.sessionKey) === 'true') {
            console.log('[StormScan Review Popup] Already shown this session');
            return;
        }

        // Prevent duplicate popups
        if (overlayElement) {
            console.log('[StormScan Review Popup] Popup already visible');
            return;
        }

        // Inject styles if not already injected
        injectStyles();

        // Create and append popup
        const popupContainer = document.createElement('div');
        popupContainer.innerHTML = createPopupHTML();
        overlayElement = popupContainer.firstElementChild;
        document.body.appendChild(overlayElement);

        // Store current focus
        previousActiveElement = document.activeElement;

        // Mark as shown
        sessionStorage.setItem(CONFIG.sessionKey, 'true');
        trackEvent('popup_shown');

        // Trigger animation (need slight delay for CSS transition)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                overlayElement.classList.add('ss-active');
            });
        });

        // Set up event listeners
        document.addEventListener('keydown', handleKeyDown);
        overlayElement.addEventListener('click', handleOutsideClick);

        // Close button
        const closeBtn = overlayElement.querySelector('.ss-review-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closePopup('close-x'));
        }

        // Maybe later button
        const dismissBtn = overlayElement.querySelector('.ss-review-dismiss');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => closePopup('maybe-later'));
        }

        // Review CTA click tracking
        const ctaBtn = overlayElement.querySelector('.ss-review-cta');
        if (ctaBtn) {
            ctaBtn.addEventListener('click', () => {
                trackEvent('review_clicked');
                // Close popup after a brief delay to ensure click registers
                setTimeout(() => closePopup('review-clicked'), 300);
            });
        }

        // Focus the CTA button for accessibility
        setTimeout(() => {
            if (ctaBtn) {
                ctaBtn.focus();
            }
        }, CONFIG.animationDuration);
    };

    // ============================================
    // PUBLIC API
    // ============================================
    window.showReviewPopup = showPopup;

    // Also expose configuration for A/B testing
    window.StormScanReviewPopup = {
        show: showPopup,
        close: closePopup,
        setVariant: (variant) => {
            // Explicit whitelist - only allow known variants
            const allowedVariants = ['A', 'B'];
            if (allowedVariants.includes(variant)) {
                CONFIG.variant = variant;
            } else {
                console.warn('[StormScan Review Popup] Invalid variant:', variant);
            }
        },
        getVariant: () => CONFIG.variant,
        reset: () => {
            sessionStorage.removeItem(CONFIG.sessionKey);
            localStorage.removeItem(CONFIG.permanentDismissKey);
            console.log('[StormScan Review Popup] Reset complete');
        }
    };

    // Log initialization
    console.log('[StormScan Review Popup] Initialized with variant:', CONFIG.variant);

})();
