async function sendGitLabDeleteReq(filenames) {
  var actions = [];

  filenames.forEach(file => {
    actions.push({
      action: "delete",
      file_path: `f/${file}.yml`,
    })
  })

  await $.ajax({
    type: 'POST',
    url: `${CORS_URL}https://gitlab.com/api/v4/projects/${PROJECT_ID}/repository/commits`,
    dataType: "json",
    contentType: 'application/json; charset=UTF-8',
    data: JSON.stringify({
      branch: "ftp",
      commit_message: `FTP :: Removing ${filenames.length} file(s)`,
      actions: actions      
    }),
    beforeSend: function(xhr) {
      xhr.setRequestHeader("PRIVATE-TOKEN", auth.currentUser().user_metadata.gitlabToken);
    },
    success: function(response) {
      console.log(response)
    },
    error: function(xhr, textStatus, errorThrown) {
      console.log(xhr, textStatus, errorThrown)
    }
  });
  return;
}

//===========================================
var allPanels         = $('.file-accordian').hide().removeClass("hidden");//prevent flicker
var allDeleteButtons  = $('.flag-delete-button').hide();

$('.list > .file-item').click(async function() {
    var $this     = $(this);

    //dont open accordian if user is just clicking link to image
    if ($this.find("#outbound-link:hover").length > 0) {
      return
    }

    var $target   = $this.next();
    var filename  = $this.find("p").text();
    var thumbnail = $target.find("img#thumbnail");

    //load image thumbnail
    if(!thumbnail.hasClass('hasImage')) {
      thumbnail.attr("src", "https://ftp.cass.si/"+filename)
      thumbnail.addClass("hasImage")
    }

    //open up accordian
    if(!$target.hasClass('active')) {
       allPanels.removeClass('active').slideUp();
       $target.addClass('active').slideDown();
    }

  return false;
});

// check if input already has autosaved token
if( $('#token').length && $('#token').val() != "") {
  var credentials = parseAuthContent($('#token').val())
  authUser(credentials.username, credentials.password)
}

//show auth input
$('#fingerprint').click(function() {
  $("#fingerprint").addClass("hidden")  
  $("#token").removeClass("hidden") 
  $("#token").focus() 
})

// on input enter
$(document).keyup(function(event) {
  if ($("#token").is(":focus") && event.key == "Enter") {
    $(".spinner").removeClass("hidden");
    (async () => {
      // attempt to authorise
      var credentials = parseAuthContent($('#token').val())
      var user
      try {
        user = await authUser(credentials.username, credentials.password)
      } catch(e) {
        $(".spinner").addClass("hidden")
        $("#token").addClass("incorrect");
      }

      if (user) {
        $("#token").addClass("hidden")
        $("#send-delete-all-req").removeClass("hidden")
        allDeleteButtons.show();
      }
    })();
  }
});

//set file up for deletion
$('.flag-delete-button').click(function() {
  $(this).parent().prev().toggleClass("rejected-item");

  //only allow
  if ($(".list").find(".rejected-item").length > 0) {
    $("#send-delete-all-req").removeClass("disabled")
  } else {
    $("#send-delete-all-req").addClass("disabled")    
  }
})

//time to bulk delete files
$('#send-delete-all-req').click(async function() {
  if(!$(this).hasClass("disabled")) {
    $(".spinner").removeClass("hidden")
    var filenames = [];
    //all elements with rejected-item are flagged for deletion
    $(".rejected-item").each(function(i, obj) {
      var filename = $(obj).find("p").text();
      filename = filename.split('.')[0]; //remove extension
      filenames.push(filename);
    });
    console.log(filenames);
    try {
      await sendGitLabDeleteReq(filenames);
      $(".spinner").addClass("hidden")
      $("#send-delete-all-req").find("img").attr("src","/img/success.png");
      $(".rejected-item").each(function(i, obj) {
        obj = $(obj);
        obj.addClass("deleted");
        //permanently hide the accordian
        obj.next().removeClass('active').slideUp('fast', function() {
          obj.next().addClass("hidden");
          obj.find("img").attr("src", "/img/clear.png");
          obj.find("a").attr("href", "#");
        });
      })
    } catch(e) {
      console.log(e)
      $("#send-delete-all-req").find("img").attr("src","/img/error.png");
    }
  }
})
