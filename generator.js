/*global $*/
$(function() {
	$.getJSON('colors.json', function( data ) {
		var css = '/*! Colors.css 1.8 | MIT License | https://github.com/eustasy/colors.css */\n'
		//console.log(data)
		$.each( data, function( group, list ) {
			//console.log(group + ': ' + list)
			css += '/* $$ ' + group + ' */\n'
			css += '/* $ Backgrounds */\n'
			if ( group == 'Baseline' ) {
				group = ''
			} else {
				group = group.replace(/\s+/g, '-').toLowerCase()
			}
			$.each( list, function( key, val ) {
				//console.log(key + ': ' + val)
				css += '.background-' + key.replace(/\s+/g, '-').toLowerCase() + ' { background: ' + val.toLowerCase() + '; }\n'
			})
			css += '/* $ Colors */\n'
			$.each( list, function( key, val ) {
				//console.log(key + ': ' + val)
				css += '.color-' + key.replace(/\s+/g, '-').toLowerCase() + ' { color: ' + val.toLowerCase() + '; }\n'
			})
			css += '/* $ Fills */\n'
			$.each( list, function( key, val ) {
				//console.log(key + ': ' + val)
				css += '.fill-' + key.replace(/\s+/g, '-').toLowerCase() + ' { fill: ' + val.toLowerCase() + '; }\n'
			})
		})
		$('#js-target-css').val(css)
	})
})
