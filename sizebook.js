"use strict";

{
  document.addEventListener("DOMContentLoaded", function () {
    let suid_value;
    let utm_campaign_value;
    let params = location.search.slice(1).split("&");
    let query = {};
    let has_suid = false;
    let ignore_ = {}; // ignore_ をオブジェクトとして初期化
    let ignore_yclid = 0;
    let ignore_gclid = 0;

    for (let i = 0; i < params.length; i++) {
      let t = params[i].split("=");
      query[t[0]] = t[1];
      if (t[0] == "suid") {
        has_suid = true;
      }
    }

    // クッキーの削除とGoogle Optimizerリダイレクトのケースを処理
    //2018.06.19 anzu ↓google optimizer経由だとこういう形で入ってきてしまうので
    //https://datsumou-salon-hikakunavi.net/salon/ginzacalla_2/?utm_expid=.XhzP7Y4eRxOKWPCJ_OGrJQ.1&utm_referrer=https%3A%2F%2Fdatsumou-salon-hikakunavi.net%2F%3Fgclid%3Dhogehoge
    if (query["yclid"] || query["gclid"] || query["utm_source"]) {
      ["sizebook_yclid", "sizebook_gclid", "sizebook_utm_source"].forEach(
        function (cookiename) {
          document.cookie = cookiename + "=; max-age=0; path=/;";
        }
      );
    } else if (query["utm_referrer"]) {
      let referrerUrl = decodeURIComponent(query["utm_referrer"]);
      let work = referrerUrl.search.slice(1).split("&");
      work.forEach((param) => {
        let [key, value] = param.split("=");
        query[key] = value;
      });
    }

    // クッキーを設定する関数
    function setCookie(name, value, days) {
      let expires = "";
      if (days) {
        let date = new Date();
        // 現在の日時に指定した日数分のミリ秒を加算
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
      }
      // 指定した日時までのクッキーを設定
      document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    // クッキーを取得する関数
    function getCookie(name) {
      let nameEQ = name + "=";
      let ca = document.cookie.split(";");
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    }

    // クッキーの管理する関数
    function setUtmCookie(media, sizebook_media) {
      if ((query[media] && query[media] !== "") || getCookie(sizebook_media)) {
        ignore_[media] = 1;
        suid_value = query[media] ? query[media] : getCookie(sizebook_media);
        if (query[media]) {
          setCookie(sizebook_media, query[media], 1);
        }
      }
    }
    setUtmCookie("yclid", "sizebook_yclid");
    setUtmCookie("gclid", "sizebook_gclid");

    //utm_campaignのクッキーを管理
    if (query["utm_source"] == "yahoo") {
      utm_campaign_value = query["utm_campaign"];
      setCookie("sizebook_utm_campaign", query["utm_campaign"], 1);
      console.log("yes, UTM campaign=" + query["utm_campaign"]);
    } else if (getCookie("sizebook_utm_campaign")) {
      utm_campaign_value = getCookie("sizebook_utm_campaign");
    }

    function rename(atag) {
      let old = atag.getAttribute("href");
      try {
        let lnk = new URL(atag.href);
        if (
          lnk.hostname == "tr.threeate.jp" ||
          lnk.hostname == "www.af-mark.jp" ||
          lnk.hostname == "t.felmat.net"
        ) {
          if (utm_campaign_value)
            lnk.searchParams.append("utm_campaign", utm_campaign_value);
          if (suid_value) lnk.searchParams.append("suid", suid_value);
        }
        atag.setAttribute("href", lnk.href);
        if (lnk.hostname == "tr.threeate.jp")
          console.log("old=" + old + " new=" + atag.getAttribute("href"));
      } catch (e) {
        console.log(e + ", " + old);
      }
    }

    window.addEventListener("load", function () {
      document.querySelectorAll("a").forEach(function (atag) {
        rename(atag);
      });
    });
  });
}
