


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


    let button1 = document.getElementById('button1');
    let button2 = document.getElementById('button2');
    let button3 = document.getElementById('button3');

    let checkerPic1 = document.getElementById('checker-pic-1');
    let checkerPic2 = document.getElementById('checker-pic-2');
    let checkerPic3 = document.getElementById('checker-pic-3');

    let checkerPics = [checkerPic1, checkerPic2, checkerPic3];

    let score1 = document.getElementById('checker-score-1');
    let score2 = document.getElementById('checker-score-2');
    let score3 = document.getElementById('checker-score-3');

    let scores = [score1, score2, score3];

    button1.addEventListener('click', () => makeImageActive(checkerPic1, checkerPics));
    button2.addEventListener('click', () => makeImageActive(checkerPic2, checkerPics));
    button3.addEventListener('click', () => makeImageActive(checkerPic3, checkerPics));

    button1.addEventListener('click', () => makeImageActive(score1, scores));
    button2.addEventListener('click', () => makeImageActive(score2, scores));
    button3.addEventListener('click', () => makeImageActive(score3, scores));
}

