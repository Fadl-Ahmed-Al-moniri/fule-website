function loadComponent(id, file) {
    fetch(file)
      .then(res => res.text())
      .then(html => {
        document.getElementById(id).innerHTML = html;
      })
      .catch(err => console.error("فشل في تحميل المكون:", err));
  }

loadComponent("header-container", 'assets/js/components/header.html');
loadComponent("sidebar-desktop-container", "assets/js/components/sidebar-desktop.html");
loadComponent("sidebar-mobile-container",  "assets/js/components/sidebar-mobile.html");