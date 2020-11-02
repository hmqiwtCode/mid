const image = document.getElementById('image')
const tenbaibao = document.getElementById('tenbaibao')
const tacgia = document.getElementById('tacgia')
const isbn = document.getElementById('isbn')
const trang = document.getElementById('trang')
const nam = document.getElementById('nam')
const add = document.getElementById('add')
let fileU = null

const sua = document.getElementById('sua')

sua.style.display = 'none'

const getFile = (file) => {
    console.dir(file.files[0])
    fileU = file.files[0]
}

add.addEventListener('click',(e) => {
    e.preventDefault()
    let bodyFormData = new FormData()

    bodyFormData.append('tenbaibao',tenbaibao.value)
    bodyFormData.append('tentacgia',tacgia.value)
    bodyFormData.append('isbn',isbn.value)
    bodyFormData.append('trang',trang.value)
    bodyFormData.append('nam',nam.value)
    bodyFormData.append('image',fileU)

    axios({
        method : 'post',
        url : '/article',
        data : bodyFormData,
        headers : {'Content-Type' : 'multipart/form-data'}
    }).then((result) => {
        console.log(result)
        location.reload("/")
    }).catch(err => console.log(err))
})

const del = del  => {
    console.log(del.getAttribute('name'))
    const name = del.getAttribute('name')
    const check = confirm('Do you want to delete?')
    if(check){
        axios({
            'method' : 'delete',
            'url' : `/article/${name}`

        }).then(data => {
            console.log(data)
            location.reload('/home')
        }).catch(e => {
            console.log(e)
        })
    }
}


const edit = (edit) => {
    add.style.visibility = "hidden";
    add.style.display = "none";
    sua.style.display = "block";
    

    const name = edit.getAttribute('name')

    axios({
        method : 'get',
        url : `/article/${name}`
    }).then(data => {
        tenbaibao.setAttribute('disabled','disabled')
        tenbaibao.value = data.data.tenbaibao
        tacgia.value = data.data.tentacgia
        isbn.value = data.data.isbn
        trang.value = data.data.trang
        nam.value = data.data.nam
    })
}


const sua1 = (e) => {
    e.preventDefault()
    let bodyFormData = new FormData()
    bodyFormData.append('tenbaibao',tenbaibao.value)
    bodyFormData.append('tentacgia',tacgia.value)
    bodyFormData.append('isbn',isbn.value)
    bodyFormData.append('sotrang',trang.value)
    bodyFormData.append('nam',nam.value)
    bodyFormData.append('image',fileU)

    axios({
        method : 'patch',
        url : `/article/${tenbaibao.value}`,
        data : bodyFormData
    }).then(d => {
        location.reload('/home')
    }).catch(e=> {
        console.log(e)
    })

}


