const scrollToSearchInput = (searchInputRef: any, offsetTop: number = 80) => {
  if (searchInputRef.current) {
    setTimeout(() => {
      const topPosition =
        searchInputRef.current.getBoundingClientRect().top +
        window.pageYOffset -
        offsetTop;
      window.scrollTo({ top: topPosition, behavior: "smooth" });
    }, 300);
  }
};

export default scrollToSearchInput;
