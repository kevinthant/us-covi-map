const onReady = new Promise(function(resolve){
  if (
      document.readyState === "complete" ||
      (document.readyState !== "loading" && !document.documentElement.doScroll)
  ) {
    resolve();
  } else {
    document.addEventListener("DOMContentLoaded", resolve);
  }
});

export default { 
  onReady 
};

export { 
  onReady 
};