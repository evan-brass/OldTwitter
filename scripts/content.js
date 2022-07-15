let pages = [
    {
        name: "home",
        paths: ["/", "/home"],
        activeMenu: "home"
    },
    {
        name: "notifications",
        paths: ["/old/notifications"],
        activeMenu: "notifications"
    },
    {
        name: "profile",
        paths: [/^\/[A-z-0-9-_]{1,15}$/g, /^\/[A-z-0-9-_]{1,15}\/with_replies$/g, /^\/[A-z-0-9-_]{1,15}\/media$/g, /^\/[A-z-0-9-_]{1,15}\/likes$/g, /^\/[A-z-0-9-_]{1,15}\/following$/g, /^\/[A-z-0-9-_]{1,15}\/followers$/g],
        exclude: ["/home", "/notifications", "/messages", "/settings", "/explore", "/login", "/register", "/logout"],
    },
    {
        name: "settings",
        paths: ["/old/settings"]
    },
    {
        name: "tweet",
        paths: [/^\/[A-z-0-9-_]{1,15}\/status\/\d{5,32}$/g]
    },
];

let page = pages.find(p => (!p.exclude || !p.exclude.includes(window.location.pathname)) && (p.paths.includes(window.location.pathname) || p.paths.find(r => r instanceof RegExp && r.test(window.location.pathname))));

(async () => {
    if(!page) return;
    // invalidate manifest cache by blocking it
    try {
        await fetch('/manifest.json').then(response => response.text()).catch(e => {});
    } catch(e) {}
    
    let html = await fetch(chrome.runtime.getURL(`layouts/${page.name}/index.html`)).then(response => response.text());
    let css = await fetch(chrome.runtime.getURL(`layouts/${page.name}/style.css`)).then(response => response.text());
    let header_html = await fetch(chrome.runtime.getURL(`layouts/header/index.html`)).then(response => response.text());
    let header_css = await fetch(chrome.runtime.getURL(`layouts/header/style.css`)).then(response => response.text());

    document.open();
    document.write(html);
    document.close();
    document.getElementsByTagName('header')[0].innerHTML = header_html;
    if(page.activeMenu) {
        let el = document.getElementById(page.activeMenu);
        el.classList.add("menu-active");
    }
    let version = document.getElementById('oldtwitter-version');
    if(version) {
        version.innerText = chrome.runtime.getManifest().version;
    }

    let style = document.createElement("style");
    style.innerHTML = css;
    document.head.appendChild(style);
    let header_style = document.createElement("style");
    header_style.innerHTML = header_css;
    document.head.appendChild(header_style);

    let icon = document.createElement("link");
    icon.href = chrome.runtime.getURL(`images/logo32.png`);
    icon.rel = "icon";
    icon.id = "site-icon";
    document.head.appendChild(icon);

    setInterval(() => {
        let donateButton = document.getElementById('donate-button');
        donateButton.style.color = "var(--link-color)";
        setTimeout(() => {
            donateButton.style.color = "";
        }, 2000);
    }, 10000);
})();