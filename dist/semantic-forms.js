(function(root,factory){if(typeof exports==="object"&&typeof module==="object")module.exports=factory();else if(typeof define==="function"&&define.amd)define("semanticForms",[],factory);else if(typeof exports==="object")exports["semanticForms"]=factory();else root["semanticForms"]=factory()})(this,(()=>/******/(()=>{// webpackBootstrap
/******/var __webpack_modules__={
/***/90:
/***/module=>{const semanticForms=()=>{
// do some feature detection so none of the JS executes if the browser is too old
if(typeof document.getElementsByClassName!=="function"||typeof document.querySelector!=="function"||!document.body.classList||!window.MutationObserver){console.warn("semantic-forms was loaded into an unsupported browser and will not execute.");return}const passwordShow='<svg fill="none" height="256" viewBox="0 0 24 24" width="256" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m1 12s4-8 11-8 11 8 11 8"/><path d="m1 12s4 8 11 8 11-8 11-8"/><circle cx="12" cy="12" r="3"/></g></svg>';const passwordHide='<svg fill="none" height="256" viewBox="0 0 24 24" width="256" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m2 2 20 20"/><path d="m6.71277 6.7226c-3.04798 2.07267-4.71277 5.2774-4.71277 5.2774s3.63636 7 10 7c2.0503 0 3.8174-.7266 5.2711-1.7116m-6.2711-12.23018c.3254-.03809.6588-.05822 1-.05822 6.3636 0 10 7 10 7s-.6918 1.3317-2 2.8335"/><path d="m14 14.2362c-.5308.475-1.2316.7639-2 .7639-1.6569 0-3-1.3431-3-3 0-.8237.33193-1.5698.86932-2.11192"/></g></svg>';const helpTextIcon='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="14px" height="14px" viewBox="0 0 16 16" version="1.1"><rect width="16" height="16" fill="none"/><path fill="currentColor" d="M8,10.5c-0.552,0-1,0.448-1,1c0,0.552,0.448,1,1,1c0.552,0,1-0.448,1-1C9,10.948,8.552,10.5,8,10.5z M8,0 C3.582,0,0,3.582,0,8c0,4.418,3.582,8,8,8s8-3.582,8-8C16,3.582,12.418,0,8,0z M12.243,12.243C11.109,13.376,9.603,14,8,14 s-3.109-0.624-4.243-1.757C2.624,11.109,2,9.603,2,8s0.624-3.109,1.757-4.243C4.891,2.624,6.397,2,8,2s3.109,0.624,4.243,1.757 C13.376,4.891,14,6.397,14,8C14,9.603,13.376,11.109,12.243,12.243z M7.927,3.755c-2.248,0-2.76,1.695-2.802,2.906h1.571 c0.028-0.256,0.101-1.418,1.221-1.418c0.672,0,1.206,0.406,1.206,1.175c0,0.695-0.724,1.155-1.303,1.711 C7.241,8.685,7.168,9.325,7.168,9.824V10c0.146,0,1.615,0,1.615,0V9.824c0-1.256,1.967-1.594,1.967-3.541 C10.75,5.059,9.874,3.755,7.927,3.755z"/></svg>';const nodeNameLookup=["TEXTAREA","SELECT"];const inputTypeLookup=["checkbox","color","date","datetime-local","email","file","image","month","number","password","radio","range","search","tel","text","time","url","week"];
// progressively enhance form elements that have the semanticForms class
const forms=document.querySelectorAll("form.semanticForms:not(.semanticFormsActive)");for(const form of forms){form.classList.add("semanticFormsActive");if(form.classList.contains("lowFlow"))continue;
// update each input in the semantic form
const inputs=Array.from(form.querySelectorAll("input, textarea, select"));for(const input of inputs){
// ignore input if it has previously been formatted
if(input.classList.contains("semanticform")||!input.id)continue;const type=input.getAttribute("type");if(nodeNameLookup.includes(input.nodeName)||inputTypeLookup.includes(type)){
// recursively find <dl> element
let dl=input.parentNode;while(dl&&dl.nodeName!=="DL")dl=dl.parentNode;if(!dl)continue;if(!dl.classList.contains("floatLabelForm"))dl.classList.add("floatLabelForm");const label=input.parentNode.parentNode.id&&(type==="checkbox"||type==="radio")?document.querySelector("label[data-for="+input.parentNode.parentNode.id.replace(/\./g,"\\.")+"]"):document.querySelector("label[for="+input.id.replace(/\./g,"\\.")+"]");if(!label)console.error(`semantic-forms: Found an input (${input.id||input.getAttribute("name")}) without a properly associated label. Make sure there is a label for it and the label has a matching "for" attribute.`);input.classList.add("semanticform");
// #region create labels
if(type==="checkbox"||type==="radio"){
// recursively find <dd> element
let dd=input.parentNode;while(dd&&dd.nodeName!=="DD")dd=dd.parentNode;if(!dd){console.error(`semantic-forms: Found an input (${input.id||input.getAttribute("name")}) that is not inside a <dd> element.`);continue}if(dd.firstChild.nodeName!=="LABEL"){const newLabel=document.createElement("label");newLabel.className="floatLabelFormAnimatedLabel";if(type==="checkbox"&&input.parentNode.nodeName==="DD"){newLabel.setAttribute("for",input.id);input.parentNode.classList.add("singleCheckbox");newLabel.className="";label.setAttribute("hidden","hidden");insertAfter(newLabel,input)}newLabel.innerHTML=label.innerHTML;if(label.hasAttribute("title")&&label.getAttribute("data-show-help-icon")!==null&&!label.querySelector("span.help")){const text=label.getAttribute("title");label.innerHTML+=` <span title="${text}" class="help">${helpTextIcon}</span>`;newLabel.innerHTML+=` <span title="${text}" class="help">${helpTextIcon}</span>`}if(dd.querySelector(":required")&&label.getAttribute("data-no-asterisk")===null&&!label.querySelector("span.required")){const text=label.getAttribute("data-asterisk-text")||"This field is required.";label.innerHTML+=` <span title="${text}" class="required">*</span>`;newLabel.innerHTML+=` <span title="${text}" class="required">*</span>`}if(!dd.querySelector("label"))dd.append(newLabel)}
// removes old div that a radio or checkbox may have been added to
if(dd.parentElement.nodeName==="DIV")dd.parentElement.remove();const div=document.createElement("div");div.append(label.closest("dt"),dd);dl.append(div)}else{const newLabel=document.createElement("label");newLabel.setAttribute("for",input.id);newLabel.className="floatLabelFormAnimatedLabel";newLabel.innerHTML=label.innerHTML;if(input.hasAttribute("title")&&label.getAttribute("data-show-help-icon")!==null&&!label.querySelector("span.help")){const text=input.getAttribute("title");newLabel.innerHTML+=` <span title="${text}" class="help">${helpTextIcon}</span>`}if(input.hasAttribute("required")&&label.getAttribute("data-no-asterisk")===null&&!label.querySelector("span.required")){const text=label.getAttribute("data-asterisk-text")||"This field is required.";newLabel.innerHTML+=` <span title="${text}" class="required">*</span>`}label.setAttribute("hidden","hidden");insertAfter(newLabel,input)}
// #endregion
// standard inputs
if(type!=="checkbox"&&type!=="radio"){if(!input.getAttribute("placeholder"))input.setAttribute("placeholder"," ");const div=document.createElement("div");const dt=label.closest("dt");const dd=input.closest("dd");if(!dt){console.error(`semantic-forms: Found an input (${input.id||input.getAttribute("name")}) that does not have a corresponding <dt> element.`);continue}if(!dd){console.error(`semantic-forms: Found an input (${input.id||input.getAttribute("name")}) that does not have a corresponding <dd> element.`);continue}
// #region clear button
if(input.nodeName!=="SELECT"&&type!=="range"){const clearBtn=document.createElement("button");clearBtn.type="button";clearBtn.title=input.getAttribute("data-clear-field-text")||"Clear field";clearBtn.ariaLabel=input.getAttribute("data-clear-field-text")||"Clear field";clearBtn.tabIndex=-1;clearBtn.innerHTML='<svg viewBox="0 0 16 16" width="18" height="18"><path d="M 1 1 L 15 15 M 1 15 L 15 1" fill="none" stroke-width="2" stroke="currentColor" />';clearBtn.classList.add("clear");clearBtn.id=`semanticFormsClearButton_${input.id}`;clearBtn.addEventListener("click",(event=>{input.previousValue=input.value;input.value="";input.focus();lastClearFieldPressed=input.id}));insertAfter(clearBtn,dd.querySelector("label"))}input.addEventListener("focus",(event=>{if(event.target.nodeName==="INPUT")lastFocusedInput=event.target}));
// #endregion
// check for colspan- utility class
if(/colspan-/.test(dd.className)){const match=dd.className.match(/colspan-([0-9]|full)/)[0];dd.classList.remove(match);div.classList.add(match)}div.append(dt,dd);dl.append(div);
// determine visibility of newly created <div>
if(dt.style.display==="none"&&dd.style.display==="none")div.style.display="none"}
// handle file input clear btn, cannot be handled with CSS
if(type==="file"){const clearBtn=input.parentElement.querySelector(".clear");input.addEventListener("input",(e=>{clearBtn.style.display=e.target.files.length?"flex":"none"}));clearBtn.addEventListener("click",(()=>{clearBtn.style.display="none"}))}
// #region show password button
if(type==="password"&&input.getAttribute("data-no-reveal")===null){const showBtn=document.createElement("button");showBtn.type="button";showBtn.title=input.getAttribute("data-show-password-text")||"Show password";showBtn.ariaLabel=input.getAttribute("data-show-password-text")||"Show password";showBtn.tabIndex=-1;showBtn.innerHTML=passwordShow;showBtn.classList.add("show");showBtn.id=`semanticFormsShowButton_${input.id}`;const dd=input.closest("dd");if(!dd){console.error(`semantic-forms: Found an input (${input.id||input.getAttribute("name")}) that is not inside a <dd> element.`);continue}showBtn.addEventListener("click",(event=>{if(input.type==="password"){showBtn.innerHTML=passwordHide;showBtn.title=input.getAttribute("data-hide-password-text")||"Hide password";showBtn.ariaLabel=input.getAttribute("data-hide-password-text")||"Hide password";input.type="text"}else{showBtn.innerHTML=passwordShow;showBtn.title=input.getAttribute("data-show-password-text")||"Show password";showBtn.ariaLabel=input.getAttribute("data-show-password-text")||"Show password";input.type="password"}input.focus()}));insertAfter(showBtn,dd.querySelector("label"))}
// #endregion
// add listener to shift clear button when scrollbar present
for(const textarea of document.querySelectorAll("textarea")){
// shifts the close button to the right if a scrollbar is present
const shiftCloseBtn=()=>{const clearBtn=textarea.parentElement?.querySelector("button.clear");if(clearBtn)clearBtn.style.marginRight=textarea.clientHeight<textarea.scrollHeight?"15px":""};textarea.addEventListener("input",shiftCloseBtn);textarea.addEventListener("mouseup",shiftCloseBtn)}}}}
/**
   * Places an element immediately after another element
   * @param {Object} newNode element being placed after the reference node
   * @param {*} referenceNode element to be used as reference for new node
   */function insertAfter(newNode,referenceNode){if(referenceNode.nextSibling)referenceNode.parentNode.insertBefore(newNode,referenceNode.nextSibling);else referenceNode.parentNode.appendChild(newNode)}
// handle undo/redo
let lastFocusedInput;let lastClearFieldPressed;document.addEventListener("keydown",(event=>{if((event.ctrlKey||event.metaKey)&&event.key==="z"&&!event.shiftKey){
// undo clearing a field
if(lastFocusedInput)if(lastFocusedInput?.parentNode?.querySelector("button.clear").id===`semanticFormsClearButton_${lastClearFieldPressed}`||lastFocusedInput?.parentNode?.querySelector("button.clear").name===`semanticFormsClearButton_${lastClearFieldPressed}`)if(lastFocusedInput.previousValue){lastFocusedInput.redoValue=lastFocusedInput.value;lastFocusedInput.value=lastFocusedInput.previousValue}}else if(event.ctrlKey&&event.key==="y"||event.metaKey&&event.shiftKey&&event.key==="z")
// redo clearing a field
if(lastFocusedInput)if(lastFocusedInput?.parentNode?.querySelector("button.clear").id===`semanticFormsClearButton_${lastClearFieldPressed}`||lastFocusedInput?.parentNode?.querySelector("button.clear").name===`semanticFormsClearButton_${lastClearFieldPressed}`)if(lastFocusedInput.redoValue){lastFocusedInput.previousValue=lastFocusedInput.value;lastFocusedInput.value=lastFocusedInput.redoValue}}));
// monitor changes to the DOM and enhance new semanticForms forms that get added
if(!window.semanticFormsObserver){window.semanticFormsObserver=new window.MutationObserver((mutations=>{let stop=false;for(const mutation of mutations){for(const node of mutation.addedNodes)if(node.nodeName==="FORM"||node?.querySelector?.("form")){semanticForms();stop=true}if(stop)break}}));window.semanticFormsObserver.observe(document.body,{attributes:false,childList:true,characterData:false,subtree:true})}semanticForms.reinitialize=form=>{form.classList.remove("semanticFormsActive");semanticForms()}};module.exports=semanticForms
/***/}
/******/};
/************************************************************************/
/******/ // The module cache
/******/var __webpack_module_cache__={};
/******/
/******/ // The require function
/******/function __webpack_require__(moduleId){
/******/ // Check if module is in cache
/******/var cachedModule=__webpack_module_cache__[moduleId];
/******/if(cachedModule!==void 0)
/******/return cachedModule.exports;
/******/
/******/ // Create a new module (and put it into the cache)
/******/var module=__webpack_module_cache__[moduleId]={
/******/ // no module.id needed
/******/ // no module.loaded needed
/******/exports:{}
/******/};
/******/
/******/ // Execute the module function
/******/__webpack_modules__[moduleId](module,module.exports,__webpack_require__);
/******/
/******/ // Return the exports of the module
/******/return module.exports;
/******/}
/******/
/************************************************************************/
/******/
/******/ // startup
/******/ // Load entry module and return exports
/******/ // This entry module is referenced by other modules so it can't be inlined
/******/var __webpack_exports__=__webpack_require__(90);
/******/
/******/return __webpack_exports__;
/******/})()));
//# sourceMappingURL=semantic-forms.js.map