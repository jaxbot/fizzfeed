var tagLines = ["slacking coders", "when tests are running", "when code is compiling", "when npm is down", "cookie clicker lovers"];
var curTag = 0;

function updateTagline() {
  curTag++;

  document.getElementById("forwhom").innerHTML = tagLines[curTag % tagLines.length];
}

setInterval(updateTagline, 4000);

function ajaxUpload(action) {
  var xhr = new XMLHttpRequest();
  var files = document.getElementById("filechooser").files;
  var formdata = new FormData();

  formdata.append('files', files[0], files[0].name);
  xhr.open("POST", "/upload");
  xhr.onload = function() {
    if (xhr.status == 200) {
      var img = "/uploads/" + xhr.responseText;
      switch (action) {
	case "thumb":
	  document.getElementById("imgtxt").value = img;
	  document.getElementById("imgthumb").value = img;
	  break;
	case "insert":
	  insertAtEnd("<img src=\"" + img + "\">");
	  break;

      }
      alert(xhr.responseText);
    }
  }
  xhr.send(formdata);
}
