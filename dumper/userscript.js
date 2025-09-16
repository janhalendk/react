// ==UserScript==
// @name         ReactSearch
// @namespace    http://tampermonkey.net/
// @version      1.0.2
// @description  Dump raw JSON data from React based web sites
// @author       janhalendk
// @match        *://*/*
// @icon         https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://react.dev&size=64
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @noframes

// ==/UserScript==

/**
 * This is for pulling stuff from reactProps
 */

(function () {
  const searchTerm = function () {
      // get a string representation of a given HTML node
      function extractOpeningTag(element) {
          const tagName = element.localName;
          const attributes = Array.from(element.attributes)
              .map(attr => `${attr.name}="${attr.value}"`)
              .join(' ');
          return `<${tagName} ${attributes}>`;
      }

      // drill into a given HTML node based on array of props
      function drill(element, propArray) {
          let drilled = element;
          for (let p of propArray) {
              drilled = drilled[p]
          }
          if (drilled && drilled !== null && drilled.hasOwnProperty("props")) {
              drilled = drilled.props;
              propArray.push("props");
          }
          return drilled
      }

      // dump JSON from HTML node based on array of props
      function extractJSON(tag, propArray, tagHTML) {
          let EXCLUDES = ["className"];
          let data;
          let drilled = drill(tag, propArray);
          try {
              let json = JSON.parse(JSON.stringify(drilled));
              let jsonKeys = Object.keys(json);

              // ignore data that's just {"children": "some value" / 123 / null} - reduce noise on output
              if (jsonKeys.length === 1 && ["string", "number", "undefined"].includes(typeof json[jsonKeys[0]])) {
                  return data
              }
              let jsonStr = JSON.stringify(json);
              let curPath = [tagHTML, ...propArray];
              let path = curPath.join(" | ");
              /* dump everything in scope if returnAll is true - otherwise match on all given searchTerms */
              if (json && Object.keys(json).length > 0 && EXCLUDES.indexOf(Object.keys(json).toString()) === -1) {
                  if (returnAll || searchTerms.every(term => jsonStr.toLowerCase().includes(term.toLowerCase()))) {
                      console.log(`[+] Hit for search term(s) - ${path}`);
                      console.log(tag);
                      console.log(JSON.stringify(json, null, 4));
                      data = { path, json };
                      hitCount += 1;
                  }
              }
          } catch (err) { }
          return data
      }

      // main logic
      console.log("[*] Starting React Tools - keyword search");
      var hitCount = 0;
      var isReact = false;
      for (let e of document.querySelectorAll('*')) {
          if (Object.keys(e).toString().includes("__react")) {
              isReact = true;
              break
          }
      };
      if (isReact === false) {
          let msg = "This site does not use React. Sorry";
          console.log(msg);
          alert(msg);
          return
      }
      let searchTermStr = prompt("Input search term(s). Separate terms by ',' - or return all with '*'");

      /* filter out empty search and abouts */
      if (!searchTermStr || !searchTermStr.trim().length > 0) {
          console.log("Empty search / search aborted");
          return
      }

      /* trim searchTermStr - and check if user wants to dump everything, indicated by '*' */
      searchTermStr = searchTermStr.trim();
      let returnAll = searchTermStr === "*" ? true : false;

      /* create searchTerms array and trim each element */
      var searchTerms = searchTermStr.split(",").filter(term => term.trim().length > 0);;
      console.log(`[*] Screening for ${searchTerms.length} search term(s) (${searchTerms})`)

      /* set the tags you want to loop through here */
      let WANTED_TAGS = ["div", "article"];
      let WANTED_TAGS_STR = WANTED_TAGS.join(",");
      console.log(`[*] Extracting for tags: ${WANTED_TAGS_STR}`);
      let outSet = new Set();
      for (let tag of document.querySelectorAll(WANTED_TAGS_STR)) {
          let tagHTML = extractOpeningTag(tag);
          for (let prop of Object.keys(tag)) {
              let data;
              if (!prop.includes("__reactProps")) {
                  continue
              }
              data = extractJSON(tag, [prop], tagHTML);
              if (data) {
                  outSet.add(data);
                  continue;
              }
              /* we try each if the tags children instead since no dice */
              let elementChildren = tag[prop].children;
              if (typeof elementChildren !== "undefined" && Symbol.iterator in Object(elementChildren)) {
                  for (let child of elementChildren) {
                      if (!typeof child === 'object') {
                          continue
                      } else {
                          let index = elementChildren.indexOf(child);
                          data = extractJSON(tag, [prop, "children", index], tagHTML);
                          if (data) {
                              outSet.add(data);
                              continue;
                          }
                      }
                  }
              }

          }
      };
      let outObj = new Object();
      var i = 0;
      for (let e of outSet) {
          outObj[i] = e;
          i++
      };
      GM_setClipboard(JSON.stringify(outObj, null, 4));
      console.log(`[*] Keyword search complete: ${hitCount} matches found`);
  }
  GM_registerMenuCommand("reactProps", searchTerm);
})();


