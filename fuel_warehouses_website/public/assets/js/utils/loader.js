const loader = document.querySelector('.loader');
const loaderOverlay = document.querySelector('.loader-overlay');

export const showLoader = () => {
  loader.style.display = 'block';
  loaderOverlay.style.display = 'block';
};

export const hideLoader = () => {
  loader.style.display = 'none';
  loaderOverlay.style.display = 'none';
};
