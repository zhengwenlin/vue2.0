let result = {
    "code": 2000,
    "msg": null,
    "data": [
        {
            "id": 1,
            "rule": "2020年11月4号7:00-2020年11月4号11:30;",
            "sortId": 1,
            "prizeSortId": null,
            "title": "活动时间"
        },
        {
            "id": 2,
            "rule": "2020年11月4日7:00",
            "sortId": 2,
            "prizeSortId": null,
            "title": "投票开始时间"
        },
        {
            "id": 3,
            "rule": "首席普法官：华为电脑 MateBook X Pro",
            "sortId": 3,
            "prizeSortId": 1,
            "title": "活动奖品"
        },
        {
            "id": 5,
            "rule": "卓越普法官：华为手机 P40",
            "sortId": 3,
            "prizeSortId": 2,
            "title": "活动奖品"
        },
        {
            "id": 6,
            "rule": "人气普法官：华为平板+智能磁吸键盘",
            "sortId": 3,
            "prizeSortId": 3,
            "title": "活动奖品"
        },
        {
            "id": 4,
            "rule": "同一手机号共有3次投票机会，可为每个类型（内勤、外勤、团体）各投一票，首次投票成功后瓜分250000元的随机红包，最高可获得66元大红包，获取的红包金额自动进入微信钱包中。",
            "sortId": 4,
            "prizeSortId": null,
            "title": "兑奖要求"
        }
    ]
}

let data = result.data;

function formatData(data) {
   let mapIds = data.reduce((prev,current) => {
        prev[current.sortId] ? prev[current.sortId].push(current): prev[current.sortId] = [current]
        return prev;
    },{})
   let result = []
   Object.keys(mapIds).forEach(key => {
     let item = mapIds[key]
     result.push({
         ...item[0],
         rule: item.map(l=>l.rule)
     })
   })
   return result;
}
let r = formatData(data)
console.log(r)
