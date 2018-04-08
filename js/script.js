var context, img_width, img_height, img_name;

$( function() {
	$("#chkInv").checkboxradio();
	$("#chkInv").click(function(event) {
		if(this.checked) {
			$("#help").text("(White is background):");
		} else {
			$("#help").text("(Black is background):");
		}
		doConvert(); 
	});
	$("#refresh").hide();
	$("#refresh").button();
	$("#contrastSpan").hide();
	$("#invertedSpan").hide();
    $("#contrast").spinner({
	    min: 1,
	    max: 254,
	    spin: function(event, ui) {
	        $(this).change();
	        doConvert();
	    }
	});
	$("#contrast").spinner("value", 128);
	
	var canvas = document.getElementById('canvas');
	context = canvas.getContext('2d');
	
	$("#file_input").change(function(e){
	    var URL = window.URL;
	    img_name = e.target.files[0].name;
	    var url = URL.createObjectURL(e.target.files[0]);
	    var img = new Image();
	    img.src = url;
	    img.onload = function() {
            img_width = img.width;
            img_height = img.height;
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0, img_width, img_height);
	        doConvert();
	    }
	});
});

function doConvert() {
	$("#file_input").hide();
	$("#refresh").show();
	$("#contrastSpan").show();
	$("#invertedSpan").show();
	var contrast = $("#contrast").spinner("value");
	var imgData = context.getImageData(0,0,img_width, img_height).data;
	var data = "const unsigned char data_" + img_name.substring(0,img_name.length - 4) + "[] PROGMEM = {";
	for(var e=0;e<img_height/8;e++) {
		for(var x=0;x<img_width;x++) {
			var byte = 0;
			if($("#chkInv").prop('checked')) {
				byte = 0xFF;
			}
			for(var y=0;y<8;y++) {
				var c = getPixel(imgData, x, y + 8*e);
				if(c > contrast) {
					if($("#chkInv").prop('checked')) {
						byte &= ~(1 << y);
					} else {
						byte |= (1 << y);
					}
				}
			}
			if(e > 0 || x > 0) {
				data += ", ";
			}
			data += "0x" + convert(byte);
		}
	}
	data += "};";
	$("#output").val(data);
}

function getPixel(data, x, y) {
	var pix = context.getImageData(x,y,1,1).data;
	return (pix[0] + pix[1] + pix[2]) / 3;
}

function convert(integer) {
    var str = Number(integer).toString(16).toUpperCase();
    return str.length == 1 ? "0" + str : str;
};