var LC_API = LC_API || {};

var __lc_ivs_visitor_engaged = false;
LC_API.on_before_load = function () {
    // this callback is called, in addition to when the page loads, every time a dialog is opened...
    // we would like to keep hiding the chat window/bar unless the user activly opened a chat.
    if (!__lc_ivs_visitor_engaged) {
        if (LC_API.visitor_engaged()) {
            // the chat was opened before the page was loaded (in a previous page)
            // don't hide the chat window, visitor is currently chatting with an agent
            // set the flag so we don't check again
            __lc_ivs_visitor_engaged = true;
        } else {

            LC_API.hide_chat_window();
        }
    }
};

function openChat() {
    __lc_ivs_visitor_engaged = true;// set the flag so we don't hide the chat next time on_before_load is called
    LC_API.open_chat_window();
}