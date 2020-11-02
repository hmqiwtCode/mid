const {AWS,dynamodb,docClient,tableName,readAllItem} = require("./crud")
const express = require('express')
const hbs = require('hbs')
const path = require('path')
const multer = require("multer")
const uuid = require('uuid')
const axios = require('axios')

const app = express()
//app.use(express.json())

const port = process.env.PORT || 3000

const viewPath = path.join(__dirname,'./template')
const publicPath = path.join(__dirname,'./public')
const s3 = new AWS.S3({
    accessKeyId : '',
    secretAccessKey : ''
})


const storage = multer.memoryStorage()
const upload = multer({storage}).single('image')



app.set('view engine','hbs')
app.set('views',viewPath)
app.use(express.static(publicPath))



app.get('/home',async (req,resp) => {
    const results = await readAllItem(tableName)
    resp.render('home',{
        results
    })
})

// Thêm 
//https://expressjs.com/en/resources/middleware/multer.html để hiểu thêm về multer
// Nó là thư viện dùng để handle việc upload image, file...

app.post('/article',upload, async(req,resp) => {
    console.log(req.file)
    const fileUpload = req.file.originalname.split('.') // cái này trả về 1 array, vd: thisisimage.png thì mảng là [thisisimage,png]
    const fileExtension = fileUpload[1] // lấy ra tên đuôi image => png

    const param = {
        Bucket : 'bucket-testinghihi', // lên trên s3 tạo ra một bucket, rồi lấy cái tên nó để vô đây
        Key : `${uuid.v4()}.${fileExtension}`, // xem kĩ cái dấu `` chứ ko phải '', cái uuid dùng trong trwowngf hợp này để generate ra 1 cái ID kết hợp với đuôi hình ảnh.
        Body : req.file.buffer,
        ACL : 'public-read' // cái này upload lên s3 ở chế độ public, để lấy cái link image mà có thể truy cập, xem đc trên browser
    }

    s3.upload(param,(e,d) => {

        // if upload lỗi thì trả về lỗi 
        if(e){
            return resp.status(500).send(e)
        }
        // Nếu không có thì lấy ra cái link image ở trên, kết hợp với dữ liệu truyền lên từ form để thêm vào database
        const paramDB = {
            TableName : tableName,
            Item : {
                ...req.body, // truyền kiểu post nên dữ liệu nằm trong body, ....req.body tạm hiểu lấy hết dữ liệu trong 1 array luôn 
                avatar : d.Location // kết hợp với link image
            }
        }
        // H thì thêm vào thôi.

        docClient.put(paramDB,(err,data) => {
            if(err){
                return resp.status(500).send(JSON.stringify(err, null, 2))
            }
            return resp.status(201).send({ ...req.body,avatar:d.Location})
        })

    })

})

app.delete('/article/:article',async(req,resp) => {
    const articalName = req.params.article
    const param = {
        TableName : tableName,
        Key : {
            tenbaibao : articalName
        }
    }

    docClient.delete(param, (e,d) => {
        if(e){
            return resp.status(500).send(e)
        }
        return resp.status(200).send(d)
    })
})


//get by name

app.get('/article/:id', (req,resp) => {
    const param = {
        TableName : tableName,
        Key : {
            tenbaibao : req.params.id
        }
    }

    docClient.get(param,(e,d) => {
        if(d) {
            return resp.send(d.Item)
        }
        return resp.send(e)
    })
})

// Update
app.patch('/article/:article',upload, (req,resp) => {
    const articalName = req.params.article
    if(req.file){
        const fileUE = req.file.originalname.split('.')[1]
        const param = {
            Bucket : 'bucket-testinghihi',
            Key : `${uuid.v4()}.${fileUE}`,
            Body : req.file.buffer,
            ACL : 'public-read'
        }
        s3.upload(param,(e,d) => {
            if(d){
                const param = {
                    TableName : tableName,
                    Key : {
                        tenbaibao : articalName
                    },
                    UpdateExpression : 'set tentacgia=:ten,nam=:nam,trang=:trang,isbn=:isbn,avatar=:avatar',
                    ExpressionAttributeValues : {
                        ':ten' : req.body.tentacgia,
                        ':nam' : req.body.nam,
                        ':trang' : req.body.sotrang,
                        ':isbn' : req.body.isbn,
                        ':avatar' : d.Location,
                    },
                    ReturnValues:"UPDATED_NEW"
        
                }
        
        
                docClient.update(param,(e,d) => {
                    if(d){
                        return resp.status(200).send(d)
                    }
                    return resp.status(500).send(e)
                })
            }
        })
    }else{
        const param = {
            TableName : tableName,
            Key : {
                tenbaibao : articalName
            },
            UpdateExpression : 'set tentacgia=:ten,nam=:nam,trang=:trang,isbn=:isbn',
            ExpressionAttributeValues : {
                ':ten' : req.body.tentacgia,
                ':nam' : req.body.nam,
                ':trang' : req.body.sotrang,
                ':isbn' : req.body.isbn
            },
            ReturnValues:"UPDATED_NEW"

        }


        docClient.update(param,(e,d) => {
            if(d){
                return resp.status(200).send(d)
            }
            return resp.status(500).send(e)
        })
    }
})


// app.get('/hi',async (req,res) => {
//     const get  = await axios.get('http://localhost:3001/')
//     console.log(get.data)
//     res.send(get.data)
// })


// app.post('/addvui',async (req,resp) => {
//     const post1 = await axios.post('http://localhost:3001/add',{
//         'chatchoi' : 'hihichanqua',
//         'chatchoi1' : 'chatchoilamnha'
//     })
//     console.log(post1)
//     resp.send(post1.data)
// })


app.listen(port,() => {
    console.log(`Listen at ${port}`)
})

