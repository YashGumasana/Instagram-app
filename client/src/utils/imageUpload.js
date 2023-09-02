export const checkImage = (file) => {
    let err = ""
    if (!file) return err = "File does not exist."

    if (file.size > 1024 * 1024) // 1mb
        err = "The largest image size is 1mb."

    if (file.type !== 'image/jpeg' && file.type !== 'image/png')
        err = "Image format is incorrect."

    return err;
}


export const imageUpload = async (images) => {
    let imgArr = [];
    for (const item of images) {
        const formData = new FormData()
        console.log(item);
        if (item.camera) {
            formData.append("file", item.camera)
        } else {
            formData.append("file", item)
        }

        console.log(formData);

        formData.append("upload_preset", "")
        formData.append("cloud_name", "")
        console.log('***');
        console.log(formData);
        
        
        // https://api.cloudinary.com/v1_1/devat-channel/upload
        const res = await fetch("https://api.cloudinary.com/v1_1//upload", {
            method: "POST",
            body: formData
        })

        console.log('//');
        console.log(res);
        const data = await res.json()
        imgArr.push({ public_id: data.public_id, url: data.url })
    }
    return imgArr;
}
