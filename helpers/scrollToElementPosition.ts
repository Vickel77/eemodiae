const scrollToSearchInput = (searchInputRef: any, offsetTop: number = 80) => {
  if (searchInputRef.current) {
    const topPosition =
      searchInputRef.current.getBoundingClientRect().top +
      window.pageYOffset -
      offsetTop;
    window.scrollTo({ top: topPosition, behavior: "smooth" });
  }
};

export default scrollToSearchInput;
