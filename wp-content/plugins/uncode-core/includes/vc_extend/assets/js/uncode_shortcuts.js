(function() {
	tinymce.create('tinymce.plugins.uncode_shortcuts', {
		init: function(ed, url) {
			ed.onPreInit.add(function(ed) {

				// Get the DOM document object for the IFRAME
				var doc = ed.getDoc();

				// Create the script we will add to the header asynchronously
				var jscript = "(function() {\n\
					document.addEventListener('keydown', function(e) {\n\
						window.parent.listenKeyboardEvents(e, window.parent, true);\n\
					});\n\
				})();";

				var script = doc.createElement("script");
				script.type = "text/javascript";
				script.appendChild(doc.createTextNode(jscript));

				// Add the script to the header
				doc.getElementsByTagName('head')[0].appendChild(script);

			});

		},
	});
	tinymce.PluginManager.add('uncode_shortcuts', tinymce.plugins.uncode_shortcuts);
})();
