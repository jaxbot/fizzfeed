var SHARE_URLS = {
  fb: "https://www.facebook.com/sharer/sharer.php?u=",
  tw: "https://twitter.com/intent/tweet?via=slackernews&url=",
  gp: "https://plus.google.com/share?url="
}

function share(via) {
  window.open(SHARE_URLS[via] + encodeURIComponent(window.location), "sharer", "width=700,height=400,menubar=no,toolbar=no,resizable=yes,scrollbars=yes");
}
