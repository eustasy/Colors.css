/*global $*/
$(function() {
	$.getJSON('colors.json', function( data ) {
		var css = '/*! Colors.css 1.9.0 | MIT License | https://github.com/eustasy/colors.css */\n'
		//console.log(data)
		$.each( data, function( group, list ) {
			//console.log(group + ': ' + list)
			css += '/* $$ ' + group + ' */\n'
			if ( group == 'Baseline' ) {
				group = ''
			} else {
				group = group.replace(/\s+/g, '').toLowerCase() + '-'
			}
			var typeIndex
			var types = ['background', 'color', 'fill']
			for (typeIndex = 0; typeIndex < types.length; ++typeIndex) {
				css += '/* $ ' + types[typeIndex].charAt(0).toUpperCase() + types[typeIndex].slice(1) + 's */\n'
				$.each( list, function( key, val ) {
					//console.log(key + ': ' + val)
					css += '.' + types[typeIndex] + '-' + group + key.replace(/\s+/g, '-').toLowerCase() + ' { background: ' + val.toLowerCase() + '; }\n'
				})
			}
		})
		$('#js-target-css').val(css)
	})
})
