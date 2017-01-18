/* global $ */

var searchBtn = document.querySelector(".search-button");
$(document).ready(function(){
  $('.ui.dropdown').dropdown();
  $('#example1').progress();
  $('#example4').progress();
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

$(".small.modal").modal('setting', {observeChanges: true}).modal('setting', 'transition', "Horizontal Flip").modal("attach events", "#editBlog", "show");
$(".small.modal.student").modal('setting', {observeChanges: true} ).modal('setting', 'transition', "Horizontal Flip").modal("attach events", "#editStudent", "show");
