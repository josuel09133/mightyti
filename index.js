const axios = require('axios');
const fs = require('fs');
var authToken = "Bearer 1534507|r9iQGywpda4i3Nj0ThqkTYUh73rzXRNg24qFcLdL";
var started = false;
var counter=0;
var autologinCreds = {"username":"quinotjoylen","password":"Joylen1992@"};
let rewardsDataContainer={
    '1':{
        'reward_logs':{}
    },
    '2':{
        'reward_logs':{}
    },
    '3':{
        'reward_logs':{}
    },
    '4':{
        'reward_logs':{}
    },
    '5':{
        'reward_logs':{}
    },
    '6':{
        'reward_logs':{}
    },
    '7':{
        'reward_logs':{}
    },
    '8':{
        'reward_logs':{}
    },
    '9':{
        'reward_logs':{}
    },
    '10':{
        'reward_logs':{}
    },
    '11':{
        'reward_logs':{}
    }
}
test();
async function test(){
    for(;;){
      await main();
    }
}


async function main(){
    let rewardsData = await getRewards();
    console.clear();
    if(rewardsData?.code==200 && rewardsData?.data.length>0){
        console.log("STARTED ["+counter+"]")
        rewardsData?.data.forEach((reward)=>{
            let importantDatas = {
                "id":reward?.id,
                "name":reward?.name,
                "desc":reward?.description,
                "image":reward?.prize?.image,
                "quantity":reward?.prize?.quantity
            }
            var execTime = currentDateTime();
            //check to start
            if(!started){
                importantDatas['time_started'] = execTime
                rewardsDataContainer[importantDatas?.id].reward_logs=importantDatas
                saveDatas(JSON.stringify(rewardsDataContainer,null, '\t'));
            }else{
                //check for quantity changes
                console.log("CHECKING QUANTITY CHANGES!")
                var logs = rewardsDataContainer[importantDatas?.id].reward_logs
                //quantity changes detected
                if(logs.hasOwnProperty('changes_logs')){
                    var lastLog = logs.changes_logs[logs.changes_logs.length-1];
                    if(lastLog.quantity != importantDatas?.quantity){
                        console.log("["+lastLog+'=>'+importantDatas?.quantity+"] "+importantDatas.name + " Changes detected!");
                        rewardsDataContainer[importantDatas?.id].reward_logs.changes_logs.push({
                            "quantity":importantDatas?.quantity,
                            "time_checked":execTime
                        })
                        saveDatas(JSON.stringify(rewardsDataContainer,null, '\t'));
                    }
                }else{
                    if(logs?.quantity != importantDatas?.quantity){
                        console.log("["+logs?.quantity+'=>'+importantDatas?.quantity+"] "+importantDatas.name + " Changes detected!");
                        rewardsDataContainer[importantDatas?.id].reward_logs.changes_logs = [ {
                            "quantity":importantDatas?.quantity,
                            "time_checked":execTime
                        }]
                        saveDatas(JSON.stringify(rewardsDataContainer,null, '\t'));
                    }
                }
            }
            
        })
        started = true;
    }else{
        
        var headers = {
            method : "POST",
            data: {
                "Sec-Ch-Ua-Mobile": "?0",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.53 Safari/537.36",
                "Sec-Ch-Ua-Platform": "Windows",
                "Origin": "https://mighty.ph",
                "Sec-Fetch-Site": "same-site",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Dest": "empty",
                "Referer": "https://mighty.ph/",
                "Accept-Encoding": "gzip, deflate",
                "Accept-Language": "en-US,en;q=0.9"
            }
        }
        console.log("Attempting to relogin ....")
        let loginData = await axiosReq('https://be.mighty.ph/api/v1/login',headers,autologinCreds);
        if(loginData?.code==200 && loginData?.data?.token){
            var newTok = "Bearer "+loginData?.data?.token;
            console.log('got new token : '+newTok)
            authToken = newTok;
        }else{
            console.log(rewardsData?.status + " => " +rewardsData?.message)
        }
    }
    counter++
}

function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}

function currentDateTime(){
    var d = new Date();
    var timezz = convertTZ(d, "Asia/Manila")
    return timezz.toLocaleString();
}


function saveDatas(content){
    fs.appendFile('promo_logs.txt', content+'\n', function (err) {
        if (err) throw err;
    });
    fs.writeFile('promo_single.txt', content+'\n', function (err) {
        if (err) throw err;
    });
}

async function getRewards(){
    var headers = {
        method : "GET",
        data: {
            "Authorization": authToken,
            "Sec-Ch-Ua-Mobile": "?0",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.53 Safari/537.36",
            "Sec-Ch-Ua-Platform": "Windows",
            "Origin": "https://mighty.ph",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Referer": "https://mighty.ph/",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "en-US,en;q=0.9"
        }
    }
    let checkRewards = await axiosReq('https://be.mighty.ph/api/v1/raffles',headers,null);
    return checkRewards;
}

async function axiosReq(url,headers,data){
    try {
        var config = {
            method: headers.method,
            url: url,
            data,
            headers: headers.data
          };
          
          return await axios(config)
          .then(
            response => response.data
          )
          .catch(
            response => response
          );
    } catch (error) {
        console.error(error);
    }
}