/*global $*/
$(function() {
	$.getJSON('colors.json', function( data ) {
		//console.log(data)
		swatches = ''
		$.each( data, function( group, list ) {
			//console.log(group + ': ' + list)
			swatches += '<section class="whole grid">'
			swatches += '<h2 id="' + group + '">' + group + '</h2>'
			if ( group == 'Baseline' ) {
				group = ''
			} else {
				group = group.replace(/\s+/g, '').toLowerCase() + '-'
			}
			var typeIndex
			var types = ['background', 'color', 'fill']
			for (typeIndex = 0; typeIndex < types.length; ++typeIndex) {
				swatches += '<div class="whole smablet-third">'
				swatches += '<h3 id="' + group + '-' + types[typeIndex] + '">'
				swatches += types[typeIndex].charAt(0).toUpperCase() + types[typeIndex].slice(1) + '</h3>'
				$.each( list, function( key, val ) {
					//console.log(key + ': ' + val)
					name = types[typeIndex] + '-' + group + key.replace(/\s+/g, '-').toLowerCase()
					swatches += '<div class="css-colors-box ' + name + '">' + name + '</div>'
				})
				swatches += '</div>'
			}
			swatches += '</section>'
			swatches += '<hr class="section-breaker">'
		})
		$('#js-target-swatches').html(swatches)
	})
})