/**
* This is for pulling stuff from reactFiber
*/
(function () {
  const searchTerm = function () {
      // get a string representation of a given HTML node
      function extractOpeningTag(element) {
          const tagName = element.localName;
          const attributes = Array.from(element.attributes)
              .map(attr => `${attr.name}="${attr.value}"`)
              .join(' ');
          return `<${tagName} ${attributes}>`;
      }

      // drill into a given HTML node based on array of props
      function drill(element, propArray) {
          let drilled = element;
          for (let p of propArray) {
              drilled = drilled[p]
          }
          if (drilled && drilled !== null && drilled.hasOwnProperty("props")) {
              drilled = drilled.props;
              propArray.push("props");
          }
          return drilled
      }

      // dump JSON from HTML node based on array of props
      function extractJSON(tag, propArray, tagHTML) {
          let EXCLUDES = ["className"];
          let data;
          let drilled = drill(tag, propArray);
          try {
              let json = JSON.parse(JSON.stringify(drilled));
              let jsonKeys = Object.keys(json);

              // ignore data that's just {"children": "some value" / 123 / null} - reduce noise on output
              if (jsonKeys.length === 1 && ["string", "number", "undefined"].includes(typeof json[jsonKeys[0]])) {
                  return data
              }
              let jsonStr = JSON.stringify(json);
              let curPath = [tagHTML, ...propArray];
              let path = curPath.join(" | ");
              /* dump everything in scope if returnAll is true - otherwise match on all given searchTerms */
              if (json && Object.keys(json).length > 0 && EXCLUDES.indexOf(Object.keys(json).toString()) === -1) {
                  if (returnAll || searchTerms.every(term => jsonStr.toLowerCase().includes(term.toLowerCase()))) {
                      console.log(`[+] Hit for search term(s) - ${path}`);
                      console.log(tag);
                      console.log(JSON.stringify(json, null, 4));
                      data = { path, json }
                      hitCount += 1
                  }
              }
          } catch (err) { }
          return data
      }

      // main logic
      console.log("[*] Starting React Tools - keyword search");
      var hitCount = 0;
      var isReact = false;
      for (let e of document.querySelectorAll('*')) {
          if (Object.keys(e).toString().includes("__react")) {
              isReact = true;
              break
          }
      };
      if (isReact === false) {
          let msg = "This site does not use React. Sorry";
          console.log(msg);
          alert(msg);
          return
      }
      let searchTermStr = prompt("Input search term(s). Separate terms by ',' - or return all with '*'");

      /* filter out empty search and abouts */
      if (!searchTermStr || !searchTermStr.trim().length > 0) {
          console.log("Empty search / search aborted");
          return
      }

      /* trim searchTermStr - and check if user wants to dump everything, indicated by '*' */
      searchTermStr = searchTermStr.trim();
      let returnAll = searchTermStr === "*" ? true : false;

      /* create searchTerms array and trim each element */
      var searchTerms = searchTermStr.split(",").filter(term => term.trim().length > 0);;
      console.log(`[*] Screening for ${searchTerms.length} search term(s) (${searchTerms})`)

      /* set the tags you want to loop through here */
      let WANTED_TAGS = ["div", "article"];
      let WANTED_TAGS_STR = WANTED_TAGS.join(",");
      console.log(`[*] Extracting for tags: ${WANTED_TAGS_STR}`);
      let outSet = new Set();
      for (let tag of document.querySelectorAll(WANTED_TAGS_STR)) {
          let tagHTML = extractOpeningTag(tag);
          for (let prop of Object.keys(tag)) {
              let data;
              if (!prop.includes("__reactFiber")) {
                  continue
              }
              data = extractJSON(tag, [prop], tagHTML);
              if (data) {
                  outSet.add(data);
                  continue;
              }
              /* we try each if the tag's return instead since no dice - and only memoizedState, memoizedProps and pendingProps */
              let returnElement = tag[prop].return;
              if (typeof returnElement !== "undefined") {
                  for (let child of ["memoizedState", "memoizedProps", "pendingProps"]) {
                      data = extractJSON(tag, [prop, "return", child], tagHTML);
                      if (data) {
                          outSet.add(data);
                          continue;
                      }
                  }
              }
          }
      };
      let outObj = new Object();
      var i = 0;
      for (let e of outSet) {
          outObj[i] = e;
          i++
      };
      GM_setClipboard(JSON.stringify(outObj, null, 4));
      console.log(`[*] Keyword search complete: ${hitCount} matches found`);
  }
  GM_registerMenuCommand("reactFiber", searchTerm);

})();


