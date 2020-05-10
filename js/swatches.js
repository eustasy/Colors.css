/*global $*/
$(function() {
	$.getJSON('../data/index.json', function( data ) {
		//console.log(data)
		$.each( data, function( name, slug ) {
			//console.name(name + ': ' + slug)
			var palette = ''
			palette += '<section class="whole grid">'
			palette += '<h2 id="' + slug + '">' + name + '</h2>'
			palette += '<div id="js-target-swatches-' + slug + '" style="' +
			'display: block; columns: 3;"></div>'
			palette += '</section>'
			palette += '<hr class="section-breaker">'
			//console.log(palette)
			$('#js-target-swatches').append(palette)

			$.getJSON('../data/' + slug + '.json', function( palette ) {
				//console.log(slug)
				//console.log(palette)
				var swatches = ''
				$.each( palette, function( color, hex ) {
					//console.log(color + ': ' + hex)
					var c = hex.replace('#', '')
					var c_r = parseInt(c.substr(0, 2), 16)
					var c_g = parseInt(c.substr(2, 2), 16)
					var c_b = parseInt(c.substr(3, 2), 16)
					c = ( ( c_r * 299 ) + ( c_g * 587 ) + ( c_b * 114 ) ) / 1000
					//console.log(c)
					swatches += '<div class="css-colors-box" style="' +
					'background: ' + hex + '; color: ' + ((c < 100) ? '#fff' : '#000') +
					 ';">' + color + '</div>'
				})
				//console.log(swatches)
				//console.log($('#js-target-swatches-' + slug))
				$('#js-target-swatches-' + slug).html(swatches)
			})
		})
	})
})
