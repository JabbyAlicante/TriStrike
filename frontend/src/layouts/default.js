export default function Layout(root) {
  root.innerHTML = `
      
        <main id="main"></main>
        <footer id="footer"></footer>
      
    `

  return {
    navigation: document.getElementById('navigation'),
    main: document.getElementById('main'),
    footer: document.getElementById('footer'),
  }
}

// <navigation id="navigation"></navigation>
