$(".form-control").on('click', function(){
    $(".form-control").css({
        "background": "none",
    	"color": "#c9c7c7"
                    
    });
});
$("form").show();
$("#new").hide();
    $("#update").hide();
    $('#select').on('change', () => {
        if($('#select').val() === 'new'){
            $("#new").show();
            $("#update").hide();
        } else {
            $("#new").hide();
            $("#update").show();
        }
    })