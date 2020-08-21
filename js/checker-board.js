

function toggleMenu(menu){
    let visibility = menu.style.visibility;
    if(visibility == 'hidden'){
        menu.style.visibility = 'visible';
    } else {
        menu.style.visibility = 'hidden';
    }
}
function initCheckerBoard(){
    let menu = document.getElementById('dropdown-menu');
    let menuButton = document.getElementById('dropdown-menu-button');
    document.addEventListener('click', () => toggleMenu(menu));
}

