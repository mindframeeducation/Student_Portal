/* global $ */

var searchBtn = document.querySelector(".search-button");
$(document).ready(function(){
  $('.ui.dropdown').dropdown();
});

// Auto timeout messages
window.setTimeout(function() {
    $(".alert").fadeTo(500, 0).slideUp(500, function(){
        $(this).remove(); 
    });
}, 1500);

$('#ddl').dropdown();

$('.message .close').on('click', function() {
  $(this).closest('.message').fadeOut();
});

// searchBtn.addEventListener("click", function(){
//   alert("Student's name: "+ $('.ui.dropdown').dropdown('get text') + "\n" + "Student's id: " + $('.ui.dropdown').dropdown('get value'));
// });

// $("#openmodal").click(function () {
//     $('.small.modal').modal('show');
// });

$(".small.modal").modal("attach events", "#openmodal", "show");