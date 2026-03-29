console.log("Content script loaded");

let scrolling = false;
let speed = 1;
let direction = 1;
let turning = false;
let pageTurnDelay = 2000;
let triggerAtButton = false;

startScroll();


function startScroll() { scrolling = true; }
function stopScroll() { scrolling = false; }

function autoScroll() {
  if (scrolling) {
    window.scrollBy({ top: speed * direction, behavior: "smooth" });
  }
  requestAnimationFrame(autoScroll);
  //call auto everyframe 
}
autoScroll();


function isAtBottom(offset = 10) {
  return (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - offset);
  //height of visible screen + how far you've scrolled down from the top 
  // >=
  // height of the entire page
}

function isAtTop(offset = 10) {
  return window.scrollY <= offset;
}

function isButtonVisible(element) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return rect.top <= window.innerHeight && rect.bottom >= 0;
}




function getCurrentChapter() {
  const url = window.location.href.toLowerCase();
  //full page url but lower case

  //  common patterns
  const match = url.match(/chapter[-\/ ]?(\d+(\.\d+)?)/i)
             || url.match(/ch[-\/ ]?(\d+(\.\d+)?)/i)
             || url.match(/\/(\d+(\.\d+)?)(\/|$)/)
             || url.match(/oyasumi-chapter[-\/ ]?(\d+(\.\d+)?)/i);

  if (match) return parseFloat(match[1]);
  //if match is found it converts chapter number into a number

  console.warn("Could not detect current chapter");
  return null;
}


function getLinks() {
  return Array.from(document.querySelectorAll("a")) //scans page and grabs every a tag //a href=/"chapter-1" - all
  //usable urls on the page
    .filter(a => a.href && a.offsetParent !== null);//usable url 
}
//


function getChapterFromLink(link) {
  const url = link.href.toLowerCase();

  const match = url.match(/chapter[-\/ ]?(\d+(\.\d+)?)/i)
             || url.match(/ch[-\/ ]?(\d+(\.\d+)?)/i)
             || url.match(/\/(\d+(\.\d+)?)(\/|$)/)
             || url.match(/oyasumi-chapter[-\/ ]?(\d+(\.\d+)?)/i);

  if (match) return parseFloat(match[1]);

  return null;
}

// ------------Find Next Chapter
function findNextLink() {
  const current = getCurrentChapter(); 
  if (current === null) return null;

  const links = getLinks();//array of usuable links on page

  let best = null;
  let smallestDiff = Infinity;

  for (const link of links) {
    const chapter = getChapterFromLink(link);

    if (chapter !== null && chapter > current) {
      const diff = chapter - current;

      if (diff < smallestDiff) {
        smallestDiff = diff;
        best = link;
      }
    }
  }

  if (best) {
    console.log("Next chapter detected:", best.href);
  } else {
    console.warn("No next chapter found");
  }

  return best;
}


function findPrevLink() {
  const current = getCurrentChapter();
  if (current === null) return null;

  const links = getLinks();

  let best = null;
  let smallestDiff = Infinity;

  for (const link of links) {
    const chapter = getChapterFromLink(link);

    if (chapter !== null && chapter < current) {
      const diff = current - chapter;

      if (diff < smallestDiff) {
        smallestDiff = diff;
        best = link;
      }
    }
  }

  return best;
}


function checkPageTurn() {
  if (turning) return;

  const nextLink = findNextLink();
  const prevLink = findPrevLink();

  if (direction === 1 && nextLink) {
    if (
      (triggerAtButton && isButtonVisible(nextLink)) ||
      (!triggerAtButton && isAtBottom())
    ) {
      turning = true;
      console.log("Turning NEXT (chapter-based)");
       

      setTimeout(() => {
        nextLink.click();
        turning = false;
        
      }, pageTurnDelay);
    }
   
  }

  if (direction === -1 && prevLink) {
    if (
      (triggerAtButton && isButtonVisible(prevLink)) ||
      (!triggerAtButton && isAtTop())
    ) {
      turning = true;
      console.log("Turning PREV (chapter-based)");

      setTimeout(() => {
        prevLink.click();
        turning = false;
      }, pageTurnDelay);
    }
  }

  requestAnimationFrame(checkPageTurn);
}

checkPageTurn();


chrome.runtime.onMessage.addListener((msg) => {
  console.log("Received message:", msg);

  if (msg.action === "start") startScroll();
  if (msg.action === "stop") stopScroll();
  if (msg.action === "speed") speed = msg.value;
  if (msg.action === "direction") direction = msg.value;
  if (msg.action === "pageTurnDelay") pageTurnDelay = msg.value;
  if (msg.action === "setTriggerAtButton") triggerAtButton = msg.value;
});


//be able to make it slower
//change the UI of the popup
//fix speed so u can adjust it








//make autoscroller even slower
//make it so u can reverse
//make it so it turns pages on a variable timing as well
//one button for reverse and not reverse
//prev and next separate buttons that go to it at the end of the page