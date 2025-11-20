/**
 * Complete Admin JavaScript for AI Chatbot Plugin
 */

jQuery(document).ready(function($) {
    const $knowledgeStatusPanel = $('#aicb-knowledge-status');
    
    // Initialize color pickers (match PHP class)
    $('.aicb-color-picker').wpColorPicker();
    
    // Test API Connection
    $('#test-connection').on('click', function(e) {
        e.preventDefault();
        
        const $button = $(this);
        const originalText = $button.html();
        const $result = $('#connection-result');
        
        const apiKey = $('input[name="aicb_settings[openai_api_key]"]').val();
        if (!apiKey) {
            $result.html('<span class="error">Please enter your OpenAI API Key first.</span>').removeClass('success').addClass('error');
            return;
        }
        
        $button.html('<span class="dashicons dashicons-update spin"></span> ' + aicb_admin.strings.test_connection).prop('disabled', true);
        $result.removeClass('success error').html('');
        
        $.ajax({
            url: aicb_admin.ajax_url,
            type: 'POST',
            data: {
                action: 'aicb_test_connection',
                nonce: aicb_admin.nonce,
                api_key: apiKey
            },
            success: function(response) {
                if (response.success) {
                    $result.html('<span class="success">✓ ' + response.data.message + '</span>').addClass('success');
                } else {
                    $result.html('<span class="error">✗ ' + (response.data.message || 'Connection failed') + '</span>').addClass('error');
                }
            },
            error: function() {
                $result.html('<span class="error">✗ Network error. Please try again.</span>').addClass('error');
            },
            complete: function() {
                $button.html(originalText).prop('disabled', false);
            }
        });
    });
    
    // Media Upload Handler for Chatbot Icon
    $(document).on('click', '.aicb-upload-button', function(e) {
        e.preventDefault();
        const $button = $(this);
        const targetId = $button.data('target');
        const $input = $('#' + targetId);
        const $previewContainer = $button.siblings('.aicb-image-preview');

        const mediaUploader = wp.media({
            title: 'Choose Icon',
            button: { text: 'Choose Icon' },
            multiple: false,
            library: { type: 'image' }
        });
        
        mediaUploader.on('select', function() {
            const attachment = mediaUploader.state().get('selection').first().toJSON();
            $input.val(attachment.url);
            
            if ($previewContainer.length) {
                $previewContainer.html('<img src="' + attachment.url + '" style="max-width: 150px; height: auto;" /><button type="button" class="button aicb-remove-image" data-target="' + targetId + '">Remove</button>');
            } else {
                $button.after('<div class="aicb-image-preview" style="margin-top: 10px;"><img src="' + attachment.url + '" style="max-width: 150px; height: auto;" /><button type="button" class="button aicb-remove-image" data-target="' + targetId + '">Remove</button></div>');
            }
        });
        
        mediaUploader.open();
    });
    
    // Remove Image Handler
    $(document).on('click', '.aicb-remove-image', function(e) {
        e.preventDefault();
        const targetId = $(this).data('target');
        $('#' + targetId).val('');
        $(this).closest('.aicb-image-preview').remove();
    });

    // Repeater field for Suggested Questions
    $('.add-item').on('click', function() {
        const container = $(this).prev('div');
        const newItem = `
            <div class="repeater-item">
                <input type="text" name="${container.attr('id').replace('-container', '[]')}" value="" class="regular-text">
                <button type="button" class="button remove-item">Remove</button>
            </div>`;
        container.append(newItem);
    });

    $(document).on('click', '.remove-item', function() {
        $(this).closest('.repeater-item').remove();
    });

    // Knowledge Base Actions
    $('#reindex-content').on('click', function(e) {
        e.preventDefault();
        const $button = $(this);
        const originalText = $button.text();
        const $controls = $button.closest('.aicb-reindex-controls');
        const $spinner = $controls.find('.spinner');
    const $progress = $('.aicb-reindex-progress');

        $spinner.addClass('is-active');
        if ($progress.length) {
            $progress.addClass('is-active');
        }
        setReindexFeedback('');
        $button.text(aicb_admin.strings.reindexing).prop('disabled', true);

        $.post(aicb_admin.ajax_url, {
            action: 'aicb_reindex_content',
            nonce: aicb_admin.nonce
        })
        .done(response => {
            if (response.success) {
                showNotice(response.data.message, 'success');
                setReindexFeedback(response.data.message, 'success');
                if (response.data.status) {
                    updateKnowledgeStatusDisplay(response.data.status);
                }
            } else {
                const errorMessage = response.data && response.data.message ? response.data.message : aicb_admin.strings.status_error;
                showNotice('Error: ' + errorMessage, 'error');
                setReindexFeedback(errorMessage, 'error');
            }
        })
        .fail(() => {
            showNotice(aicb_admin.strings.generic_error, 'error');
            setReindexFeedback(aicb_admin.strings.status_error, 'error');
        })
        .always(() => {
            $button.text(originalText).prop('disabled', false);
            $spinner.removeClass('is-active');
            if ($progress.length) {
                $progress.removeClass('is-active');
            }
        });
    });

    $('#aicb-upload-file-button').on('click', () => $('#aicb-knowledge-file-input').click());

    $('#aicb-knowledge-file-input').on('change', function() {
        if (this.files.length === 0) return;

        const file = this.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('action', 'aicb_upload_knowledge_file');
        formData.append('nonce', aicb_admin.nonce);

        const $spinner = $(this).siblings('.spinner').addClass('is-active');

        $.ajax({
            url: aicb_admin.ajax_url,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    showNotice(response.data.message, 'success');
                    const fileInfo = response.data.file_info;
                    const newRow = `
                        <tr data-id="${response.data.file_id}">
                            <td><a href="${fileInfo.url}" target="_blank">${escapeHtml(fileInfo.file)}</a></td>
                            <td>${new Date(fileInfo.date).toLocaleDateString()}</td>
                            <td><button type="button" class="button button-link-delete aicb-remove-file" data-id="${response.data.file_id}">Remove</button></td>
                        </tr>
                    `;
                    const $table = $('#aicb-knowledge-files-list table');
                    if ($table.length) {
                        $table.find('tbody').append(newRow);
                    } else {
                        const tableHtml = `
                            <table class="wp-list-table widefat fixed striped" style="margin-top: 20px;">
                                <thead><tr><th style="width: 60%;">File Name</th><th>Uploaded On</th><th>Actions</th></tr></thead>
                                <tbody>${newRow}</tbody>
                            </table>`;
                        $('#aicb-knowledge-files-list').html(tableHtml);
                    }
                    $('#aicb-no-files-message').hide();
                } else {
                    showNotice('Upload failed: ' + response.data.message, 'error');
                }
                if (response.data && response.data.status) {
                    updateKnowledgeStatusDisplay(response.data.status);
                } else {
                    fetchKnowledgeStatus();
                }
            },
            error: function() {
                showNotice('An error occurred during upload.', 'error');
                fetchKnowledgeStatus();
            },
            complete: function() {
                $spinner.removeClass('is-active');
            }
        });
    });

    $('#aicb-knowledge-files-list').on('click', '.aicb-remove-file', function(e) {
        e.preventDefault();
        if (!confirm(aicb_admin.strings.confirm_remove_file)) return;

        const $button = $(this);
        const fileId = $button.data('id');
        
        $.post(aicb_admin.ajax_url, {
            action: 'aicb_remove_knowledge_file',
            nonce: aicb_admin.nonce,
            file_id: fileId
        })
        .done(response => {
            if (response.success) {
                showNotice(response.data.message, 'success');
                $button.closest('tr').fadeOut(300, function() { $(this).remove(); });
                if (response.data && response.data.status) {
                    updateKnowledgeStatusDisplay(response.data.status);
                } else {
                    fetchKnowledgeStatus();
                }
            } else {
                showNotice('Error: ' + (response.data.message || 'Could not remove file.'), 'error');
            }
        })
        .fail(() => {
            showNotice(aicb_admin.strings.generic_error, 'error');
            fetchKnowledgeStatus();
        });
    });

    $('#aicb-indexed-table').on('click', '.aicb-remove-indexed', function(e) {
        e.preventDefault();

        if (!confirm(aicb_admin.strings.remove_indexed_confirm)) {
            return;
        }

        const $button = $(this);
        const entryId = $button.data('entry-id');
        if (!entryId) {
            return;
        }

        $button.prop('disabled', true);

        $.post(aicb_admin.ajax_url, {
            action: 'aicb_remove_indexed_entry',
            nonce: aicb_admin.nonce,
            entry_id: entryId
        })
            .done((response) => {
                if (response.success) {
                    showNotice(aicb_admin.strings.remove_indexed_success, 'success');
                    const $row = $button.closest('tr');
                    $row.fadeOut(200, () => {
                        $row.remove();
                        if ($('#aicb-indexed-table tbody tr').length === 0) {
                            $('#aicb-indexed-table tbody').append(
                                `<tr class="aicb-no-indexed"><td colspan="5">${escapeHtml(aicb_admin.strings.status_entry_none)}</td></tr>`
                            );
                        }
                    });
                    if (response.data && response.data.status) {
                        updateKnowledgeStatusDisplay(response.data.status);
                    } else {
                        fetchKnowledgeStatus();
                    }
                } else {
                    const message = response.data && response.data.message
                        ? response.data.message
                        : aicb_admin.strings.remove_indexed_failure;
                    showNotice(message, 'error');
                }
            })
            .fail(() => {
                showNotice(aicb_admin.strings.remove_indexed_failure, 'error');
                fetchKnowledgeStatus();
            })
            .always(() => {
                $button.prop('disabled', false);
            });
    });
    
    // Tab Switching Logic
    $('.nav-tab-wrapper a').on('click', function(e) {
        e.preventDefault();
        const target = $(this).attr('href');

        $('.nav-tab').removeClass('nav-tab-active');
        $(this).addClass('nav-tab-active');

        $('.tab-content').removeClass('active');
        $(target).addClass('active');

        window.history.pushState(null, null, target);
    });

    // On page load, check hash and show correct tab
    const hash = window.location.hash;
    if (hash) {
        $('.nav-tab-wrapper a[href="' + hash + '"]').click();
    }

    // Utility function to show notices
    function showNotice(message, type = 'info', duration = 5000) {
        const $notice = $(`<div class="notice notice-${type} is-dismissible"><p>${escapeHtml(message)}</p></div>`);
        $('.wrap h1').after($notice);
        setTimeout(() => $notice.fadeOut(), duration);
    }

    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    // Build clickable sitemap list from preview text
    function renderSitemapList(text) {
        const lines = String(text || '').split(/\r?\n/);
        const items = [];
        const re = /^•\s*(.+?)\s+—\s+(https?:[^\s]+)(?:\s+—\s+(.+))?/u;
        for (const raw of lines) {
            const m = re.exec(raw.trim());
            if (!m) continue;
            const title = escapeHtml(m[1]);
            const url = m[2];
            const desc = m[3] ? ' — ' + escapeHtml(m[3]) : '';
            items.push(`<li><a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>${desc}</li>`);
        }
        if (!items.length) { return `<pre style="white-space:pre-wrap">${escapeHtml(text || '')}</pre>`; }
        return `<ul style="margin:0;padding-left:18px;list-style:disc;">${items.join('')}</ul>`;
    }

    function setReindexFeedback(message, type = 'success') {
        const $feedback = $('#aicb-reindex-feedback');
        if (!$feedback.length) {
            return;
        }
        $feedback.removeClass('success error');
        if (!message) {
            $feedback.text('');
            return;
        }
        $feedback.addClass(type === 'success' ? 'success' : 'error');
        $feedback.text(message);
    }

    function fetchKnowledgeStatus() {
        if (!$knowledgeStatusPanel.length) {
            return;
        }
        $knowledgeStatusPanel
            .removeClass('notice-success notice-warning notice-error')
            .addClass('notice-info')
            .html(`<p>${escapeHtml(aicb_admin.strings.status_loading)}</p>`);

        $.post(aicb_admin.ajax_url, {
            action: 'aicb_get_embedding_status',
            nonce: aicb_admin.nonce
        })
        .done(response => {
            if (response.success && response.data && response.data.status) {
                updateKnowledgeStatusDisplay(response.data.status);
            } else {
                showKnowledgeStatusError(response.data && response.data.message ? response.data.message : aicb_admin.strings.status_error);
            }
        })
        .fail(() => showKnowledgeStatusError(aicb_admin.strings.status_error));
    }

    function showKnowledgeStatusError(message) {
        if (!$knowledgeStatusPanel.length) {
            return;
        }
        $knowledgeStatusPanel
            .removeClass('notice-info notice-success notice-warning')
            .addClass('notice-error')
            .html(`<p>${escapeHtml(message)}</p>`);
    }

    function updateKnowledgeStatusDisplay(status) {
        if (!$knowledgeStatusPanel.length) {
            return;
        }

        if (!status || (!status.snapshot_id && !status.chunk_count && !status.knowledge_entries && !status.files_count)) {
            $knowledgeStatusPanel
                .removeClass('notice-info notice-error')
                .addClass('notice-warning')
                .html(`<p>${escapeHtml(aicb_admin.strings.status_none)}</p>`);
            return;
        }

        let html = `<h4>${escapeHtml(aicb_admin.strings.status_heading)}</h4>`;
        html += '<ul class="aicb-status-list">';
        if (status.snapshot_id) {
            html += `<li><strong>${escapeHtml(aicb_admin.strings.status_snapshot)}:</strong> ${escapeHtml(status.snapshot_id)}</li>`;
        }
        if (status.generated_at_human) {
            html += `<li><strong>${escapeHtml(aicb_admin.strings.status_generated)}:</strong> ${escapeHtml(status.generated_at_human)}</li>`;
        }
        const chunkCount = typeof status.chunk_count !== 'undefined' && status.chunk_count !== null ? status.chunk_count : 0;
        const entryCount = typeof status.entry_count !== 'undefined' && status.entry_count !== null ? status.entry_count : (status.knowledge_entries || 0);
        html += `<li><strong>${escapeHtml(aicb_admin.strings.status_chunks)}:</strong> ${escapeHtml(String(chunkCount))}</li>`;
        html += `<li><strong>${escapeHtml(aicb_admin.strings.status_entries)}:</strong> ${escapeHtml(String(entryCount))}</li>`;
        html += `<li><strong>${escapeHtml(aicb_admin.strings.status_documents)}:</strong> ${escapeHtml(String(status.files_count || 0))}</li>`;
        html += '</ul>';

        if (status.sources && status.sources.length) {
            html += `<h5>${escapeHtml(aicb_admin.strings.status_sources)}</h5><ul class="aicb-status-list">`;
            status.sources.forEach(source => {
                const label = source && source.label ? source.label : '-';
                const count = source && typeof source.count !== 'undefined' ? source.count : 0;
                html += `<li>${escapeHtml(label)}: ${escapeHtml(String(count))}</li>`;
            });
            html += '</ul>';
        }

        if (status.latest_entries && status.latest_entries.length) {
            html += `<h5>${escapeHtml(aicb_admin.strings.status_latest_entries)}</h5><ul class="aicb-status-list">`;
            status.latest_entries.forEach(entry => {
                const title = entry && entry.title ? entry.title : aicb_admin.strings.status_entry_untitled;
                const link = entry && entry.source_url ? entry.source_url : (entry && entry.public_url ? entry.public_url : '');
                const source = entry && entry.source ? entry.source : '';
                const category = entry && entry.category ? entry.category : '';
                const updated = entry && entry.updated_human ? entry.updated_human : '';

                let meta = [];
                if (source) {
                    meta.push(`${escapeHtml(aicb_admin.strings.status_entry_source)}: ${escapeHtml(source)}`);
                }
                if (category) {
                    meta.push(`${escapeHtml(aicb_admin.strings.status_entry_category)}: ${escapeHtml(category)}`);
                }
                if (updated) {
                    meta.push(`${escapeHtml(aicb_admin.strings.status_entry_updated)}: ${escapeHtml(updated)}`);
                }

                const titleHtml = link
                    ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(title)}</a>`
                    : escapeHtml(title);

                html += `<li><strong>${titleHtml}</strong>`;
                if (meta.length) {
                    html += `<br><small>${meta.join(' • ')}</small>`;
                }
                html += '</li>';
            });
            html += '</ul>';
        } else {
            html += `<p>${escapeHtml(aicb_admin.strings.status_entry_none)}</p>`;
        }

        $knowledgeStatusPanel
            .removeClass('notice-info notice-warning notice-error')
            .addClass('notice-success')
            .html(html);
    }

    if ($knowledgeStatusPanel.length) {
        fetchKnowledgeStatus();
    }

    // Regenerate sitemap on Knowledge Status page
    $(document).on('click', '#aicb-regenerate-sitemap', function(e) {
        e.preventDefault();
    const $btn = $(this);
    const $card = $btn.closest('.card');
        const $spinner = $card.find('.spinner');
        const $notice = $('#aicb-sitemap-notice');
        const lang = $('#aicb-sitemap-language-select').val() || '';
    const originalText = $btn.text();

        $btn.prop('disabled', true).text(aicb_admin.strings.sitemap_regenerating);
        $spinner.addClass('is-active');
        $notice.text('');

        $.post(aicb_admin.ajax_url, {
            action: 'aicb_regenerate_sitemap',
            nonce: aicb_admin.nonce,
            lang: lang
        })
        .done(res => {
            if (res && res.success) {
                if (res.data && res.data.preview) {
                    $('#aicb-sitemap-preview').html(renderSitemapList(res.data.preview));
                } else {
                    $('#aicb-sitemap-preview').text('');
                }
                showNotice(aicb_admin.strings.sitemap_regenerated, 'success');
            } else {
                const msg = res && res.data && res.data.message ? res.data.message : aicb_admin.strings.sitemap_failed;
                showNotice(msg, 'error');
            }
        })
        .fail(() => showNotice(aicb_admin.strings.sitemap_failed, 'error'))
        .always(() => {
            $spinner.removeClass('is-active');
            $btn.prop('disabled', false).text(originalText);
        });
    });

    // Expose as global to avoid scope issues in async callbacks or script minifiers
    window.aicbProcessBatch = function() {
		const $btn = $('#aicb-rebuild-embeddings');
		const $spinner = $btn.siblings('.spinner');

		$.post(aicb_admin.ajax_url, { action: 'aicb_process_embedding_batch', nonce: aicb_admin.nonce })
		.done(response => {
			if (!response.success) {
				showNotice(response.data.message, 'error');
				$btn.prop('disabled', false);
				$spinner.removeClass('is-active');
				return;
			}

			const data = response.data;
			if (data.done) {
				showNotice(aicb_admin.strings.emb_rebuild_success, 'success');
				$('#aicb-progress-bar').css('width', '100%').text('100%');
				$('#aicb-progress-status').text(aicb_admin.strings.emb_rebuild_success);
				$btn.prop('disabled', false);
				$spinner.removeClass('is-active');
				setTimeout(() => { window.location.reload(); }, 2000);
			} else {
                // Guard against totals changing mid-run: clamp to 100% and never show processed > total visually
                const totalAdj = Math.max(1, Math.max(Number(data.total) || 0, Number(data.processed) || 0));
                const pct = Math.min(100, Math.round((Number(data.processed) || 0) / totalAdj * 100));
                $('#aicb-progress-bar').css('width', pct + '%').text(pct + '%');
                $('#aicb-progress-status').text(`Processing ${data.processed} / ${totalAdj}...`);
                window.aicbProcessBatch();
			}
		})
		.fail(() => {
			showNotice(aicb_admin.strings.emb_rebuild_failed, 'error');
			$btn.prop('disabled', false);
			$spinner.removeClass('is-active');
		});
    }

    // Rebuild embeddings now
    $(document).on('click', '#aicb-rebuild-embeddings', function(e) {
        e.preventDefault();
        const $btn = $(this);
        const $spinner = $btn.siblings('.spinner');

        $btn.prop('disabled', true);
        $spinner.addClass('is-active');
        $('#aicb-progress-bar-container').show();
        $('#aicb-progress-status').text(aicb_admin.strings.emb_rebuild_in_progress);
        $('#aicb-cancel-rebuild').show();

    $.post(aicb_admin.ajax_url, { action: 'aicb_start_embedding_rebuild', nonce: aicb_admin.nonce, force: 1 })
        .done(response => {
            if (!response.success) {
                showNotice(response.data.message, 'error');
                $btn.prop('disabled', false);
                $spinner.removeClass('is-active');
                $('#aicb-cancel-rebuild').hide();
                return;
            }
            window.aicbProcessBatch();
        })
        .fail(() => {
            showNotice(aicb_admin.strings.emb_rebuild_failed, 'error');
            $btn.prop('disabled', false);
            $spinner.removeClass('is-active');
            $('#aicb-cancel-rebuild').hide();
        });
    });

    // Cancel rebuild
    $(document).on('click', '#aicb-cancel-rebuild', function(e){
        e.preventDefault();
        const $btn = $('#aicb-rebuild-embeddings');
        const $spinner = $btn.siblings('.spinner');
        const $cancel = $(this);
        $cancel.prop('disabled', true);
        $.post(aicb_admin.ajax_url, { action: 'aicb_cancel_embedding_rebuild', nonce: aicb_admin.nonce })
        .always(() => {
            $spinner.removeClass('is-active');
            $btn.prop('disabled', false);
            $('#aicb-progress-bar-container').hide();
            $('#aicb-progress-status').text('');
            $('#aicb-progress-bar').css('width','0%').text('0%');
            $cancel.hide().prop('disabled', false);
        });
    });

    function checkRebuildStatus() {
        $.post(aicb_admin.ajax_url, { action: 'aicb_get_embedding_progress', nonce: aicb_admin.nonce })
        .done(response => {
            if (response.success && response.data.total > 0 && response.data.processed < (response.data.total * 10)) { // loose check, UI will clamp
                const data = response.data;
                const totalAdj = Math.max(1, Math.max(Number(data.total) || 0, Number(data.processed) || 0));
                const percentage = Math.min(100, Math.round((Number(data.processed) || 0) / totalAdj * 100));
                $('#aicb-progress-bar-container').show();
                $('#aicb-progress-bar').css('width', percentage + '%').text(percentage + '%');
                $('#aicb-progress-status').text(`Processing ${data.processed} / ${totalAdj}...`);
                $('#aicb-rebuild-embeddings').prop('disabled', true);
				$('#aicb-rebuild-embeddings').siblings('.spinner').addClass('is-active');
                $('#aicb-cancel-rebuild').show();
                setTimeout(window.aicbProcessBatch, 1000); // Give a second before starting
            }
        });
    }

    if ($('#aicb-rebuild-embeddings').length) {
        checkRebuildStatus();
    }

    // Enriched chunks editor: save button
    $(document).on('click', '.aicb-save-enriched', function(e){
        e.preventDefault();
        const $btn = $(this);
        const id = $btn.data('id');
        const $row = $btn.closest('tr');
        const text = $row.find('.aicb-enriched-text').val();
        $btn.prop('disabled', true);
        $.post(aicb_admin.ajax_url, { action: 'aicb_update_enriched_chunk', nonce: aicb_admin.nonce, id, text })
            .done((res) => {
                if (res && res.success) {
                    showNotice(res.data && res.data.message ? res.data.message : 'Saved', 'success');
                } else {
                    const msg = res && res.data && res.data.message ? res.data.message : aicb_admin.strings.generic_error;
                    showNotice(msg, 'error');
                }
            })
            .fail(() => showNotice(aicb_admin.strings.generic_error, 'error'))
            .always(() => $btn.prop('disabled', false));
    });

    // Rebuild only updated chunks (loop until queue is empty)
    $(document).on('click', '#aicb-rebuild-updated', function(e){
        e.preventDefault();
        const $btn = $(this);
        const $sp = $btn.next('.spinner');
        $btn.prop('disabled', true); $sp.addClass('is-active');
        const runOnce = () => {
            return $.post(aicb_admin.ajax_url, { action: 'aicb_rebuild_updated_chunks', nonce: aicb_admin.nonce })
                .done((res) => {
                    if (res && res.success) {
                        const d = res.data || {};
                        const rem = d.remaining || 0;
                        const proc = d.processed || 0;
                        if (proc) { showNotice(`Rebuilt ${proc} chunk(s).`, 'success'); }
                        if (rem > 0) {
                            $btn.text(`Rebuild updated only (${rem})`);
                            return runOnce();
                        } else {
                            $btn.text('Rebuild updated only');
                        }
                    } else {
                        const msg = res && res.data && res.data.message ? res.data.message : aicb_admin.strings.generic_error;
                        showNotice(msg, 'error');
                    }
                })
                .fail(() => showNotice(aicb_admin.strings.generic_error, 'error'));
        };
        runOnce().always(() => { $btn.prop('disabled', false); $sp.removeClass('is-active'); });
    });

    // Save per-entry summary
    $(document).on('click', '#aicb-save-entry-summary', function(e){
        e.preventDefault();
        const $btn = $(this);
        const entry = $btn.data('entry');
        const summary = $('#aicb-entry-summary').val();
        const apply = $('#aicb-apply-to-chunks').is(':checked');
        $btn.prop('disabled', true);
        $.post(aicb_admin.ajax_url, { action: 'aicb_update_entry_summary', nonce: aicb_admin.nonce, entry_id: entry, summary, apply })
            .done((res) => {
                if (res && res.success) {
                    const d = res.data || {}; showNotice(`Saved. Updated ${d.updated||0} chunks; queued ${d.queued||0}.`, 'success');
                } else { showNotice((res && res.data && res.data.message) || aicb_admin.strings.generic_error, 'error'); }
            })
            .fail(() => showNotice(aicb_admin.strings.generic_error, 'error'))
            .always(() => $btn.prop('disabled', false));
    });

    // Rebuild only updated for a single entry
    $(document).on('click', '#aicb-rebuild-updated-entry', function(e){
        e.preventDefault();
        const $btn = $(this); const $sp = $btn.next('.spinner');
        const entry = $btn.data('entry');
        $btn.prop('disabled', true); $sp.addClass('is-active');
        const loop = () => $.post(aicb_admin.ajax_url, { action: 'aicb_rebuild_updated_chunks', nonce: aicb_admin.nonce, source_id: entry })
            .done((res) => { if (res && res.success) { const rem = (res.data && res.data.remaining) || 0; if (rem>0) return loop(); } else { showNotice(aicb_admin.strings.generic_error, 'error'); } })
            .fail(() => showNotice(aicb_admin.strings.generic_error, 'error'));
        loop().always(()=>{ $btn.prop('disabled', false); $sp.removeClass('is-active'); });
    });
});
