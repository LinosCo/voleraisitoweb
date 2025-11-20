/**
 * AI Chatbot Frontend JavaScript
 * Refactored to work with server-side rendered HTML.
 */

(function($) {
    'use strict';

    class AIChatbot {
        constructor() {
            // Properties to be filled in init
            this.container = null;
            this.toggleButton = null;
            this.messages = [];
            this.isTyping = false;
            this.conversationId = null;
            this.hasConsent = false;
            this.leadCaptured = false;
            this.messageCount = 0;
            this.privacyCheckbox = null;
            this.historyCheckbox = null;
            this.consentButton = null;
            this.historyId = null;
            this.isSubmittingLead = false;
            this.lastAssistantText = '';
            
            // Defer initialization to DOM ready
            $(() => this.init());
        }

        init() {
            // Select pre-rendered elements
            this.container = $('#aicb-chatbot');
            this.toggleButton = $('.aicb-chatbot-toggle');

            // Ensure the chat container is a positioned ancestor for absolute overlays
            if (this.container.length && this.container.css('position') === 'static') {
                this.container.css('position', 'relative');
            }

            // If the main container doesn't exist, do nothing.
            if (!this.container.length) {
                return;
            }

            this.bindEvents();
            this.loadConversationState();
            this.ensureHistoryId();
            this.checkLeadCaptureTrigger();

            // Compatibility: ensure chatbot stays above sticky headers (e.g., Uncode)
            this.ensureOnTop();
            
            // Show welcome message if configured and no prior conversation
            const consentRequired = window.aicb_params.enable_consent === '1';
            if (window.aicb_params.welcome_message && this.messages.length === 0 && (!consentRequired || this.hasConsent)) {
                setTimeout(() => {
                    this.addMessage('assistant', window.aicb_params.welcome_message);
                    this.showSuggestedQuestions();
                }, 1000);
            }
        }

        bindEvents() {
            this.toggleButton.on('click', () => this.openChat());
            
            this.container.find('.aicb-close').on('click', () => this.closeChat());
            this.container.find('.aicb-minimize').on('click', () => this.minimizeChat());
            this.container.find('.aicb-clear-chat').on('click', () => this.clearChat());
            
            this.container.find('.aicb-send-button').on('click', () => this.sendMessage());
            this.container.find('#aicb-input').on('keypress', (e) => {
                if (e.which === 13 && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            this.container.find('.aicb-consent-accept').on('click', () => this.handleConsent());

            this.privacyCheckbox = this.container.find('#aicb-consent-privacy');
            this.historyCheckbox = this.container.find('#aicb-consent-history');
            this.consentButton = this.container.find('.aicb-consent-accept');

            if (this.privacyCheckbox.length && this.consentButton.length) {
                const updateConsentButtonState = () => {
                    this.consentButton.prop('disabled', !this.privacyCheckbox.is(':checked'));
                };
                updateConsentButtonState();
                this.privacyCheckbox.on('change', updateConsentButtonState);
            }

            if (this.historyCheckbox.length) {
                if (window.aicb_params.enable_chat_history === '1') {
                    const storedPreference = sessionStorage.getItem('aicb_save_history');
                    if (storedPreference === 'true') {
                        this.historyCheckbox.prop('checked', true);
                    } else if (storedPreference === 'false') {
                        this.historyCheckbox.prop('checked', false);
                    } else {
                        this.historyCheckbox.prop('checked', false);
                    }
                } else {
                    this.historyCheckbox.closest('.aicb-consent-options').remove();
                    this.container.find('.aicb-consent-history-message, .aicb-consent-history-note').remove();
                    this.historyCheckbox = $();
                }
            }

            this.container.find('#aicb-lead-capture-form').on('submit', (e) => {
                e.preventDefault();
                this.submitLeadForm();
            });
            
            // Use event delegation for suggested questions as they are added dynamically
            this.container.on('click', '.aicb-suggested-question', (e) => {
                const question = $(e.currentTarget).text();
                this.container.find('#aicb-input').val(question);
                this.sendMessage();
            });

            this.initializeConsentContent();
            this.initializeLeadPrivacyLabel();
            this.bindMessageFocusCompression();

            // Re-layout lead form overlay on resize if visible
            $(window).on('resize.aicb', () => {
                const $form = this.container.find('.aicb-lead-form:visible');
                if ($form.length) {
                    this.layoutLeadFormOverlay();
                }
            });

            // Prevent page scroll hijacking when scrolling inside messages
            const $messages = this.container.find('.aicb-messages');
            // Force inner scrolling even if theme intercepts wheel events
            $messages.on('wheel.aicb', function(e) {
                const el = this;
                const dy = e.originalEvent.deltaY || 0;
                el.scrollTop += dy; // apply manual scroll
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            });
            // Older mousewheel events fallback
            $messages.on('mousewheel.aicb DOMMouseScroll.aicb', function(e) {
                const el = this;
                const oe = e.originalEvent;
                const dy = (oe.wheelDelta ? -oe.wheelDelta : oe.detail * 40) || 0;
                el.scrollTop += dy;
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            });
            // Touch support
            let startY = 0;
            $messages.on('touchstart.aicb', function(e){ if (e.originalEvent.touches && e.originalEvent.touches.length){ startY = e.originalEvent.touches[0].clientY; } });
            $messages.on('touchmove.aicb', function(e){
                if (!e.originalEvent.touches || !e.originalEvent.touches.length) return;
                const el = this;
                const currentY = e.originalEvent.touches[0].clientY;
                const up = currentY > startY; // swipe down means up=true for scrollTop
                if (!up && el.scrollTop + el.clientHeight >= el.scrollHeight) {
                    e.preventDefault(); e.stopPropagation();
                } else if (up && el.scrollTop === 0) {
                    e.preventDefault(); e.stopPropagation();
                }
            });
        }

        // Reduce vertical spacing while the message field is active
        bindMessageFocusCompression() {
            const $form = this.container.find('.aicb-lead-form');
            const $msg = this.container.find('#aicb-lead-message');
            if (!$form.length || !$msg.length) return;
            $msg.off('focus.aicbMsg blur.aicbMsg');
            $msg.on('focus.aicbMsg', () => { $form.addClass('message-focused'); });
            $msg.on('blur.aicbMsg',  () => { $form.removeClass('message-focused'); });
        }

        // Compute max z-index of fixed/sticky elements and put chatbot above
        ensureOnTop() {
            try {
                const computeZ = (el) => {
                    const z = window.getComputedStyle(el).zIndex;
                    const zi = parseInt(z, 10);
                    return isNaN(zi) ? 0 : zi;
                };
                let maxZ = 0;
                const fixedNodes = Array.from(document.querySelectorAll('header, .header, .navbar, [data-sticky], .is-sticky, [style*="position:fixed"], *'))
                    .filter((el) => {
                        const pos = window.getComputedStyle(el).position;
                        return pos === 'fixed' || el.matches('.is-sticky,[data-sticky]');
                    });
                fixedNodes.forEach((el) => { maxZ = Math.max(maxZ, computeZ(el)); });
                const containerZ = parseInt(this.container.css('z-index'), 10) || 0;
                const toggleZ = parseInt(this.toggleButton.css('z-index'), 10) || 0;
                const targetBase = Math.max(maxZ + 2, 9999);
                if (containerZ < targetBase) { this.container.css('z-index', targetBase); }
                if (toggleZ < targetBase + 1) { this.toggleButton.css('z-index', targetBase + 1); }
            } catch (e) {
                // no-op
            }
        }

        openChat() {
            this.container.addClass('active');
            this.toggleButton.addClass('hidden');
            try { sessionStorage.setItem('aicb_chat_open', '1'); } catch (e) {}

            // Check for consent on first open
            if (!this.hasConsent && window.aicb_params.enable_consent === '1') {
                this.container.find('.aicb-consent-screen').show();
                this.container.find('.aicb-messages, .aicb-input-form').hide();
            } else {
                if (!this.hasConsent) {
                    this.autoGrantConsent();
                }
                this.container.find('.aicb-consent-screen').hide();
                this.container.find('.aicb-messages, .aicb-input-form').show();
            }

            setTimeout(() => {
                this.scrollToBottom();
                this.container.find('#aicb-input').focus();
            }, 300);
            this.trackEvent('chat_opened');
        }

        closeChat() {
            this.container.removeClass('active');
            this.toggleButton.removeClass('hidden');
            try { sessionStorage.setItem('aicb_chat_open', '0'); } catch (e) {}
        }

        minimizeChat() {
            const minimizeButtonIcon = this.container.find('.aicb-minimize .dashicons');
            if (this.container.hasClass('minimized')) {
                this.container.removeClass('minimized');
                this.container.find('.aicb-messages, .aicb-input-form, .aicb-suggested-questions').show();
                minimizeButtonIcon.removeClass('dashicons-arrow-up-alt').addClass('dashicons-minus');
            } else {
                this.container.addClass('minimized');
                this.container.find('.aicb-messages, .aicb-input-form, .aicb-suggested-questions').hide();
                minimizeButtonIcon.removeClass('dashicons-minus').addClass('dashicons-arrow-up-alt');
            }
        }

        clearChat() {
            if (confirm('Are you sure you want to clear the conversation?')) {
                this.container.find('.aicb-messages').empty();
                this.messages = [];
                this.messageCount = 0;
                this.conversationId = null;
                this.leadCaptured = false;
                this.resetHistoryId();

                sessionStorage.removeItem('aicb_conversation');

                if (window.aicb_params.enable_consent === '1') {
                    sessionStorage.removeItem('aicb_consent');
                    sessionStorage.removeItem('aicb_save_history');
                    this.hasConsent = false;

                    if (this.privacyCheckbox && this.privacyCheckbox.length) {
                        this.privacyCheckbox.prop('checked', false).trigger('change');
                    }
                    if (this.historyCheckbox && this.historyCheckbox.length) {
                        this.historyCheckbox.prop('checked', false);
                    }
                } else {
                    this.hasConsent = true;
                    sessionStorage.setItem('aicb_consent', 'true');
                    if (window.aicb_params.enable_chat_history === '1') {
                        sessionStorage.setItem('aicb_save_history', 'true');
                    } else {
                        sessionStorage.removeItem('aicb_save_history');
                    }
                }

                this.container.find('.aicb-lead-form').hide();
                this.container.removeClass('showing-lead');
                this.container.find('.aicb-input-form').show();

                if (window.aicb_params.enable_consent === '1') {
                    this.container.find('.aicb-consent-screen').show();
                    this.container.find('.aicb-messages, .aicb-input-form, .aicb-suggested-questions').hide();
                } else {
                    this.container.find('.aicb-consent-screen').hide();
                    this.container.find('.aicb-messages, .aicb-input-form').show();
                    if (window.aicb_params.welcome_message) {
                        this.addMessage('assistant', window.aicb_params.welcome_message);
                    }
                    this.showSuggestedQuestions();
                }
            }
        }

        sendMessage() {
            const input = this.container.find('#aicb-input');
            const message = input.val().trim();
            if (!message) return;
            
            this.addMessage('user', message);
            input.val('');
            this.container.find('.aicb-suggested-questions').hide();
            this.showTypingIndicator();
            this.sendToAPI(message);
            this.messageCount++;
            this.checkLeadCaptureTrigger(message);
        }

        async sendToAPI(message) {
            const chatHistoryConsent = sessionStorage.getItem('aicb_save_history') === 'true';
            const contextPayload = JSON.stringify(this.getConversationContext());

            try {
                const response = await fetch(`${window.aicb_params.rest_url}ai-chatbot/v1/send-message`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': window.aicb_params.rest_nonce
                    },
                    body: JSON.stringify({
                        message: message,
                        thread_id: this.conversationId,
                        page_context: contextPayload,
                        chat_history_consent_given: chatHistoryConsent,
                        history_id: this.historyId,
                        current_language: window.aicb_params.current_language || 'en'
                    })
                });

                const data = await response.json();
                this.hideTypingIndicator();

                if (!response.ok) {
                    const errorMessage = data && data.message ? data.message : 'Failed to get response';
                    throw new Error(errorMessage);
                }

                const payload = data.data ? data.data : data;
                if (!payload || !payload.message) {
                    throw new Error('No response from assistant');
                }

                this.addMessage('assistant', payload.message);
                if (payload.related_content) {
                    this.showRelatedContent(payload.related_content);
                }
                if (payload.thread_id) {
                    this.conversationId = payload.thread_id;
                }
                if (payload.history_id) {
                    this.setHistoryId(payload.history_id);
                }
            } catch (error) {
                console.error('API Error:', error);
                this.hideTypingIndicator();
                this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
            }
        }

        addMessage(role, content) {
            const normalizedRole = role === 'assistant' ? 'assistant' : 'user';
            if (normalizedRole === 'assistant') {
                const trimmed = String(content || '').trim();
                if (trimmed && this.lastAssistantText === trimmed) {
                    return; // avoid duplicate assistant bubble
                }
                this.lastAssistantText = trimmed;
            }
            const messageHtml = `<div class="aicb-message aicb-message-${normalizedRole} ${normalizedRole}"><div class="aicb-message-bubble">${this.formatMessage(content)}</div></div>`;
            const $messages = this.container.find('.aicb-messages');
            $messages.append(messageHtml);

            // Scrolling behavior:
            // - assistant replies: align the start of the new message to the top of the viewport
            // - user messages: keep the traditional scroll-to-bottom
            const $newMsg = $messages.children('.aicb-message').last();
            if (normalizedRole === 'assistant') {
                this.scrollMessageTopIntoView($newMsg);
            } else {
                this.scrollToBottom();
            }
            
            // Only save to history if it's not the initial welcome message
            if (this.messages.length > 0 || role === 'user') {
                this.messages.push({ role, content, timestamp: Date.now() });
                this.saveConversationState();
            }
        }

        // Scroll so that the supplied message's top sits at the top edge of the messages viewport
        scrollMessageTopIntoView($el) {
            const $messages = this.container.find('.aicb-messages');
            if (!$messages.length || !$el || !$el.length) return;
            try {
                const el = $el.get(0);
                const top = el.offsetTop; // position within the scroll container
                const padding = 8; // small visual padding
                $messages.scrollTop(Math.max(0, top - padding));
            } catch (e) {
                this.scrollToBottom(); // fallback
            }
        }

        formatMessage(content) {
            // Basic markdown formatting
            let html = content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1<\/a>');

            // Autolink bare URLs but avoid touching existing anchors
            const parts = html.split(/(<a\b[^>]*>.*?<\/a>)/gis);
            for (let i = 0; i < parts.length; i++) {
                if (i % 2 === 1) continue; // inside <a> ... </a>
                parts[i] = parts[i].replace(/\bhttps?:\/\/[^\s<\)]+/g, (url) => {
                    return `<a href="${url}">${url}<\/a>`;
                });
            }
            html = parts.join('');

            // Strip any target attribute that may come through in raw HTML
            html = html.replace(/(<a\b[^>]*?)\s+target=("|')[^\2>]*\2/gi, '$1');

            // Preserve line breaks last
            html = html.replace(/\n/g, '<br>');
            return html;
        }

        showTypingIndicator() {
            // Localize typing label by UI language (fallback to EN)
            const lang = (window.aicb_params.current_language || 'en').toLowerCase().slice(0,2);
            const dict = {
                it: "L'AI sta scrivendo...",
                en: 'AI is typing...',
                de: 'KI schreibt...',
                es: 'La IA está escribiendo...',
                fr: "L’IA est en train d’écrire...",
            };
            const label = dict[lang] || dict.en;
            this.container.find('.aicb-typing-label').text(label);
            this.container.find('.aicb-typing-indicator').show();
            this.scrollToBottom();
        }

        hideTypingIndicator() {
            this.container.find('.aicb-typing-indicator').hide();
        }

        showSuggestedQuestions() {
            const questions = window.aicb_params.suggested_questions || [];
            const container = this.container.find('.aicb-suggested-questions');
            if (questions.length > 0 && this.messages.length <= 1) { // Only show on start
                const html = questions.map(q => `<button class="aicb-suggested-question">${q}</button>`).join('');
                container.html(html).show();
            } else {
                container.hide();
            }
        }

        showRelatedContent(content) {
            // This function is not fully implemented in the original JS, but we'll keep the placeholder
            if (!content || content.length === 0) return;
            // ... logic to show related content ...
        }

        checkLeadCaptureTrigger(latestMessage = '') {
            if (this.leadCaptured || window.aicb_params.enable_lead_capture !== '1') {
                return;
            }
            const triggerThreshold = parseInt(window.aicb_params.lead_trigger_threshold || window.aicb_params.lead_message_threshold || 3, 10) || 3;
            const triggerWords = (window.aicb_params.lead_trigger_words || '')
                .split(',')
                .map((word) => word.trim().toLowerCase())
                .filter(Boolean);

            if (latestMessage && triggerWords.length) {
                const normalized = latestMessage.toLowerCase();
                const matched = triggerWords.some((word) => normalized.includes(word));
                if (matched) {
                    this.showLeadForm();
                    return;
                }
            }

            if (this.messageCount >= triggerThreshold) {
                this.showLeadForm();
            }
        }

        showLeadForm() {
            // Show the lead form overlay and hide the input to ensure full form visibility (including CTAs)
            this.container.addClass('showing-lead');
            const $form = this.container.find('.aicb-lead-form');
            // Hide input and messages so overlay can cover entire window area
            this.container.find('.aicb-input-form').hide();
            this.container.find('.aicb-messages').hide();
            $form.show();
            this.layoutLeadFormOverlay(true);
        }

        // Compute overlay geometry so lead form covers the full floating window except the header
        layoutLeadFormOverlay(hideInput = false) {
            const $form = this.container.find('.aicb-lead-form');
            const $header = this.container.find('.aicb-chatbot-header');
            const $input = this.container.find('.aicb-input-form');
            const headerH = $header.outerHeight() || 0;
            // Set CSS var so CSS can compute overlay top consistently
            try { this.container.get(0).style.setProperty('--aicb-header-height', headerH + 'px'); } catch(e) {}
            // While the lead overlay is visible we want it to reach the bottom of the window
            const inputH = 0;
            $form.css({
                position: 'absolute',
                top: headerH + 'px',
                left: 0,
                right: 0,
                bottom: inputH + 'px',
                margin: 0,
                borderRadius: 0,
                overflow: 'auto',
                zIndex: 1000,
                width: '100%',
                padding: $form.css('padding') || '20px',
                background: $form.css('background') || '#f8f9fa'
            });
        }

        async submitLeadForm() {
            if (this.isSubmittingLead) { return; }
            this.isSubmittingLead = true;
            const form = this.container.find('#aicb-lead-capture-form');
            const formData = {
                name: form.find('#aicb-lead-name').val(),
                email: form.find('#aicb-lead-email').val(),
                phone: form.find('#aicb-lead-phone').val(),
                company: form.find('#aicb-lead-company').val(),
                message: form.find('#aicb-lead-message').val(),
                privacy: form.find('#aicb-lead-privacy').is(':checked'),
                marketing: form.find('#aicb-lead-marketing').length ? form.find('#aicb-lead-marketing').is(':checked') : false,
                thread_id: this.conversationId,
                page_url: window.location.href,
                history_id: this.historyId
            };

            // Basic validation
            if (!formData.name || !formData.email) {
                alert('Please fill in all required fields.');
                return;
            }

            if (!formData.privacy) {
                alert('Please accept the privacy policy to continue.');
                return;
            }

            const marketingRequired = window.aicb_params.lead_marketing_required === '1';
            if (marketingRequired && form.find('#aicb-lead-marketing').length && !formData.marketing) {
                alert(window.aicb_params.marketing_consent_required_message || 'Please accept the marketing consent to continue.');
                return;
            }

            try {
                // Use the REST API endpoint for lead submission
                const response = await fetch(`${window.aicb_params.rest_url}ai-chatbot/v1/lead`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': window.aicb_params.rest_nonce
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (!response.ok) {
                    const errorMessage = data && data.message ? data.message : 'There was an error submitting the form.';
                    throw new Error(errorMessage);
                }

                const payload = data.data ? data.data : data;
                if (payload && payload.success) {
                    this.leadCaptured = true;
                    // Hide and reset overlay styles
                    const $form = this.container.find('.aicb-lead-form');
                    $form.hide();
                    this.container.removeClass('showing-lead');
                    this.container.find('.aicb-input-form').show();
                    this.container.find('.aicb-messages').show();
                    // Localized thank-you message based on conversation language
                    const lang = (window.aicb_params.current_language || 'en').toLowerCase().slice(0,2);
                    const localizedThanks = (function(l){
                        const dict = {
                            it: 'Grazie! La tua richiesta è stata inviata. Come posso aiutarti ora?',
                            en: 'Thanks! Your request has been sent. How can I help you now?',
                            es: '¡Gracias! Tu solicitud ha sido enviada. ¿Cómo puedo ayudarte ahora?',
                            fr: 'Merci ! Votre demande a été envoyée. Comment puis-je vous aider maintenant ?',
                            de: 'Danke! Ihre Anfrage wurde gesendet. Wie kann ich Ihnen jetzt helfen?',
                        }; return dict[l] || dict.en; })(lang);
                    const thanks = window.aicb_params.lead_thank_you_message || localizedThanks;
                    this.addMessage('assistant', thanks);
                    this.isSubmittingLead = false;
                } else {
                    throw new Error(payload && payload.message ? payload.message : 'There was an error submitting the form.');
                }
            } catch (error) {
                console.error('Lead submission error:', error);
                alert(error.message || 'An error occurred while submitting the form.');
                this.isSubmittingLead = false;
            }
        }

        handleConsent() {
            if (this.privacyCheckbox && !this.privacyCheckbox.is(':checked')) {
                alert(window.aicb_params.privacy_consent_required_message || 'Please agree to the privacy policy to continue.');
                return;
            }

            this.hasConsent = true;
            const historyEnabled = window.aicb_params.enable_chat_history === '1';
            const saveHistory = this.historyCheckbox && this.historyCheckbox.length
                ? this.historyCheckbox.is(':checked')
                : historyEnabled;

            sessionStorage.setItem('aicb_consent', 'true');
            sessionStorage.setItem('aicb_save_history', saveHistory ? 'true' : 'false');

            this.container.find('.aicb-consent-screen').hide();
            this.container.find('.aicb-messages, .aicb-input-form').show();

            if (this.messages.length === 0 && window.aicb_params.welcome_message) {
                this.addMessage('assistant', window.aicb_params.welcome_message);
            }
            this.showSuggestedQuestions();

            this.updateConsentStatus(saveHistory);
            this.saveConversationState();
        }

        autoGrantConsent() {
            const historyEnabled = window.aicb_params.enable_chat_history === '1';
            this.hasConsent = true;
            sessionStorage.setItem('aicb_consent', 'true');
            sessionStorage.setItem('aicb_save_history', historyEnabled ? 'true' : 'false');
            this.updateConsentStatus(historyEnabled);
        }

        async updateConsentStatus(saveHistory) {
            try {
                this.ensureHistoryId();
                await fetch(`${window.aicb_params.rest_url}ai-chatbot/v1/consent`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': window.aicb_params.rest_nonce
                    },
                    body: JSON.stringify({
                        save_history: saveHistory,
                        history_id: this.historyId,
                        conversation_id: this.conversationId
                    })
                });
            } catch (error) {
                console.error('Consent update error:', error);
            }
        }

        scrollToBottom() {
            const messages = this.container.find('.aicb-messages');
            if (messages.length) {
                messages.scrollTop(messages[0].scrollHeight);
            }
        }

        getConversationContext() {
            return {
                messages: this.messages.slice(-10),
                page_url: window.location.href,
                page_title: document.title,
                description: this.getMetaDescription(),
                content_snippet: this.getBodyContentSnippet(),
                headings: this.getHeadingsSnippet(),
                links: this.getImportantLinksSnippet()
            };
        }

        saveConversationState() {
            this.ensureHistoryId();
            const state = {
                messages: this.messages,
                conversationId: this.conversationId,
                leadCaptured: this.leadCaptured,
                messageCount: this.messageCount,
                historyId: this.historyId
            };
            sessionStorage.setItem('aicb_conversation', JSON.stringify(state));
        }

        initializeConsentContent() {
            const privacyLabel = this.container.find('.aicb-consent-privacy-text');
            if (privacyLabel.length) {
                let label = window.aicb_params.consent_gdpr_explanation || 'I agree to the privacy policy.';
                let hasLink = false;
                if (window.aicb_params.privacy_policy_url) {
                    const link = `<a href="${this.escapeAttribute(window.aicb_params.privacy_policy_url)}" target="_blank" rel="noopener noreferrer">${this.escapeHTML(window.aicb_params.privacy_policy_link_label || 'privacy policy')}</a>`;
                    label = label.replace('[privacy_policy_link]', link);
                    hasLink = true;
                } else {
                    label = label.replace('[privacy_policy_link]', this.escapeHTML(window.aicb_params.privacy_policy_link_label || 'privacy policy'));
                }
                // Also convert bracketed raw URLs like [https://example.com] into anchors
                label = label.replace(/\[(https?:[^\]]+)\]/gi, (m, url) => `<a href="${this.escapeAttribute(url)}" target="_blank" rel="noopener noreferrer">${this.escapeHTML(window.aicb_params.privacy_policy_link_label || url)}</a>`);
                if (hasLink || label.indexOf('<a') !== -1) {
                    privacyLabel.html(label);
                } else {
                    privacyLabel.text(label);
                }
            }

            const historyLabel = this.container.find('.aicb-consent-history-text');
            if (historyLabel.length) {
                const label = window.aicb_params.chat_history_consent_opt_in_label
                    || window.aicb_params.consent_history_explanation
                    || historyLabel.text();
                historyLabel.text(label);
            }

            const historyMessage = this.container.find('.aicb-consent-history-message');
            if (historyMessage.length) {
                const message = window.aicb_params.chat_history_consent_message || '';
                if (message) {
                    historyMessage.text(message);
                } else {
                    historyMessage.remove();
                }
            }

            const historyNote = this.container.find('.aicb-consent-history-note');
            if (historyNote.length) {
                const note = window.aicb_params.consent_history_explanation || '';
                if (note) {
                    historyNote.text(note);
                } else {
                    historyNote.remove();
                }
            }
        }

        initializeLeadPrivacyLabel() {
            const leadPrivacy = this.container.find('.aicb-lead-privacy-text');
            if (leadPrivacy.length) {
                let label = window.aicb_params.lead_consent_label || 'I agree to the privacy policy.';
                let hasLink = false;
                if (window.aicb_params.privacy_policy_url) {
                    const link = `<a href="${this.escapeAttribute(window.aicb_params.privacy_policy_url)}" target="_blank" rel="noopener noreferrer">${this.escapeHTML(window.aicb_params.privacy_policy_link_label || 'privacy policy')}</a>`;
                    label = label.replace('[privacy_policy_link]', link);
                    hasLink = true;
                } else {
                    label = label.replace('[privacy_policy_link]', this.escapeHTML(window.aicb_params.privacy_policy_link_label || 'privacy policy'));
                }
                label = label.replace(/\[(https?:[^\]]+)\]/gi, (m, url) => `<a href="${this.escapeAttribute(url)}" target="_blank" rel="noopener noreferrer">${this.escapeHTML(window.aicb_params.privacy_policy_link_label || url)}</a>`);
                if (hasLink || label.indexOf('<a') !== -1) {
                    leadPrivacy.html(label);
                } else {
                    leadPrivacy.text(label);
                }
            }

            const marketingLabel = this.container.find('.aicb-lead-marketing-text');
            if (marketingLabel.length && window.aicb_params.lead_marketing_label) {
                let content = window.aicb_params.lead_marketing_label;
                if (window.aicb_params.privacy_policy_url) {
                    const link = `<a href="${this.escapeAttribute(window.aicb_params.privacy_policy_url)}" target="_blank" rel="noopener noreferrer">${this.escapeHTML(window.aicb_params.privacy_policy_link_label || 'privacy policy')}</a>`;
                    content = content.replace('[privacy_policy_link]', link);
                } else {
                    content = content.replace('[privacy_policy_link]', this.escapeHTML(window.aicb_params.privacy_policy_link_label || 'privacy policy'));
                }
                marketingLabel.html(content);
            }

           const skipButton = this.container.find('.aicb-lead-form-skip');
            if (skipButton.length) {
                if (window.aicb_params.lead_skip_button_label) {
                    skipButton.text(window.aicb_params.lead_skip_button_label);
                }
                skipButton.off('click.aicbSkip').on('click.aicbSkip', (event) => {
                    event.preventDefault();
                    const $form = this.container.find('.aicb-lead-form');
                    $form.hide();
                    this.container.removeClass('showing-lead');
                    this.container.find('.aicb-input-form').show();
                    this.container.find('.aicb-messages').show();
                    this.leadCaptured = true;
                });
            }
        }

        getMetaDescription() {
            const meta = document.querySelector('meta[name="description"]');
            return meta ? meta.getAttribute('content') || '' : '';
        }

        getBodyContentSnippet() {
            const main = document.querySelector('main');
            let text = '';
            if (main && main.innerText) {
                text = main.innerText;
            } else if (document.body && document.body.innerText) {
                text = document.body.innerText;
            }
            text = text.replace(/\s+/g, ' ').trim();
            if (text.length > 1200) {
                text = `${text.substring(0, 1200)}…`;
            }
            return text;
        }

        getHeadingsSnippet() {
            const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
                .map((heading) => heading.innerText.trim())
                .filter(Boolean)
                .slice(0, 10);
            return headings.join(' | ');
        }

        getImportantLinksSnippet() {
            const anchors = Array.from(document.querySelectorAll('a[href]'))
                .filter((anchor) => anchor.innerText.trim().length > 0)
                .slice(0, 10)
                .map((anchor) => `${anchor.innerText.trim()} => ${anchor.href}`);
            return anchors.join(' | ');
        }

        loadConversationState() {
            const saved = sessionStorage.getItem('aicb_conversation');
            if (saved) {
                try {
                    const state = JSON.parse(saved);
                    this.messages = state.messages || [];
                    this.conversationId = state.conversationId || null;
                    this.leadCaptured = state.leadCaptured || false;
                    this.messageCount = state.messageCount || 0;
                    if (state.historyId) {
                        this.historyId = state.historyId;
                    }
                    
                    if (this.messages.length > 0) {
                        this.container.find('.aicb-messages').empty();
                        this.messages.forEach(msg => {
                           const msgRole = msg.role === 'assistant' ? 'assistant' : 'user';
                           const messageHtml = `<div class="aicb-message aicb-message-${msgRole} ${msgRole}"><div class="aicb-message-bubble">${this.formatMessage(msg.content)}</div></div>`;
                           this.container.find('.aicb-messages').append(messageHtml);
                        });
                        this.scrollToBottom();
                    }
                } catch (error) {
                    console.error('Error loading conversation state:', error);
                }
            }
            this.hasConsent = sessionStorage.getItem('aicb_consent') === 'true';

            // Restore open/closed UI state and ensure last message visible
            const wasOpen = sessionStorage.getItem('aicb_chat_open') === '1';
            if (wasOpen) {
                // Defer to allow DOM visibility then scroll
                setTimeout(() => {
                    this.openChat();
                    this.scrollToBottom();
                }, 50);
            }
        }

        trackEvent(eventName, data = {}) {
            // Not implemented in this version
        }

        escapeHTML(value) {
            return $('<div>').text(value || '').html();
        }

        escapeAttribute(value) {
            return this.escapeHTML(value || '');
        }

        ensureHistoryId() {
            if (!this.historyId) {
                const stored = sessionStorage.getItem('aicb_history_id');
                if (stored) {
                    this.historyId = stored;
                }
            }

            if (!this.historyId) {
                this.historyId = this.generateHistoryId();
                sessionStorage.setItem('aicb_history_id', this.historyId);
            }
        }

        setHistoryId(newId) {
            if (!newId) {
                return;
            }
            this.historyId = newId;
            sessionStorage.setItem('aicb_history_id', this.historyId);
            this.saveConversationState();
        }

        resetHistoryId() {
            this.historyId = this.generateHistoryId();
            sessionStorage.setItem('aicb_history_id', this.historyId);
        }

        generateHistoryId() {
            if (window.crypto && typeof window.crypto.randomUUID === 'function') {
                return 'hist_' + window.crypto.randomUUID();
            }
            return 'hist_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
        }
    }

    // Initialize chatbot when DOM is ready and container exists
    $(() => {
        if ($('#aicb-chatbot').length) {
            window.aiChatbot = new AIChatbot();
        }
    });

})(jQuery);
