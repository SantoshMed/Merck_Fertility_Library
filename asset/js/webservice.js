var _gWebService = new WebService();

function CallBack() {
    this.func = "";
    this.data = "";
}


function RequestHeader(Command, DataPacket, Callback) {
    this.command = Command;
    this.data = DataPacket;
    this.callback = Callback;
}

function WebService() {
    this.XmlHttp = new XMLHttpRequest();
    this.Url = "service/WebService.aspx";
    this.service = "";
}

// Ajax data request post to server
WebService.prototype.PostRequest = function (PostData, async) {
    try {
        PostData.service = this.service;
        this.XmlHttp.open("POST", this.Url, async);
        this.XmlHttp.send(JSON.stringify(PostData));
        if (!async) {
            return JSON.parse(this.XmlHttp.responseText).result;
        }
        else {
            var me = this;
            var callback = PostData.callback;
            var timer = window.setInterval(function (callback) {
                if (me.XmlHttp.readyState == 4) {
                    window.clearInterval(timer);
                    if (me.XmlHttp.status != 200) {
                        return;
                    }
                    //console.log("Response: " + me.XmlHttp.responseText);
                    var data = JSON.parse(me.XmlHttp.responseText);
                    if (data.iserror) {
                        if (data.code == 764) {
                            alert("Session Expired !");
                            location.reload();
                        }
                        else
                            alert(data.message);
                    }

                    var result = data.result;
                    if (callback != null)
                        window[callback.func](result, callback.data);
                }
            }, 1000, PostData.callback);
        }
    }
    catch (ex) {
        alert(ex);
    }
}

