$(document).on("init.zf.abide", function () {
    if (!Foundation.Abide.defaults.validators['fileSize']) {
        function checkFileSize($el, required, parent) {
            if ($($el)[0].value === "") {
                return true;
            }
            return $($el)[0].files[0].size < parseInt($el.attr('data-max-allowed-size'));
        };

        Foundation.Abide.defaults.validators['fileSize'] = checkFileSize;
        //https://github.com/foundation/foundation-sites/pull/10377#issuecomment-364689777
        var plugin = new Foundation.Abide($('#form'));
    }
});

$("#queryType").change(
    function () {
        var queryType = $("#queryType").val();
        var isNeedPassword = queryType == 1;
        $("#password-row").toggleClass("hide", !isNeedPassword);
        $("#delete-pre-requisites-row").toggleClass("hide", queryType != 2);
        $("#data-access-row").toggleClass("hide", queryType != 1);

        $("#submit-success-remember-password").toggleClass("hide", !isNeedPassword);
        $("#password").prop("required", isNeedPassword);

        var zdRequest = queryType >= 4;
        $("#name-row").toggleClass("hide", !zdRequest);
        $("#name").prop("required", zdRequest);
        $("#description-row").toggleClass("hide", !zdRequest);
        $("#submit-success").toggleClass("hide", zdRequest);
        $("#submit-success-query").toggleClass("hide", !zdRequest);
    });
$("body").on("keydown", "input, select", function (e) {
    var self = $(this)
        , form = self.parents("form:eq(0)")
        , focusable
        , next
        ;
    if (e.keyCode === 13) {
        focusable = form.find("input,a,select,button,textarea").filter(":visible");
        next = focusable.eq(focusable.index(this) + 1);
        if (next.length) {
            next.focus();
        } else {
            form.submit();
        }
        return false;
    }
});

$("#form").on("submit", function (e) {
    // TODO: This scrolling behaviour can be included in the 'formvalid.zf.abide' event, it replaces the submit anyway
    e.preventDefault();
    $("html,body").animate({
        scrollTop: $("#form").offset().top - 70
    }, 300);
    return false;
});

function onCaptchaError(data) {
    $("#error").html(personalInfoConfig.generalError);
    $("#loading-wrap").removeClass("loading loading-wrap");
    $("div[data-abide-error]").addClass("is-visible");
    $("html,body").animate({
        scrollTop: $("#form").offset().top - 70
    }, 300);
}


// Variable to store the uploaded files
var files;

// Add events
$("input[type=file]").on("change", prepareUpload);
function prepareUpload(event) {
    files = event.target.files;
}

$("#tooglePasswordVisibilityCheckBox").on("click", function() {
    if ($(this).is(":checked")) {
        $("#password").prop("type", "text");
    } else {
        $("#password").prop("type", "password");
    }
});

$(document).on("formvalid.zf.abide", function (e, target) {
    e.stopPropagation(); // Stop stuff happening
    e.preventDefault(); // Totally stop stuff happening

    
    if (grecaptcha.getResponse() === "") {
        $("#error").html(peronalInfoConfig.captchaError);
        $("div[data-abide-error]").addClass("is-visible");
        $("html,body").animate({
                scrollTop: $("#form").offset().top - 70
            },
            300);
        return false;
    }
    $("div[data-abide-error]").removeClass("is-visible");
    // Create a formdata object and add the files
    var data = new FormData();
    data.append("token", peronalInfoConfig.token);
    if (!peronalInfoConfig.secondPhase) {
        data.append("email", $("#email").val());
        data.append("password", $("#password").val());
        data.append("description", $("#description").val());
        data.append("name", $("#name").val());
        data.append("queryType", $("#queryType").val());
    } else {
        data.append("ri", peronalInfoConfig.ri);
        $.each(files, function (key, value) {
            data.append("FileUpload", value);
        });
    }
    data.append("g-Recaptcha-Response", grecaptcha.getResponse());
    $("#loading-wrap").addClass("loading loading-wrap");
    $.ajax({
        url: peronalInfoConfig.url,
        type: "POST",
        data: data,
        cache: false,
        dataType: "json",
        timeout: 60000,
        processData: false, // Don't process the files
        contentType: false, // Set content type to false as jQuery will tell the server its a query string request
        success: function (data, textStatus, jqXHR) {
            grecaptcha.reset();
            $("#loading-wrap").removeClass("loading loading-wrap");
            if (typeof data.Data.error === "undefined") {
                $("#form-success").toggleClass("is-hidden");
                $("#form-wrapper").toggleClass("is-hidden");
                
            }
            else {
                // Handle errors here
                $("#error").html(data.Data.error);
                $("div[data-abide-error]").addClass("is-visible");
                $("html,body").animate({
                    scrollTop: $("#form").offset().top - 70
                }, 300);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Handle errors here
            $("#error").html(peronalInfoConfig.generalError);
            $("#loading-wrap").removeClass("loading loading-wrap");
            $("div[data-abide-error]").addClass("is-visible");
            $("html,body").animate({
                scrollTop: $("#form").offset().top - 70
            }, 300);
            grecaptcha.reset();
        }
    });

});
var onloadCallback = function () {
    grecaptcha.render("recaptcha", {
        'sitekey': peronalInfoConfig.captchaKey
    });
};

