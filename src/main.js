import './style/default.css'
import { getAnswer } from './answer.js'
import { getContainer, initContainer } from './container.js'

function getWebsite() {
  function configRequestImmediately(name) {
    return {
      name,
      type: "immediately"
    }
  }
  function configRequestAfterClickButton(name) {
    return {
      name,
      type: "after-click-button"
    }
  }
  if (location.hostname.indexOf(".google.") !== -1) {
    return configRequestImmediately("google")
  }
  switch (location.hostname) {
    case 'www.bing.com':
    case 'cn.bing.com':
      return configRequestImmediately("bing")
    case 'www.baidu.com':
      return configRequestImmediately("baidu")
    case 'duckduckgo.com':
      return configRequestImmediately("duckduckgo")
    case 'www.deepl.com':
      return configRequestAfterClickButton("deepl")
    default:
      return 'unknow'
  }
}

function getQuestion() {
  switch (getWebsite().name) {
    case 'baidu':
      return new URL(window.location.href).searchParams.get("wd");
    default:
      return new URL(window.location.href).searchParams.get("q");
  }
}

function initUI() {
  function googleInjectContainer() {
    const container = getContainer()
    const siderbarContainer = document.getElementById("rhs");
    if (siderbarContainer) {
      siderbarContainer.prepend(container);
    } else {
      container.classList.add("sidebar-free");
      document.getElementById("rcnt").appendChild(container);
    }
  }
  function bingInjectContainer() {
    const container = getContainer()
    const siderbarContainer = document.getElementById("b_context");
    siderbarContainer.prepend(container);
  }
  function baiduInjectContainer() {
    const container = getContainer()
    const siderbarContainer = document.getElementById("content_right");
    siderbarContainer.prepend(container);
  }
  function duckduckgoInjectContainer() {
    const container = getContainer()
    const siderbarContainer = document.getElementsByClassName("results--sidebar")[0]
    siderbarContainer.prepend(container);
  }
  function deeplInjectContainer() {
    const container = getContainer()
    container.style.maxWidth = '1000px';
    const button = document.createElement("button");
    button.innerHTML = "Chat GPT Translate";
    button.className = "chat-gpt-translate-button"
    document.getElementsByClassName("lmt__textarea_container")[0].appendChild(button);
    button.addEventListener("click", function () {
      initContainer()
      button.disabled = true
      try {
        document.getElementsByClassName("lmt__raise_alternatives_placement")[0].insertBefore(container, document.getElementsByClassName("lmt__translations_as_text")[0]);
      }
      catch {
        document.getElementsByClassName("lmt__textarea_container")[1].insertBefore(container, document.getElementsByClassName("lmt__translations_as_text")[0]);
      }
      let outlang = document.querySelectorAll("strong[data-testid='deepl-ui-tooltip-target']")[0].innerHTML
      let question = 'Translate the following paragraph into ' + outlang + ' and only ' + outlang + '\n\n' + document.getElementById('source-dummydiv').innerHTML
      getAnswer(question, (t) => {
        console.log(t)
        button.disabled = false
      })
    });
  }

  function googleTopInjectContainer() {
    GM_addStyle('.chat-gpt-container{max-width: 100%!important}')
    const container2 = getContainer();
    const mainContainer = document.querySelector("#search")
    if (mainContainer) {
      mainContainer.prepend(container2);
    }
  }
  function bingTopInjectContainer() {
    GM_addStyle('.chat-gpt-container{max-width: 100%!important}')
    GM_addStyle('.chat-gpt-container{width: 70vw}')
    const container2 = getContainer();
    const mainBarContainer = document.querySelector("main");
    mainBarContainer.prepend(container2);
  }
  function baiduTopInjectContainer() {
    GM_addStyle('.chat-gpt-container{max-width: 100%!important}')
    const container2 = getContainer();
    const siderbarContainer = document.querySelector("#content_left");
    siderbarContainer.prepend(container2);
  }
  let position = GM_getValue("c_position", 1);

  initContainer()

  switch (getWebsite().name) {
    case 'google':
      position ? googleInjectContainer() : googleTopInjectContainer();
      break
    case 'bing':
      position ? bingInjectContainer() : bingTopInjectContainer();
      break
    case 'baidu':
      position ? baiduInjectContainer() : baiduTopInjectContainer();
      break
    case 'duckduckgo':
      duckduckgoInjectContainer()
      break
    case 'deepl':
      deeplInjectContainer()
      break
    default:
      alertUnknowError()
  }
}

function initMenu() {
  let position_id = GM_registerMenuCommand("切换位置 - 侧边(1)/上方(0): " + GM_getValue("c_position", 1), position_switch, "M");

  function position_switch() {
     GM_unregisterMenuCommand(position_id);
     GM_setValue("c_position", (GM_getValue("c_position", 0)+1) % 2);
     position_id = GM_registerMenuCommand ("切换位置 - 侧边(1)/上方(0): " + GM_getValue("c_position", 1), position_switch, "M");
  }
}

async function main() {
  initUI();
  initMenu();
  if (getWebsite().type === "immediately") {
    getAnswer(getQuestion())
  }
}

main().catch((e) => {
  console.log(e);
});
