var hamburger = document.getElementsByClassName("hamburger")[0];
hamburger.addEventListener("click", function() {
  hamburger.classList.toggle("is-active");
  var nav = document.getElementById("nav");
  nav.style.display = nav.style.display === 'block' ? '' : 'block';

});

// var hamburger = document.querySelector(".hamburger");
//     hamburger.addEventListener("click", function() {
//     // Change icon
//     hamburger.classList.toggle("is-active");
//     // Fade in/out nav
//     $( "#nav" ).fadeToggle( "fast", "linear" );
//     // Fade in line by line
//     $('div.nav-contents ul li').each(function (line) {
//         $(this).delay((line++) * 100).fadeIn();
//     });
// });


var nav_1 = document.getElementById('nav-1')
var nav_2 = document.getElementById('nav-2')
var nav_3 = document.getElementById('nav-3')
// var nav_4 = document.getElementById('nav-4')
nav_2.style.display = 'none';
nav_3.style.display = 'none';
// nav_4.style.display = 'none';

document.getElementById('ix-home').classList.add("nav-tab-active")

document.getElementById('ix-home').onmouseover = function(){
    nav_1.style.display = 'block';
    nav_2.style.display = 'none';
    nav_3.style.display = 'none';
    // nav_4.style.display = 'none';
    document.getElementById('ix-home').classList.add("nav-tab-active")
    document.getElementById('ix-other').classList.remove("nav-tab-active")
    document.getElementById('ix-meta').classList.remove("nav-tab-active")
    // document.getElementById('ix-search').classList.remove("nav-tab-active")
};
document.getElementById('ix-other').onmouseover = function(){
    nav_1.style.display = 'none';
    nav_2.style.display = 'block';
    nav_3.style.display = 'none';
    // nav_4.style.display = 'none';
    document.getElementById('ix-home').classList.remove("nav-tab-active")
    document.getElementById('ix-other').classList.add("nav-tab-active")
    document.getElementById('ix-meta').classList.remove("nav-tab-active")
    // document.getElementById('ix-search').classList.remove("nav-tab-active")
};
document.getElementById('ix-meta').onmouseover = function(){
    nav_1.style.display = 'none';
    nav_2.style.display = 'none';
    nav_3.style.display = 'block';
    // nav_4.style.display = 'none';
    document.getElementById('ix-home').classList.remove("nav-tab-active")
    document.getElementById('ix-other').classList.remove("nav-tab-active")
    document.getElementById('ix-meta').classList.add("nav-tab-active")
    // document.getElementById('ix-search').classList.remove("nav-tab-active")
};
// // document.getElementById('ix-search').onmouseover = function(){
//     nav_1.style.display = 'none';
//     nav_2.style.display = 'none';
//     nav_3.style.display = 'none';
//     // nav_4.style.display = 'block';
//     document.getElementById('ix-home').classList.remove("nav-tab-active")
//     document.getElementById('ix-other').classList.remove("nav-tab-active")
//     document.getElementById('ix-meta').classList.remove("nav-tab-active")
//     // document.getElementById('ix-search').classList.add("nav-tab-active")
// };
