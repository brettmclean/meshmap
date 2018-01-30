var files = files || [];
for(var i = 0; i < files.length; i++) {
	var s = document.createElement("script");
	s.type = "text/javascript";
	s.src = files[i];
	s.async = false;
	document.body.appendChild(s);
}
