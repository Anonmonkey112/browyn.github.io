
var faqResult = '#faqResults';

$faqInput = $('#searchFaq');
$faqResults = $(faqResult);
$faqSearchDropDown = $('#input-search');

$faqInput.outside('click', function (e) {
    $faqResults.empty();
});

$faqInput.on('keydown',
    function (e) {
        if (e.which === 38 || e.which === 40) {
            var selected = $(faqResult + " .auto-complete.selected");
            var prev = selected.prev();
            var next = selected.next();
            if (!prev.is("li")) {
                prev = $(faqResult + " .auto-complete").first();
            }
            if (!next.is("li")) {
                next = $(faqResult + " .auto-complete:last");
            }
            selected.toggleClass("selected");
            switch (e.which) {
            case 38: // up
                $faqInput.prop('value', prev.data('text'));
                prev.toggleClass("selected");
                $(faqResult + " ul").scrollTo(prev);
                break;

            case 40: // down
                $faqInput.prop('value', next.data('text'));
                next.toggleClass("selected");
                $(faqResult + " ul").scrollTo(next);
                break;
            }
            $faqInput.addClass("auto-complete-chage");
            e.preventDefault(); // prevent the default action (scroll / move caret)
        }
    });
$faqInput.on('keyup', function (e) {
    if (e.keyCode === 13) {
        var result = $(faqResult + ' .auto-complete.selected').first();
        if (result !== undefined && result !== null) {
            $faqInput.addClass("auto-complete-chage");
            result.click();
        }
    }
});
var faqCache = {}
var faqLastValue = "";
var searchCount = 0;
var lastFaqSearchTermWithResult;
/* Only get the value from each key up */
var suggestions = Rx.Observable.fromEventPattern(
        function add(h) {
            $faqInput.on('change', h);
            $faqInput.on('keyup', h);
        }
    )
    .pluck('target', 'value')
    .filter(function (text) {
        if ($faqInput.hasClass("auto-complete-chage")) {
            faqLastValue = text;
            $faqInput.removeClass("auto-complete-chage");
            return false;
        }
        return text.length >= 2 && faqLastValue !== text;
    })
    //.throttleTime(400)
    .switchMap(function (term) {
        faqLastValue = term;
        var termToSearch = term.toLowerCase();
        $faqSearchDropDown.addClass('animate');
        if (faqCache.hasOwnProperty(termToSearch)) {
            return Rx.Observable.from([faqCache[termToSearch]]);
        }
        return $.ajax({
            url: faqSearchConfig.searchHandlerUrl, //TODO: check error by: remove link inside ''
            dataType: 'json',
            type: "POST",
            data: {
                term: termToSearch,
                token: faqSearchConfig.token,
                method: "autocomplete",
                resCount : 10,
                searchCount: termToSearch.length >= faqSearchConfig.minLengthOfSearchTerm ? ++searchCount : searchCount
            }
        }).promise();
    })
    .subscribe(
        function (data) {
            faqCache[data.term] = data;
            if (data.term === $faqInput.val().toLowerCase()) {
                if (data.results === null || data.results.length < 1) {
                    $faqResults.empty();
                } else {
                    lastFaqSearchTermWithResult = data.term;
                    $faqResults
                        .empty()
                        .append($('<ul>')
                            .append(
                                $.map(data.results,
                                    function (value) {

                                        return $('<li class="auto-complete" data-text="' +
                                            value.Question +
                                                '" data-topic="' +
                                            value.ResourceSet.replace("FAQ_", "") +
                                            '" data-question="' + value.ResourceIdPrefix+'" >')
                                            .append($('<a href="javascript:void(0);" >')
                                                .html("<span>" + value.Topic + "</span>"+value.Question
                                                    .replace(RegExp(data.term, "ig"),
                                                        function (match) {
                                                            return "<strong class='highlight-search'>" +
                                                                match +
                                                                "</strong>";
                                                        }
                                                    )));
                                    })));
                }
                $(faqResult+" .auto-complete").first().addClass("selected");
                $faqSearchDropDown.removeClass('animate');
            }
        },

        function (error) {
            $faqSearchDropDown.removeClass('animate');
            $faqResults
                .empty()
                .append($('<span class="error-search">')
                    .text(faqSearchConfig.errorText));
        });

Rx.Observable.fromEvent($faqInput, 'keyup')
    .pluck('target', 'value')
    .filter(function (text) { return text.length < 2; }).subscribe(
        function () {
            $faqResults.empty();
            faqLastValue = "";
            $faqSearchDropDown.addClass('animate');
        }
    );

$faqResults.on('click', 'li.auto-complete', function () {
    var template = faqSearchConfig.templateUrl;
    window.location.href = template.replace(faqSearchConfig.placeholderTopic, $(this).data("topic")).replace(faqSearchConfig.placeholderQuestion, $(this).data("question"));

    //@*window.location.href = '@PageResolver.InstrumentsPage' + $(this).data("symbol");*@
    //@*Downgrade syntax for explorer :(*@
    //@*window.location.href = `@PageResolver.InstrumentsPage${$(this).data("symbol")}`;*@
});