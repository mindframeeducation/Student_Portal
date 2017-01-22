/* global $ */

var searchBtn = document.querySelector(".search-button");
$(document).ready(function(){
  $('.ui.dropdown').dropdown();
  $('#example1').progress();
  $('#example4').progress();
  $('.ui.form')
  .form({
    fields: {
      // username: {
      //   identifier: 'username',
      //   rules: [
      //     {
      //       type   : 'empty',
      //       prompt : 'Please enter your username'
      //     }
      //   ]
      // },
      
      email: {
        identifier: 'username',
        rules: [
          {
            type: 'email',
            prompt: 'Please enter a valid email address'
          }
        ]
      },
      
      password: {
        identifier: 'password',
        rules: [
          {
            type    : 'empty',
            prompt  : 'Please enter your password'
          }
        ]
      },
      
      confirm_password: {
        identifier: 'confirm_password',
        rules: [
          {
            type  : 'match[password]',
            prompt: 'Passwords do not match!'
          }
        ]
      },
    }
  });
});

// Auto timeout messages
window.setTimeout(function() {
    // $(".alert").fadeTo(500, 0).slideUp(500, function(){
    //     $(this).remove(); 
    // });
    $(".ui.success.message.small.overlay").transition();
    $(".ui.negative.message.small.overlay").transition();
}, 1500);

$('#ddl').dropdown();

$('.message .close').on('click', function() {
  $(this).closest('.message').fadeOut();
});

$(".small.modal").modal('setting', {observeChanges: true}).modal('setting', 'transition', "Horizontal Flip").modal("attach events", "#editBlog", "show");
$(".small.modal.student").modal('setting', {observeChanges: true} ).modal('setting', 'transition', "Horizontal Flip").modal("attach events", "#editStudent", "show");
