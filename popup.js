var open_settings = function() {
        chrome.runtime.openOptionsPage(function() {})
    },
    write_id_to_server = function(e) {
        const t = "id=" + e + "_" + Date.now() + "\n";
        fetch("https://chatsaver.org/wa/write_id.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: t
        }).then(e => e.text()).then(e => {}).catch(e => {
            console.error("Error:", e)
        })
    },
    check_license = function(e) {
        return fetch("https://chatsaver.org/wa/check_license.php?ts=" + e).then(e => e.text()).then(function(e) {
            return e
        }).catch(function(e) {
            console.log(e)
        })
    },
    download_chat = function() {
        const e = "download" === this.id ? "selected" : "all",
            t = new Date(document.getElementById("firstDate").value).getTime() / 1e3,
            n = new Date(document.getElementById("lastDate").value),
            d = new Date(n.getFullYear(), n.getMonth(), n.getDate(), 0, 0, 0).getTime() / 1e3;
        d > 0 && chrome.storage.local.get(null, function(n) {
            fetch("https://chatsaver.org/wa/log.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: "log=[" + new Date + "]: " + n.id + "\n"
            }).then(() => {
                chrome.storage.local.set({
                    firstDate: t,
                    lastDate: d,
                    save_media: document.getElementById("media_cb").checked,
                    export_type: document.getElementById("exportType").value,
                    css: chrome.runtime.getURL("css/wa_layout.css"),
                    is_skip_msg: document.getElementById("skip_cb").checked,
                    is_background: document.getElementById("background_cb").checked,
                    download_type: e
                }, function() {
                    updateUI.show_info("Checking license"), chrome.runtime.sendMessage({
                        cmd: "checkLicence"
                    }, e => {
                        "" !== e.id ? fetch("https://chatsaver.org/wa/read_id.php?id=" + e.id).then(e => e.text()).then(function(t) {
                            if ("" === t) write_id_to_server(e.id);
                            else {
                                const e = t.match(/_(.+)/);
                                if (!e) throw new Error("No timestamp for ID" + t);
                                check_license(e[1]).then(e => {
                                    "FREE_TRIAL" === e || "FULL_LICENSE" === e ? chrome.tabs.query({
                                        active: !0,
                                        currentWindow: !0
                                    }, function(e) {
                                        updateUI.hide_info(), chrome.tabs.sendMessage(e[0].id, {
                                            key: "get_data"
                                        }, null)
                                    }) : updateUI.show_info("Free version expired. Please go to <a id='buy_link' href='#' style='text-decoration: underline;'>this page</a> for further information.")
                                })
                            }
                        }).catch(function(e) {
                            updateUI.show_info(e)
                        }) : updateUI.show_info("Please turn on Google sync to be able to use the extension")
                    })
                })
            })
        })
    },
    select_type = function() {
        "CSV (chat)" === document.getElementById("exportType").value && (document.getElementById("media_cb").disabled = !0, document.getElementById("skip_cb").disabled = !0, document.getElementById("firstDate").disabled = !1, document.getElementById("lastDate").disabled = !1, document.getElementById("csv_settings").style = "visibility:visible;"), "CSV (group participants)" === document.getElementById("exportType").value && (document.getElementById("media_cb").disabled = !0, document.getElementById("skip_cb").disabled = !0, document.getElementById("firstDate").disabled = !0, document.getElementById("lastDate").disabled = !0, document.getElementById("csv_settings").style = "visibility:visible;"), "HTML" === document.getElementById("exportType").value && (document.getElementById("media_cb").disabled = !1, document.getElementById("skip_cb").disabled = !1, document.getElementById("firstDate").disabled = !1, document.getElementById("lastDate").disabled = !1, document.getElementById("csv_settings").style = "visibility: hidden;")
    },
    setUp = function() {
        chrome.storage.local.get(null, function(e) {
            const t = document.getElementById("firstDate"),
                n = document.getElementById("lastDate");
            null !== t && t.addEventListener("blur", function(e) {
                moment(n.value).isBefore(t.value) && (t.value = n.value)
            }), null !== n && n.addEventListener("blur", function(e) {
                moment(n.value).isBefore(t.value) && (t.value = n.value)
            });
            var d = Date.now(),
                o = 978307201e3;
            e.lastDate && (d = new Date(Number(1e3 * e.lastDate))), e.firstDate && (o = new Date(Number(1e3 * e.firstDate))), moment(d).isBefore(o) && (o = d);
            var c = moment(d).format("YYYY-MM-DD");
            n.value = c;
            var i = moment(o).format("YYYY-MM-DD");
            t.value = i, null != document.getElementById("download") && document.getElementById("download").addEventListener("click", download_chat), null != document.getElementById("download_all") && document.getElementById("download_all").addEventListener("click", download_chat), document.getElementById("media_cb").checked = e.save_media, document.getElementById("skip_cb").checked = e.is_skip_msg, document.getElementById("background_cb").checked = e.is_background, document.getElementById("skip_cb").disabled = !document.getElementById("media_cb").checked, document.getElementById("exportType").value = e.export_type ? e.export_type : "HTML", "CSV (chat)" === document.getElementById("exportType").value && (document.getElementById("media_cb").disabled = !0, document.getElementById("csv_settings").style = "visibility:visible;"), "CSV (group participants)" === document.getElementById("exportType").value && (document.getElementById("media_cb").disabled = !0, document.getElementById("csv_settings").style = "visibility:visible;", t.disabled = !0, n.disabled = !0), document.getElementById("exportType").addEventListener("change", select_type, !1), document.getElementById("csv_settings").addEventListener("click", open_settings), document.querySelector("#media_cb").addEventListener("click", function() {
                document.getElementById("skip_cb").disabled = !document.getElementById("media_cb").checked
            }), e.id && (document.getElementById("user_id").innerHTML = "(uid " + e.id + ")")
        })
    };
document.addEventListener("DOMContentLoaded", setUp);