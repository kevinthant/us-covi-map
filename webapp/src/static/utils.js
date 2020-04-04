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

const getLocalDateString = (dateStr) => {
  return new Date(new Date(dateStr).getTime() + (new Date().getTimezoneOffset() * 60 * 1000)).toLocaleDateString();
};

const getLocalDate = (dateStr) => {
  return new Date(new Date(dateStr).getTime() + (new Date().getTimezoneOffset() * 60 * 1000));
};

export default { 
  onReady,
  getLocalDateString,
  getLocalDate,
};

export { 
  onReady,
  getLocalDateString,
  getLocalDate,
};