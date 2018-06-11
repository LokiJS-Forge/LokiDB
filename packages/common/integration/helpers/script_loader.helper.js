function loadScriptByTag(src) {
  const script = document.createElement("script");
  script.setAttribute("src", src);
  document.head.appendChild(script);

  return new Promise(resolve => {
    script.onload = resolve
  });
}
