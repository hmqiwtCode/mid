// Tất cả tài liệu có thể tham khảo tại đây (thêm, xóa, sửa, query,.....)
// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.01.html

const AWS = require('aws-sdk')
const fs = require('fs')
const tableName = 'sinhvienc'

AWS.config.update({
    region : 'us-east-2',
    accessKeyId: '',
    secretAccessKey: ''
   // endpoint : 'http://localhost:8000'  // Cái nào dùng cho chạy local, nếu chạy trực tiếp trên dynamodb cloud thì comment nó lại 
})

const dynamodb = new AWS.DynamoDB()

const params = {
    TableName : tableName,
    KeySchema : [
        {AttributeName : "tenbaibao",KeyType : "HASH"}
    ],
    AttributeDefinitions : [
        {AttributeName : "tenbaibao",AttributeType : "S"}
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 1, 
        WriteCapacityUnits: 1
    }
}

// Cai nay dung de tao table tren dynamodb. Khi tạo thành công thì tốt nhất nên comment nó lại để không bị lỗi
// phím comment "ctrl + shift + /"

// dynamodb.createTable(params,(err,data) => {
//     if(err){
//         console.log(err)
//     }else{
//         console.log(data)
//     }
// })

const docClient = new AWS.DynamoDB.DocumentClient()

// Import từ file có sẵn vào db dynamodb, nếu như đề có cho sẵn file
const articals = JSON.parse(fs.readFileSync('abz.json','utf-8'))

// Hàm này lặp qua hết cái mảng json ở trên, mỗi lần nó lấy ra 1 phần tử trong mảng, tạo params và put nó vào trong table
// Nhớ ghi cho đúng key giống bên file json 

// articals.forEach(artical => {
//     const params = {
//         TableName : tableName,
//         Item : {
//             'tenbaibao' : artical.tenbaibao,
//             'tentacgia' : artical.tentacgia,
//             'isbn' : artical.isbn,
//             'sotrang' : artical.sotrang,
//             'nam' : artical.nam,
//             'avatar' : artical.avatar
//         }
//     }
//     docClient.put(params,(err,data) => {
//         if(err){
//             console.log(err)
//         }else{
//             console.log("PUT ITEM:",artical)
//         }
//     })

// });


// Read tất cả item trong table
const readAllItem = async (table) => {
    const params = {
        TableName : table
    }

    const results = [] // tạo ra một cái mảng trống sau đó từ từ push data vào mảng
    let items;

    do{
        items = await docClient.scan(params).promise() // cái này nó trả về 1 mảng các Items
        items.Items.forEach(item => results.push(item))
    }while(typeof items.LastEvaluatedKey != "undefined")

    return results
}

module.exports = {
    AWS,
    dynamodb,
    docClient,
    tableName,
    readAllItem
}
