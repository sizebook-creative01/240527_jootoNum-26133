let suid_value;
let utm_campaign_value;

$(function($){
  let params = $(location).attr('search').replace('?', '&').split('&');
  let query = {};
  let has_suid = false;

  for (let i = 0; i < params.length; i++) {
    let t = params[i].split('=');
    query[t[0]] = t[1];
    if (t[0] == "suid") {
      has_suid = true;
    } 
  }
  
  //2018.06.19 anzu ↓google optimizer経由だとこういう形で入ってきてしまうので
  //https://datsumou-salon-hikakunavi.net/salon/ginzacalla_2/?utm_expid=.XhzP7Y4eRxOKWPCJ_OGrJQ.1&utm_referrer=https%3A%2F%2Fdatsumou-salon-hikakunavi.net%2F%3Fgclid%3Dhogehoge
  if (query['gclid'] || query['utm_source']) {
    $.removeCookie('sizebook_gclid');
    $.removeCookie('sizebook_utm_campaign');
  } else {
    let work = decodeURIComponent(query['utm_referrer']).replace('?','&').split('&');
    for(let j = 0;  j < work.length; j++) {
      let tt = work[j].split('=');
      if(tt[0] == 'gclid') {
        query['gclid']=tt[1];
      }
      if(tt[0] == 'utm_source') {
        query['utm_source']=tt[1];
      }
    }
  }

  let ignore_gclid = 0;

  if (query['gclid']) {
    ignore_gclid = 1;
    $.cookie('sizebook_gclid', query['gclid'], { expires: 1, path: '/' });
    suid_value = query['gclid'];
  } else if ($.cookie('sizebook_gclid')) {
    ignore_gclid = 1;
    suid_value = $.cookie('sizebook_gclid');
  } else if (query['utm_source'] == 'yahoo') {
     utm_campaign_value = query['utm_campaign'];
     $.cookie('sizebook_utm_campaign', query['utm_campaign'], { expires: 1, path: '/' });
     console.log("yes,UTM campaign="+query['utm_campaign']);
  } else if ($.cookie('sizebook_utm_campaign')) {
     utm_campaign_value = $.cookie('sizebook_utm_campaign');
  }

  function rename(atag) {
    let old = atag.attr('href');
    try {
        let lnk = new URL(atag.attr('href'));
        if (lnk.hostname == 'tr.threeate.jp') {
          if(utm_campaign_value) lnk.searchParams.append('utm_campaign', utm_campaign_value);
          if(suid_value) lnk.searchParams.append('suid', suid_value);
        } else if (lnk.hostname == 'www.af-mark.jp' || lnk.hostname == 't.felmat.net') {
          if(utm_campaign_value) lnk.searchParams.append('utm_campaign', utm_campaign_value);
          if(suid_value) lnk.searchParams.append('suid', suid_value);
        }
        atag.attr('href', lnk);
        if(lnk.hostname == 'tr.threeate.jp') console.log("old="+old+" new="+atag.attr('href'));
        //console.log(lnk.hostname + " -> " + lnk);
        
      } catch (e) {
        //console.log(e + ", " + $(this).attr('href'));
      }
  }

  $("a").each(function() {
    // if(suid_value!==void 0) console.log(`suid=${suid_value}`);
    // if(utm_campaign_value!==void 0) console.log(`utm=${utm_campaign_value}`);
    //console.log($(this).attr('href'));
    //rename($(this));
  });

  setTimeout(function(){
    $("a").each(function() {
      //時間差でURL書き換え
      rename($(this));
    });
  },1000);
});
