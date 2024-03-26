
function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
    // document.getElementById("right-dashboard").style.marginLeft = "250px";
    // document.querySelector(".openbtn").style.display = "none"; 
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("right-dashboard").style.marginLeft = "0";
    document.querySelector(".openbtn").style.display = "block";
}