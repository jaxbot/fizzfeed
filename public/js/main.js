var tagLines = ["slacking coders", "when tests are running", "when code is compiling", "when npm is down", "cookie clicker lovers"];
var curTag = 0;

function updateTagline() {
  curTag++;

  document.getElementById("forwhom").innerHTML = tagLines[curTag % tagLines.length];
}

setInterval(updateTagline, 4000);

